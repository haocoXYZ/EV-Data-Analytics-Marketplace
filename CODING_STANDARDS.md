# 📐 CODING STANDARDS & CONVENTIONS

**Project**: EV Data Analytics Marketplace  
**Last Updated**: November 4, 2025  
**Status**: Active Development Standards

---

## 🎯 MỤC ĐÍCH

Document này quy định chuẩn mực code, naming conventions, và best practices cho toàn bộ dự án EV Data Analytics Marketplace.

**Tuân thủ 100%** các quy tắc dưới đây để đảm bảo:
- ✅ Code nhất quán trong toàn dự án
- ✅ Dễ đọc, dễ maintain
- ✅ Giảm bugs và conflicts
- ✅ Onboarding nhanh cho dev mới

---

## 🔤 NAMING CONVENTIONS

### 1. C# Backend Naming

#### Classes & Models (PascalCase)
```csharp
✅ ĐÚNG:
public class User { }
public class DataProvider { }
public class DataPackagePurchase { }
public class SystemPricing { }

❌ SAI:
public class user { }
public class data_provider { }
public class dataPackagePurchase { }
```

#### Properties (PascalCase)
```csharp
✅ ĐÚNG:
public class User
{
    public int UserId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public DateTime CreatedAt { get; set; }
}

❌ SAI:
public class User
{
    public int userId { get; set; }        // camelCase
    public string full_name { get; set; }  // snake_case
}
```

#### Methods (PascalCase với động từ)
```csharp
✅ ĐÚNG:
public async Task<IActionResult> GetDatasets()
public async Task<bool> ApproveDataset(int id)
public async Task<User> FindUserByEmail(string email)
public void ValidateInput()

❌ SAI:
public async Task<IActionResult> datasets()      // Thiếu động từ
public async Task<bool> approveDataset(int id)   // camelCase
public async Task<User> user_by_email(string email)  // snake_case
```

#### Private Fields (camelCase với underscore prefix)
```csharp
✅ ĐÚNG:
private readonly EVDataMarketplaceDbContext _context;
private readonly ILogger<DatasetsController> _logger;
private readonly ICsvParserService _csvParser;
private string _tempData;

❌ SAI:
private readonly EVDataMarketplaceDbContext context;   // No underscore
private readonly ILogger<DatasetsController> Logger;   // PascalCase
```

#### Constants (UPPER_CASE hoặc PascalCase)
```csharp
✅ ĐÚNG (Preferred):
public const int MAX_DOWNLOAD_COUNT = 5;
public const string DEFAULT_STATUS = "Active";
public const decimal PROVIDER_SHARE_PERCENT = 70.0m;

✅ CŨNG OK:
public const int MaxDownloadCount = 5;

❌ SAI:
public const int maxDownloadCount = 5;  // camelCase
```

#### Interfaces (PascalCase với tiền tố "I")
```csharp
✅ ĐÚNG:
public interface ICsvParserService { }
public interface IPaymentService { }
public interface IEmailService { }

❌ SAI:
public interface CsvParserService { }   // Thiếu "I"
public interface csvParserService { }   // camelCase
```

#### Namespaces (PascalCase)
```csharp
✅ ĐÚNG:
namespace EVDataMarketplace.API.Controllers;
namespace EVDataMarketplace.API.Models;
namespace EVDataMarketplace.API.Services;

❌ SAI:
namespace evdatamarketplace.api.controllers;
namespace EV_Data_Marketplace.API.Controllers;
```

---

### 2. Database Naming

#### Table Names (PascalCase - Singular)
```sql
✅ ĐÚNG:
User
DataProvider
Dataset
DatasetRecord
Province
District
Payment

❌ SAI:
Users                   -- Plural
data_provider          -- snake_case
datasetRecord          -- camelCase
```

**Convention**: Tên bảng LUÔN là **số ít** (singular), không dùng số nhiều

#### Column Names (snake_case - Lowercase)
```sql
✅ ĐÚNG:
user_id
full_name
email
created_at
moderation_status
province_id

❌ SAI:
UserId                 -- PascalCase
fullName              -- camelCase
CREATED_AT            -- UPPERCASE
```

