# 📚 SQL Scripts Documentation

Tất cả các SQL scripts để quản lý và troubleshoot database EVDataMarketplace.

---

## 📁 Available Scripts

### 🔧 Fix & Maintenance Scripts

#### 1. **COMPLETE_FIX_DASHBOARD.sql** ⭐ RECOMMENDED
**Purpose**: Fix toàn bộ vấn đề Dashboard không có dữ liệu

**What it does:**
- ✓ Chẩn đoán và phát hiện vấn đề timestamps
- ✓ Update tất cả DatasetRecords timestamps về 45 ngày gần đây
- ✓ Verify dữ liệu sau khi update
- ✓ Test dashboard query
- ✓ Hiển thị summary và next steps

**When to use:** Khi dashboard trống hoặc không hiển thị dữ liệu

**How to run:**
```sql
USE [EVDataMarketplace];
GO
-- Copy paste và chạy toàn bộ script
```

**Expected output:**
```
✅ Updated XXX records!
📊 Records in Last 30 Days: XXX
✅✅✅ DASHBOARD QUERY SUCCESSFUL! ✅✅✅
```

---

#### 2. **DEBUG_SUBSCRIPTION_ISSUE.sql**
**Purpose**: Chẩn đoán chi tiết các vấn đề về Subscription Dashboard

**What it does:**
- Check Provinces và Districts
- Check Active Subscriptions
- Check DatasetRecords và date ranges
- Check Dataset moderation status
- Test query giống C# code
- Identify specific issues

**When to use:** Để hiểu tại sao dashboard không có data

**How to run:**
```sql
USE [EVDataMarketplace];
GO
-- Copy paste và chạy toàn bộ script
```

