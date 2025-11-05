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
                BasePricePerMb = d.PricingTier.BasePricePerMb,
                ApiPricePerCall = d.PricingTier.ApiPricePerCall,
                SubscriptionPricePerRegion = d.PricingTier.SubscriptionPricePerRegion
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
            BasePricePerMb = dataset.PricingTier?.BasePricePerMb,
            ApiPricePerCall = dataset.PricingTier?.ApiPricePerCall,
            SubscriptionPricePerRegion = dataset.PricingTier?.SubscriptionPricePerRegion
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

    // GET: api/datasets/my-purchases - Consumer xem datasets da mua (ALL TYPES)
    [Authorize(Roles = "DataConsumer")]
    [HttpGet("my-purchases")]
    public async Task<ActionResult<object>> GetMyPurchasedDatasets()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        // Get One-Time Purchases
        var oneTimePurchases = await _context.OneTimePurchases
            .Include(p => p.Dataset)
                .ThenInclude(d => d!.DataProvider)
                    .ThenInclude(dp => dp!.User)
            .Include(p => p.Dataset)
                .ThenInclude(d => d!.PricingTier)
            .Where(p => p.ConsumerId == consumer.ConsumerId && p.Status == "Completed")
            .Select(p => new
            {
                PurchaseType = "OneTime",
                PurchaseId = p.OtpId,
                p.DatasetId,
                Dataset = new DatasetDto
                {
                    DatasetId = p.Dataset!.DatasetId,
                    ProviderId = p.Dataset.ProviderId,
                    ProviderName = p.Dataset.DataProvider!.CompanyName,
                    Name = p.Dataset.Name,
                    Description = p.Dataset.Description,
                    Category = p.Dataset.Category,
                    DataFormat = p.Dataset.DataFormat,
                    DataSizeMb = p.Dataset.DataSizeMb,
                    UploadDate = p.Dataset.UploadDate,
                    Status = p.Dataset.Status,
                    ModerationStatus = p.Dataset.ModerationStatus,
                    TierName = p.Dataset.PricingTier!.TierName,
                    BasePricePerMb = p.Dataset.PricingTier.BasePricePerMb
                },
                PurchaseDetails = new
                {
                    p.PurchaseDate,
                    p.StartDate,
                    p.EndDate,
                    p.TotalPrice,
                    p.LicenseType,
                    p.DownloadCount,
                    p.MaxDownload,
                    p.Status
                }
            })
            .ToListAsync();

        // Get Subscriptions
        var subscriptions = await _context.Subscriptions
            .Include(s => s.Dataset)
                .ThenInclude(d => d!.DataProvider)
                    .ThenInclude(dp => dp!.User)
            .Include(s => s.Dataset)
                .ThenInclude(d => d!.PricingTier)
            .Include(s => s.Province)
            .Where(s => s.ConsumerId == consumer.ConsumerId && s.RenewalStatus == "Active")
            .Select(s => new
            {
                PurchaseType = "Subscription",
                PurchaseId = s.SubId,
                s.DatasetId,
                Dataset = new DatasetDto
                {
                    DatasetId = s.Dataset!.DatasetId,
                    ProviderId = s.Dataset.ProviderId,
                    ProviderName = s.Dataset.DataProvider!.CompanyName,
                    Name = s.Dataset.Name,
                    Description = s.Dataset.Description,
                    Category = s.Dataset.Category,
                    DataFormat = s.Dataset.DataFormat,
                    DataSizeMb = s.Dataset.DataSizeMb,
                    UploadDate = s.Dataset.UploadDate,
                    Status = s.Dataset.Status,
                    ModerationStatus = s.Dataset.ModerationStatus,
                    TierName = s.Dataset.PricingTier!.TierName
                },
                PurchaseDetails = new
                {
                    ProvinceName = s.Province!.Name,
                    s.ProvinceId,
                    s.SubStart,
                    s.SubEnd,
                    s.RenewalCycle,
                    s.RenewalStatus,
                    s.RequestCount,
                    s.TotalPrice
                }
            })
            .ToListAsync();

        // Get API Packages
        var apiPackages = await _context.APIPackages
            .Include(a => a.Dataset)
                .ThenInclude(d => d!.DataProvider)
                    .ThenInclude(dp => dp!.User)
            .Include(a => a.Dataset)
                .ThenInclude(d => d!.PricingTier)
            .Where(a => a.ConsumerId == consumer.ConsumerId && a.Status == "Active")
            .Select(a => new
            {
                PurchaseType = "APIPackage",
                PurchaseId = a.ApiId,
                a.DatasetId,
                Dataset = new DatasetDto
                {
                    DatasetId = a.Dataset!.DatasetId,
                    ProviderId = a.Dataset.ProviderId,
                    ProviderName = a.Dataset.DataProvider!.CompanyName,
                    Name = a.Dataset.Name,
                    Description = a.Dataset.Description,
                    Category = a.Dataset.Category,
                    DataFormat = a.Dataset.DataFormat,
                    DataSizeMb = a.Dataset.DataSizeMb,
                    UploadDate = a.Dataset.UploadDate,
                    Status = a.Dataset.Status,
                    ModerationStatus = a.Dataset.ModerationStatus,
                    TierName = a.Dataset.PricingTier!.TierName
                },
                PurchaseDetails = new
                {
                    a.ApiKey,
                    a.ApiCallsPurchased,
                    a.ApiCallsUsed,
                    CallsRemaining = a.ApiCallsPurchased - a.ApiCallsUsed,
                    a.PricePerCall,
                    a.PurchaseDate,
                    a.ExpiryDate,
                    a.TotalPaid,
                    a.Status
                }
            })
            .ToListAsync();

        return Ok(new
        {
            OneTimePurchases = oneTimePurchases,
            Subscriptions = subscriptions,
            APIPackages = apiPackages,
            TotalPurchases = oneTimePurchases.Count + subscriptions.Count + apiPackages.Count
        });
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
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
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

        return File(memoryStream, "text/csv", $"{dataset.Name?.Replace(" ", "_")}_data.csv");
    }

    // GET: api/datasets/{id}/records - View dataset records (for purchased datasets)
    [Authorize(Roles = "DataConsumer")]
    [HttpGet("{id}/records")]
    public async Task<ActionResult<object>> GetDatasetRecords(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 100)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        // Check if consumer has purchased this dataset
        var hasPurchase = await _context.OneTimePurchases
            .AnyAsync(p => p.DatasetId == id
                && p.ConsumerId == consumer.ConsumerId
                && p.Status == "Completed");

        if (!hasPurchase)
        {
            return Forbid("You need to purchase this dataset first");
        }

        var totalRecords = await _context.DatasetRecords.CountAsync(r => r.DatasetId == id);
        
        var records = await _context.DatasetRecords
            .Where(r => r.DatasetId == id)
            .OrderBy(r => r.RowNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.RecordId,
                r.RowNumber,
                r.RecordData,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            datasetId = id,
            page,
            pageSize,
            totalRecords,
            totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
            records
        });
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

    // GET: api/datasets/{id}/api-key - Get API key for dataset (if purchased via Subscription or API Package)
    [Authorize(Roles = "DataConsumer")]
    [HttpGet("{id}/api-key")]
    public async Task<ActionResult<object>> GetDatasetApiKey(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var dataset = await _context.Datasets.FindAsync(id);
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Check if consumer has active Subscription
        var activeSubscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.DatasetId == id 
                && s.ConsumerId == consumer.ConsumerId 
                && s.RenewalStatus == "Active");

        if (activeSubscription != null)
        {
            return Ok(new
            {
                ApiKey = activeSubscription.SubId.ToString(), // Use SubId as API key
                PurchaseType = "Subscription",
                PurchaseId = activeSubscription.SubId,
                ProvinceId = activeSubscription.ProvinceId,
                SubStart = activeSubscription.SubStart,
                SubEnd = activeSubscription.SubEnd,
                RequestCount = activeSubscription.RequestCount,
                RenewalStatus = activeSubscription.RenewalStatus
            });
        }

        // Check if consumer has active API Package
        var activeApiPackage = await _context.APIPackages
            .FirstOrDefaultAsync(a => a.DatasetId == id 
                && a.ConsumerId == consumer.ConsumerId 
                && a.Status == "Active");

        if (activeApiPackage != null)
        {
            return Ok(new
            {
                ApiKey = activeApiPackage.ApiKey ?? activeApiPackage.ApiId.ToString(),
                PurchaseType = "APIPackage",
                PurchaseId = activeApiPackage.ApiId,
                ApiCallsPurchased = activeApiPackage.ApiCallsPurchased,
                ApiCallsUsed = activeApiPackage.ApiCallsUsed,
                CallsRemaining = activeApiPackage.ApiCallsPurchased - activeApiPackage.ApiCallsUsed,
                ExpiryDate = activeApiPackage.ExpiryDate
            });
        }

        return Forbid("You need to purchase this dataset first (via Subscription or API Package)");
    }

    // POST: api/datasets/{id}/api/call - Call API để lấy real-time data (cho Subscription và API Package)
    [Authorize(Roles = "DataConsumer")]
    [HttpPost("{id}/api/call")]
    public async Task<ActionResult<object>> CallDatasetApi(int id, [FromBody] Dictionary<string, object>? requestParams)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var dataset = await _context.Datasets
            .Include(d => d.PricingTier)
            .FirstOrDefaultAsync(d => d.DatasetId == id);

        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }

        // Check Subscription
        var activeSubscription = await _context.Subscriptions
            .Include(s => s.Province)
            .FirstOrDefaultAsync(s => s.DatasetId == id 
                && s.ConsumerId == consumer.ConsumerId 
                && s.RenewalStatus == "Active");

        if (activeSubscription != null)
        {
            // Unlimited API calls for Subscription
            activeSubscription.RequestCount++;
            await _context.SaveChangesAsync();

            // IMPORTANT: For subscription, get ALL datasets from ALL providers in the same province
            // In current database structure, providers don't have provinceId field
            // So we aggregate ALL active datasets to simulate data from multiple providers
            
            var provinceId = activeSubscription.ProvinceId;
            var provinceName = activeSubscription.Province?.Name;
            
            // Get all ACTIVE datasets from DIFFERENT providers IN THE SAME PROVINCE
            // When consumer subscribes to "Hà Nội", they get data from ALL providers in Hà Nội
            var datasets = await _context.Datasets
                .Include(d => d.DataProvider)
                .ThenInclude(p => p!.Province)
                .Where(d => d.Status == "Active" && d.ModerationStatus == "Approved" && 
                           d.DataProvider != null && d.DataProvider.ProvinceId == provinceId)
                .ToListAsync();

            // Group by provider name, taking first dataset from each provider
            var allActiveDatasets = datasets
                .GroupBy(d => d.DataProvider != null ? d.DataProvider.CompanyName : "Unknown")
                .Select(g => g.First())
                .Take(5) // Limit to 5 providers max
                .ToList();

            // Aggregate data from multiple providers
            var allRecords = new List<string>();
            var providerNames = new List<string>();

            foreach (var ds in allActiveDatasets)
            {
                var records = await _context.DatasetRecords
                    .Where(r => r.DatasetId == ds.DatasetId)
                    .OrderBy(r => Guid.NewGuid())
                    .Take(3) // 3 records per provider
                    .Select(r => r.RecordData)
                    .ToListAsync();
                
                allRecords.AddRange(records);
                if (ds.DataProvider != null)
                {
                    providerNames.Add(ds.DataProvider.CompanyName);
                }
            }

            return Ok(new
            {
                data = allRecords,
                purchaseType = "Subscription",
                subscriptionId = activeSubscription.SubId,
                province = provinceName,
                provinceId = provinceId,
                datasetsIncluded = allActiveDatasets.Select(d => new 
                { 
                    d.DatasetId, 
                    d.Name, 
                    providerName = d.DataProvider?.CompanyName ?? "Unknown",
                    d.Category
                }).ToList(),
                providersAggregated = providerNames,
                totalProviders = allActiveDatasets.Count,
                requestCount = activeSubscription.RequestCount,
                message = $"Unlimited API calls - Aggregated EV data from {allActiveDatasets.Count} different providers"
            });
        }

        // Check API Package
        var activeApiPackage = await _context.APIPackages
            .FirstOrDefaultAsync(a => a.DatasetId == id 
                && a.ConsumerId == consumer.ConsumerId 
                && a.Status == "Active"
                && a.ApiCallsUsed < a.ApiCallsPurchased);

        if (activeApiPackage != null)
        {
            // Limited API calls
            activeApiPackage.ApiCallsUsed++;
            
            // Check if exhausted
            if (activeApiPackage.ApiCallsUsed >= activeApiPackage.ApiCallsPurchased)
            {
                activeApiPackage.Status = "Exhausted";
            }

            await _context.SaveChangesAsync();

            // Get sample data
            var records = await _context.DatasetRecords
                .Where(r => r.DatasetId == id)
                .OrderBy(r => Guid.NewGuid())
                .Take(10)
                .Select(r => r.RecordData)
                .ToListAsync();

            return Ok(new
            {
                data = records,
                purchaseType = "APIPackage",
                apiPackageId = activeApiPackage.ApiId,
                callsRemaining = activeApiPackage.ApiCallsPurchased - activeApiPackage.ApiCallsUsed,
                status = activeApiPackage.Status
            });
        }

        return Forbid("No active purchase found for this dataset");
    }

    // GET: api/datasets/my-subscriptions - List all active subscriptions
    [Authorize(Roles = "DataConsumer")]
    [HttpGet("my-subscriptions")]
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
                .ThenInclude(d => d!.DataProvider)
            .Include(s => s.Province)
            .Where(s => s.ConsumerId == consumer.ConsumerId)
            .Select(s => new
            {
                s.SubId,
                Dataset = new
                {
                    s.Dataset!.DatasetId,
                    s.Dataset.Name,
                    ProviderName = s.Dataset.DataProvider!.CompanyName
                },
                ProvinceName = s.Province!.Name,
                s.SubStart,
                s.SubEnd,
                s.RenewalStatus,
                s.RenewalCycle,
                s.RequestCount,
                s.TotalPrice
            })
            .ToListAsync();

        return Ok(subscriptions);
    }

    // GET: api/datasets/my-api-packages - List all API packages
    [Authorize(Roles = "DataConsumer")]
    [HttpGet("my-api-packages")]
    public async Task<ActionResult<IEnumerable<object>>> GetMyApiPackages()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var consumer = await _context.DataConsumers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (consumer == null)
        {
            return NotFound(new { message = "Consumer profile not found" });
        }

        var apiPackages = await _context.APIPackages
            .Include(a => a.Dataset)
                .ThenInclude(d => d!.DataProvider)
            .Where(a => a.ConsumerId == consumer.ConsumerId)
            .Select(a => new
            {
                a.ApiId,
                Dataset = new
                {
                    a.Dataset!.DatasetId,
                    a.Dataset.Name,
                    ProviderName = a.Dataset.DataProvider!.CompanyName
                },
                a.ApiKey,
                a.ApiCallsPurchased,
                a.ApiCallsUsed,
                CallsRemaining = a.ApiCallsPurchased - a.ApiCallsUsed,
                a.PurchaseDate,
                a.ExpiryDate,
                a.Status
            })
            .ToListAsync();

        return Ok(apiPackages);
    }
}