**Convention**: Tên cột LUÔN là **snake_case** với chữ thường

#### Foreign Keys (table_singular_id)
```sql
✅ ĐÚNG:
user_id (FK → User.user_id)
provider_id (FK → DataProvider.provider_id)
dataset_id (FK → Dataset.dataset_id)
province_id (FK → Province.province_id)

❌ SAI:
userId
ProviderID
Dataset_ID
```

**Pattern**: `{related_table}_id`

#### Primary Keys (table_singular_id)
```sql
✅ ĐÚNG:
User table → user_id (PK)
DataProvider table → provider_id (PK)
Dataset table → dataset_id (PK)

❌ SAI:
User table → id (Too generic)
DataProvider table → providerId
```

#### Boolean Columns (is_/has_/can_ prefix)
```sql
✅ ĐÚNG:
is_active
is_verified
has_premium
can_download
auto_renew

❌ SAI:
active              -- Missing prefix
verified            -- Missing prefix
premium             -- Missing prefix
```

#### Timestamp Columns
```sql
✅ ĐÚNG:
created_at
updated_at
deleted_at
last_login_at
purchased_at

❌ SAI:
create_date
updateTime
deletedOn
```

**Pattern**: `{action}_at` cho timestamps

---

### 3. C# to Database Mapping

**Convention**: C# Properties (PascalCase) → DB Columns (snake_case)

```csharp
[Table("User")]  // Table name: PascalCase
public class User
{
    [Column("user_id")]        // Column: snake_case
    public int UserId { get; set; }
    
    [Column("full_name")]
    public string FullName { get; set; }
    
    [Column("email")]
    public string Email { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [Column("moderation_status")]
    public string ModerationStatus { get; set; }
}
```

**Quy tắc**:
1. Tên bảng: Match với tên class (PascalCase)
2. Tên cột: Luôn explicit với `[Column("snake_case")]`
3. Không bao giờ rely vào EF auto-mapping

---

### 4. API Endpoint Naming

#### Route Conventions
```csharp
✅ ĐÚNG:
[Route("api/[controller]")]        // Uses controller name

Examples:
GET    /api/datasets               // Get all
GET    /api/datasets/{id}          // Get by ID
POST   /api/datasets               // Create
PUT    /api/datasets/{id}          // Update
DELETE /api/datasets/{id}          // Delete

GET    /api/datasets/my-datasets   // Custom action
GET    /api/datasets/template      // Download template
```

#### HTTP Verbs (RESTful)
```csharp
✅ ĐÚNG:
[HttpGet]              // Read operations
[HttpPost]             // Create operations
[HttpPut]              // Update operations
[HttpDelete]           // Delete operations
[HttpPatch]            // Partial update

❌ SAI:
[HttpGet] CreateUser()     // Should be POST
[HttpPost] GetData()       // Should be GET
```

#### Action Names (PascalCase với động từ)
```csharp
✅ ĐÚNG:
public async Task<IActionResult> GetDatasets()
public async Task<IActionResult> GetDataset(int id)
public async Task<IActionResult> UploadDataset()
public async Task<IActionResult> ApproveDataset(int id)
public async Task<IActionResult> DownloadTemplate()

❌ SAI:
public async Task<IActionResult> Datasets()        // No verb
public async Task<IActionResult> dataset(int id)    // camelCase
public async Task<IActionResult> upload_dataset()   // snake_case
```

---

### 5. DTOs (Data Transfer Objects)

#### Naming Pattern: `{Action}{Entity}Dto`
```csharp
✅ ĐÚNG:
public class LoginDto { }
public class RegisterDto { }
public class UploadDatasetDto { }
public class PurchaseDataPackageDto { }
public class UpdatePricingDto { }

❌ SAI:
public class Login { }                  // Missing "Dto"
public class DataPackagePurchaseDto { } // Entity name, not action
public class DtoPurchase { }            // "Dto" should be suffix
```

#### DTO Properties (PascalCase)
```csharp
✅ ĐÚNG:
public class PurchaseDataPackageDto
{
    [Required]
    public int ProvinceId { get; set; }
    
    public int? DistrictId { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
}

❌ SAI:
public class PurchaseDataPackageDto
{
    public int provinceId { get; set; }     // camelCase
    public int? district_id { get; set; }   // snake_case
}
```

