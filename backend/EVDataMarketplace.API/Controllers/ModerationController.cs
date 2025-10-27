using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.Services;

namespace EVDataMarketplace.API.Controllers;

// B3: Moderator kiem duyet va dang tai thong tin cua Data Provider
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Moderator")]
public class ModerationController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly IFileService _fileService;
    private readonly ICsvParserService _csvParserService;

    public ModerationController(EVDataMarketplaceDbContext context, IFileService fileService, ICsvParserService csvParserService)
    {
        _context = context;
        _fileService = fileService;
        _csvParserService = csvParserService;
    }

    // GET: api/moderation/pending - Lay tat ca datasets dang cho kiem duyet
    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<DatasetDto>>> GetPendingDatasets()
    {
        var datasets = await _context.Datasets
            .Include(d => d.DataProvider)
                .ThenInclude(dp => dp!.User)
            .Include(d => d.PricingTier)
            .Where(d => d.ModerationStatus == "Pending" || d.ModerationStatus == "UnderReview")
            .Select(d => new DatasetDto
            {
                DatasetId = d.DatasetId,
                ProviderId = d.ProviderId,
                ProviderName = d.DataProvider!.CompanyName,
                Name = d.Name,
                Description = d.Description,
                Category = d.Category,
                DataFormat = d.DataFormat,
                DataSizeMb = d.DataSizeMb,
                UploadDate = d.UploadDate,
                Status = d.Status,
                ModerationStatus = d.ModerationStatus,
                TierName = d.PricingTier!.TierName
            })
            .ToListAsync();

        return Ok(datasets);
    }

    // POST: api/moderation/review - Kiem duyet dataset
    [HttpPost("review")]
    public async Task<IActionResult> ReviewDataset([FromBody] DatasetModerationDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var dataset = await _context.Datasets.FindAsync(request.DatasetId);

        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Validate moderation status
        if (request.ModerationStatus != "Approved" && request.ModerationStatus != "Rejected")
        {
            return BadRequest(new { message = "Invalid moderation status. Must be Approved or Rejected" });
        }

        // Update dataset moderation status
        dataset.ModerationStatus = request.ModerationStatus;

        if (request.ModerationStatus == "Approved")
        {
            dataset.Status = "Active";
            dataset.Visibility = "Public";
        }
        else if (request.ModerationStatus == "Rejected")
        {
            dataset.Status = "Rejected";
            dataset.Visibility = "Private";
        }

        dataset.LastUpdated = DateTime.Now;

        // Create moderation record
        var moderation = new DatasetModeration
        {
            DatasetId = request.DatasetId,
            ModeratorUserId = userId,
            ReviewDate = DateTime.Now,
            ModerationStatus = request.ModerationStatus,
            Comments = request.Comments
        };

        _context.DatasetModerations.Add(moderation);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Dataset {request.ModerationStatus.ToLower()} successfully" });
    }

    // GET: api/moderation/history/5 - Xem lich su kiem duyet cua dataset
    [HttpGet("history/{datasetId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetModerationHistory(int datasetId)
    {
        var history = await _context.DatasetModerations
            .Include(m => m.Moderator)
            .Where(m => m.DatasetId == datasetId)
            .OrderByDescending(m => m.ReviewDate)
            .Select(m => new
            {
                m.ModerationId,
                m.DatasetId,
                ModeratorName = m.Moderator!.FullName,
                m.ReviewDate,
                m.ModerationStatus,
                m.Comments
            })
            .ToListAsync();

        return Ok(history);
    }

    // GET: api/moderation/{id}/preview - Xem data sample để kiểm tra chất lượng (Moderator only)
    [HttpGet("{id}/preview")]
    public async Task<ActionResult<object>> PreviewDataset(int id, [FromQuery] int sampleSize = 10)
    {
        var dataset = await _context.Datasets.FindAsync(id);
        
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Get sample records from database
        var records = await _context.DatasetRecords
            .Where(r => r.DatasetId == id)
            .OrderBy(r => r.RowNumber)
            .Take(sampleSize)
            .Select(r => r.RecordData)
            .ToListAsync();

        // Get total record count
        var totalRecords = await _context.DatasetRecords.CountAsync(r => r.DatasetId == id);

        return Ok(new
        {
            datasetId = id,
            datasetName = dataset.Name,
            totalRecords = totalRecords,
            sampleSize = records.Count,
            sampleRecords = records,
            hasFile = !string.IsNullOrEmpty(dataset.FilePath) && _fileService.FileExists(dataset.FilePath ?? ""),
            filePath = dataset.FilePath
        });
    }

    // GET: api/moderation/{id}/download - Download full file để kiểm tra (Moderator only)
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDatasetForReview(int id)
    {
        var dataset = await _context.Datasets.FindAsync(id);
        
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Download from file if available
        if (!string.IsNullOrEmpty(dataset.FilePath) && _fileService.FileExists(dataset.FilePath))
        {
            var stream = await _fileService.DownloadFileAsync(dataset.FilePath);
            var fileName = Path.GetFileName(dataset.FilePath);
            return File(stream, "application/octet-stream", fileName);
        }

        // Otherwise, generate CSV from database records
        var records = await _context.DatasetRecords
            .Where(r => r.DatasetId == id)
            .OrderBy(r => r.RowNumber)
            .Select(r => r.RecordData)
            .ToListAsync();

        if (records.Count == 0)
        {
            return NotFound(new { message = "No data found for this dataset" });
        }

        // Generate CSV from records
        var csvContent = _csvParserService.ConvertRecordsToCsv(records);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csvContent);
        var memoryStream = new MemoryStream(bytes);

        return File(memoryStream, "text/csv", $"{dataset.Name?.Replace(" ", "_")}_review.csv");
    }
}