**Output sections:**
1. PROVINCES
2. DISTRICTS  
3. SUBSCRIPTIONS
4. DATASET RECORDS (Total, By Province, By District)
5. DATASETS & MODERATION STATUS
6. APPROVED DATASET RECORDS
7. TEST QUERY (Simulating C# logic)
8. SAMPLE DATASET RECORDS
9. DEBUG RESULTS

---

#### 3. **FIX_SUBSCRIPTION_DATA.sql**
**Purpose**: Fix dữ liệu nếu thiếu hoặc sai

**What it does:**
- Verify location IDs (Province, District)
- Check và tạo sample data nếu thiếu
- Create provider và dataset nếu cần
- Insert 50 sample records for Ba Đình
- Verify subscriptions
- Test dashboard query

**When to use:** Khi DEBUG script phát hiện thiếu dữ liệu

**How to run:**
```sql
USE [EVDataMarketplace];
GO
-- Script sẽ tự động detect và fix
```

---

#### 4. **QUICK_CHECK.sql**
**Purpose**: Kiểm tra nhanh cấu trúc bảng SubscriptionPackagePurchase

**What it does:**
- List tất cả columns của SubscriptionPackagePurchase table
- Check từng required column
- Show data types và nullable status

**When to use:** Khi cần verify table structure

**How to run:**
```sql
USE [EVDataMarketplace];
GO
-- Copy paste và chạy
```

**Expected output:**
```
✓ subscription_id
✓ consumer_id
✓ province_id
✓ district_id
✓ start_date
✓ end_date
... (all required columns)
```

---

### 📝 Data Creation Scripts

#### 5. **INSERT_CUSTOM_SUBSCRIPTION.sql** ⭐ MOST USEFUL
**Purpose**: Tạo subscription mới với cấu hình linh hoạt

**Configuration parameters:**
```sql
DECLARE @UserId INT = 4;                          -- User ID (consumer)
DECLARE @ProvinceId INT = 1;                      -- 1=Hanoi, 2=HCMC, 3=Danang
DECLARE @DistrictId INT = NULL;                   -- NULL=province-level, or district ID
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';   -- Monthly/Quarterly/Yearly
```

**Billing & Pricing:**
- **Monthly**: 500,000 VND/month (no discount)
- **Quarterly**: 500,000 × 3 × 0.95 = 1,425,000 VND (5% off)
- **Yearly**: 500,000 × 12 × 0.85 = 5,100,000 VND (15% off)

**Features:**
- ✓ Automatic validation (User exists, Province/District valid)
- ✓ Automatic price calculation based on billing cycle
- ✓ Automatic start/end date calculation
- ✓ Display configuration before insert
- ✓ Error handling with helpful messages
- ✓ Show created subscription details

**When to use:** Tạo subscription mới cho testing hoặc production

**How to run:**
1. Open script in SSMS
2. Edit configuration section (lines 18-22)
3. Execute entire script
4. Review output and verify subscription created

**Example output:**
```
✅ Validation passed!
📋 SUBSCRIPTION CONFIGURATION:
   User ID: 4
   Consumer ID: 1
   Province: Hà Nội (ID: 1)
   District: Ba Đình (ID: 1)
   Billing Cycle: Monthly
   Total Paid: 500,000 VND
✅✅✅ SUCCESS! ✅✅✅
🎉 Subscription ID: 5
```

---

### 📊 Query & Analytics Scripts

#### 6. **evmarketplace.sql** (Main Database Script)
**Purpose**: Full database schema và sample data

**Contains:**
- Database creation
- All table definitions
- Sample data (Users, Provinces, Districts, Datasets, DatasetRecords)
- Indexes và constraints

**When to use:** 
- Initial database setup
- Restore to clean state
- Reference for schema

**Size:** ~2000 lines
**Data included:**
- 4 Users (Admin, Moderator, Provider, Consumer)
- 63 Provinces
- ~110 Districts (Hanoi, HCMC, Danang)
- 3 Datasets (Approved)
- ~900 DatasetRecords

---

## 🎯 Common Workflows

### Workflow 1: Dashboard không có dữ liệu
```
1. Run: DEBUG_SUBSCRIPTION_ISSUE.sql
   → Identify issue (likely: old timestamps)

2. Run: COMPLETE_FIX_DASHBOARD.sql
   → Fix timestamps automatically

3. Test: API GET /api/subscription-packages/{id}/dashboard
   → Should now show data
```

### Workflow 2: Tạo subscription mới để test
```
1. Edit: INSERT_CUSTOM_SUBSCRIPTION.sql
   → Set @UserId, @ProvinceId, @DistrictId

2. Run script
   → Get new subscription_id

3. Test: Login as consumer@test.com
   → Navigate to My Purchases
   → Click on new subscription
   → View dashboard
```

### Workflow 3: Database bị corrupt hoặc sai
```
1. Backup current data (if needed)

2. Run: evmarketplace.sql
   → Recreate entire database

3. Run: COMPLETE_FIX_DASHBOARD.sql
   → Update timestamps to recent

4. Run: INSERT_CUSTOM_SUBSCRIPTION.sql
   → Create test subscriptions
```

### Workflow 4: Verify everything working
```
1. Run: QUICK_CHECK.sql
   → Verify table structure

2. Run: DEBUG_SUBSCRIPTION_ISSUE.sql
   → Check all data counts

3. Query: Test dashboard query manually
   → Verify returns data

4. API Test: Call dashboard endpoint
   → Verify JSON response
```

---

## 📋 Script Execution Order (Fresh Setup)

```
1. evmarketplace.sql              → Create database & schema
2. COMPLETE_FIX_DASHBOARD.sql     → Update timestamps
3. INSERT_CUSTOM_SUBSCRIPTION.sql → Create test subscription
4. DEBUG_SUBSCRIPTION_ISSUE.sql   → Verify everything
```

---

## 🔍 Quick Reference: Key Queries

### Get all active subscriptions with locations
```sql
SELECT 
    s.subscription_id,
    u.email,
    p.name AS province,
    d.name AS district,
    s.status,
    s.end_date
FROM SubscriptionPackagePurchase s
INNER JOIN DataConsumer c ON s.consumer_id = c.consumer_id
INNER JOIN [User] u ON c.user_id = u.user_id
LEFT JOIN Province p ON s.province_id = p.province_id
LEFT JOIN District d ON s.district_id = d.district_id
WHERE s.status = 'Active';
```

### Get data count by location (last 30 days)
```sql
SELECT 
    p.name AS province,
    d.name AS district,
    COUNT(*) AS record_count,
    SUM(dr.energy_kwh) AS total_energy
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
INNER JOIN Province p ON dr.province_id = p.province_id
LEFT JOIN District d ON dr.district_id = d.district_id
WHERE ds.moderation_status = 'Approved'
  AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
GROUP BY p.name, d.name
ORDER BY record_count DESC;
```

### Check data freshness
```sql
SELECT 
    MIN(charging_timestamp) AS oldest,
    MAX(charging_timestamp) AS newest,
    COUNT(*) AS total,
    COUNT(CASE WHEN charging_timestamp >= DATEADD(DAY, -30, GETDATE()) THEN 1 END) AS last_30_days,
    COUNT(CASE WHEN charging_timestamp >= DATEADD(DAY, -7, GETDATE()) THEN 1 END) AS last_7_days
FROM DatasetRecords;
```

### Get dataset approval status
```sql
SELECT 
    dataset_id,
    dataset_name,
    moderation_status,
    status,
    row_count,
    upload_date
FROM Dataset
ORDER BY dataset_id;
```

---

## ⚠️ Important Notes

### Database Names
Scripts use `EVDataMarketplace` database name. If your database has a different name (e.g., `db_easycode_cm`), update:
```sql
USE [YourDatabaseName];  -- Change this line in each script
```

### Connection String
Ensure your application's connection string matches:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=...;Database=EVDataMarketplace;..."
}
```

### DateTime Handling
- Database uses `datetime2(7)` type
- C# uses `DateTime` or `DateTime2`
- All times should be UTC for consistency
- Dashboard query: Last 30 days from `DateTime.UtcNow`

### Testing vs Production
- Scripts create test users with password `Test123!`
- Change passwords in production
- Review data privacy before using real data

---

## 🐛 Troubleshooting

### Error: "Cannot find database EVDataMarketplace"
**Solution:** Run `evmarketplace.sql` first to create database

### Error: "Invalid column name"
**Solution:** 
1. Run `QUICK_CHECK.sql` to verify schema
2. Check if using correct database version
3. May need to run migrations

### Error: "Cannot insert duplicate key"
**Solution:**
1. Check existing data: `SELECT * FROM SubscriptionPackagePurchase`
2. Either delete existing or adjust script IDs

### Warning: "No records in last 30 days"
**Solution:** Run `COMPLETE_FIX_DASHBOARD.sql` to update timestamps

---

## 📞 Support Files

Related documentation:
- `DASHBOARD_FIX_GUIDE.md` - Detailed fix guide
- `README.md` - Main project README

API Controllers:
- `backend/EVDataMarketplace.API/Controllers/SubscriptionPackageController.cs`
- Line 184-192: Dashboard query logic

Database Context:
- `backend/EVDataMarketplace.API/Data/EVDataMarketplaceDbContext.cs`
- `backend/EVDataMarketplace.API/Data/DbSeeder.cs`

---

**Last Updated**: 2025-11-05  
**Database Version**: EVDataMarketplace v1.0  
**Scripts Version**: 1.0