---

### 6. JavaScript/Frontend Naming

#### Variables & Functions (camelCase)
```javascript
✅ ĐÚNG:
const userName = "John";
const apiBaseUrl = "http://localhost:5258";
function getUserData() { }
async function fetchDatasets() { }

❌ SAI:
const UserName = "John";        // PascalCase
const api_base_url = "...";     // snake_case
function GetUserData() { }      // PascalCase
```

#### Constants (UPPER_CASE)
```javascript
✅ ĐÚNG:
const API_BASE_URL = "http://localhost:5258";
const MAX_FILE_SIZE = 5000000;
const DEFAULT_PAGE_SIZE = 10;

❌ SAI:
const apiBaseUrl = "...";       // camelCase
const maxFileSize = 5000000;    // camelCase
```

#### Classes & Constructors (PascalCase)
```javascript
✅ ĐÚNG:
class DataPackageService {
    constructor() { }
}

class AuthManager {
    constructor() { }
}

❌ SAI:
class dataPackageService { }    // camelCase
class auth_manager { }          // snake_case
```

#### File Names (kebab-case)
```
✅ ĐÚNG:
login.html
consumer-data-packages.html
provider-dashboard.html
api-service.js
auth-manager.js

❌ SAI:
Login.html                      // PascalCase
consumer_data_packages.html     // snake_case
providerDashboard.html          // camelCase
```

---

## 📏 CODE FORMATTING

### C# Code Style

#### Indentation
```csharp
✅ ĐÚNG: 4 spaces (not tabs)
public class User
{
    public int UserId { get; set; }
    
    public async Task<bool> ValidateAsync()
    {
        if (condition)
        {
            // code
        }
        return true;
    }
}

❌ SAI: Tabs or 2 spaces
```

#### Braces
```csharp
✅ ĐÚNG: Allman style (braces on new line)
if (condition)
{
    // code
}

for (int i = 0; i < 10; i++)
{
    // code
}

❌ SAI: K&R style
if (condition) {
    // code
}
```

#### Using Statements
```csharp
✅ ĐÚNG: File-scoped namespace (C# 10+)
using System;
using Microsoft.AspNetCore.Mvc;
using EVDataMarketplace.API.Models;

namespace EVDataMarketplace.API.Controllers;

public class DatasetsController : ControllerBase
{
    // code
}

❌ SAI: Old-style namespace
using System;

namespace EVDataMarketplace.API.Controllers
{
    public class DatasetsController : ControllerBase
    {
        // code
    }
}
```

---

## 🎨 BEST PRACTICES

### 1. Error Handling

```csharp
✅ ĐÚNG: Proper try-catch với logging
public async Task<IActionResult> GetDataset(int id)
{
    try
    {
        var dataset = await _context.Datasets.FindAsync(id);
        
        if (dataset == null)
        {
            return NotFound(new { message = "Dataset not found" });
        }
        
        return Ok(dataset);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting dataset {Id}", id);
        return StatusCode(500, new { message = "Internal server error" });
    }
}

❌ SAI: Swallow exceptions
public async Task<IActionResult> GetDataset(int id)
{
    try
    {
        var dataset = await _context.Datasets.FindAsync(id);
        return Ok(dataset);
    }
    catch { }  // Silent fail
    return null;
}
```

### 2. Async/Await

```csharp
✅ ĐÚNG: Async all the way
public async Task<IActionResult> GetDatasets()
{
    var datasets = await _context.Datasets.ToListAsync();
    return Ok(datasets);
}

❌ SAI: Blocking calls
public IActionResult GetDatasets()
{
    var datasets = _context.Datasets.ToList();  // Blocking
    return Ok(datasets);
}
```

### 3. Dependency Injection

```csharp
✅ ĐÚNG: Constructor injection
public class DatasetsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context;
    private readonly ILogger<DatasetsController> _logger;
    
    public DatasetsController(
        EVDataMarketplaceDbContext context,
        ILogger<DatasetsController> logger)
    {
        _context = context;
        _logger = logger;
    }
}

❌ SAI: Direct instantiation
public class DatasetsController : ControllerBase
{
    private readonly EVDataMarketplaceDbContext _context = new();  // ❌
}
```

