# 🔄 EV Data Marketplace - Data Flow Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Data Provider Flow](#data-provider-flow)
3. [Data Consumer Flow](#data-consumer-flow)
4. [Real Data vs Mock Data](#real-data-vs-mock-data)
5. [Dashboard Visualization](#dashboard-visualization)

---

## 🎯 System Overview

EV Data Marketplace là một nền tảng marketplace cho dữ liệu trạm sạc xe điện (EV Charging Stations).

### Key Players:
- **Data Providers**: Upload dữ liệu thô (raw data) từ các trạm sạc
- **Data Consumers**: Mua và sử dụng dữ liệu qua 3 packages:
  - 📥 Data Packages (one-time download)
  - 🔄 Subscription Packages (dashboard access)
  - 🔌 API Packages (programmatic access)
- **Admin**: Duyệt datasets, quản lý hệ thống

---

## 📤 Data Provider Flow

### 1. Provider Registration
```
User Register → Select "Data Provider" role → Create profile
```

### 2. Data Upload Process

#### Step 1: Download CSV Template
```http
GET /api/datasets/template
```
Returns: `charging_station_template.csv`

#### Step 2: Prepare Data
Provider chuẩn bị dữ liệu theo format:
```csv
StationId,StationName,ProvinceId,DistrictId,ChargingTimestamp,EnergyKwh,DurationMinutes,PowerKw,VehicleType
ST001,VinFast Station A,79,1,2024-01-15 08:30:00,45.5,60,50,VinFast VF8
ST002,Green Energy Hub,79,2,2024-01-15 09:15:00,38.2,45,50,Tesla Model 3
```

#### Step 3: Upload CSV
```http
POST /api/datasets
Content-Type: multipart/form-data
Authorization: Bearer {provider_token}

{
  "csvFile": [file],
  "name": "Q1 2024 Charging Data",
  "description": "Charging station data for Q1 2024",
  "category": "EV Charging"
}
```

#### Step 4: CSV Parsing & Validation
Backend (`CsvParserService`) validates:
- ✅ Required columns present
- ✅ Valid ProvinceId & DistrictId
- ✅ Valid data types
- ✅ Positive EnergyKwh values
- ✅ Valid timestamps

#### Step 5: Data Storage
Valid records → Saved to **`DatasetRecords`** table:
```sql
INSERT INTO DatasetRecords (
    DatasetId, ProvinceId, DistrictId,
    StationId, StationName, ChargingTimestamp,
    EnergyKwh, DurationMinutes, PowerKw,
    VehicleType, DataSource, CreatedAt
) VALUES (...)
```

#### Step 6: Admin Moderation
```
Status: "Pending" → Admin Review → "Approved" / "Rejected"
```

---

## 📥 Data Consumer Flow

### 1. Consumer Registration
```
User Register → Select "Data Consumer" role → Create profile
```

### 2. Browse Catalog
```http
GET /api/catalog
```
Returns: Available data by Province/District

### 3. Purchase Options

#### Option A: Data Package (One-time Download)
```http
POST /api/data-packages/purchase
{
  "provinceId": 79,
  "districtId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Result:**
- Purchase record created
- Can download CSV up to `maxDownload` times
- Data = **REAL DATA from DatasetRecords**

#### Option B: Subscription Package (Dashboard Access)
```http
POST /api/subscription-packages/purchase
{
  "provinceId": 79,
  "districtId": 1,
  "billingCycle": "Monthly"
}
```

**Result:**
- Subscription created (auto-renew)
- Access to **Interactive Dashboard** with charts
- Data = **REAL DATA from DatasetRecords**

#### Option C: API Package (Programmatic Access)
```http
POST /api/api-packages/purchase
{
  "apiCallsRequested": 10000,
  "provinceId": 79
}
```

**Result:**
- API keys generated
- Programmatic data access
- Usage tracking
- Data = **REAL DATA from DatasetRecords**

---

## 🔄 Real Data vs Mock Data

### ❌ OLD Implementation (Mock Data)
```csharp
// BAD: PurchasesController generating fake data
private string GenerateMockCSVData(DataPackagePurchase purchase) {
    // Generating random fake data...
    var transactionId = $"TXN{DateTime.Now.Year}{i:D6}";
    // ...
}
```

### ✅ NEW Implementation (Real Data)
```csharp
// GOOD: Query actual data from DatasetRecords
var query = _context.DatasetRecords
    .Include(r => r.Dataset)
    .Where(r => r.ProvinceId == subscription.ProvinceId)
    .Where(r => r.Dataset!.ModerationStatus == "Approved")
    .Where(r => r.ChargingTimestamp >= startDate);
```

### Data Sources Comparison

| Feature | Old (Mock) | New (Real) |
|---------|------------|-----------|
| Data Package Download | ❌ Fake CSV | ✅ Real from DB |
| Subscription Dashboard | ❌ Mock charts | ✅ Real charts |
| API Access | ❌ Not implemented | ✅ Real data queries |
| Data Source | Random generator | Provider uploads |
| Accuracy | 0% (fake) | 100% (real) |

---

## 📊 Dashboard Visualization

### Architecture
```
DatasetRecords (SQL Server)
        ↓
Backend API (ASP.NET Core)
        ↓
REST API Endpoints
        ↓
Frontend (React + Recharts)
        ↓
Interactive Charts
```

### Dashboard Components

#### 1. KPI Cards
```typescript
// Real-time statistics
totalStations: COUNT(DISTINCT StationId)
totalEnergyKwh: SUM(EnergyKwh)
averageChargingDuration: AVG(DurationMinutes)
totalChargingSessions: COUNT(*)
```

#### 2. Area Chart - Energy Over Time
```sql
SELECT 
    CAST(ChargingTimestamp AS DATE) as date,
    SUM(EnergyKwh) as totalEnergy
FROM DatasetRecords
WHERE ProvinceId = @provinceId
  AND ChargingTimestamp >= DATEADD(day, -30, GETDATE())
  AND ModerationStatus = 'Approved'
GROUP BY CAST(ChargingTimestamp AS DATE)
ORDER BY date
```

Visual: Gradient blue area chart với smooth curves

#### 3. Pie Chart - Station Distribution
```sql
SELECT 
    d.Name as districtName,
    COUNT(DISTINCT r.StationId) as stationCount
FROM DatasetRecords r
JOIN Districts d ON r.DistrictId = d.DistrictId
WHERE r.ProvinceId = @provinceId
  AND r.ChargingTimestamp >= DATEADD(day, -30, GETDATE())
GROUP BY d.DistrictId, d.Name
```

Visual: Multi-color pie chart với percentage labels

#### 4. Bar Chart - Peak Hours
```sql
SELECT 
    DATEPART(HOUR, ChargingTimestamp) as hour,
    COUNT(*) as sessions
FROM DatasetRecords
WHERE ProvinceId = @provinceId
  AND ChargingTimestamp >= DATEADD(day, -30, GETDATE())
GROUP BY DATEPART(HOUR, ChargingTimestamp)
ORDER BY hour
```

Visual: 24 bars (00:00 - 23:00) với gradient colors

---

## 🔍 Data Query Filters

### Location-based
```csharp
// Province filter (required)
query = query.Where(r => r.ProvinceId == subscription.ProvinceId);

// District filter (optional)
if (subscription.DistrictId.HasValue) {
    query = query.Where(r => r.DistrictId == subscription.DistrictId.Value);
}
```

### Time-based
```csharp
// Last 30 days
var thirtyDaysAgo = DateTime.Now.AddDays(-30);
query = query.Where(r => r.ChargingTimestamp >= thirtyDaysAgo);

// Custom date range (for Data Packages)
query = query.Where(r => 
    r.ChargingTimestamp >= purchase.StartDate &&
    r.ChargingTimestamp <= purchase.EndDate
);
```

### Status-based
```csharp
// Only approved datasets
query = query
    .Include(r => r.Dataset)
    .Where(r => r.Dataset!.ModerationStatus == "Approved");
```

---

## 📈 Performance Optimization

### Indexing Strategy
```sql
-- Index for location queries
CREATE INDEX IX_DatasetRecords_Location 
ON DatasetRecords(ProvinceId, DistrictId);

-- Index for time-based queries
CREATE INDEX IX_DatasetRecords_Timestamp 
ON DatasetRecords(ChargingTimestamp);

-- Composite index for dashboard queries
CREATE INDEX IX_DatasetRecords_Dashboard 
ON DatasetRecords(ProvinceId, DistrictId, ChargingTimestamp)
INCLUDE (StationId, EnergyKwh, DurationMinutes);
```

### Caching Strategy (Future)
```csharp
// Cache dashboard data for 5 minutes
[ResponseCache(Duration = 300)]
public async Task<IActionResult> GetDashboard(int subscriptionId) {
    // ...
}
```

---

## 🔐 Security & Access Control

### Authentication
```csharp
[Authorize(Roles = "DataConsumer")]
public async Task<IActionResult> GetDashboard(int subscriptionId) {
    // Verify subscription belongs to consumer
    var consumer = await GetCurrentConsumer();
    var subscription = await _context.SubscriptionPackagePurchases
        .FirstOrDefaultAsync(s => 
            s.SubscriptionId == subscriptionId && 
            s.ConsumerId == consumer.ConsumerId
        );
}
```

### Data Isolation
- Providers can only see their own datasets
- Consumers can only access purchased data
- Admin can see all data

### Download Limits
```csharp
// Data Package download tracking
if (purchase.DownloadCount >= purchase.MaxDownload) {
    return BadRequest(new { 
        message = "Download limit reached" 
    });
}

purchase.DownloadCount++;
purchase.LastDownloadDate = DateTime.UtcNow;
await _context.SaveChangesAsync();
```

---

## 📊 Data Statistics

### Aggregation Examples

#### Total Energy by Province
```csharp
var energyByProvince = await _context.DatasetRecords
    .GroupBy(r => r.Province)
    .Select(g => new {
        Province = g.Key.Name,
        TotalEnergy = g.Sum(r => r.EnergyKwh),
        TotalSessions = g.Count()
    })
    .OrderByDescending(x => x.TotalEnergy)
    .ToListAsync();
```

#### Average Charging Duration
```csharp
var avgDuration = await _context.DatasetRecords
    .Where(r => r.DurationMinutes.HasValue)
    .AverageAsync(r => r.DurationMinutes.Value);
```

#### Peak Hour Analysis
```csharp
var peakHour = await _context.DatasetRecords
    .GroupBy(r => r.ChargingTimestamp.Hour)
    .Select(g => new {
        Hour = g.Key,
        Sessions = g.Count()
    })
    .OrderByDescending(x => x.Sessions)
    .FirstOrDefaultAsync();
```

---

## 🚀 Complete User Journey

### Provider Journey
```
1. Register as Provider
2. Download CSV template
3. Collect charging data from stations
4. Format data according to template
5. Upload CSV via web interface
6. Wait for admin approval
7. Data becomes available to consumers
8. Earn revenue from data sales
```

### Consumer Journey
```
1. Register as Consumer
2. Browse available data in catalog
3. Select Province/District
4. Choose purchase type:
   - Data Package → Download CSV
   - Subscription → View Dashboard
   - API Package → Get API keys
5. Use purchased data for analysis
6. Renew/extend as needed
```

### Admin Journey
```
1. Login as Admin
2. Review pending datasets
3. Check data quality
4. Approve/Reject uploads
5. Monitor marketplace activity
6. Generate reports
```

---

## 📝 Summary

### Key Points:
✅ **Real Data**: Tất cả dữ liệu đều từ provider uploads, không có mock data
✅ **Interactive Charts**: Dashboard sử dụng Recharts với Area, Pie, Bar charts
✅ **Location-based**: Filter theo Province & District
✅ **Time-based**: Last 30 days hoặc custom date range
✅ **Secure**: JWT authentication, role-based access, download limits
✅ **Scalable**: Indexed queries, caching strategy, efficient aggregation

### Data Quality Assurance:
- CSV validation at upload
- Admin moderation
- Type checking
- Range validation
- Duplicate detection

---

## 📞 Contact

For questions or support:
- Technical: dev@evdatamarketplace.com
- Business: sales@evdatamarketplace.com
- Documentation: https://docs.evdatamarketplace.com


