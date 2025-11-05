# 📦 Data Package Download - Mapping & Flow

## 🎯 Overview
Tài liệu này mô tả chi tiết luồng hoạt động của chức năng **Data Package Download** - cho phép customer mua và download dữ liệu sạc xe điện.

---

## 🗺️ Complete Flow Mapping

### 1️⃣ **Customer Mua Data Package**

#### Frontend Flow:
```
Customer vào trang Data Packages
    ↓
Chọn Province/District + Date Range
    ↓
Hệ thống tính số lượng rows & giá
    ↓
Customer nhấn "Purchase"
    ↓
POST /api/datapackage/purchase
    ↓
Redirect đến PayOS payment gateway
    ↓
Customer thanh toán
    ↓
PayOS webhook callback → update status = "Active"
```

#### API Endpoints Involved:
- `GET /api/datapackage/preview` - Preview số rows & giá
- `POST /api/datapackage/purchase` - Tạo purchase order
- `POST /api/webhook/payos` - Nhận callback từ PayOS

---

### 2️⃣ **Customer Download Data Package**

#### Frontend Flow:
```
Customer vào "My Purchases"
    ↓
Xem danh sách Data Packages đã mua
    ↓
Chọn package (status = Active)
    ↓
Nhấn "Download CSV" button
    ↓
GET /api/purchases/download/{purchaseId}
    ↓
Browser tự động download file CSV
    ↓
Download count tăng lên (1/5, 2/5, ...)
```

#### API Endpoint:
**Primary**: `GET /api/purchases/download/{purchaseId}` (PurchasesController)

**Alternative** (cũ): `GET /api/datapackage/{purchaseId}/download` (DataPackageController)

---

## 🔑 Key Components

### Backend Controllers

#### 1. **PurchasesController.cs** (RECOMMENDED)
```csharp
[HttpGet("download/{purchaseId}")]
public async Task<IActionResult> DownloadDataPackage(int purchaseId)
```

**Features**:
- ✅ Verify JWT token & user ownership
- ✅ Check purchase status = "Active"
- ✅ Check download limit (downloadCount < maxDownload)
- ✅ Generate **mock CSV data** on-the-fly
- ✅ Update download tracking (count & timestamp)
- ✅ Return CSV file with proper headers

**Location**: `backend/EVDataMarketplace.API/Controllers/PurchasesController.cs` (line 285-339)

---

#### 2. **DataPackageController.cs** (ALTERNATIVE)
```csharp
[HttpGet("{purchaseId}/download")]
public async Task<IActionResult> Download(int purchaseId)
```

**Features**:
- ✅ Similar validation as PurchasesController
- ✅ Queries **real data** from `DatasetRecords` table
- ✅ Filters by Province, District, Date Range
- ✅ Only includes approved datasets

**Location**: `backend/EVDataMarketplace.API/Controllers/DataPackageController.cs` (line 246-333)

---

### Database Tables

#### DataPackagePurchase
```sql
Table: DataPackagePurchase
Columns:
  - PurchaseId (PK)
  - ConsumerId (FK)
  - ProvinceId (FK)
  - DistrictId (FK, nullable)
  - StartDate (nullable)
  - EndDate (nullable)
  - RowCount (số dòng dữ liệu)
  - PricePerRow
  - TotalPrice
  - Status (Pending/Active/Cancelled)
  - PurchaseDate
  - DownloadCount (số lần đã download)
  - MaxDownload (giới hạn download, default = 5)
  - LastDownloadDate
```

**Current Data**:
```
Purchase ID 1: Hà Nội, 400 rows, Active, Downloads: 1/5
Purchase ID 2: Hà Nội, 402 rows, Active, Downloads: 0/5
Purchase ID 3: Hà Nội, 402 rows, Pending, Downloads: 0/5
Purchase ID 4: HCM, 320 rows, Pending, Downloads: 0/5
```

---

### Frontend Components

#### MyPurchases.tsx
**Location**: `frontend/src/pages/MyPurchases.tsx`

**Features**:
- 3 tabs: Data Packages, Subscriptions, API Packages
- Table columns:
  - Purchase Date
  - Location (Province/District)
  - Rows
  - Price
  - Status
  - **Downloads** (1/5, 2/5, ...)
  - Actions (Download button)

**Download Button Logic**:
```typescript
// Disabled conditions:
- status !== 'Active'
- downloadCount >= maxDownload

// Click handler:
- Call API: GET /api/purchases/download/{id}
- Show loading state
- Download file
- Reload data (update count)
- Show success message
```

