# 🎯 Dashboard Data Fix - Complete Guide

## 📋 Tóm tắt vấn đề

**VẤN ĐỀ**: Dashboard Subscription không hiển thị dữ liệu dù có Active subscription

**NGUYÊN NHÂN CHÍNH**: 
- DatasetRecords trong database có `charging_timestamp` từ Q1 2024 (quá cũ)
- Dashboard query filter: `WHERE charging_timestamp >= DATEADD(DAY, -30, GETDATE())`
- Không có records nào trong 30 ngày gần nhất → Dashboard trống

**GIẢI PHÁP**: Update timestamps của tất cả DatasetRecords về 45 ngày gần nhất

---

## 🔧 Cách Fix (Chọn 1 trong 2)

### ✅ Option 1: Chạy script tự động (RECOMMENDED)

```sql
-- File: backend/COMPLETE_FIX_DASHBOARD.sql
-- Run trong SQL Server Management Studio hoặc Azure Data Studio
```

Script này sẽ:
1. ✓ Kiểm tra và chẩn đoán vấn đề
2. ✓ Update tất cả timestamps về 45 ngày gần nhất
3. ✓ Verify dữ liệu sau khi update
4. ✓ Test query giống dashboard
5. ✓ Hiển thị hướng dẫn tiếp theo

### ✅ Option 2: Manual check và fix

**Step 1: Chẩn đoán**
```sql
-- File: backend/DEBUG_SUBSCRIPTION_ISSUE.sql
```

**Step 2: Fix dữ liệu**
```sql
-- File: backend/FIX_SUBSCRIPTION_DATA.sql
```

---

## 📊 Cấu trúc Database (từ evmarketplace.sql)

### SubscriptionPackagePurchase
```sql
subscription_id      (PK)
consumer_id          (FK → DataConsumer)
province_id          (FK → Province)
district_id          (FK → District, nullable)
start_date
end_date
billing_cycle        (Monthly/Quarterly/Yearly)
monthly_price
total_paid
purchase_date
status               ('Active', 'Expired', 'Cancelled')
auto_renew
cancelled_at
dashboard_access_count
last_access_date
```

### DatasetRecords
```sql
RecordId             (PK)
DatasetId            (FK → Dataset)
province_id          (FK → Province)
district_id          (FK → District)
station_id
station_name
station_address
station_operator
charging_timestamp   ⚠️ CRITICAL FIELD (must be recent!)
energy_kwh
voltage, current, power_kw
duration_minutes
charging_cost
vehicle_type
battery_capacity_kwh
soc_start, soc_end
created_at
data_source
```

### Dataset
```sql
dataset_id           (PK)
provider_id          (FK → DataProvider)
dataset_name
description
category
data_format
upload_date
moderation_status    ⚠️ Must be 'Approved' for dashboard
status               ('Active', 'Inactive')
visibility
row_count
```

---

## 🔍 Dashboard Query Logic (C# Code)

```csharp
// File: backend/EVDataMarketplace.API/Controllers/SubscriptionPackageController.cs
// Lines: 184-192

var datasetRecordsQuery = _context.DatasetRecords
    .Include(r => r.Dataset)
    .Where(r => r.ProvinceId == subscription.ProvinceId)  // ✓ Match province
    .Where(r => subscription.DistrictId == null || r.DistrictId == subscription.DistrictId)  // ✓ Match district
    .Where(r => r.Dataset.ModerationStatus == "Approved")  // ✓ Only approved
    .Where(r => r.ChargingTimestamp >= DateTime.UtcNow.AddDays(-30));  // ⚠️ CRITICAL: Last 30 days only!
```

**Điều kiện để có dữ liệu:**
1. ✅ `ProvinceId` match (ví dụ: 1 = Hà Nội)
2. ✅ `DistrictId` match hoặc NULL (province-level)
3. ✅ `Dataset.ModerationStatus = "Approved"`
4. ⚠️ **`ChargingTimestamp >= 30 ngày trước`** ← Đây là lý do chính!

---

## 🎫 Tạo Test Subscription

### Sử dụng SQL Script

```sql
-- File: backend/INSERT_CUSTOM_SUBSCRIPTION.sql
-- Edit configuration section:

DECLARE @UserId INT = 4;                          -- Consumer User ID
DECLARE @ProvinceId INT = 1;                      -- 1=Hanoi
DECLARE @DistrictId INT = 1;                      -- 1=Ba Đình (first district)
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';   -- Monthly/Quarterly/Yearly
```

### Hoặc sử dụng API

```http
POST /api/subscription-packages/purchase
Content-Type: application/json
Authorization: Bearer {consumer_token}

{
  "provinceId": 1,
  "districtId": 1,
  "billingCycle": "Monthly"
}
```

---

## 🧪 Kiểm tra sau khi Fix

### 1. Verify Data Update
```sql
SELECT 
    MIN(charging_timestamp) AS oldest_record,
    MAX(charging_timestamp) AS newest_record,
    COUNT(*) AS total_records,
    COUNT(CASE WHEN charging_timestamp >= DATEADD(DAY, -30, GETDATE()) THEN 1 END) AS recent_records
FROM DatasetRecords;
```