### 4. Validation

```csharp
✅ ĐÚNG: Data annotations + manual checks
public class PurchaseDataPackageDto
{
    [Required(ErrorMessage = "Province ID is required")]
    public int ProvinceId { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "Invalid district ID")]
    public int? DistrictId { get; set; }
}

// In controller:
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}

❌ SAI: No validation
public class PurchaseDataPackageDto
{
    public int ProvinceId { get; set; }  // No validation
}
```

### 5. Response Format

```csharp
✅ ĐÚNG: Consistent response objects
return Ok(new
{
    message = "Success",
    data = dataset,
    timestamp = DateTime.UtcNow
});

return BadRequest(new
{
    message = "Invalid input",
    errors = new[] { "Province not found" }
});

❌ SAI: Inconsistent formats
return Ok(dataset);  // Sometimes object
return Ok("Success");  // Sometimes string
```

---

## 📝 COMMENT & DOCUMENTATION

### XML Documentation Comments

```csharp
✅ ĐÚNG:
/// <summary>
/// Upload new dataset with CSV file
/// </summary>
/// <param name="dto">Dataset upload information</param>
/// <returns>Created dataset information</returns>
[HttpPost]
public async Task<IActionResult> UploadDataset([FromForm] UploadDatasetDto dto)
{
    // Implementation
}

❌ SAI: No documentation
[HttpPost]
public async Task<IActionResult> UploadDataset([FromForm] UploadDatasetDto dto)
{
    // No XML comments
}
```

### Code Comments

```csharp
✅ ĐÚNG: Comment WHY, not WHAT
// Calculate provider share based on row count proportionally
var providerShare = totalAmount * (dataset.RowCount / totalRows) * 0.7m;

// Validate MIME type to prevent non-CSV uploads
if (!file.ContentType.Equals("text/csv"))
{
    return BadRequest("Only CSV files allowed");
}

❌ SAI: Comment obvious things
// Set user id
userId = 123;

// Loop through datasets
foreach (var dataset in datasets)
{
}
```

---

## 🔒 QUY TẮC NGƯỜI DÙNG

### 1. User Roles

**4 Roles - Không thay đổi tên**:
```
Admin           → Full access
Moderator       → Moderation only
DataProvider    → Upload & earnings
DataConsumer    → Purchase & download
```

**Quy tắc**:
- ❌ KHÔNG tạo thêm roles mới ngoài 4 roles trên
- ❌ KHÔNG đổi tên roles
- ✅ Nếu cần thêm quyền → Extend existing role

### 2. Password Policy

```
Min Length: 6 characters
Requirements:
  - At least 1 letter
  - At least 1 number
  - Special characters recommended

Test passwords: "Test123!"
```

### 3. User Status

```sql
Active      → Can login
Inactive    → Cannot login (temporary)
Suspended   → Cannot login (banned)
```

### 4. User Email

```
Format: valid email format
Unique: true (no duplicates)
Case: Store lowercase
Verify: Email verification (optional feature)
```

---

## 🗄️ DATABASE CONVENTIONS

### 1. Data Types

```sql
✅ ĐÚNG:
user_id             INT
email               NVARCHAR(150)
password            NVARCHAR(255)
created_at          DATETIME2(7)
price               DECIMAL(18,2)
is_active           BIT

❌ SAI:
user_id             BIGINT           -- Unless needed
email               VARCHAR(150)     -- Use NVARCHAR for Unicode
created_at          DATETIME         -- Use DATETIME2
price               FLOAT            -- Use DECIMAL for money
```

### 2. NULL vs NOT NULL

```sql
✅ ĐÚNG:
user_id         INT NOT NULL           -- Primary keys
email           NVARCHAR(150) NOT NULL -- Required fields
description     NVARCHAR(MAX) NULL     -- Optional fields
district_id     INT NULL               -- Optional FK

❌ SAI:
email           NVARCHAR(150) NULL     -- Email should be required
```

### 3. Default Values

