using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.Models;
using System.Security.Claims;
using System.Text;

namespace EVDataMarketplace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Moderator,Admin")]
public class ModerationController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;

    public ModerationController(EVDataMarketplaceDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get pending datasets for moderation
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingDatasets()
    {
        var datasets = await _context.Datasets
            .Include(d => d.DataProvider)
                .ThenInclude(p => p!.User)
            .Where(d => d.ModerationStatus == "Pending" || d.ModerationStatus == "UnderReview")
            .OrderBy(d => d.UploadDate)
            .Select(d => new
            {
                datasetId = d.DatasetId,
                name = d.Name,
                description = d.Description,
                category = d.Category,
                rowCount = d.RowCount,
                uploadDate = d.UploadDate,
                moderationStatus = d.ModerationStatus,
                provider = new
                {
                    providerId = d.DataProvider!.ProviderId,
                    companyName = d.DataProvider.CompanyName,
                    contactEmail = d.DataProvider.ContactEmail
                }
            })
            .ToListAsync();

        return Ok(datasets);
    }

    /// <summary>
    /// Get dataset details for moderation
    /// </summary>
    [HttpGet("{datasetId}")]
    public async Task<IActionResult> GetDatasetForModeration(int datasetId)
    {
        var dataset = await _context.Datasets
            .Include(d => d.DataProvider)
                .ThenInclude(p => p!.User)
            .Include(d => d.DatasetModerations)
                .ThenInclude(m => m.Moderator)
            .FirstOrDefaultAsync(d => d.DatasetId == datasetId);

        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        return Ok(new
        {
            datasetId = dataset.DatasetId,
            name = dataset.Name,
            description = dataset.Description,
            category = dataset.Category,
            rowCount = dataset.RowCount,
            uploadDate = dataset.UploadDate,
            lastUpdated = dataset.LastUpdated,
            status = dataset.Status,
            moderationStatus = dataset.ModerationStatus,
            provider = new
            {
                providerId = dataset.DataProvider!.ProviderId,
                companyName = dataset.DataProvider.CompanyName,
                contactEmail = dataset.DataProvider.ContactEmail,
                contactPhone = dataset.DataProvider.ContactPhone
            },
            moderationHistory = dataset.DatasetModerations.Select(m => new
            {
                moderationId = m.ModerationId,
                reviewDate = m.ReviewDate,
                status = m.ModerationStatus,
                comments = m.Comments,
                moderatorName = m.Moderator?.FullName
            }).ToList()
        });
    }

    /// <summary>
    /// Preview dataset records (paginated)
    /// </summary>
    [HttpGet("{datasetId}/preview-data")]
    public async Task<IActionResult> PreviewData(
        int datasetId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var dataset = await _context.Datasets.FindAsync(datasetId);
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        if (pageSize > 100)
        {
            pageSize = 100; // Max page size
        }

        var totalRecords = await _context.DatasetRecords
            .CountAsync(r => r.DatasetId == datasetId);

        var records = await _context.DatasetRecords
            .Include(r => r.Province)
            .Include(r => r.District)
            .Where(r => r.DatasetId == datasetId)
            .OrderBy(r => r.ChargingTimestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                recordId = r.RecordId,
                stationId = r.StationId,
                stationName = r.StationName,
                stationAddress = r.StationAddress,
                stationOperator = r.StationOperator,
                provinceName = r.Province != null ? r.Province.Name : "Unknown",
                districtName = r.District != null ? r.District.Name : "Unknown",
                chargingTimestamp = r.ChargingTimestamp,
                energyKwh = r.EnergyKwh,
                voltage = r.Voltage,
                current = r.Current,
                powerKw = r.PowerKw,
                durationMinutes = r.DurationMinutes,
                chargingCost = r.ChargingCost,
                vehicleType = r.VehicleType,
                batteryCapacityKwh = r.BatteryCapacityKwh,
                socStart = r.SocStart,
                socEnd = r.SocEnd,
                dataSource = r.DataSource
            })
            .ToListAsync();

        return Ok(new
        {
            datasetId,
            datasetName = dataset.Name,
            totalRecords,
            currentPage = page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
            records
        });
    }

    /// <summary>
    /// Download dataset as CSV for review
    /// </summary>
    [HttpGet("{datasetId}/download")]
    public async Task<IActionResult> DownloadDataset(int datasetId)
    {
        var dataset = await _context.Datasets.FindAsync(datasetId);
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        var records = await _context.DatasetRecords
            .Include(r => r.Province)
            .Include(r => r.District)
            .Where(r => r.DatasetId == datasetId)
            .OrderBy(r => r.ChargingTimestamp)
            .ToListAsync();

        if (records.Count == 0)
        {
            return NotFound(new { message = "No records found for this dataset" });
        }

        // Generate CSV content
        var csv = new StringBuilder();
        
        // Header
        csv.AppendLine("StationId,StationName,StationAddress,StationOperator,Province,District,ChargingTimestamp,EnergyKwh,Voltage,Current,PowerKw,DurationMinutes,ChargingCost,VehicleType,BatteryCapacityKwh,SocStart,SocEnd,DataSource");

        // Data rows
        foreach (var record in records)
        {
            csv.AppendLine($"{record.StationId},{EscapeCsv(record.StationName)},{EscapeCsv(record.StationAddress)},{EscapeCsv(record.StationOperator)},{EscapeCsv(record.Province?.Name ?? "")},{EscapeCsv(record.District?.Name ?? "")},{record.ChargingTimestamp:yyyy-MM-dd HH:mm:ss},{record.EnergyKwh},{record.Voltage},{record.Current},{record.PowerKw},{record.DurationMinutes},{record.ChargingCost},{EscapeCsv(record.VehicleType)},{record.BatteryCapacityKwh},{record.SocStart},{record.SocEnd},{EscapeCsv(record.DataSource)}");
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        var fileName = $"{dataset.Name.Replace(" ", "_")}_{DateTime.Now:yyyyMMdd}.csv";

        return File(bytes, "text/csv", fileName);
    }

    private string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }

    /// <summary>
    /// Approve dataset
    /// </summary>
    [HttpPut("{datasetId}/approve")]
    public async Task<IActionResult> ApproveDataset(int datasetId, [FromBody] ModerationActionDto? dto)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var moderator = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (moderator == null)
        {
            return NotFound(new { message = "Moderator not found" });
        }

        var dataset = await _context.Datasets.FindAsync(datasetId);
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Update dataset status
        dataset.ModerationStatus = "Approved";
        dataset.Status = "Active";
        dataset.LastUpdated = DateTime.Now;

        // Create moderation record
        var moderation = new DatasetModeration
        {
            DatasetId = datasetId,
            ModeratorUserId = moderator.UserId,
            ReviewDate = DateTime.Now,
            ModerationStatus = "Approved",
            Comments = dto?.Comments ?? "Dataset approved"
        };

        _context.DatasetModerations.Add(moderation);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Dataset approved successfully",
            datasetId,
            moderationStatus = dataset.ModerationStatus,
            status = dataset.Status
        });
    }

    /// <summary>
    /// Reject dataset
    /// </summary>
    [HttpPut("{datasetId}/reject")]
    public async Task<IActionResult> RejectDataset(int datasetId, [FromBody] ModerationActionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.Comments))
        {
            return BadRequest(new { message = "Rejection reason (comments) is required" });
        }

        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found" });
        }

        var moderator = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (moderator == null)
        {
            return NotFound(new { message = "Moderator not found" });
        }

        var dataset = await _context.Datasets.FindAsync(datasetId);
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Update dataset status
        dataset.ModerationStatus = "Rejected";
        dataset.Status = "Inactive";
        dataset.LastUpdated = DateTime.Now;

        // Create moderation record
        var moderation = new DatasetModeration
        {
            DatasetId = datasetId,
            ModeratorUserId = moderator.UserId,
            ReviewDate = DateTime.Now,
            ModerationStatus = "Rejected",
            Comments = dto.Comments
        };

        _context.DatasetModerations.Add(moderation);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Dataset rejected",
            datasetId,
            moderationStatus = dataset.ModerationStatus,
            status = dataset.Status,
            reason = dto.Comments
        });
    }

    /// <summary>
    /// Get all datasets with moderation status
    /// </summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetAllDatasets([FromQuery] string? status)
    {
        var query = _context.Datasets
            .Include(d => d.DataProvider)
                .ThenInclude(p => p!.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(d => d.ModerationStatus == status);
        }

        var datasets = await query
            .OrderByDescending(d => d.UploadDate)
            .Select(d => new
            {
                datasetId = d.DatasetId,
                name = d.Name,
                description = d.Description,
                category = d.Category,
                rowCount = d.RowCount,
                uploadDate = d.UploadDate,
                status = d.Status,
                moderationStatus = d.ModerationStatus,
                provider = new
                {
                    providerId = d.DataProvider!.ProviderId,
                    companyName = d.DataProvider.CompanyName
                }
            })
            .ToListAsync();

        return Ok(datasets);
    }
}

public class ModerationActionDto
{
    public string? Comments { get; set; }
}
