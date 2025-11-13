using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Services;
using System.Security.Claims;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/providers")]
public class ProvidersController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly IAuthService _authService;

    public ProvidersController(EVDataMarketplaceDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    /// <summary>
    /// Admin: Create a new DataProvider account
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateProvider([FromBody] CreateProviderDto dto)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        // Validate province if provided
        if (dto.ProvinceId.HasValue)
        {
            var provinceExists = await _context.Provinces.AnyAsync(p => p.ProvinceId == dto.ProvinceId.Value);
            if (!provinceExists)
            {
                return BadRequest(new { message = "Invalid ProvinceId" });
            }
        }

        // Create User
        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Password = _authService.HashPassword(dto.Password),
            Role = "DataProvider",
            Status = "Active",
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Create DataProvider profile
        var provider = new DataProvider
        {
            UserId = user.UserId,
            CompanyName = dto.CompanyName,
            CompanyWebsite = dto.CompanyWebsite,
            ContactEmail = dto.Email,
            ContactPhone = dto.ContactPhone,
            Address = dto.Address,
            ProvinceId = dto.ProvinceId,
            CreatedAt = DateTime.Now
        };

        _context.DataProviders.Add(provider);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Provider created successfully",
            providerId = provider.ProviderId,
            userId = user.UserId,
            email = user.Email,
            companyName = provider.CompanyName
        });
    }

    /// <summary>
    /// Get provider profile (Admin or self)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,DataProvider")]
    public async Task<IActionResult> GetProvider(int id)
    {
        var provider = await _context.DataProviders
            .Include(p => p.User)
            .Include(p => p.Province)
            .FirstOrDefaultAsync(p => p.ProviderId == id);

        if (provider == null)
        {
            return NotFound(new { message = "Provider not found" });
        }

        // Check authorization: Admin can view any, Provider can only view self
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

        if (userRole != "Admin" && provider.User.Email != userEmail)
        {
            return Forbid();
        }

        var result = new ProviderDto
        {
            ProviderId = provider.ProviderId,
            UserId = provider.UserId,
            FullName = provider.User.FullName,
            Email = provider.User.Email,
            CompanyName = provider.CompanyName,
            CompanyWebsite = provider.CompanyWebsite,
            ContactEmail = provider.ContactEmail,
            ContactPhone = provider.ContactPhone,
            Address = provider.Address,
            ProvinceId = provider.ProvinceId,
            ProvinceName = provider.Province?.Name,
            CreatedAt = provider.CreatedAt,
            Status = provider.User.Status
        };

        return Ok(result);
    }

    /// <summary>
    /// Get current provider profile (for logged-in provider)
    /// </summary>
    [HttpGet("me")]
    [Authorize(Roles = "DataProvider")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var provider = await _context.DataProviders
            .Include(p => p.User)
            .Include(p => p.Province)
            .FirstOrDefaultAsync(p => p.User.Email == userEmail);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        var result = new ProviderDto
        {
            ProviderId = provider.ProviderId,
            UserId = provider.UserId,
            FullName = provider.User.FullName,
            Email = provider.User.Email,
            CompanyName = provider.CompanyName,
            CompanyWebsite = provider.CompanyWebsite,
            ContactEmail = provider.ContactEmail,
            ContactPhone = provider.ContactPhone,
            Address = provider.Address,
            ProvinceId = provider.ProvinceId,
            ProvinceName = provider.Province?.Name,
            CreatedAt = provider.CreatedAt,
            Status = provider.User.Status
        };

        return Ok(result);
    }

    /// <summary>
    /// List all providers (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllProviders([FromQuery] string? status = null)
    {
        var query = _context.DataProviders
            .Include(p => p.User)
            .Include(p => p.Province)
            .AsQueryable();

        // Filter by status if provided
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(p => p.User.Status == status);
        }

        var providers = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProviderDto
            {
                ProviderId = p.ProviderId,
                UserId = p.UserId,
                FullName = p.User.FullName,
                Email = p.User.Email,
                CompanyName = p.CompanyName,
                CompanyWebsite = p.CompanyWebsite,
                ContactEmail = p.ContactEmail,
                ContactPhone = p.ContactPhone,
                Address = p.Address,
                ProvinceId = p.ProvinceId,
                ProvinceName = p.Province != null ? p.Province.Name : null,
                CreatedAt = p.CreatedAt,
                Status = p.User.Status
            })
            .ToListAsync();

        return Ok(new
        {
            totalProviders = providers.Count,
            providers
        });
    }

    /// <summary>
    /// Update provider profile (Admin or self)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,DataProvider")]
    public async Task<IActionResult> UpdateProvider(int id, [FromBody] UpdateProviderDto dto)
    {
        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.ProviderId == id);

        if (provider == null)
        {
            return NotFound(new { message = "Provider not found" });
        }

        // Check authorization: Admin can update any, Provider can only update self
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;

        if (userRole != "Admin" && provider.User.Email != userEmail)
        {
            return Forbid();
        }

        // Validate province if provided
        if (dto.ProvinceId.HasValue)
        {
            var provinceExists = await _context.Provinces.AnyAsync(p => p.ProvinceId == dto.ProvinceId.Value);
            if (!provinceExists)
            {
                return BadRequest(new { message = "Invalid ProvinceId" });
            }
        }

        // Update fields
        if (!string.IsNullOrWhiteSpace(dto.CompanyName))
            provider.CompanyName = dto.CompanyName;

        if (dto.CompanyWebsite != null)
            provider.CompanyWebsite = dto.CompanyWebsite;

        if (dto.ContactPhone != null)
            provider.ContactPhone = dto.ContactPhone;

        if (dto.Address != null)
            provider.Address = dto.Address;

        if (dto.ProvinceId.HasValue)
            provider.ProvinceId = dto.ProvinceId;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Provider updated successfully",
            providerId = provider.ProviderId
        });
    }

    /// <summary>
    /// Deactivate provider account (Admin only)
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateProvider(int id)
    {
        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.ProviderId == id);

        if (provider == null)
        {
            return NotFound(new { message = "Provider not found" });
        }

        if (provider.User.Status == "Inactive")
        {
            return BadRequest(new { message = "Provider already inactive" });
        }

        provider.User.Status = "Inactive";
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Provider deactivated successfully",
            providerId = provider.ProviderId
        });
    }

    /// <summary>
    /// Activate provider account (Admin only)
    /// </summary>
    [HttpPost("{id}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateProvider(int id)
    {
        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.ProviderId == id);

        if (provider == null)
        {
            return NotFound(new { message = "Provider not found" });
        }

        if (provider.User.Status == "Active")
        {
            return BadRequest(new { message = "Provider already active" });
        }

        provider.User.Status = "Active";
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Provider activated successfully",
            providerId = provider.ProviderId
        });
    }

    /// <summary>
    /// Get provider earnings summary (for logged-in provider)
    /// </summary>
    [HttpGet("me/earnings")]
    [Authorize(Roles = "DataProvider")]
    public async Task<IActionResult> GetMyEarnings()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Email == userEmail);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        // Get all revenue shares (exclude cancelled ones from subscription upgrades)
        var revenueShares = await _context.RevenueShares
            .Include(rs => rs.Payment)
            .Where(rs => rs.ProviderId == provider.ProviderId && rs.PayoutStatus != "Cancelled")
            .OrderByDescending(rs => rs.CalculatedDate)
            .Select(rs => new
            {
                shareId = rs.ShareId,
                paymentId = rs.PaymentId,
                totalAmount = rs.TotalAmount,
                providerShare = rs.ProviderShare,
                adminShare = rs.AdminShare,
                calculatedDate = rs.CalculatedDate,
                payoutStatus = rs.PayoutStatus,
                paymentType = rs.Payment != null ? rs.Payment.PaymentType : null
            })
            .ToListAsync();

        // Get all payouts
        var payouts = await _context.Payouts
            .Where(p => p.ProviderId == provider.ProviderId)
            .OrderByDescending(p => p.MonthYear)
            .Select(p => new
            {
                payoutId = p.PayoutId,
                monthYear = p.MonthYear,
                totalDue = p.TotalDue,
                payoutDate = p.PayoutDate,
                payoutStatus = p.PayoutStatus,
                paymentMethod = p.PaymentMethod,
                transactionRef = p.TransactionRef
            })
            .ToListAsync();

        // Calculate summary
        var totalEarned = revenueShares.Sum(rs => rs.providerShare ?? 0);
        var pendingPayout = revenueShares.Where(rs => rs.payoutStatus == "Pending").Sum(rs => rs.providerShare ?? 0);
        var paidOut = revenueShares.Where(rs => rs.payoutStatus == "Paid").Sum(rs => rs.providerShare ?? 0);

        return Ok(new
        {
            summary = new
            {
                totalEarned = Math.Round(totalEarned, 2),
                pendingPayout = Math.Round(pendingPayout, 2),
                paidOut = Math.Round(paidOut, 2),
                totalRevenueShares = revenueShares.Count,
                totalPayouts = payouts.Count
            },
            revenueShares,
            payouts
        });
    }

    /// <summary>
    /// Get provider revenue breakdown by month (for logged-in provider)
    /// </summary>
    [HttpGet("me/earnings/monthly")]
    [Authorize(Roles = "DataProvider")]
    public async Task<IActionResult> GetMyMonthlyEarnings([FromQuery] int? year = null)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Email == userEmail);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        var targetYear = year ?? DateTime.Now.Year;

        // Exclude cancelled revenue shares from subscription upgrades
        var monthlyBreakdown = await _context.RevenueShares
            .Where(rs => rs.ProviderId == provider.ProviderId
                && rs.CalculatedDate.Year == targetYear
                && rs.PayoutStatus != "Cancelled")
            .GroupBy(rs => new { rs.CalculatedDate.Year, rs.CalculatedDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                monthYear = $"{g.Key.Year}-{g.Key.Month:D2}",
                totalEarned = g.Sum(rs => rs.ProviderShare ?? 0),
                transactionCount = g.Count(),
                pendingAmount = g.Where(rs => rs.PayoutStatus == "Pending").Sum(rs => rs.ProviderShare ?? 0),
                paidAmount = g.Where(rs => rs.PayoutStatus == "Paid").Sum(rs => rs.ProviderShare ?? 0)
            })
            .OrderBy(g => g.year)
            .ThenBy(g => g.month)
            .ToListAsync();

        return Ok(new
        {
            year = targetYear,
            totalYearlyEarnings = monthlyBreakdown.Sum(m => m.totalEarned),
            monthlyBreakdown
        });
    }

    /// <summary>
    /// Get provider earnings by package type (for logged-in provider)
    /// </summary>
    [HttpGet("me/earnings/by-package-type")]
    [Authorize(Roles = "DataProvider")]
    public async Task<IActionResult> GetMyEarningsByPackageType()
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Email == userEmail);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        // Exclude cancelled revenue shares from subscription upgrades
        var earningsByType = await _context.RevenueShares
            .Include(rs => rs.Payment)
            .Where(rs => rs.ProviderId == provider.ProviderId && rs.PayoutStatus != "Cancelled")
            .GroupBy(rs => rs.Payment!.PaymentType)
            .Select(g => new
            {
                packageType = g.Key,
                totalEarned = g.Sum(rs => rs.ProviderShare ?? 0),
                transactionCount = g.Count(),
                pendingAmount = g.Where(rs => rs.PayoutStatus == "Pending").Sum(rs => rs.ProviderShare ?? 0),
                paidAmount = g.Where(rs => rs.PayoutStatus == "Paid").Sum(rs => rs.ProviderShare ?? 0)
            })
            .ToListAsync();

        return Ok(new
        {
            earningsByPackageType = earningsByType,
            totalEarnings = earningsByType.Sum(e => e.totalEarned)
        });
    }
}