**Expected:**
- `oldest_record`: ~45 ngày trước
- `newest_record`: Gần hôm nay
- `recent_records`: > 0 (should have records in last 30 days)

### 2. Test Dashboard Query
```sql
-- Assuming subscription: province_id=1, district_id=1
SELECT 
    COUNT(*) AS total_sessions,
    SUM(energy_kwh) AS total_energy,
    AVG(duration_minutes) AS avg_duration,
    COUNT(DISTINCT station_id) AS unique_stations
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE dr.province_id = 1
  AND dr.district_id = 1
  AND ds.moderation_status = 'Approved'
  AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE());
```

**Expected:** Kết quả trả về > 0 rows với dữ liệu có ý nghĩa

### 3. Test API Endpoint
```http
GET /api/subscription-packages/{subscription_id}/dashboard
Authorization: Bearer {consumer_token}
```

**Expected Response:**
```json
{
  "subscriptionId": 1,
  "provinceId": 1,
  "districtId": 1,
  "dashboard": {
    "totalSessions": 100,
    "totalEnergyKwh": 4250.50,
    "averageEnergyPerSession": 42.51,
    "totalStations": 25,
    "averageDuration": 65.3,
    "peakHour": 18,
    "mostCommonVehicle": "VF8",
    "totalRevenue": 12750000,
    "chargingSessions": [...],
    "dailyStats": [...],
    "stationUsage": [...]
  }
}
```

---

## 📝 Test Users (từ evmarketplace.sql)

| Role | Email | Password | User ID | Related ID |
|------|-------|----------|---------|------------|
| Admin | admin@test.com | Test123! | 1 | - |
| Moderator | moderator@test.com | Test123! | 2 | - |
| DataProvider | provider@test.com | Test123! | 3 | provider_id=1 |
| DataConsumer | consumer@test.com | Test123! | 4 | consumer_id=1 |

---

## 🎯 Expected Data After Fix

### Province 1 (Hà Nội)
- **Districts**: 1 (Ba Đình), 2 (Hoàn Kiếm), 3 (Tây Hồ), 4 (Long Biên)
- **Records per district**: 100 (total 400)
- **Dataset**: ID=1, "Hà Nội EV Charging Data - Q1 2024" (ModerationStatus='Approved')

### Province 2 (Hồ Chí Minh)
- **Districts**: Multiple
- **Records**: 320 total
- **Dataset**: ID=2, "TP.HCM EV Charging Data - Q1 2024"

### Province 3 (Đà Nẵng)
- **Districts**: 3 districts
- **Records**: 180 total
- **Dataset**: ID=3, "Đà Nẵng EV Charging Data - Q1 2024"

---

## ⚠️ Common Issues & Solutions

### Issue 1: "No data in dashboard" sau khi fix
**Check:**
```sql
-- 1. Verify timestamps updated
SELECT MIN(charging_timestamp), MAX(charging_timestamp) FROM DatasetRecords;

-- 2. Check subscription IDs match data
SELECT province_id, district_id FROM SubscriptionPackagePurchase WHERE subscription_id = YOUR_ID;

-- 3. Verify dataset approved
SELECT dataset_id, moderation_status FROM Dataset;
```

### Issue 2: "Province/District ID không match"
**Solution:**
```sql
-- Get correct district IDs for Hà Nội
SELECT d.district_id, d.name
FROM District d
INNER JOIN Province p ON d.province_id = p.province_id
WHERE p.name = N'Hà Nội'
ORDER BY d.district_id;

-- Update subscription với correct IDs
UPDATE SubscriptionPackagePurchase
SET province_id = 1, district_id = 1  -- Ba Đình
WHERE subscription_id = YOUR_ID;
```

### Issue 3: "Dataset not approved"
**Solution:**
```sql
UPDATE Dataset
SET moderation_status = 'Approved',
    status = 'Active'
WHERE dataset_id IN (1, 2, 3);
```

---

## 🚀 Quick Start (TL;DR)

```sql
-- 1. Run fix script
USE [EVDataMarketplace];
-- Run: COMPLETE_FIX_DASHBOARD.sql

-- 2. Create test subscription (if needed)
-- Edit and run: INSERT_CUSTOM_SUBSCRIPTION.sql

-- 3. Test API
GET /api/subscription-packages/{id}/dashboard
```

Done! 🎉

---

## 📞 Support

Nếu vẫn gặp vấn đề, check:
1. ✅ Database connection string đúng
2. ✅ User đăng nhập là DataConsumer
3. ✅ Subscription status = 'Active'
4. ✅ Subscription chưa hết hạn (end_date > GETDATE())
5. ✅ DatasetRecords có timestamps trong 30 ngày
6. ✅ Dataset.moderation_status = 'Approved'

---

**Last Updated**: 2025-11-05
**Database**: EVDataMarketplace
**Script Version**: 1.0