---

## 📊 CSV Data Structure

### Generated CSV Headers
```csv
Transaction ID,Station Name,Location,District,Province,Charger Type,Power (kW),Start Time,End Time,Duration (minutes),Energy Consumed (kWh),Cost (VND),Vehicle Model,Battery Capacity (kWh),SOC Before (%),SOC After (%),Temperature (°C),Payment Method,User ID
```

### Sample Data
```csv
TXN202500001,VinFast Charging Station,123 Nguyen Van Cu Street,Ba Dinh,Hà Nội,DC Fast,120,2024-02-15 08:30,2024-02-15 09:45,75,45.50,136500,VinFast VF8,82,25,85,28,E-Wallet,USER1234
TXN202500002,EV Power Hub,456 Le Duan Street,Cau Giay,Hà Nội,Super Fast DC,350,2024-02-16 14:20,2024-02-16 15:10,50,52.30,157000,Tesla Model 3,75,15,80,32,Credit Card,USER5678
```

### Data Generation Logic
**Mock Data** (PurchasesController):
- Generates `rowCount` rows instantly
- Uses purchase parameters (Province, District, Date Range)
- Randomized but realistic values
- Vehicle models: VinFast VF8/VF9/VFe34, Tesla Model 3/Y, BYD Atto 3, Hyundai Ioniq 5, Kia EV6
- Charger types: AC (7-22kW), DC Fast (50-120kW), Super Fast DC (180-350kW)
- Energy: 10-60 kWh per session
- Cost: ~3,000 VND per kWh

**Real Data** (DataPackageController):
- Queries `DatasetRecords` table
- Filters by location & date range
- Only approved datasets
- Actual uploaded data from providers

---

## 🔐 Security & Business Rules

### Authorization
```
✅ JWT Authentication required
✅ Role: DataConsumer
✅ Purchase ownership verification
```

### Validation
```
✅ Purchase must exist
✅ Purchase must belong to current user
✅ Status must be "Active" (not Pending/Cancelled)
✅ downloadCount < maxDownload
```

### Tracking
```
✅ Increment downloadCount on each download
✅ Update lastDownloadDate timestamp
✅ Audit trail in database
```

---

## 🧪 Testing Guide

### Test Case 1: Normal Download
```
Prerequisites:
  - Login as DataConsumer (consumer@test.com)
  - Have Active purchase (ID 1 or 2)

Steps:
  1. Navigate to /my-purchases
  2. Select "Data Packages" tab
  3. Find Active purchase
  4. Click "Download CSV" button
  5. Verify file downloads
  6. Check Downloads column updates (e.g., 1/5 → 2/5)

Expected:
  ✅ CSV file downloaded
  ✅ File name: ev_charging_data_HàNội_20250104_143022.csv
  ✅ Contains correct number of rows
  ✅ Download count incremented
  ✅ Success alert shown
```

### Test Case 2: Download Limit
```
Steps:
  1. Download same package 5 times
  2. On 6th attempt, button should be disabled
  3. Downloads column shows "5/5" in red
  4. Hover shows tooltip: "Download limit reached"

Expected:
  ✅ Button disabled after 5 downloads
  ✅ Red text indicator
  ✅ API returns 400 error if attempted via curl
```

### Test Case 3: Pending Purchase
```
Steps:
  1. Find purchase with status = "Pending" (ID 3 or 4)
  2. Download button should be disabled
  3. Tooltip: "Payment not completed"

Expected:
  ✅ Button disabled
  ✅ Cannot download
```

### Test Case 4: Unauthorized Access
```
Steps:
  1. Try to access another user's purchase via API
  2. curl -H "Authorization: Bearer {token}" \
        http://localhost:5292/api/purchases/download/999

Expected:
  ✅ 404 Not Found
  ✅ Message: "Purchase not found or you don't have permission"
```

---

## 📁 File Structure

```
backend/
├── Controllers/
│   ├── PurchasesController.cs        ← Main download endpoint (RECOMMENDED)
│   ├── DataPackageController.cs      ← Alternative endpoint (real data)
│   └── PaymentController.cs          ← Payment webhook handler
├── Models/
│   ├── DataPackagePurchase.cs        ← Purchase entity
│   └── DatasetRecords.cs             ← Actual charging data
└── Data/
    └── EVDataMarketplaceDbContext.cs

frontend/
├── src/
│   ├── pages/
│   │   └── MyPurchases.tsx           ← Main UI for downloads
│   ├── api/
│   │   └── purchases.ts              ← API client
│   └── types/
│       └── index.ts                  ← TypeScript interfaces
```