```sql
✅ ĐÚNG:
created_at      DATETIME2(7) NOT NULL DEFAULT GETDATE()
status          NVARCHAR(50) NOT NULL DEFAULT 'Active'
is_active       BIT NOT NULL DEFAULT 1

❌ SAI:
created_at      DATETIME2(7) NULL      -- Should have default
status          NVARCHAR(50) NULL      -- Should have default
```

### 4. Indexes

```sql
✅ TẠO INDEX CHO:
- Primary Keys (automatic)
- Foreign Keys
- Columns used in WHERE clauses
- Columns used in JOIN
- Columns used in ORDER BY

Example:
CREATE INDEX IX_Dataset_ProviderId ON Dataset(provider_id);
CREATE INDEX IX_DatasetRecord_ProvinceId ON DatasetRecord(province_id);
```

---

## 🎯 STATUS VALUES

### Dataset Status
```
Draft       → Being edited
Active      → Published & available
Inactive    → Temporarily hidden
```

### Moderation Status
```
Pending     → Waiting for review
UnderReview → Being reviewed
Approved    → Accepted
Rejected    → Rejected with reason
```

### Purchase Status
```
Pending     → Awaiting payment
Active      → Paid & available
Expired     → Time expired
Cancelled   → User cancelled
```

### Payment Status
```
Pending     → Payment initiated
Completed   → Payment successful
Failed      → Payment failed
Refunded    → Refunded to user
```

### Payout Status
```
Pending     → Waiting to process
Completed   → Paid to provider
Failed      → Payout failed
```

---

## ✅ CHECKLIST TRƯỚC KHI COMMIT

### Code Quality
- [ ] Code follows naming conventions
- [ ] No hardcoded values (use configuration)
- [ ] Error handling implemented
- [ ] Async/await used properly
- [ ] Try-catch blocks in place
- [ ] Input validation added

### Database
- [ ] Column names in snake_case
- [ ] Table names in PascalCase (singular)
- [ ] Foreign keys properly named
- [ ] Indexes created for lookups
- [ ] Default values set

### API
- [ ] RESTful routes
- [ ] Proper HTTP verbs
- [ ] Authorization attributes
- [ ] Response format consistent
- [ ] XML documentation added

### Testing
- [ ] Endpoint tested with Postman
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases considered

---

## 🚫 COMMON MISTAKES

### ❌ Mistake 1: Inconsistent Naming
```csharp
// ❌ WRONG: Mixing styles
public class user {  // Should be "User"
    public int UserId { get; set; }
    public string full_name { get; set; }  // Should be "FullName"
}

// ✅ CORRECT:
public class User {
    public int UserId { get; set; }
    public string FullName { get; set; }
}
```

### ❌ Mistake 2: Missing Async
```csharp
// ❌ WRONG: Blocking call
public IActionResult GetData() {
    var data = _context.Datasets.ToList();  // Blocks thread
    return Ok(data);
}

// ✅ CORRECT:
public async Task<IActionResult> GetData() {
    var data = await _context.Datasets.ToListAsync();
    return Ok(data);
}
```

### ❌ Mistake 3: No Validation
```csharp
// ❌ WRONG: No input check
public async Task<IActionResult> GetDataset(int id) {
    var dataset = await _context.Datasets.FindAsync(id);
    return Ok(dataset);  // What if null?
}

// ✅ CORRECT:
public async Task<IActionResult> GetDataset(int id) {
    if (id <= 0) {
        return BadRequest("Invalid ID");
    }
    
    var dataset = await _context.Datasets.FindAsync(id);
    
    if (dataset == null) {
        return NotFound("Dataset not found");
    }
    
    return Ok(dataset);
}
```

---

## 📚 REFERENCES

### C# Guidelines
- Microsoft C# Coding Conventions: https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions
- .NET API Design Guidelines: https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/

### Database Guidelines
- SQL Server Naming Conventions: Snake_case for columns, PascalCase for tables

### API Guidelines
- RESTful API Design: https://restfulapi.net/
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

---

**Document Version**: 1.0.0  
**Last Updated**: November 4, 2025  
**Status**: Active & Enforced

**⚠️ LƯU Ý**: Tất cả code mới PHẢI tuân theo conventions này. Code review sẽ reject nếu vi phạm!

