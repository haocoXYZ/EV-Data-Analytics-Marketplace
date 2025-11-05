using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Controllers;

// B7: Admin quan ly thanh toan va tra tien cho Data Provider moi thang
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PayoutsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public PayoutsController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    // GET: api/payouts/revenue-summary - Xem tong quan revenue chua tra
    [HttpGet("revenue-summary")]
    public async Task<ActionResult<object>> GetRevenueSummary([FromQuery] string? monthYear = null)
    {
        var query = _context.RevenueShares
            .Include(rs => rs.DataProvider)
                .ThenInclude(dp => dp!.User)
            .Where(rs => rs.PayoutStatus == "Pending");

        if (!string.IsNullOrEmpty(monthYear))
        {
            // Filter by month-year (format: 2025-01)
            var year = int.Parse(monthYear.Split('-')[0]);
            var month = int.Parse(monthYear.Split('-')[1]);

            query = query.Where(rs => rs.CalculatedDate.Year == year && rs.CalculatedDate.Month == month);
        }

        var summary = await query
            .GroupBy(rs => new
            {
                rs.ProviderId,
                ProviderName = rs.DataProvider!.CompanyName,
                rs.DataProvider.User.Email
            })
            .Select(g => new
            {
                g.Key.ProviderId,
                g.Key.ProviderName,
                g.Key.Email,
                TotalDue = g.Sum(rs => rs.ProviderShare),
                TransactionCount = g.Count(),
                AdminShare = g.Sum(rs => rs.AdminShare)
            })
            .ToListAsync();

        return Ok(new
        {
            MonthYear = monthYear ?? DateTime.Now.ToString("yyyy-MM"),
            Providers = summary,
            TotalProviderPayout = summary.Sum(s => s.TotalDue),
            TotalAdminRevenue = summary.Sum(s => s.AdminShare)
        });
    }

    // POST: api/payouts/generate - Tao payout cho thang
    [HttpPost("generate")]
    public async Task<ActionResult<object>> GenerateMonthlyPayouts([FromQuery] string monthYear)
    {
        // Validate format
        if (!monthYear.Contains('-') || monthYear.Length != 7)
        {
            return BadRequest(new { message = "Invalid month-year format. Use YYYY-MM" });
        }

        var year = int.Parse(monthYear.Split('-')[0]);
        var month = int.Parse(monthYear.Split('-')[1]);

        // Check if payouts already generated for this month
        var existingPayouts = await _context.Payouts
            .AnyAsync(p => p.MonthYear == monthYear);

        if (existingPayouts)
        {
            return BadRequest(new { message = $"Payouts already generated for {monthYear}" });
        }

        // Get all pending revenue shares for the month
        var revenueShares = await _context.RevenueShares
            .Include(rs => rs.DataProvider)
            .Where(rs => rs.PayoutStatus == "Pending"
                && rs.CalculatedDate.Year == year
                && rs.CalculatedDate.Month == month)
            .ToListAsync();

        if (!revenueShares.Any())
        {
            return BadRequest(new { message = $"No pending revenue shares found for {monthYear}" });
        }

        // Group by provider and create payouts
        var providerGroups = revenueShares
            .GroupBy(rs => rs.ProviderId)
            .ToList();

        var createdPayouts = new List<Payout>();

        foreach (var group in providerGroups)
        {
            var totalDue = group.Sum(rs => rs.ProviderShare ?? 0);

            var payout = new Payout
            {
                ProviderId = group.Key,
                MonthYear = monthYear,
                TotalDue = totalDue,
                PayoutDate = null,
                PayoutStatus = "Pending",
                PaymentMethod = "BankTransfer"
            };

            _context.Payouts.Add(payout);
            createdPayouts.Add(payout);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Generated {createdPayouts.Count} payouts for {monthYear}",
            TotalAmount = createdPayouts.Sum(p => p.TotalDue),
            Payouts = createdPayouts.Select(p => new
            {
                p.PayoutId,
                p.ProviderId,
                p.TotalDue,
                p.PayoutStatus
            })
        });
    }

    // GET: api/payouts - Xem tat ca payouts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetPayouts(
        [FromQuery] string? status = null,
        [FromQuery] string? monthYear = null)
    {
        var query = _context.Payouts
            .Include(p => p.DataProvider)
                .ThenInclude(dp => dp!.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(p => p.PayoutStatus == status);
        }

        if (!string.IsNullOrEmpty(monthYear))
        {
            query = query.Where(p => p.MonthYear == monthYear);
        }

        var payouts = await query
            .OrderByDescending(p => p.MonthYear)
            .ThenBy(p => p.PayoutStatus)
            .Select(p => new
            {
                p.PayoutId,
                p.ProviderId,
                ProviderName = p.DataProvider!.CompanyName,
                ProviderEmail = p.DataProvider.User.Email,
                p.MonthYear,
                p.TotalDue,
                p.PayoutDate,
                p.PayoutStatus,
                p.PaymentMethod,
                p.BankAccount,
                p.TransactionRef
            })
            .ToListAsync();

        return Ok(payouts);
    }

    // PUT: api/payouts/{id}/complete - Danh dau payout da hoan thanh
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompletePayout(int id, [FromBody] CompletePayoutDto request)
    {
        var payout = await _context.Payouts.FindAsync(id);

        if (payout == null)
        {
            return NotFound(new { message = "Payout not found" });
        }

        if (payout.PayoutStatus == "Completed")
        {
            return BadRequest(new { message = "Payout already completed" });
        }

        payout.PayoutStatus = "Completed";
        payout.PayoutDate = DateTime.Now;
        payout.TransactionRef = request.TransactionRef;
        payout.BankAccount = request.BankAccount;
        payout.Notes = request.Notes;

        // Update revenue shares to Paid
        var year = int.Parse(payout.MonthYear!.Split('-')[0]);
        var month = int.Parse(payout.MonthYear.Split('-')[1]);

        var revenueShares = await _context.RevenueShares
            .Where(rs => rs.ProviderId == payout.ProviderId
                && rs.PayoutStatus == "Pending"
                && rs.CalculatedDate.Year == year
                && rs.CalculatedDate.Month == month)
            .ToListAsync();

        foreach (var rs in revenueShares)
        {
            rs.PayoutStatus = "Paid";
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Payout completed successfully" });
    }

    // GET: api/payouts/provider/{providerId} - Provider xem payouts cua minh
    [AllowAnonymous]
    [Authorize(Roles = "DataProvider,Admin")]
    [HttpGet("provider/{providerId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetProviderPayouts(int providerId)
    {
        var payouts = await _context.Payouts
            .Where(p => p.ProviderId == providerId)
            .OrderByDescending(p => p.MonthYear)
            .Select(p => new
            {
                p.PayoutId,
                p.MonthYear,
                p.TotalDue,
                p.PayoutDate,
                p.PayoutStatus,
                p.PaymentMethod,
                p.BankAccount,
                p.TransactionRef
            })
            .ToListAsync();

        return Ok(payouts);
    }
}

public class CompletePayoutDto
{
    public string? TransactionRef { get; set; }
    public string? BankAccount { get; set; }
    public string? Notes { get; set; }
}
