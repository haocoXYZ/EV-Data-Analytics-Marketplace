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
[Route("api/[controller]")]
public class DatasetsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly ICsvParserService _csvParser;

    public DatasetsController(EVDataMarketplaceDbContext context, ICsvParserService csvParser)
    {
        _context = context;
        _csvParser = csvParser;
    }

    /// <summary>
    /// Download CSV template for providers
    /// </summary>
    [HttpGet("template")]
    [AllowAnonymous]
    public IActionResult DownloadTemplate()
    {
        var templateBytes = _csvParser.GenerateCsvTemplate();
        return File(templateBytes, "text/csv", "charging_station_template.csv");
    }

    /// <summary>
    /// Upload new dataset (DataProvider only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "DataProvider")]
    public async Task<IActionResult> UploadDataset([FromForm] UploadDatasetDto dto)
    {
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return Unauthorized(new { message = "User email not found in token" });
        }

        // Get provider
        var provider = await _context.DataProviders
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Email == userEmail);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        // Validate CSV file
        if (dto.CsvFile == null || dto.CsvFile.Length == 0)
        {
            return BadRequest(new { message = "CSV file is required" });
        }

        if (!dto.CsvFile.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Only CSV files are allowed" });
        }

        // Create dataset record
        var dataset = new Dataset
        {
            ProviderId = provider.ProviderId,
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            DataFormat = "CSV",
            UploadDate = DateTime.Now,
            Status = "Active",
            ModerationStatus = "Pending",
            Visibility = "Public",
            RowCount = 0
        };

        _context.Datasets.Add(dataset);
        await _context.SaveChangesAsync();

        // Parse CSV
        using var stream = dto.CsvFile.OpenReadStream();
        var (success, message, records) = await _csvParser.ParseAndValidateCsvAsync(
            stream,
            dataset.DatasetId,
            provider.CompanyName);

        if (!success)
        {
            // Delete dataset if parsing failed
            _context.Datasets.Remove(dataset);
            await _context.SaveChangesAsync();
            return BadRequest(new { message });
        }

        // Save records
        await _context.DatasetRecords.AddRangeAsync(records);

        // Update row count
        dataset.RowCount = records.Count;
        dataset.LastUpdated = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Dataset uploaded successfully",
            datasetId = dataset.DatasetId,
            rowCount = records.Count,
            status = dataset.ModerationStatus
        });
    }

    /// <summary>
    /// Get dataset by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDataset(int id)
    {
        var dataset = await _context.Datasets
            .Include(d => d.DataProvider)
            .ThenInclude(p => p!.User)
            .FirstOrDefaultAsync(d => d.DatasetId == id);

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
                companyName = dataset.DataProvider?.CompanyName,
                contactEmail = dataset.DataProvider?.ContactEmail
            }
        });
    }

    /// <summary>
    /// Get datasets (with filters)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDatasets(
        [FromQuery] string? status,
        [FromQuery] string? moderationStatus,
        [FromQuery] int? providerId)
    {
        var query = _context.Datasets
            .Include(d => d.DataProvider)
            .ThenInclude(p => p!.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(d => d.Status == status);
        }

        if (!string.IsNullOrEmpty(moderationStatus))
        {
            query = query.Where(d => d.ModerationStatus == moderationStatus);
        }

        if (providerId.HasValue)
        {
            query = query.Where(d => d.ProviderId == providerId.Value);
        }

        // If user is a provider, only show their datasets
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (!string.IsNullOrEmpty(userEmail) && User.IsInRole("DataProvider"))
        {
            var provider = await _context.DataProviders
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.User.Email == userEmail);

            if (provider != null)
            {
                query = query.Where(d => d.ProviderId == provider.ProviderId);
            }
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
                lastUpdated = d.LastUpdated,
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

    /// <summary>
    /// Get my datasets (Provider only)
    /// </summary>
    [HttpGet("my-datasets")]
    [Authorize(Roles = "DataProvider")]
    public async Task<IActionResult> GetMyDatasets()
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

        var datasets = await _context.Datasets
            .Where(d => d.ProviderId == provider.ProviderId)
            .OrderByDescending(d => d.UploadDate)
            .Select(d => new
            {
                datasetId = d.DatasetId,
                name = d.Name,
                description = d.Description,
                category = d.Category,
                rowCount = d.RowCount,
                uploadDate = d.UploadDate,
                lastUpdated = d.LastUpdated,
                status = d.Status,
                moderationStatus = d.ModerationStatus
            })
            .ToListAsync();

        return Ok(datasets);
    }
}
