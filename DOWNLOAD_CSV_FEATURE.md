# 📥 Download CSV Feature - Implementation Guide

## ✅ Completed Implementation

### Overview
Implemented a complete **CSV download feature** for Data Package purchases with **mock data generation** from the backend. No database seeding required - all data is dynamically generated based on purchase parameters.

---

## 🎯 Features

### Backend (C# / .NET)
✅ **New API Endpoint**: `GET /api/purchases/download/{purchaseId}`
- Verifies user authentication and purchase ownership
- Validates purchase status (must be "Active")
- Checks download limits (downloadCount vs maxDownload)
- Generates **mock CSV data** on-the-fly based on purchase parameters
- Updates download count and last download date
- Returns CSV file with proper headers

### Frontend (React / TypeScript)
✅ **Updated Types**:
- Added `pricePerRow`, `downloadCount`, `maxDownload`, `lastDownloadDate` to `DataPackagePurchase`
- Added `totalPaid`, `purchaseDate`, `cancelledAt`, `dashboardAccessCount`, `lastAccessDate` to `SubscriptionPackagePurchase`

✅ **Updated UI** (`MyPurchases.tsx`):
- Added "Downloads" column showing `{downloadCount}/{maxDownload}`
- Download button disabled when limit reached or status is not Active
- Visual feedback with red text when limit reached
- Auto-reload data after successful download to update count
- Better filename: `ev_charging_data_{purchaseId}_{date}.csv`

✅ **Updated API** (`purchases.ts`):
- Fixed endpoint URL from `/data-packages/{id}/download` to `/purchases/download/{id}`

---

## 📊 Mock CSV Data Structure

The generated CSV includes realistic EV charging transaction data:

### CSV Headers
```csv
Transaction ID,Station Name,Location,District,Province,Charger Type,Power (kW),Start Time,End Time,Duration (minutes),Energy Consumed (kWh),Cost (VND),Vehicle Model,Battery Capacity (kWh),SOC Before (%),SOC After (%),Temperature (°C),Payment Method,User ID
```

### Sample Data Fields
- **Transaction ID**: TXN{year}{sequential_number}
- **Station Names**: VinFast Charging Station, EV Power Hub, Green Energy Station, etc.
- **Charger Types**: AC, DC Fast, Super Fast DC
- **Power Levels**: 7, 22, 50, 120, 180, 350 kW
- **Vehicle Models**: VinFast VF8/VF9/VFe34, Tesla Model 3/Y, BYD Atto 3, Hyundai Ioniq 5, Kia EV6
- **Date Range**: Based on purchase's `startDate` and `endDate`
- **Energy**: 10-60 kWh per transaction
- **Cost**: ~3,000 VND per kWh (with random variance)
- **Payment Methods**: Credit Card, E-Wallet, Cash, QR Code, Subscription

### Data Count
- Number of rows = purchase's `rowCount` field
- All data is randomized but realistic
- Dates are distributed randomly within the purchase date range

---

## 🔐 Security & Business Logic

### Authorization
✅ Verifies JWT token and user role (DataConsumer)
✅ Ensures user can only download their own purchases

### Business Rules
✅ **Status Check**: Only "Active" purchases can be downloaded
✅ **Download Limit**: Enforces `maxDownload` limit
✅ **Tracking**: Increments `downloadCount` and updates `lastDownloadDate`
✅ **Audit Trail**: All downloads are logged in database

---

## 🧪 Testing Guide

### Prerequisites
1. Have a DataConsumer account
2. Have at least one Active DataPackagePurchase

### Test Steps

#### 1. **View Purchases**
```
Navigate to: /my-purchases
Select: "Data Packages" tab
```

Should see:
- List of all your data package purchases
- Downloads column showing current count (e.g., "0/5")
- "Download CSV" button (enabled for Active purchases)

#### 2. **Download CSV**
```
Click: "Download CSV" button
```

Expected behavior:
- Button shows "Downloading..." during request
- Browser downloads CSV file named: `ev_charging_data_{id}_{date}.csv`
- Alert: "✅ Data package downloaded successfully!"
- Download count increments (e.g., "1/5")

#### 3. **Verify CSV Content**
Open downloaded CSV file:
- Should have proper headers
- Number of rows = purchase's `rowCount`
- All data should be realistic and properly formatted
- Dates should be within purchase date range
- Province/District should match purchase location

#### 4. **Test Download Limit**
Download the same package multiple times until limit reached:
- Downloads column should turn red when at limit
- Download button should be disabled
- Hover shows tooltip: "Download limit reached"
- Attempting to download via API returns 400 error

