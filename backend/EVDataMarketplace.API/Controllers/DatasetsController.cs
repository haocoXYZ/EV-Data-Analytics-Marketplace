using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using EVDataMarketplace.API.Data;
using EVDataMarketplace.API.DTOs;
using EVDataMarketplace.API.Models;
using EVDataMarketplace.API.Services;

namespace EVDataMarketplace.API.Controllers;

// B2: Data Provider cung cap thong tin len nen tang
// B4: Data Consumer tim kiem thong tin ve data
[ApiController]
[Route("api/[controller]")]
public class DatasetsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly IFileService _fileService;
    private readonly ICsvParserService _csvParserService;
    private readonly ILogger<DatasetsController> _logger;

    public DatasetsController(
        EVDataMarketplaceDbContext context,
        IFileService fileService,
        ICsvParserService csvParserService,
        ILogger<DatasetsController> logger)
    {
        _context = context;
        _fileService = fileService;
        _csvParserService = csvParserService;
        _logger = logger;
    }

    // GET: api/datasets - Public, chi hien thi approved datasets
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DatasetDto>>> GetDatasets(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null)
    {
        var query = _context.Datasets
            .Include(d => d.DataProvider)
                .ThenInclude(dp => dp!.User)
            .Include(d => d.PricingTier)
            .Where(d => d.ModerationStatus == "Approved" && d.Status == "Active");

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(d => d.Category == category);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(d => d.Name!.Contains(search) || d.Description!.Contains(search));
        }

        var datasets = await query
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
                TierName = d.PricingTier!.TierName,
                BasePricePerMb = d.PricingTier.BasePricePerMb
            })
            .ToListAsync();

        return Ok(datasets);
    }

    // GET: api/datasets/5
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<DatasetDto>> GetDataset(int id)
    {
        var dataset = await _context.Datasets
            .Include(d => d.DataProvider)
                .ThenInclude(dp => dp!.User)
            .Include(d => d.PricingTier)
            .FirstOrDefaultAsync(d => d.DatasetId == id);

        if (dataset == null)
        {
            return NotFound();
        }

        return Ok(new DatasetDto
        {
            DatasetId = dataset.DatasetId,
            ProviderId = dataset.ProviderId,
            ProviderName = dataset.DataProvider?.CompanyName,
            Name = dataset.Name,
            Description = dataset.Description,
            Category = dataset.Category,
            DataFormat = dataset.DataFormat,
            DataSizeMb = dataset.DataSizeMb,
            UploadDate = dataset.UploadDate,
            Status = dataset.Status,
            ModerationStatus = dataset.ModerationStatus,
            TierName = dataset.PricingTier?.TierName,
            BasePricePerMb = dataset.PricingTier?.BasePricePerMb
        });
    }

    // GET: api/datasets/my - Provider xem datasets cua minh
    [Authorize(Roles = "DataProvider")]
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<DatasetDto>>> GetMyDatasets()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var provider = await _context.DataProviders
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        var datasets = await _context.Datasets
            .Include(d => d.PricingTier)
            .Where(d => d.ProviderId == provider.ProviderId)
            .Select(d => new DatasetDto
            {
                DatasetId = d.DatasetId,
                ProviderId = d.ProviderId,
                Name = d.Name,
                Description = d.Description,
                Category = d.Category,
                DataFormat = d.DataFormat,
                DataSizeMb = d.DataSizeMb,
                UploadDate = d.UploadDate,
                Status = d.Status,
                ModerationStatus = d.ModerationStatus,
                TierName = d.PricingTier!.TierName,
                BasePricePerMb = d.PricingTier.BasePricePerMb
            })
            .ToListAsync();

        return Ok(datasets);
    }

    // POST: api/datasets - Provider upload dataset with CSV file and save to database
    [Authorize(Roles = "DataProvider")]
    [HttpPost]
    public async Task<ActionResult<DatasetDto>> CreateDataset([FromForm] DatasetCreateDto request, IFormFile? file)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var provider = await _context.DataProviders
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        // Validate pricing tier exists
        if (request.TierId.HasValue)
        {
            var tierExists = await _context.PricingTiers.AnyAsync(t => t.TierId == request.TierId && t.IsActive);
            if (!tierExists)
            {
                return BadRequest(new { message = "Invalid pricing tier" });
            }
        }

        string? filePath = null;
        decimal? fileSizeMb = null;
        int recordCount = 0;

        // Upload and parse CSV file if provided
        if (file != null && file.Length > 0)
        {
            try
            {
                // Save file to disk
                filePath = await _fileService.UploadFileAsync(file, "datasets");
                fileSizeMb = file.Length / (1024m * 1024m); // Convert to MB

                // Parse CSV and save to database
                if (file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("Parsing CSV file: {FileName}", file.FileName);

                    using var stream = file.OpenReadStream();
                    var csvRecords = await _csvParserService.ParseCsvAsync(stream);
                    recordCount = csvRecords.Count;

                    _logger.LogInformation("Parsed {Count} records from CSV", recordCount);

                    // Create dataset first
                    var dataset = new Dataset
                    {
                        ProviderId = provider.ProviderId,
                        TierId = request.TierId,
                        Name = request.Name,
                        Description = request.Description,
                        Category = request.Category,
                        DataFormat = request.DataFormat ?? "CSV",
                        DataSizeMb = fileSizeMb,
                        FilePath = filePath,
                        UploadDate = DateTime.Now,
                        LastUpdated = DateTime.Now,
                        Status = "Pending",
                        ModerationStatus = "Pending",
                        Visibility = "Private"
                    };

                    _context.Datasets.Add(dataset);
                    await _context.SaveChangesAsync(); // Save to get DatasetId

                    _logger.LogInformation("Dataset created with ID: {DatasetId}", dataset.DatasetId);

                    // Save CSV records to database
                    var datasetRecords = new List<DatasetRecord>();
                    for (int i = 0; i < csvRecords.Count; i++)
                    {
                        var recordData = JsonSerializer.Serialize(csvRecords[i]);
                        datasetRecords.Add(new DatasetRecord
                        {
                            DatasetId = dataset.DatasetId,
                            RecordData = recordData,
                            RowNumber = i + 1,
                            CreatedAt = DateTime.Now
                        });
                    }

                    _context.DatasetRecords.AddRange(datasetRecords);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Saved {Count} records to database for Dataset {DatasetId}", recordCount, dataset.DatasetId);

                    return CreatedAtAction(nameof(GetDataset), new { id = dataset.DatasetId }, new DatasetDto
                    {
                        DatasetId = dataset.DatasetId,
                        ProviderId = dataset.ProviderId,
                        Name = dataset.Name,
                        Description = dataset.Description,
                        Category = dataset.Category,
                        DataFormat = dataset.DataFormat,
                        DataSizeMb = dataset.DataSizeMb,
                        UploadDate = dataset.UploadDate,
                        Status = dataset.Status,
                        ModerationStatus = dataset.ModerationStatus
                    });
                }
            }
            catch (InvalidDataException ex)
            {
                _logger.LogError(ex, "Invalid CSV file format");
                return BadRequest(new { message = "Invalid CSV file format: " + ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading dataset");
                return StatusCode(500, new { message = "Error uploading dataset: " + ex.Message });
            }
        }

        // Fallback for non-CSV files (just save metadata)
        var datasetFallback = new Dataset
        {
            ProviderId = provider.ProviderId,
            TierId = request.TierId,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            DataFormat = request.DataFormat ?? "CSV",
            DataSizeMb = fileSizeMb,
            FilePath = filePath,
            UploadDate = DateTime.Now,
            LastUpdated = DateTime.Now,
            Status = "Pending",
            ModerationStatus = "Pending",
            Visibility = "Private"
        };

        _context.Datasets.Add(datasetFallback);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDataset), new { id = datasetFallback.DatasetId }, new DatasetDto
        {
            DatasetId = datasetFallback.DatasetId,
            ProviderId = datasetFallback.ProviderId,
            Name = datasetFallback.Name,
            Description = datasetFallback.Description,
            Category = datasetFallback.Category,
            DataFormat = datasetFallback.DataFormat,
            DataSizeMb = datasetFallback.DataSizeMb,
            UploadDate = datasetFallback.UploadDate,
            Status = datasetFallback.Status,
            ModerationStatus = datasetFallback.ModerationStatus
        });
    }

    // GET: api/datasets/{id}/download - Download dataset file
    [Authorize(Roles = "DataConsumer")]
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDataset(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var dataset = await _context.Datasets.FindAsync(id);
        if (dataset == null || string.IsNullOrEmpty(dataset.FilePath))
        {
            return NotFound(new { message = "Dataset file not found" });
        }

        // Check if consumer has purchased this dataset
        var hasPurchase = await _context.OneTimePurchases
            .AnyAsync(p => p.DatasetId == id
                && p.ConsumerId == consumer.ConsumerId
                && p.Status == "Completed"
                && p.DownloadCount < p.MaxDownload);

        if (!hasPurchase)
        {
            return Forbid("You need to purchase this dataset first or download limit exceeded");
        }

        // Check if file exists
        if (!_fileService.FileExists(dataset.FilePath))
        {
            return NotFound(new { message = "File not found on server" });
        }

        // Increment download count
        var purchase = await _context.OneTimePurchases
            .FirstOrDefaultAsync(p => p.DatasetId == id
                && p.ConsumerId == consumer.ConsumerId
                && p.Status == "Completed");

        if (purchase != null)
        {
            purchase.DownloadCount++;
            await _context.SaveChangesAsync();
        }

        // Download file
        var stream = await _fileService.DownloadFileAsync(dataset.FilePath);
        var fileName = Path.GetFileName(dataset.FilePath);

        return File(stream, "application/octet-stream", fileName);
    }

    // PUT: api/datasets/5 - Provider update own dataset (chi khi chua approved)
    [Authorize(Roles = "DataProvider")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDataset(int id, [FromBody] DatasetCreateDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var provider = await _context.DataProviders
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        var dataset = await _context.Datasets.FindAsync(id);

        if (dataset == null)
        {
            return NotFound();
        }

        if (dataset.ProviderId != provider.ProviderId)
        {
            return Forbid();
        }

        // Chi cho phep edit neu chua approved
        if (dataset.ModerationStatus == "Approved")
        {
            return BadRequest(new { message = "Cannot edit approved dataset" });
        }

        dataset.Name = request.Name;
        dataset.Description = request.Description;
        dataset.Category = request.Category;
        dataset.TierId = request.TierId;
        dataset.LastUpdated = DateTime.Now;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/datasets/5 - Provider delete own dataset
    [Authorize(Roles = "DataProvider")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDataset(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var provider = await _context.DataProviders
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (provider == null)
        {
            return NotFound(new { message = "Provider profile not found" });
        }

        var dataset = await _context.Datasets.FindAsync(id);

        if (dataset == null)
        {
            return NotFound();
        }

        if (dataset.ProviderId != provider.ProviderId)
        {
            return Forbid();
        }

        dataset.Status = "Inactive";
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
