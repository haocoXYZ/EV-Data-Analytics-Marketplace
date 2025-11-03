using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using System.Security.Claims;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "DataConsumer")]
public class PurchasesController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public PurchasesController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all my purchases (all types)
    /// </summary>
    [HttpGet("my-purchases")]
    public async Task<IActionResult> GetMyPurchases()
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

        // Get data packages
        var dataPackages = await _context.DataPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .Select(p => new
            {
                type = "DataPackage",
                id = p.PurchaseId,
                provinceName = p.Province != null ? p.Province.Name : "Unknown",
                districtName = p.District != null ? p.District.Name : "All districts",
                details = $"{p.RowCount} rows",
                totalPrice = p.TotalPrice,
                purchaseDate = p.PurchaseDate,
                status = p.Status,
                downloadCount = p.DownloadCount,
                maxDownload = p.MaxDownload
            })
            .ToListAsync();

        // Get subscriptions
        var subscriptions = await _context.SubscriptionPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .Select(p => new
            {
                type = "Subscription",
                id = p.SubscriptionId,
                provinceName = p.Province != null ? p.Province.Name : "Unknown",
                districtName = p.District != null ? p.District.Name : "All districts",
                details = $"{p.BillingCycle} - {p.StartDate:yyyy-MM-dd} to {p.EndDate:yyyy-MM-dd}",
                totalPrice = p.TotalPaid,
                purchaseDate = p.PurchaseDate,
                status = p.Status,
                dashboardAccessCount = p.DashboardAccessCount,
                autoRenew = p.AutoRenew
            })
            .ToListAsync();

        // Get API packages
        var apiPackages = await _context.APIPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .Select(p => new
            {
                type = "APIPackage",
                id = p.ApiPurchaseId,
                provinceName = p.Province != null ? p.Province.Name : "Nationwide",
                districtName = p.District != null ? p.District.Name : null,
                details = $"{p.ApiCallsPurchased} calls ({p.ApiCallsUsed} used)",
                totalPrice = p.TotalPaid,
                purchaseDate = p.PurchaseDate,
                status = p.Status,
                expiryDate = p.ExpiryDate
            })
            .ToListAsync();

        return Ok(new
        {
            dataPackages,
            subscriptions,
            apiPackages,
            totalPurchases = dataPackages.Count + subscriptions.Count + apiPackages.Count
        });
    }

    /// <summary>
    /// Get my data packages
    /// </summary>
    [HttpGet("my-data-packages")]
    public async Task<IActionResult> GetMyDataPackages()
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

        var purchases = await _context.DataPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                purchaseId = p.PurchaseId,
                provinceName = p.Province != null ? p.Province.Name : "Unknown",
                districtName = p.District != null ? p.District.Name : "All districts",
                rowCount = p.RowCount,
                pricePerRow = p.PricePerRow,
                totalPrice = p.TotalPrice,
                purchaseDate = p.PurchaseDate,
                status = p.Status,
                downloadCount = p.DownloadCount,
                maxDownload = p.MaxDownload,
                lastDownloadDate = p.LastDownloadDate,
                startDate = p.StartDate,
                endDate = p.EndDate
            })
            .ToListAsync();

        return Ok(purchases);
    }

    /// <summary>
    /// Get my subscriptions
    /// </summary>
    [HttpGet("my-subscriptions")]
    public async Task<IActionResult> GetMySubscriptions()
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

        var subscriptions = await _context.SubscriptionPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                subscriptionId = p.SubscriptionId,
                provinceName = p.Province != null ? p.Province.Name : "Unknown",
                districtName = p.District != null ? p.District.Name : "All districts",
                startDate = p.StartDate,
                endDate = p.EndDate,
                billingCycle = p.BillingCycle,
                monthlyPrice = p.MonthlyPrice,
                totalPaid = p.TotalPaid,
                purchaseDate = p.PurchaseDate,
                status = p.Status,
                autoRenew = p.AutoRenew,
                cancelledAt = p.CancelledAt,
                dashboardAccessCount = p.DashboardAccessCount,
                lastAccessDate = p.LastAccessDate
            })
            .ToListAsync();

        return Ok(subscriptions);
    }

    /// <summary>
    /// Get my API packages
    /// </summary>
    [HttpGet("my-api-packages")]
    public async Task<IActionResult> GetMyAPIPackages()
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

        var apiPackages = await _context.APIPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Include(p => p.APIKeys)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                apiPurchaseId = p.ApiPurchaseId,
                provinceName = p.Province != null ? p.Province.Name : "Nationwide",
                districtName = p.District != null ? p.District.Name : null,
                apiCallsPurchased = p.ApiCallsPurchased,
                apiCallsUsed = p.ApiCallsUsed,
                remainingCalls = p.ApiCallsPurchased - p.ApiCallsUsed,
                pricePerCall = p.PricePerCall,
                totalPaid = p.TotalPaid,
                purchaseDate = p.PurchaseDate,
                expiryDate = p.ExpiryDate,
                status = p.Status,
                apiKeys = p.APIKeys.Select(k => new
                {
                    keyId = k.KeyId,
                    keyValue = k.KeyValue,
                    keyName = k.KeyName,
                    isActive = k.IsActive,
                    createdAt = k.CreatedAt,
                    lastUsedAt = k.LastUsedAt,
                    revokedAt = k.RevokedAt
                }).ToList()
            })
            .ToListAsync();

        return Ok(apiPackages);
    }
}