#### 5. **Test Error Cases**
- Try downloading inactive/cancelled purchase → Button disabled
- Try downloading someone else's purchase (via API) → 404 Not Found
- Try downloading non-existent purchase ID → 404 Not Found

---

## 📁 Files Modified

### Backend
- ✅ `backend/EVDataMarketplace.API/Controllers/PurchasesController.cs`
  - Added `DownloadDataPackage(int purchaseId)` endpoint
  - Added `GenerateMockCSVData()` helper method
  - Added `using System.Text` for StringBuilder

### Frontend
- ✅ `frontend/src/types/index.ts`
  - Updated `DataPackagePurchase` interface
  - Updated `SubscriptionPackagePurchase` interface

- ✅ `frontend/src/api/purchases.ts`
  - Fixed `downloadDataPackage()` endpoint URL

- ✅ `frontend/src/pages/MyPurchases.tsx`
  - Added "Downloads" column to table
  - Updated download button logic
  - Improved handleDownload function
  - Added auto-reload after download

---

## 🚀 How It Works

### Flow Diagram
```
User clicks "Download CSV"
    ↓
Frontend calls GET /api/purchases/download/{purchaseId}
    ↓
Backend validates:
    - User authentication ✓
    - Purchase ownership ✓
    - Purchase status = Active ✓
    - downloadCount < maxDownload ✓
    ↓
Backend generates mock CSV data:
    - Creates CSV headers
    - Generates {rowCount} rows
    - Uses purchase parameters (location, date range)
    - Randomizes realistic values
    ↓
Backend updates database:
    - Increments downloadCount
    - Sets lastDownloadDate
    ↓
Backend returns CSV file
    ↓
Frontend downloads file
    ↓
Frontend reloads purchase data (shows updated count)
```

---

## 💡 Benefits of This Approach

### ✅ No Database Seeding Required
- No need to pre-populate DatasetRecord table
- No dependency on existing dataset data
- Works immediately after purchase

### ✅ Consistent Mock Data
- Data always matches purchase parameters
- Realistic and properly formatted
- Suitable for testing and demos

### ✅ Scalable
- Generates any number of rows instantly
- No storage overhead
- Easy to modify data format

### ✅ Production-Ready
When real data is available, simply replace `GenerateMockCSVData()` with:
```csharp
// Query actual DatasetRecord table
var records = await _context.DatasetRecords
    .Where(r => r.ProvinceId == purchase.ProvinceId)
    .Where(r => r.Date >= purchase.StartDate && r.Date <= purchase.EndDate)
    .Take(purchase.RowCount)
    .ToListAsync();

// Convert to CSV
```

---

## 🔄 Future Enhancements

### Potential Improvements
1. **Email Notification**: Send email with download link
2. **Async Processing**: For large datasets (>100K rows), process in background
3. **Download History**: Show list of previous downloads with timestamps
4. **Multiple Formats**: Support JSON, Excel, Parquet formats
5. **Data Compression**: ZIP large CSV files automatically
6. **Partial Downloads**: Resume interrupted downloads
7. **API Rate Limiting**: Prevent abuse of download endpoint

### Data Quality
1. **More Realistic Distribution**: 
   - Peak hours (7-9 AM, 5-7 PM) should have more transactions
   - Weekends vs weekdays patterns
   - Seasonal variations

2. **Location-Specific Data**:
   - Different pricing for different provinces
   - Urban vs rural patterns
   - Station density based on actual locations

3. **Vehicle Profiles**:
   - Consistent battery capacity per model
   - Realistic charging patterns per vehicle type

---

## 📝 API Documentation

### Endpoint
```
GET /api/purchases/download/{purchaseId}
```

### Authentication
Required: Bearer token with DataConsumer role

### Path Parameters
- `purchaseId` (integer): ID of the data package purchase

### Response
- **Success (200)**: Returns CSV file
  - Content-Type: `text/csv`
  - Content-Disposition: `attachment; filename=ev_charging_data_{province}_{timestamp}.csv`

- **Errors**:
  - `401 Unauthorized`: Invalid or missing token
  - `404 Not Found`: Purchase not found or user doesn't own it
  - `400 Bad Request`: Purchase not active or download limit reached

### Example Response Headers
```
Content-Type: text/csv
Content-Disposition: attachment; filename=ev_charging_data_Hanoi_20250104_143022.csv
```

---

## ✨ Summary

The CSV download feature is **fully implemented and ready to use**! 

Key Points:
- ✅ Backend generates **realistic mock data** on-the-fly
- ✅ Frontend has proper UI with download tracking
- ✅ Security and business rules enforced
- ✅ No database seeding required
- ✅ Easy to switch to real data when available

**Test it now**: Login as DataConsumer → My Purchases → Download CSV 🎉

