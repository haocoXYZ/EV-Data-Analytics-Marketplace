using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.DTOs;
using System.Security.Claims;
using System.Security.Cryptography;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/api-packages")]
public class APIPackageController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public APIPackageController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Purchase API package
    /// </summary>
    [HttpPost("purchase")]
    [Authorize(Roles = "DataConsumer")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseAPIPackageDto dto)
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

        // Validate province if provided
        if (dto.ProvinceId.HasValue)
        {
            var province = await _context.Provinces.FindAsync(dto.ProvinceId.Value);
            if (province == null)
            {
                return BadRequest(new { message = "Invalid province ID" });
            }
        }

        // Validate district if provided
        if (dto.DistrictId.HasValue)
        {
            if (!dto.ProvinceId.HasValue)
            {
                return BadRequest(new { message = "Province ID required when district ID is provided" });
            }

            var district = await _context.Districts
                .FirstOrDefaultAsync(d => d.DistrictId == dto.DistrictId.Value && d.ProvinceId == dto.ProvinceId.Value);

            if (district == null)
            {
                return BadRequest(new { message = "Invalid district ID" });
            }
        }

        // Get pricing
        var pricing = await _context.SystemPricings
            .FirstOrDefaultAsync(p => p.PackageType == "APIPackage" && p.IsActive);

        if (pricing == null || !pricing.ApiPricePerCall.HasValue)
        {
            return StatusCode(500, new { message = "API pricing not configured" });
        }

        var totalPaid = dto.ApiCallsPurchased * pricing.ApiPricePerCall.Value;

        // Create API package purchase
        var apiPackage = new APIPackagePurchase
        {
            ConsumerId = consumer.ConsumerId,
            ProvinceId = dto.ProvinceId,
            DistrictId = dto.DistrictId,
            ApiCallsPurchased = dto.ApiCallsPurchased,
            ApiCallsUsed = 0,
            PricePerCall = pricing.ApiPricePerCall.Value,
            TotalPaid = totalPaid,
            PurchaseDate = DateTime.Now,
            ExpiryDate = null, // No expiry by default
            Status = "Pending"
        };

        _context.APIPackagePurchases.Add(apiPackage);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "API package created successfully. Please proceed to payment.",
            apiPurchaseId = apiPackage.ApiPurchaseId,
            apiCallsPurchased = dto.ApiCallsPurchased,
            pricePerCall = pricing.ApiPricePerCall.Value,
            totalPaid,
            status = apiPackage.Status,
            paymentInfo = new
            {
                paymentType = "APIPackage",
                referenceId = apiPackage.ApiPurchaseId,
                amount = totalPaid
            }
        });
    }

    /// <summary>
    /// Generate API key for purchased package (called after payment)
    /// </summary>
    [HttpPost("{apiPurchaseId}/generate-key")]
    [Authorize(Roles = "DataConsumer")]
    public async Task<IActionResult> GenerateAPIKey(int apiPurchaseId, [FromBody] GenerateKeyDto? dto)
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

        var apiPackage = await _context.APIPackagePurchases
            .FirstOrDefaultAsync(p => p.ApiPurchaseId == apiPurchaseId && p.ConsumerId == consumer.ConsumerId);

        if (apiPackage == null)
        {
            return NotFound(new { message = "API package not found" });
        }

        if (apiPackage.Status != "Active")
        {
            return BadRequest(new { message = $"API package status is {apiPackage.Status}. Payment may not be completed." });
        }

        // Generate unique API key
        var apiKeyValue = GenerateUniqueAPIKey();

        var apiKey = new APIKey
        {
            ApiPurchaseId = apiPurchaseId,
            ConsumerId = consumer.ConsumerId,
            KeyValue = apiKeyValue,
            KeyName = dto?.KeyName ?? $"API Key {DateTime.Now:yyyyMMdd}",
            CreatedAt = DateTime.Now,
            IsActive = true,
            RequestsToday = 0
        };

        _context.APIKeys.Add(apiKey);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "API key generated successfully",
            keyId = apiKey.KeyId,
            keyValue = apiKey.KeyValue,
            keyName = apiKey.KeyName,
            createdAt = apiKey.CreatedAt,
            warning = "Please save this API key. It cannot be retrieved again."
        });
    }

    /// <summary>
    /// Get my API keys
    /// </summary>
    [HttpGet("{apiPurchaseId}/keys")]
    [Authorize(Roles = "DataConsumer")]
    public async Task<IActionResult> GetAPIKeys(int apiPurchaseId)
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

        var keys = await _context.APIKeys
            .Where(k => k.ApiPurchaseId == apiPurchaseId && k.ConsumerId == consumer.ConsumerId)
            .OrderByDescending(k => k.CreatedAt)
            .Select(k => new
            {
                keyId = k.KeyId,
                keyValue = k.KeyValue,
                keyName = k.KeyName,
                isActive = k.IsActive,
                createdAt = k.CreatedAt,
                lastUsedAt = k.LastUsedAt,
                requestsToday = k.RequestsToday,
                revokedAt = k.RevokedAt,
                revokedReason = k.RevokedReason
            })
            .ToListAsync();

        return Ok(keys);
    }

    /// <summary>
    /// Revoke API key
    /// </summary>
    [HttpPost("keys/{keyId}/revoke")]
    [Authorize(Roles = "DataConsumer")]
    public async Task<IActionResult> RevokeKey(int keyId, [FromBody] RevokeKeyDto? dto)
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

        var apiKey = await _context.APIKeys
            .FirstOrDefaultAsync(k => k.KeyId == keyId && k.ConsumerId == consumer.ConsumerId);

        if (apiKey == null)
        {
            return NotFound(new { message = "API key not found" });
        }

        if (!apiKey.IsActive)
        {
            return BadRequest(new { message = "API key already revoked" });
        }

        apiKey.IsActive = false;
        apiKey.RevokedAt = DateTime.Now;
        apiKey.RevokedReason = dto?.Reason ?? "Revoked by user";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "API key revoked successfully",
            keyId,
            revokedAt = apiKey.RevokedAt
        });
    }

    /// <summary>
    /// Query data using API key (Public endpoint)
    /// </summary>
    [HttpGet("/api/data")]
    [AllowAnonymous]
    public async Task<IActionResult> QueryData(
        [FromHeader(Name = "X-API-Key")] string? apiKey,
        [FromQuery] int? provinceId,
        [FromQuery] int? districtId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        // Validate API key
        if (string.IsNullOrEmpty(apiKey))
        {
            return Unauthorized(new { message = "API key required in X-API-Key header" });
        }

        var key = await _context.APIKeys
            .Include(k => k.APIPackagePurchase)
            .FirstOrDefaultAsync(k => k.KeyValue == apiKey);

        if (key == null)
        {
            return Unauthorized(new { message = "Invalid API key" });
        }

        if (!key.IsActive)
        {
            return Unauthorized(new { message = "API key has been revoked" });
        }

        var apiPackage = key.APIPackagePurchase;
        if (apiPackage == null || apiPackage.Status != "Active")
        {
            return Unauthorized(new { message = "API package not active" });
        }

        // Check if calls exhausted
        if (apiPackage.ApiCallsUsed >= apiPackage.ApiCallsPurchased)
        {
            return BadRequest(new { message = "API calls exhausted. Please purchase more calls." });
        }

        // Check expiry if set
        if (apiPackage.ExpiryDate.HasValue && DateTime.Now > apiPackage.ExpiryDate.Value)
        {
            return BadRequest(new { message = "API package has expired" });
        }

        // Validate scope
        if (apiPackage.ProvinceId.HasValue)
        {
            if (!provinceId.HasValue || provinceId.Value != apiPackage.ProvinceId.Value)
            {
                return BadRequest(new { message = $"API key restricted to province ID {apiPackage.ProvinceId}" });
            }
        }

        if (apiPackage.DistrictId.HasValue)
        {
            if (!districtId.HasValue || districtId.Value != apiPackage.DistrictId.Value)
            {
                return BadRequest(new { message = $"API key restricted to district ID {apiPackage.DistrictId}" });
            }
        }

        // Query data
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Include(r => r.Province)
            .Include(r => r.District)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (provinceId.HasValue)
        {
            query = query.Where(r => r.ProvinceId == provinceId.Value);
        }

        if (districtId.HasValue)
        {
            query = query.Where(r => r.DistrictId == districtId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp <= endDate.Value);
        }

        if (pageSize > 1000)
        {
            pageSize = 1000; // Max page size
        }

        var totalRecords = await query.CountAsync();
        var records = await query
            .OrderByDescending(r => r.ChargingTimestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                recordId = r.RecordId,
                stationId = r.StationId,
                stationName = r.StationName,
                stationAddress = r.StationAddress,
                provinceName = r.Province != null ? r.Province.Name : "Unknown",
                districtName = r.District != null ? r.District.Name : "Unknown",
                chargingTimestamp = r.ChargingTimestamp,
                energyKwh = r.EnergyKwh,
                voltage = r.Voltage,
                current = r.Current,
                powerKw = r.PowerKw,
                durationMinutes = r.DurationMinutes,
                chargingCost = r.ChargingCost
            })
            .ToListAsync();

        // Update usage
        apiPackage.ApiCallsUsed++;
        key.LastUsedAt = DateTime.Now;

        // Update daily request count
        if (key.LastRequestDate?.Date != DateTime.Now.Date)
        {
            key.RequestsToday = 1;
            key.LastRequestDate = DateTime.Now;
        }
        else
        {
            key.RequestsToday++;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            totalRecords,
            currentPage = page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
            remainingCalls = apiPackage.ApiCallsPurchased - apiPackage.ApiCallsUsed,
            records
        });
    }

    private string GenerateUniqueAPIKey()
    {
        const string prefix = "evdata_";
        var randomBytes = RandomNumberGenerator.GetBytes(32);
        var keyPart = Convert.ToBase64String(randomBytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")
            .Substring(0, 32);

        return $"{prefix}{keyPart}";
    }
}

public class GenerateKeyDto
{
    public string? KeyName { get; set; }
}

public class RevokeKeyDto
{
    public string? Reason { get; set; }
}
