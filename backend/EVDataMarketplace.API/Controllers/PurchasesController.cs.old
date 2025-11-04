using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Controllers;

// B5: Data Consumer chon va mua data theo goi
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

    // POST: api/purchases/onetime - Goi mua 1 lan
    [HttpPost("onetime")]
    public async Task<ActionResult<object>> CreateOneTimePurchase([FromBody] OneTimePurchaseRequestDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var dataset = await _context.Datasets
            .Include(d => d.PricingTier)
            .FirstOrDefaultAsync(d => d.DatasetId == request.DatasetId && d.Status == "Active");

        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found or not available" });
        }

        if (dataset.PricingTier == null || dataset.DataSizeMb == null)
        {
            return BadRequest(new { message = "Dataset pricing information incomplete" });
        }

        // Tinh tien: Fixed 10000 VND for testing PayOS
        var totalPrice = 10000m; // TEST: Fixed price
        // var totalPrice = (dataset.PricingTier.BasePricePerMb ?? 0) * dataset.DataSizeMb.Value;

        var purchase = new OneTimePurchase
        {
            DatasetId = request.DatasetId,
            ConsumerId = consumer.ConsumerId,
            PurchaseDate = DateTime.Now,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalPrice = totalPrice,
            LicenseType = request.LicenseType,
            MaxDownload = 3,
            Status = "Pending"
        };

        _context.OneTimePurchases.Add(purchase);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            purchase.OtpId,
            purchase.DatasetId,
            purchase.TotalPrice,
            purchase.Status,
            Message = "One-time purchase created. Proceed to payment."
        });
    }

    // POST: api/purchases/subscription - Goi thue bao theo khu vuc
    [HttpPost("subscription")]
    public async Task<ActionResult<object>> CreateSubscription([FromBody] SubscriptionRequestDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var dataset = await _context.Datasets
            .Include(d => d.PricingTier)
            .FirstOrDefaultAsync(d => d.DatasetId == request.DatasetId && d.Status == "Active");

        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found or not available" });
        }

        var province = await _context.Provinces.FindAsync(request.ProvinceId);
        if (province == null)
        {
            return NotFound(new { message = "Province not found" });
        }

        if (dataset.PricingTier == null)
        {
            return BadRequest(new { message = "Dataset pricing information incomplete" });
        }

        // Tinh tien: SubscriptionPricePerRegion * so thang
        var totalPrice = (dataset.PricingTier.SubscriptionPricePerRegion ?? 0) * request.DurationMonths;

        var subscription = new Subscription
        {
            DatasetId = request.DatasetId,
            ConsumerId = consumer.ConsumerId,
            ProvinceId = request.ProvinceId,
            SubStart = DateTime.Now,
            SubEnd = DateTime.Now.AddMonths(request.DurationMonths),
            RenewalCycle = request.RenewalCycle,
            RenewalStatus = "Active",
            TotalPrice = totalPrice
        };

        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            subscription.SubId,
            subscription.DatasetId,
            subscription.ProvinceId,
            ProvinceName = province.Name,
            subscription.TotalPrice,
            subscription.SubStart,
            subscription.SubEnd,
            Message = "Subscription created. Proceed to payment."
        });
    }

    // POST: api/purchases/api - Goi API theo so luot
    [HttpPost("api")]
    public async Task<ActionResult<object>> CreateAPIPackage([FromBody] APIPackageRequestDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var dataset = await _context.Datasets
            .Include(d => d.PricingTier)
            .FirstOrDefaultAsync(d => d.DatasetId == request.DatasetId && d.Status == "Active");

        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found or not available" });
        }

        if (dataset.PricingTier == null)
        {
            return BadRequest(new { message = "Dataset pricing information incomplete" });
        }

        // Tinh tien: ApiPricePerCall * so luot
        var pricePerCall = dataset.PricingTier.ApiPricePerCall ?? 0;
        var totalPaid = pricePerCall * request.ApiCallsCount;

        // Generate API key
        var apiKey = Guid.NewGuid().ToString("N");

        var apiPackage = new APIPackage
        {
            DatasetId = request.DatasetId,
            ConsumerId = consumer.ConsumerId,
            ApiKey = apiKey,
            ApiCallsPurchased = request.ApiCallsCount,
            ApiCallsUsed = 0,
            PricePerCall = pricePerCall,
            PurchaseDate = DateTime.Now,
            ExpiryDate = DateTime.Now.AddYears(1), // API key valid for 1 year
            TotalPaid = totalPaid,
            Status = "Pending"
        };

        _context.APIPackages.Add(apiPackage);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            apiPackage.ApiId,
            apiPackage.DatasetId,
            apiPackage.ApiKey,
            apiPackage.ApiCallsPurchased,
            apiPackage.TotalPaid,
            apiPackage.ExpiryDate,
            Message = "API package created. Proceed to payment."
        });
    }

    // GET: api/purchases/my/onetime
    [HttpGet("my/onetime")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyOneTimePurchases()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var purchases = await _context.OneTimePurchases
            .Include(p => p.Dataset)
            .Where(p => p.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(p => p.PurchaseDate)
            .Select(p => new
            {
                p.OtpId,
                p.DatasetId,
                DatasetName = p.Dataset!.Name,
                p.PurchaseDate,
                p.StartDate,
                p.EndDate,
                p.TotalPrice,
                p.LicenseType,
                p.DownloadCount,
                p.MaxDownload,
                p.Status
            })
            .ToListAsync();

        return Ok(purchases);
    }

    // GET: api/purchases/my/subscriptions
    [HttpGet("my/subscriptions")]
    public async Task<ActionResult<IEnumerable<object>>> GetMySubscriptions()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var subscriptions = await _context.Subscriptions
            .Include(s => s.Dataset)
            .Include(s => s.Province)
            .Where(s => s.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(s => s.SubStart)
            .Select(s => new
            {
                s.SubId,
                s.DatasetId,
                DatasetName = s.Dataset!.Name,
                s.ProvinceId,
                ProvinceName = s.Province!.Name,
                s.SubStart,
                s.SubEnd,
                s.RenewalCycle,
                s.RenewalStatus,
                s.TotalPrice,
                s.RequestCount
            })
            .ToListAsync();

        return Ok(subscriptions);
    }

    // GET: api/purchases/my/api
    [HttpGet("my/api")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyAPIPackages()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var apiPackages = await _context.APIPackages
            .Include(a => a.Dataset)
            .Where(a => a.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(a => a.PurchaseDate)
            .Select(a => new
            {
                a.ApiId,
                a.DatasetId,
                DatasetName = a.Dataset!.Name,
                a.ApiKey,
                a.ApiCallsPurchased,
                a.ApiCallsUsed,
                RemainingCalls = a.ApiCallsPurchased - a.ApiCallsUsed,
                a.PurchaseDate,
                a.ExpiryDate,
                a.TotalPaid,
                a.Status
            })
            .ToListAsync();

        return Ok(apiPackages);
    }
}