---

## 🔄 Two Download Implementations

### Implementation 1: Mock Data (PurchasesController) ⭐ CURRENT
**Pros**:
- ✅ Works immediately without database data
- ✅ Fast generation for any row count
- ✅ Perfect for demos and testing
- ✅ No dependency on DatasetRecords

**Cons**:
- ❌ Not real data
- ❌ Need to switch to real data for production

**Usage**: Testing, demos, MVP

---

### Implementation 2: Real Data (DataPackageController)
**Pros**:
- ✅ Returns actual uploaded data
- ✅ Production-ready
- ✅ Reflects real charging patterns

**Cons**:
- ❌ Requires DatasetRecords to be populated
- ❌ May be slow for large datasets
- ❌ Limited by available data

**Usage**: Production with real provider data

---

## 🚀 Which Endpoint to Use?

### For Development & Testing:
```
Use: GET /api/purchases/download/{purchaseId}
Reason: Mock data works without seeding database
```

### For Production:
```
Option A: Keep mock data if sufficient for business needs
Option B: Switch to GET /api/datapackage/{purchaseId}/download
Reason: Real data from providers
```

### Hybrid Approach:
```
IF DatasetRecords has enough data
  THEN use DataPackageController (real data)
  ELSE use PurchasesController (mock data)
```

---

## 💡 Current Implementation Status

### ✅ What's Working
1. **Purchase Flow**:
   - Customer can preview data package
   - Purchase creates order in database
   - PayOS integration for payment
   - Webhook updates status to Active

2. **Download Flow**:
   - Customer can see all purchases
   - Download button with proper validation
   - Mock CSV generation
   - Download tracking (count & timestamp)
   - Download limit enforcement

3. **Security**:
   - JWT authentication
   - Purchase ownership verification
   - Role-based access control

### 🔧 What Needs Attention

1. **Choose Primary Endpoint**:
   - Currently have TWO download endpoints
   - Recommend: Standardize on PurchasesController
   - Action: Remove or deprecate DataPackageController download

2. **Real Data Integration**:
   - DatasetRecords table has 904 rows
   - Can switch to real data when ready
   - Need to map DatasetRecords → Purchase filters

3. **Frontend Consistency**:
   - Update API client to use consistent endpoint
   - Currently uses: `/purchases/download/{id}` ✅

---

## 📝 API Documentation

### Endpoint: Download Data Package
```http
GET /api/purchases/download/{purchaseId}
```

**Authentication**: Bearer token (DataConsumer role)

**Parameters**:
- `purchaseId` (path, integer, required): ID of the purchased package

**Response: Success (200)**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=ev_charging_data_HàNội_20250104_143022.csv

Body: CSV file content
```

**Response: Errors**
```json
// 401 Unauthorized
{
  "message": "User email not found"
}

// 404 Not Found
{
  "message": "Purchase not found or you don't have permission to download this data"
}

// 400 Bad Request
{
  "message": "This purchase is not active"
}

// 400 Bad Request (limit reached)
{
  "message": "Download limit reached (5/5)"
}
```

---

## 🎯 Summary

### Customer Journey
```
1. Browse Data Packages
2. Select location + date range
3. See preview (rows & price)
4. Click Purchase
5. Pay via PayOS
6. Go to My Purchases
7. Click Download CSV (up to 5 times)
8. Use data for analysis
```

### Key Features
- ✅ Secure download with ownership check
- ✅ Download limit (5 times per purchase)
- ✅ Download tracking
- ✅ Mock data generation (no DB required)
- ✅ Can switch to real data easily
- ✅ CSV format compatible with Excel, Python, R

### Files to Review
1. `backend/EVDataMarketplace.API/Controllers/PurchasesController.cs` (line 285-412)
2. `frontend/src/pages/MyPurchases.tsx`
3. `DOWNLOAD_CSV_FEATURE.md` (detailed implementation guide)

---

## 🔗 Related Documentation
- `DOWNLOAD_CSV_FEATURE.md` - Implementation details
- `TESTING_GUIDE.md` - Full testing procedures
- Database: See `check_results.txt` for current data

---

**Last Updated**: 2025-11-04  
**Status**: ✅ Fully Implemented & Working

