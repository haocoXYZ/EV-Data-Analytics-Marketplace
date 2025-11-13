using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public AdminController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/admin/dashboard-stats
    /// Get comprehensive statistics for admin dashboard
    /// </summary>
    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        // Count providers
        var totalProviders = await _context.DataProviders.CountAsync();
        var activeProviders = await _context.DataProviders
            .Where(p => p.User.Status == "Active")
            .CountAsync();

        // Count consumers
        var totalConsumers = await _context.DataConsumers.CountAsync();
        var activeConsumers = await _context.DataConsumers
            .Where(c => c.User.Status == "Active")
            .CountAsync();

        // Count datasets
        var totalDatasets = await _context.Datasets.CountAsync();
        var approvedDatasets = await _context.Datasets
            .Where(d => d.ModerationStatus == "Approved")
            .CountAsync();
        var pendingDatasets = await _context.Datasets
            .Where(d => d.ModerationStatus == "Pending")
            .CountAsync();
        var rejectedDatasets = await _context.Datasets
            .Where(d => d.ModerationStatus == "Rejected")
            .CountAsync();

        // Revenue statistics from RevenueShares (exclude Cancelled)
        var allRevenueShares = await _context.RevenueShares
            .Where(rs => rs.PayoutStatus != "Cancelled")
            .ToListAsync();

        var totalRevenue = allRevenueShares.Sum(rs => rs.TotalAmount ?? 0);
        var totalProviderRevenue = allRevenueShares.Sum(rs => rs.ProviderShare ?? 0);
        var totalAdminRevenue = allRevenueShares.Sum(rs => rs.AdminShare ?? 0);

        var pendingRevenue = allRevenueShares
            .Where(rs => rs.PayoutStatus == "Pending")
            .Sum(rs => rs.TotalAmount ?? 0);
        var paidRevenue = allRevenueShares
            .Where(rs => rs.PayoutStatus == "Paid")
            .Sum(rs => rs.TotalAmount ?? 0);

        // Payment statistics
        var totalPayments = await _context.Payments
            .Where(p => p.Status == "Completed")
            .CountAsync();

        // Package sales statistics
        var dataPackageCount = await _context.DataPackagePurchases
            .Where(p => p.Status == "Active")
            .CountAsync();
        var dataPackageRevenue = await _context.DataPackagePurchases
            .Where(p => p.Status == "Active")
            .SumAsync(p => p.TotalPrice);

        var subscriptionCount = await _context.SubscriptionPackagePurchases
            .Where(p => p.Status == "Active")
            .CountAsync();
        var subscriptionRevenue = await _context.SubscriptionPackagePurchases
            .Where(p => p.Status == "Active")
            .SumAsync(p => p.TotalPaid);

        var apiPackageCount = await _context.APIPackagePurchases
            .Where(p => p.Status == "Active")
            .CountAsync();
        var apiPackageRevenue = await _context.APIPackagePurchases
            .Where(p => p.Status == "Active")
            .SumAsync(p => p.TotalPaid);

        // Payout statistics
        var pendingPayouts = await _context.Payouts
            .Where(p => p.PayoutStatus == "Pending")
            .SumAsync(p => p.TotalDue ?? 0);
        var completedPayouts = await _context.Payouts
            .Where(p => p.PayoutStatus == "Completed")
            .SumAsync(p => p.TotalDue ?? 0);

        return Ok(new
        {
            // Users
            providers = new
            {
                total = totalProviders,
                active = activeProviders,
                inactive = totalProviders - activeProviders
            },
            consumers = new
            {
                total = totalConsumers,
                active = activeConsumers,
                inactive = totalConsumers - activeConsumers
            },

            // Datasets
            datasets = new
            {
                total = totalDatasets,
                approved = approvedDatasets,
                pending = pendingDatasets,
                rejected = rejectedDatasets
            },

            // Revenue
            revenue = new
            {
                totalRevenue = Math.Round(totalRevenue, 2),
                providerRevenue = Math.Round(totalProviderRevenue, 2),
                adminRevenue = Math.Round(totalAdminRevenue, 2),
                pendingRevenue = Math.Round(pendingRevenue, 2),
                paidRevenue = Math.Round(paidRevenue, 2)
            },

            // Payments
            payments = new
            {
                totalCompleted = totalPayments
            },

            // Package Sales
            packages = new
            {
                dataPackages = new
                {
                    count = dataPackageCount,
                    revenue = Math.Round(dataPackageRevenue, 2)
                },
                subscriptions = new
                {
                    count = subscriptionCount,
                    revenue = Math.Round(subscriptionRevenue, 2)
                },
                apiPackages = new
                {
                    count = apiPackageCount,
                    revenue = Math.Round(apiPackageRevenue, 2)
                },
                total = new
                {
                    count = dataPackageCount + subscriptionCount + apiPackageCount,
                    revenue = Math.Round(dataPackageRevenue + subscriptionRevenue + apiPackageRevenue, 2)
                }
            },

            // Payouts
            payouts = new
            {
                pending = Math.Round(pendingPayouts, 2),
                completed = Math.Round(completedPayouts, 2)
            }
        });
    }

    /// <summary>
    /// GET /api/admin/revenue-trends
    /// Get revenue trends over time (monthly breakdown)
    /// </summary>
    [HttpGet("revenue-trends")]
    public async Task<IActionResult> GetRevenueTrends([FromQuery] int? year = null)
    {
        var targetYear = year ?? DateTime.Now.Year;

        var monthlyRevenue = await _context.RevenueShares
            .Where(rs => rs.CalculatedDate.Year == targetYear && rs.PayoutStatus != "Cancelled")
            .GroupBy(rs => new { rs.CalculatedDate.Year, rs.CalculatedDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                monthYear = $"{g.Key.Year}-{g.Key.Month:D2}",
                totalRevenue = g.Sum(rs => rs.TotalAmount ?? 0),
                providerRevenue = g.Sum(rs => rs.ProviderShare ?? 0),
                adminRevenue = g.Sum(rs => rs.AdminShare ?? 0),
                transactionCount = g.Count()
            })
            .OrderBy(g => g.year)
            .ThenBy(g => g.month)
            .ToListAsync();

        return Ok(new
        {
            year = targetYear,
            totalYearRevenue = monthlyRevenue.Sum(m => m.totalRevenue),
            totalYearAdminRevenue = monthlyRevenue.Sum(m => m.adminRevenue),
            monthlyBreakdown = monthlyRevenue
        });
    }
}
