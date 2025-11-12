using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.DTOs;
using System.Security.Claims;
using System.Text;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/data-packages")]
[Authorize(Roles = "DataConsumer")]
public class DataPackageController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public DataPackageController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Preview data package before purchase
    /// </summary>
    [HttpGet("preview")]
    public async Task<IActionResult> PreviewPackage(
        [FromQuery] int provinceId,
        [FromQuery] int? districtId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        // Validate province
        var province = await _context.Provinces.FindAsync(provinceId);
        if (province == null)
        {
            return BadRequest(new { message = "Invalid province ID" });
        }

        // Validate district if provided
        District? district = null;
        if (districtId.HasValue)
        {
            district = await _context.Districts
                .FirstOrDefaultAsync(d => d.DistrictId == districtId.Value && d.ProvinceId == provinceId);

            if (district == null)
            {
                return BadRequest(new { message = "Invalid district ID or district not in selected province" });
            }
        }

        // Query approved dataset records
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == provinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

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

        // Count rows
        var rowCount = await query.CountAsync();

        if (rowCount == 0)
        {
            return Ok(new
            {
                provinceId,
                provinceName = province.Name,
                districtId,
                districtName = district?.Name,
                totalRecords = 0,
                dateRange = new
                {
                    startDate = startDate ?? DateTime.MinValue,
                    endDate = endDate ?? DateTime.MaxValue
                },
                pricePerRow = 0m,
                totalPrice = 0m,
                sampleRecords = new List<object>(),
                message = "No data available for selected filters"
            });
        }

        // Get pricing
        var pricing = await _context.SystemPricings
            .FirstOrDefaultAsync(p => p.PackageType == "DataPackage" && p.IsActive);

        if (pricing == null)
        {
            return StatusCode(500, new { message = "Pricing not configured" });
        }

        var totalPrice = rowCount * pricing.PricePerRow;

        // Get sample data (first 5 records)
        var sampleData = await query
            .Take(5)
            .Select(r => new
            {
                stationId = r.StationId,
                stationName = r.StationName,
                chargingTimestamp = r.ChargingTimestamp,
                energyKwh = r.EnergyKwh,
                voltage = r.Voltage,
                current = r.Current
            })
            .ToListAsync();

        return Ok(new
        {
            provinceId,
            provinceName = province.Name,
            districtId,
            districtName = district?.Name,
            totalRecords = rowCount,
            dateRange = new
            {
                startDate = startDate ?? DateTime.MinValue,
                endDate = endDate ?? DateTime.MaxValue
            },
            pricePerRow = pricing.PricePerRow,
            totalPrice,
            sampleRecords = sampleData
        });
    }

    /// <summary>
    /// Purchase data package
    /// </summary>
    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] PurchaseDataPackageDto dto)
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

        // Count rows again
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == dto.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (dto.DistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == dto.DistrictId.Value);
        }

        if (dto.StartDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp >= dto.StartDate.Value);
        }

        if (dto.EndDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp <= dto.EndDate.Value);
        }

        var rowCount = await query.CountAsync();

        if (rowCount == 0)
        {
            return BadRequest(new { message = "No data available for selected filters" });
        }

        // Get pricing
        var pricing = await _context.SystemPricings
            .FirstOrDefaultAsync(p => p.PackageType == "DataPackage" && p.IsActive);

        if (pricing == null)
        {
            return StatusCode(500, new { message = "Pricing not configured" });
        }

        var totalPrice = rowCount * pricing.PricePerRow;

        // Create purchase
        var purchase = new DataPackagePurchase
        {
            ConsumerId = consumer.ConsumerId,
            ProvinceId = dto.ProvinceId,
            DistrictId = dto.DistrictId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            RowCount = rowCount,
            PricePerRow = pricing.PricePerRow,
            TotalPrice = totalPrice,
            PurchaseDate = DateTime.Now,
            Status = "Pending",
            DownloadCount = 0,
            MaxDownload = 5
        };

        _context.DataPackagePurchases.Add(purchase);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Purchase created successfully. Please proceed to payment.",
            purchaseId = purchase.PurchaseId,
            rowCount,
            totalPrice,
            status = purchase.Status,
            paymentInfo = new
            {
                paymentType = "DataPackage",
                referenceId = purchase.PurchaseId,
                amount = totalPrice
            }
        });
    }

    /// <summary>
    /// Download purchased data package
    /// </summary>
    [HttpGet("{purchaseId}/download")]
    public async Task<IActionResult> Download(int purchaseId)
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

        // Get purchase
        var purchase = await _context.DataPackagePurchases
            .Include(p => p.Province)
            .Include(p => p.District)
            .FirstOrDefaultAsync(p => p.PurchaseId == purchaseId && p.ConsumerId == consumer.ConsumerId);

        if (purchase == null)
        {
            return NotFound(new { message = "Purchase not found" });
        }

        // Check status
        if (purchase.Status != "Active")
        {
            return BadRequest(new { message = $"Purchase status is {purchase.Status}. Payment may not be completed." });
        }

        // Check download limit
        if (purchase.DownloadCount >= purchase.MaxDownload)
        {
            return BadRequest(new { message = $"Download limit reached ({purchase.MaxDownload} downloads allowed)" });
        }

        // Query records
        var query = _context.DatasetRecords
            .Include(r => r.Dataset)
            .Where(r => r.ProvinceId == purchase.ProvinceId)
            .Where(r => r.Dataset!.ModerationStatus == "Approved");

        if (purchase.DistrictId.HasValue)
        {
            query = query.Where(r => r.DistrictId == purchase.DistrictId.Value);
        }

        if (purchase.StartDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp >= purchase.StartDate.Value);
        }

        if (purchase.EndDate.HasValue)
        {
            query = query.Where(r => r.ChargingTimestamp <= purchase.EndDate.Value);
        }

        var records = await query.OrderBy(r => r.ChargingTimestamp).ToListAsync();

        // Generate CSV
        var csv = new StringBuilder();
        csv.AppendLine("StationId,StationName,StationAddress,StationOperator,ProvinceId,DistrictId,ChargingTimestamp,EnergyKwh,Voltage,Current,PowerKw,DurationMinutes,ChargingCost,VehicleType,BatteryCapacityKwh,SocStart,SocEnd,DataSource");

        foreach (var record in records)
        {
            csv.AppendLine($"{record.StationId},{record.StationName},{record.StationAddress},{record.StationOperator}," +
                          $"{record.ProvinceId},{record.DistrictId},{record.ChargingTimestamp:yyyy-MM-dd HH:mm:ss}," +
                          $"{record.EnergyKwh},{record.Voltage},{record.Current},{record.PowerKw}," +
                          $"{record.DurationMinutes},{record.ChargingCost},{record.VehicleType}," +
                          $"{record.BatteryCapacityKwh},{record.SocStart},{record.SocEnd},{record.DataSource}");
        }

        // Update download count
        purchase.DownloadCount++;
        purchase.LastDownloadDate = DateTime.Now;
        await _context.SaveChangesAsync();

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        var provinceName = purchase.Province?.Name ?? "Unknown";
        var fileName = $"charging_data_{provinceName}_{DateTime.Now:yyyyMMdd}.csv";

        return File(bytes, "text/csv", fileName);
    }

    /// <summary>
    /// Get my data package purchases
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
                startDate = p.StartDate,
                endDate = p.EndDate,
                rowCount = p.RowCount,
                totalPrice = p.TotalPrice,
                purchaseDate = p.PurchaseDate,
                status = p.Status,
                downloadCount = p.DownloadCount,
                maxDownload = p.MaxDownload,
                lastDownloadDate = p.LastDownloadDate
            })
            .ToListAsync();

        return Ok(purchases);
    }
}
