using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using System.Security.Claims;
using System.Text;

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
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                purchaseId = p.PurchaseId,
                consumerId = p.ConsumerId,
                provinceId = p.ProvinceId,
                provinceName = p.Province != null ? p.Province.Name : "Unknown",
                districtId = p.DistrictId,
                districtName = p.District != null ? p.District.Name : "All districts",
                startDate = p.StartDate,
                endDate = p.EndDate,
                rowCount = p.RowCount,
                pricePerRow = p.PricePerRow,
                totalPrice = p.TotalPrice,
                status = p.Status,
                purchaseDate = p.PurchaseDate,
                downloadCount = p.DownloadCount,
                maxDownload = p.MaxDownload,
                lastDownloadDate = p.LastDownloadDate
            })
            .ToListAsync();

        // Get subscriptions
        var subscriptions = await _context.SubscriptionPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                subscriptionId = p.SubscriptionId,
                consumerId = p.ConsumerId,
                provinceId = p.ProvinceId,
                provinceName = p.Province != null ? p.Province.Name : "Unknown",
                districtId = p.DistrictId,
                districtName = p.District != null ? p.District.Name : "All districts",
                billingCycle = p.BillingCycle,
                monthlyPrice = p.MonthlyPrice,
                totalPaid = p.TotalPaid,
                status = p.Status,
                startDate = p.StartDate,
                endDate = p.EndDate,
                nextBillingDate = p.Status == "Active" && p.EndDate > DateTime.UtcNow ? p.EndDate : (DateTime?)null,
                purchaseDate = p.PurchaseDate,
                autoRenew = p.AutoRenew,
                cancelledAt = p.CancelledAt,
                dashboardAccessCount = p.DashboardAccessCount,
                lastAccessDate = p.LastAccessDate
            })
            .ToListAsync();

        // Get API packages
        var apiPackages = await _context.APIPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                purchaseId = p.ApiPurchaseId,
                consumerId = p.ConsumerId,
                totalAPICalls = p.ApiCallsPurchased,
                apiCallsUsed = p.ApiCallsUsed,
                apiCallsRemaining = p.ApiCallsPurchased - p.ApiCallsUsed,
                pricePerCall = p.PricePerCall,
                totalPrice = p.TotalPaid,
                status = p.Status,
                purchaseDate = p.PurchaseDate,
                expiryDate = p.ExpiryDate,
                provinceId = p.ProvinceId,
                districtId = p.DistrictId
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
                purchaseId = p.ApiPurchaseId,
                consumerId = p.ConsumerId,
                provinceName = p.Province != null ? p.Province.Name : "Nationwide",
                districtName = p.District != null ? p.District.Name : null,
                totalAPICalls = p.ApiCallsPurchased,
                apiCallsUsed = p.ApiCallsUsed,
                apiCallsRemaining = p.ApiCallsPurchased - p.ApiCallsUsed,
                pricePerCall = p.PricePerCall,
                totalPrice = p.TotalPaid,
                purchaseDate = p.PurchaseDate,
                expiryDate = p.ExpiryDate,
                status = p.Status,
                provinceId = p.ProvinceId,
                districtId = p.DistrictId,
                apiKeys = p.APIKeys.Select(k => new
                {
                    keyId = k.KeyId,
                    apiKey = k.KeyValue,
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

    /// <summary>
    /// Download CSV data for a purchased data package
    /// </summary>
    [HttpGet("download/{purchaseId}")]
    public async Task<IActionResult> DownloadDataPackage(int purchaseId)
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

        // Get the purchase
        var purchase = await _context.DataPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId && p.ConsumerId == consumer.ConsumerId);

        if (purchase == null)
        {
            return NotFound(new { message = "Purchase not found or you don't have permission to download this data" });
        }

        // Check if purchase is active
        if (purchase.Status != "Active")
        {
            return BadRequest(new { message = "This purchase is not active" });
        }

        // Check download limit
        if (purchase.DownloadCount >= purchase.MaxDownload)
        {
            return BadRequest(new { message = $"Download limit reached ({purchase.DownloadCount}/{purchase.MaxDownload})" });
        }

        // Generate mock CSV data
        var csv = GenerateMockCSVData(purchase);

        // Update download count
        purchase.DownloadCount++;
        purchase.LastDownloadDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Return CSV file
        var bytes = Encoding.UTF8.GetBytes(csv);
        var fileName = $"ev_charging_data_{purchase.Province?.Name ?? "unknown"}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        
        return File(bytes, "text/csv", fileName);
    }

    private string GenerateMockCSVData(EVDataMarketplace.API.Models.DataPackagePurchase purchase)
    {
        var csv = new StringBuilder();
        
        // CSV Header
        csv.AppendLine("Transaction ID,Station Name,Location,District,Province,Charger Type,Power (kW),Start Time,End Time,Duration (minutes),Energy Consumed (kWh),Cost (VND),Vehicle Model,Battery Capacity (kWh),SOC Before (%),SOC After (%),Temperature (°C),Payment Method,User ID");

        // Generate mock records based on row count
        var random = new Random();
        var startDate = purchase.StartDate ?? DateTime.UtcNow.AddMonths(-6);
        var endDate = purchase.EndDate ?? DateTime.UtcNow;
        var totalDays = (endDate - startDate).Days;

        var chargingStations = new[] {
            "VinFast Charging Station",
            "EV Power Hub",
            "Green Energy Station",
            "Fast Charge Point",
            "City Charging Station",
            "Highway Rest Stop Charger",
            "Mall Parking Charger",
            "Office Building Station"
        };

        var chargerTypes = new[] { "AC", "DC Fast", "Super Fast DC" };
        var powerLevels = new[] { 7, 22, 50, 120, 180, 350 };
        var vehicleModels = new[] {
            "VinFast VF8",
            "VinFast VF9",
            "VinFast VFe34",
            "Tesla Model 3",
            "Tesla Model Y",
            "BYD Atto 3",
            "Hyundai Ioniq 5",
            "Kia EV6"
        };
        var paymentMethods = new[] { "Credit Card", "E-Wallet", "Cash", "QR Code", "Subscription" };

        var provinceName = purchase.Province?.Name ?? "Unknown Province";
        var districtName = purchase.District?.Name ?? "Various Districts";

        for (int i = 0; i < purchase.RowCount; i++)
        {
            var transactionId = $"TXN{DateTime.Now.Year}{(i + 1):D6}";
            var stationName = chargingStations[random.Next(chargingStations.Length)];
            var location = $"{random.Next(1, 999)} {(random.Next(2) == 0 ? "Nguyen Van Cu" : "Le Duan")} Street";
            var district = districtName == "Various Districts" ? $"District {random.Next(1, 13)}" : districtName;
            var chargerType = chargerTypes[random.Next(chargerTypes.Length)];
            var power = powerLevels[random.Next(powerLevels.Length)];
            
            // Random date within purchase period
            var recordDate = startDate.AddDays(random.Next(totalDays + 1));
            var startTime = recordDate.AddHours(random.Next(0, 24)).AddMinutes(random.Next(0, 60));
            var duration = random.Next(15, 180); // 15 to 180 minutes
            var endTime = startTime.AddMinutes(duration);
            
            var energyConsumed = Math.Round(random.NextDouble() * 50 + 10, 2); // 10-60 kWh
            var cost = Math.Round(energyConsumed * (3000 + random.Next(-500, 500)), 0); // ~3000 VND per kWh
            
            var vehicleModel = vehicleModels[random.Next(vehicleModels.Length)];
            var batteryCapacity = random.Next(50, 110);
            var socBefore = random.Next(10, 50);
            var socAfter = Math.Min(100, socBefore + random.Next(20, 60));
            var temperature = random.Next(20, 38);
            var paymentMethod = paymentMethods[random.Next(paymentMethods.Length)];
            var userId = $"USER{random.Next(1000, 9999)}";

            csv.AppendLine($"{transactionId},{stationName},{location},{district},{provinceName},{chargerType},{power},{startTime:yyyy-MM-dd HH:mm},{endTime:yyyy-MM-dd HH:mm},{duration},{energyConsumed},{cost},{vehicleModel},{batteryCapacity},{socBefore},{socAfter},{temperature},{paymentMethod},{userId}");
        }

        return csv.ToString();
    }
}
