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
    /// Normalize Vietnamese text for case-insensitive, diacritic-insensitive comparison
    /// </summary>
    private static string NormalizeName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return string.Empty;

        var normalized = name.ToLowerInvariant().Trim();

        normalized = normalized
            .Replace("tp.", "")
            .Replace("thành phố", "")
            .Replace("tỉnh", "")
            .Replace("quận", "")
            .Replace("huyện", "")
            .Replace("  ", " ")
            .Trim();

        return RemoveDiacritics(normalized);
    }

    /// <summary>
    /// Remove Vietnamese diacritics
    /// </summary>
    private static string RemoveDiacritics(string text)
    {
        var diacriticMap = new Dictionary<char, char>
        {
            {'á', 'a'}, {'à', 'a'}, {'ả', 'a'}, {'ã', 'a'}, {'ạ', 'a'},
            {'ă', 'a'}, {'ắ', 'a'}, {'ằ', 'a'}, {'ẳ', 'a'}, {'ẵ', 'a'}, {'ặ', 'a'},
            {'â', 'a'}, {'ấ', 'a'}, {'ầ', 'a'}, {'ẩ', 'a'}, {'ẫ', 'a'}, {'ậ', 'a'},
            {'é', 'e'}, {'è', 'e'}, {'ẻ', 'e'}, {'ẽ', 'e'}, {'ẹ', 'e'},
            {'ê', 'e'}, {'ế', 'e'}, {'ề', 'e'}, {'ể', 'e'}, {'ễ', 'e'}, {'ệ', 'e'},
            {'í', 'i'}, {'ì', 'i'}, {'ỉ', 'i'}, {'ĩ', 'i'}, {'ị', 'i'},
            {'ó', 'o'}, {'ò', 'o'}, {'ỏ', 'o'}, {'õ', 'o'}, {'ọ', 'o'},
            {'ô', 'o'}, {'ố', 'o'}, {'ồ', 'o'}, {'ổ', 'o'}, {'ỗ', 'o'}, {'ộ', 'o'},
            {'ơ', 'o'}, {'ớ', 'o'}, {'ờ', 'o'}, {'ở', 'o'}, {'ỡ', 'o'}, {'ợ', 'o'},
            {'ú', 'u'}, {'ù', 'u'}, {'ủ', 'u'}, {'ũ', 'u'}, {'ụ', 'u'},
            {'ư', 'u'}, {'ứ', 'u'}, {'ừ', 'u'}, {'ử', 'u'}, {'ữ', 'u'}, {'ự', 'u'},
            {'ý', 'y'}, {'ỳ', 'y'}, {'ỷ', 'y'}, {'ỹ', 'y'}, {'ỵ', 'y'},
            {'đ', 'd'}
        };

        var result = new System.Text.StringBuilder();
        foreach (var c in text)
        {
            result.Append(diacriticMap.ContainsKey(c) ? diacriticMap[c] : c);
        }

        return result.ToString();
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
    /// Supports both ID and Name for province/district:
    /// - Use provinceId/districtId (int) OR province/district (string)
    /// - Examples:
    ///   ?provinceId=1 OR ?province=Ha Noi
    ///   ?districtId=1 OR ?district=Ba Dinh
    /// </summary>
    [HttpGet("/api/data")]
    [AllowAnonymous]
    public async Task<IActionResult> QueryData(
        [FromHeader(Name = "X-API-Key")] string? apiKey,
        [FromQuery] int? provinceId,
        [FromQuery] int? districtId,
        [FromQuery] string? province,
        [FromQuery] string? district,
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

        // Convert province/district names to IDs if provided
        int? resolvedProvinceId = provinceId;
        int? resolvedDistrictId = districtId;

        // Handle province parameter (name or ID)
        if (!string.IsNullOrEmpty(province) && !provinceId.HasValue)
        {
            var provinces = await _context.Provinces.ToListAsync();
            var normalizedProvince = NormalizeName(province);
            var matchedProvince = provinces.FirstOrDefault(p => NormalizeName(p.Name) == normalizedProvince);

            if (matchedProvince == null)
            {
                return BadRequest(new { message = $"Province '{province}' not found. Please check spelling or use provinceId parameter." });
            }

            resolvedProvinceId = matchedProvince.ProvinceId;
        }

        // Handle district parameter (name or ID)
        if (!string.IsNullOrEmpty(district) && !districtId.HasValue)
        {
            if (!resolvedProvinceId.HasValue)
            {
                return BadRequest(new { message = "Province parameter required when using district name" });
            }

            var districts = await _context.Districts.Where(d => d.ProvinceId == resolvedProvinceId.Value).ToListAsync();
            var normalizedDistrict = NormalizeName(district);
            var matchedDistrict = districts.FirstOrDefault(d => NormalizeName(d.Name) == normalizedDistrict);

            if (matchedDistrict == null)
            {
                return BadRequest(new { message = $"District '{district}' not found in the selected province. Please check spelling or use districtId parameter." });
            }

            resolvedDistrictId = matchedDistrict.DistrictId;
        }

        // Validate scope against API package restrictions
        if (apiPackage.ProvinceId.HasValue)
        {
            if (!resolvedProvinceId.HasValue || resolvedProvinceId.Value != apiPackage.ProvinceId.Value)
            {
                var restrictedProvince = await _context.Provinces.FindAsync(apiPackage.ProvinceId.Value);
                return BadRequest(new { message = $"API key restricted to province: {restrictedProvince?.Name ?? $"ID {apiPackage.ProvinceId}"}" });
            }
        }

        if (apiPackage.DistrictId.HasValue)
        {
            if (!resolvedDistrictId.HasValue || resolvedDistrictId.Value != apiPackage.DistrictId.Value)
            {
                var restrictedDistrict = await _context.Districts.FindAsync(apiPackage.DistrictId.Value);
                return BadRequest(new { message = $"API key restricted to district: {restrictedDistrict?.Name ?? $"ID {apiPackage.DistrictId}"}" });
            }
        }

        // Query data with resolved IDs
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Include(r => r.Province)
            .Include(r => r.District)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (resolvedProvinceId.HasValue)
        {
            query = query.Where(r => r.ProvinceId == resolvedProvinceId.Value);
        }

        if (resolvedDistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == resolvedDistrictId.Value);
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
