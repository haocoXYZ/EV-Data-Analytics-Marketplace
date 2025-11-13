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
        // Validate monthYear format if provided
        if (!string.IsNullOrEmpty(monthYear))
        {
            var parts = monthYear.Split('-');
            if (parts.Length != 2 ||
                !int.TryParse(parts[0], out int year) ||
                !int.TryParse(parts[1], out int month) ||
                year < 2000 || year > 2100 ||
                month < 1 || month > 12)
            {
                return BadRequest(new { message = "Invalid monthYear format. Use YYYY-MM (e.g., 2025-11)" });
            }
        }

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
                providerId = g.Key.ProviderId,
                providerName = g.Key.ProviderName,
                email = g.Key.Email,
                totalDue = g.Sum(rs => rs.ProviderShare),
                transactionCount = g.Count(),
                adminShare = g.Sum(rs => rs.AdminShare)
            })
            .ToListAsync();

        return Ok(new
        {
            monthYear = monthYear ?? DateTime.Now.ToString("yyyy-MM"),
            providers = summary,
            totalProviderPayout = summary.Sum(s => s.totalDue),
            totalAdminRevenue = summary.Sum(s => s.adminShare)
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
                p.TransactionRef
            })
            .ToListAsync();

        return Ok(payouts);
    }

    // GET: api/payouts/package-sales - Thống kê chi tiết packages đã bán
    [HttpGet("package-sales")]
    public async Task<ActionResult<object>> GetPackageSalesStats([FromQuery] string? monthYear = null)
    {
        // Get revenue shares to link packages to providers
        var revenueShares = await _context.RevenueShares
            .Include(rs => rs.DataProvider)
                .ThenInclude(dp => dp!.User)
            .Include(rs => rs.Payment)
            .ToListAsync();

        // Get data package purchases with payments
        var dataPackagePurchases = await _context.DataPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.Status == "Active")
            .ToListAsync();

        // Get subscription packages
        var subscriptionPackages = await _context.SubscriptionPackagePurchases
            .Include(p => p.Province)
            .Where(p => p.Status == "Active")
            .ToListAsync();

        // Get API packages
        var apiPackages = await _context.APIPackagePurchases
            .Where(p => p.Status == "Active")
            .ToListAsync();

        // Get payments to link purchases to revenue shares
        var payments = await _context.Payments
            .Where(p => p.Status == "Completed")
            .ToListAsync();

        // Filter by month if provided
        if (!string.IsNullOrEmpty(monthYear))
        {
            var year = int.Parse(monthYear.Split('-')[0]);
            var month = int.Parse(monthYear.Split('-')[1]);

            dataPackagePurchases = dataPackagePurchases.Where(p => p.PurchaseDate.Year == year && p.PurchaseDate.Month == month).ToList();
            subscriptionPackages = subscriptionPackages.Where(p => p.PurchaseDate.Year == year && p.PurchaseDate.Month == month).ToList();
            apiPackages = apiPackages.Where(p => p.PurchaseDate.Year == year && p.PurchaseDate.Month == month).ToList();
            revenueShares = revenueShares.Where(rs => rs.CalculatedDate.Year == year && rs.CalculatedDate.Month == month).ToList();
        }

        // Group by provider with payment information
        var providerSales = revenueShares
            .Where(rs => rs.Payment != null)
            .GroupBy(rs => new { rs.ProviderId, rs.DataProvider!.CompanyName, rs.DataProvider.User.Email })
            .Select(g => new
            {
                providerId = g.Key.ProviderId,
                providerName = g.Key.CompanyName,
                email = g.Key.Email,
                totalRevenue = g.Sum(rs => rs.ProviderShare),
                packages = new
                {
                    dataPackages = g.Count(rs => rs.Payment!.PaymentType == "DataPackage"),
                    subscriptions = g.Count(rs => rs.Payment!.PaymentType == "SubscriptionPackage"),
                    apiPackages = g.Count(rs => rs.Payment!.PaymentType == "APIPackage")
                }
            })
            .ToList();

        return Ok(new
        {
            // Overall summary
            dataPackages = new
            {
                count = dataPackagePurchases.Count,
                totalRevenue = dataPackagePurchases.Sum(p => p.TotalPrice)
            },
            subscriptionPackages = new
            {
                count = subscriptionPackages.Count,
                totalRevenue = subscriptionPackages.Sum(p => p.TotalPaid)
            },
            apiPackages = new
            {
                count = apiPackages.Count,
                totalRevenue = apiPackages.Sum(p => p.TotalPaid)
            },
            summary = new
            {
                totalPackages = dataPackagePurchases.Count + subscriptionPackages.Count + apiPackages.Count,
                totalRevenue = dataPackagePurchases.Sum(p => p.TotalPrice) +
                              subscriptionPackages.Sum(p => p.TotalPaid) +
                              apiPackages.Sum(p => p.TotalPaid)
            },
            // Breakdown by provider
            providerSales = providerSales
        });
    }

    // GET: api/payouts/provider-packages/{providerId} - Chi tiết packages của provider
    [HttpGet("provider-packages/{providerId}")]
    public async Task<ActionResult<object>> GetProviderPackageDetails(int providerId, [FromQuery] string? monthYear = null)
    {
        // Get all revenue shares for this provider
        var revenueShares = await _context.RevenueShares
            .Include(rs => rs.Payment)
                .ThenInclude(p => p!.DataConsumer)
                    .ThenInclude(dc => dc!.User)
            .Where(rs => rs.ProviderId == providerId)
            .ToListAsync();

        if (!string.IsNullOrEmpty(monthYear))
        {
            var year = int.Parse(monthYear.Split('-')[0]);
            var month = int.Parse(monthYear.Split('-')[1]);
            revenueShares = revenueShares.Where(rs => rs.CalculatedDate.Year == year && rs.CalculatedDate.Month == month).ToList();
        }

        // Group by payment and get package details
        var packageDetails = new List<object>();

        foreach (var rs in revenueShares.Where(rs => rs.Payment != null))
        {
            var payment = rs.Payment!;
            object? packageInfo = null;

            if (payment.PaymentType == "DataPackage" && payment.ReferenceId.HasValue)
            {
                var pkg = await _context.DataPackagePurchases
                    .Include(p => p.Province)
                    .Include(p => p.District)
                    .Include(p => p.DataConsumer)
                        .ThenInclude(dc => dc!.User)
                    .FirstOrDefaultAsync(p => p.PurchaseId == payment.ReferenceId.Value);

                if (pkg != null)
                {
                    packageInfo = new
                    {
                        packageType = "Data Package",
                        packageId = pkg.PurchaseId,
                        consumerName = pkg.DataConsumer?.User?.Email ?? "N/A",
                        location = $"{pkg.Province?.Name ?? "N/A"} - {pkg.District?.Name ?? "Toàn tỉnh"}",
                        dateRange = $"{pkg.StartDate:dd/MM/yyyy} - {pkg.EndDate:dd/MM/yyyy}",
                        totalPrice = pkg.TotalPrice,
                        providerShare = rs.ProviderShare,
                        purchaseDate = pkg.PurchaseDate,
                        status = pkg.Status
                    };
                }
            }
            else if (payment.PaymentType == "SubscriptionPackage" && payment.ReferenceId.HasValue)
            {
                var pkg = await _context.SubscriptionPackagePurchases
                    .Include(p => p.Province)
                    .Include(p => p.DataConsumer)
                        .ThenInclude(dc => dc!.User)
                    .FirstOrDefaultAsync(p => p.SubscriptionId == payment.ReferenceId.Value);

                if (pkg != null)
                {
                    packageInfo = new
                    {
                        packageType = "Subscription",
                        packageId = pkg.SubscriptionId,
                        consumerName = pkg.DataConsumer?.User?.Email ?? "N/A",
                        location = pkg.Province?.Name ?? "N/A",
                        dateRange = $"{pkg.StartDate:dd/MM/yyyy} - {pkg.EndDate:dd/MM/yyyy}",
                        totalPrice = pkg.TotalPaid,
                        providerShare = rs.ProviderShare,
                        purchaseDate = pkg.PurchaseDate,
                        status = pkg.Status
                    };
                }
            }
            else if (payment.PaymentType == "APIPackage" && payment.ReferenceId.HasValue)
            {
                var pkg = await _context.APIPackagePurchases
                    .Include(p => p.DataConsumer)
                        .ThenInclude(dc => dc!.User)
                    .FirstOrDefaultAsync(p => p.ApiPurchaseId == payment.ReferenceId.Value);

                if (pkg != null)
                {
                    packageInfo = new
                    {
                        packageType = "API Package",
                        packageId = pkg.ApiPurchaseId,
                        consumerName = pkg.DataConsumer?.User?.Email ?? "N/A",
                        location = "Toàn quốc",
                        dateRange = $"{pkg.ApiCallsUsed}/{pkg.ApiCallsPurchased} calls",
                        totalPrice = pkg.TotalPaid,
                        providerShare = rs.ProviderShare,
                        purchaseDate = pkg.PurchaseDate,
                        status = pkg.Status
                    };
                }
            }

            if (packageInfo != null)
            {
                packageDetails.Add(packageInfo);
            }
        }

        return Ok(new
        {
            providerId = providerId,
            totalPackages = packageDetails.Count,
            totalRevenue = revenueShares.Sum(rs => rs.ProviderShare),
            packages = packageDetails.OrderByDescending(p => ((dynamic)p).purchaseDate).ToList()
        });
    }
}

public class CompletePayoutDto
{
    public string? TransactionRef { get; set; }
    public string? BankAccount { get; set; }
    public string? Notes { get; set; }
}
