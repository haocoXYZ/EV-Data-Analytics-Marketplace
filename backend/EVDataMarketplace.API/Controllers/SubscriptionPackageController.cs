using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.DTOs;
using System.Security.Claims;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/subscription-packages")]
[Authorize(Roles = "DataConsumer")]
public class SubscriptionPackageController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public SubscriptionPackageController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Purchase subscription package
    /// </summary>
    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseSubscriptionDto dto)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var consumer = await _context.DataConsumers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.User.Email == userEmail);

        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        // Validate province
        var province = await _context.Provinces.FindAsync(dto.ProvinceId);
        if (province == null)
        {
            return BadRequest(new { message = "Invalid province ID" });
        }

        // Validate district if provided
        if (dto.DistrictId.HasValue)
        {
            var district = await _context.Districts
                .FirstOrDefaultAsync(d => d.DistrictId == dto.DistrictId.Value && d.ProvinceId == dto.ProvinceId);

            if (district == null)
            {
                return BadRequest(new { message = "Invalid district ID" });
            }
        }

        // Get pricing
        var pricing = await _context.SystemPricings
            .FirstOrDefaultAsync(p => p.PackageType == "SubscriptionPackage" && p.IsActive);

        if (pricing == null || !pricing.SubscriptionMonthlyBase.HasValue)
        {
            return StatusCode(500, new { message = "Subscription pricing not configured" });
        }

        var monthlyPrice = pricing.SubscriptionMonthlyBase.Value;

        // Calculate dates and total based on billing cycle
        var startDate = DateTime.Now;
        DateTime endDate;
        decimal totalPaid;

        switch (dto.BillingCycle)
        {
            case "Monthly":
                endDate = startDate.AddMonths(1);
                totalPaid = monthlyPrice;
                break;
            case "Quarterly":
                endDate = startDate.AddMonths(3);
                totalPaid = monthlyPrice * 3 * 0.95M; // 5% discount
                break;
            case "Yearly":
                endDate = startDate.AddYears(1);
                totalPaid = monthlyPrice * 12 * 0.85M; // 15% discount
                break;
            default:
                return BadRequest(new { message = "Invalid billing cycle" });
        }

        // Create subscription
        var subscription = new SubscriptionPackagePurchase
        {
            ConsumerId = consumer.ConsumerId,
            ProvinceId = dto.ProvinceId,
            DistrictId = dto.DistrictId,
            StartDate = startDate,
            EndDate = endDate,
            BillingCycle = dto.BillingCycle,
            MonthlyPrice = monthlyPrice,
            TotalPaid = totalPaid,
            PurchaseDate = DateTime.Now,
            Status = "Pending",
            AutoRenew = false,
            DashboardAccessCount = 0
        };

        _context.SubscriptionPackagePurchases.Add(subscription);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Subscription created successfully. Please proceed to payment.",
            subscriptionId = subscription.SubscriptionId,
            startDate,
            endDate,
            billingCycle = dto.BillingCycle,
            monthlyPrice,
            totalPaid,
            status = subscription.Status,
            paymentInfo = new
            {
                paymentType = "SubscriptionPackage",
                referenceId = subscription.SubscriptionId,
                amount = totalPaid
            }
        });
    }

    /// <summary>
    /// Get dashboard analytics for active subscription
    /// </summary>
    [HttpGet("{subscriptionId}/dashboard")]
    public async Task<IActionResult> GetDashboard(int subscriptionId, [FromQuery] int? days = null)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var consumer = await _context.DataConsumers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.User.Email == userEmail);

        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        // Get subscription
        var subscription = await _context.SubscriptionPackagePurchases
            .Include(s => s.Province)
            .Include(s => s.District)
            .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId && s.ConsumerId == consumer.ConsumerId);

        if (subscription == null)
        {
            return NotFound(new { message = "Subscription not found" });
        }

        if (subscription.Status != "Active")
        {
            return BadRequest(new { message = $"Subscription status is {subscription.Status}" });
        }

        if (DateTime.Now > subscription.EndDate)
        {
            return BadRequest(new { message = "Subscription has expired" });
        }

        // Update access count
        subscription.DashboardAccessCount++;
        subscription.LastAccessDate = DateTime.Now;
        await _context.SaveChangesAsync();

        // Query data for analytics
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == subscription.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (subscription.DistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == subscription.DistrictId.Value);
        }

        // Apply date filter if specified, otherwise get all available data
        DateTime? filterStartDate = null;
        int actualDaysRange = 0;

        if (days.HasValue && days.Value > 0)
        {
            filterStartDate = DateTime.Now.AddDays(-days.Value);
            query = query.Where(r => r.ChargingTimestamp >= filterStartDate.Value);
            actualDaysRange = days.Value;
        }

        var allRecords = await query.ToListAsync();

        // Calculate actual date range from data
        if (allRecords.Any())
        {
            var minDate = allRecords.Min(r => r.ChargingTimestamp);
            var maxDate = allRecords.Max(r => r.ChargingTimestamp);
            actualDaysRange = (int)(maxDate - minDate).TotalDays + 1;
        }

        // Calculate statistics
        var totalRecords = allRecords.Count;
        var totalEnergy = allRecords.Sum(r => r.EnergyKwh);
        var avgEnergy = totalRecords > 0 ? allRecords.Average(r => r.EnergyKwh) : 0;
        var avgDuration = totalRecords > 0 ? allRecords.Where(r => r.DurationMinutes.HasValue).Average(r => r.DurationMinutes!.Value) : 0;
        var uniqueStations = allRecords.Select(r => r.StationId).Distinct().Count();

        return Ok(new
        {
            subscription = new
            {
                subscriptionId = subscription.SubscriptionId,
                provinceName = subscription.Province?.Name ?? "Unknown",
                districtName = subscription.District?.Name,
                startDate = subscription.StartDate,
                endDate = subscription.EndDate,
                daysRemaining = (subscription.EndDate - DateTime.Now).Days
            },
            statistics = new
            {
                totalRecords,
                totalEnergyKwh = Math.Round(totalEnergy, 2),
                averageEnergyKwh = Math.Round(avgEnergy, 2),
                averageChargingDuration = Math.Round(avgDuration, 2),
                uniqueStations,
                dataRangeDays = actualDaysRange,
                dataDateRange = allRecords.Any() ? new
                {
                    from = allRecords.Min(r => r.ChargingTimestamp),
                    to = allRecords.Max(r => r.ChargingTimestamp)
                } : null
            }
        });
    }

    /// <summary>
    /// Get energy consumption over time chart data
    /// </summary>
    [HttpGet("{subscriptionId}/charts/energy-over-time")]
    public async Task<IActionResult> GetEnergyOverTimeChart(int subscriptionId, [FromQuery] int? days = null)
    {
        var subscription = await ValidateSubscriptionAccess(subscriptionId);
        if (subscription == null)
        {
            return BadRequest(new { message = "Invalid subscription or access denied" });
        }

        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == subscription.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved")
            .Where(r => !subscription.DistrictId.HasValue || r.DistrictId == subscription.DistrictId.Value);

        // Apply date filter only if days parameter is provided
        if (days.HasValue && days.Value > 0)
        {
            var startDate = DateTime.Now.AddDays(-days.Value);
            query = query.Where(r => r.ChargingTimestamp >= startDate);
        }

        var data = await query
            .GroupBy(r => r.ChargingTimestamp.Date)
            .Select(g => new
            {
                date = g.Key,
                totalEnergy = g.Sum(r => r.EnergyKwh),
                recordCount = g.Count()
            })
            .OrderBy(g => g.date)
            .ToListAsync();

        return Ok(new
        {
            chartType = "Energy Over Time",
            dataPoints = data,
            daysFilter = days,
            totalDataPoints = data.Count
        });
    }

    /// <summary>
    /// Get station distribution chart data
    /// </summary>
    [HttpGet("{subscriptionId}/charts/station-distribution")]
    public async Task<IActionResult> GetStationDistributionChart(int subscriptionId, [FromQuery] int? days = null, [FromQuery] int top = 10)
    {
        var subscription = await ValidateSubscriptionAccess(subscriptionId);
        if (subscription == null)
        {
            return BadRequest(new { message = "Invalid subscription or access denied" });
        }

        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == subscription.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved")
            .Where(r => !subscription.DistrictId.HasValue || r.DistrictId == subscription.DistrictId.Value);

        // Apply date filter only if days parameter is provided
        if (days.HasValue && days.Value > 0)
        {
            var startDate = DateTime.Now.AddDays(-days.Value);
            query = query.Where(r => r.ChargingTimestamp >= startDate);
        }

        var data = await query
            .GroupBy(r => new { r.StationId, r.StationName })
            .Select(g => new
            {
                stationId = g.Key.StationId,
                stationName = g.Key.StationName,
                totalEnergy = g.Sum(r => r.EnergyKwh),
                recordCount = g.Count()
            })
            .OrderByDescending(g => g.totalEnergy)
            .Take(top)
            .ToListAsync();

        return Ok(new
        {
            chartType = $"Top {top} Stations by Energy",
            dataPoints = data,
            daysFilter = days,
            totalStations = data.Count
        });
    }

    /// <summary>
    /// Get peak hours analysis
    /// </summary>
    [HttpGet("{subscriptionId}/charts/peak-hours")]
    public async Task<IActionResult> GetPeakHoursChart(int subscriptionId, [FromQuery] int? days = null)
    {
        var subscription = await ValidateSubscriptionAccess(subscriptionId);
        if (subscription == null)
        {
            return BadRequest(new { message = "Invalid subscription or access denied" });
        }

        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == subscription.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved")
            .Where(r => !subscription.DistrictId.HasValue || r.DistrictId == subscription.DistrictId.Value);

        // Apply date filter only if days parameter is provided
        if (days.HasValue && days.Value > 0)
        {
            var startDate = DateTime.Now.AddDays(-days.Value);
            query = query.Where(r => r.ChargingTimestamp >= startDate);
        }

        var data = await query.ToListAsync();

        var hourlyData = data
            .GroupBy(r => r.ChargingTimestamp.Hour)
            .Select(g => new
            {
                hour = g.Key,
                totalEnergy = Math.Round(g.Sum(r => r.EnergyKwh), 2),
                recordCount = g.Count(),
                avgEnergy = Math.Round(g.Average(r => r.EnergyKwh), 2)
            })
            .OrderBy(g => g.hour)
            .ToList();

        return Ok(new
        {
            chartType = "Peak Hours Analysis",
            dataPoints = hourlyData,
            daysFilter = days,
            totalRecords = data.Count
        });
    }

    /// <summary>
    /// Cancel subscription
    /// </summary>
    [HttpPost("{subscriptionId}/cancel")]
    public async Task<IActionResult> CancelSubscription(int subscriptionId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var consumer = await _context.DataConsumers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.User.Email == userEmail);

        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var subscription = await _context.SubscriptionPackagePurchases
            .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId && s.ConsumerId == consumer.ConsumerId);

        if (subscription == null)
        {
            return NotFound(new { message = "Subscription not found" });
        }

        if (subscription.Status == "Cancelled")
        {
            return BadRequest(new { message = "Subscription already cancelled" });
        }

        subscription.Status = "Cancelled";
        subscription.CancelledAt = DateTime.Now;
        subscription.AutoRenew = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Subscription cancelled successfully",
            subscriptionId,
            cancelledAt = subscription.CancelledAt
        });
    }

    private async Task<SubscriptionPackagePurchase?> ValidateSubscriptionAccess(int subscriptionId)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail)) return null;

        var consumer = await _context.DataConsumers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.User.Email == userEmail);

        if (consumer == null) return null;

        var subscription = await _context.SubscriptionPackagePurchases
            .Include(s => s.Province)
            .Include(s => s.District)
            .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId && s.ConsumerId == consumer.ConsumerId);

        if (subscription == null || subscription.Status != "Active" || DateTime.Now > subscription.EndDate)
        {
            return null;
        }

        return subscription;
    }
}
