# 📝 Hướng dẫn Insert Sample Subscription Data

## 🎯 Mục đích
Tạo dữ liệu mẫu subscription cho customer trong database để test.

---

## 🚀 Option 1: Insert Nhanh (Mặc định)

Script này tự động tạo subscription cho User ID 4 với cấu hình mặc định.

### Chạy script:

**Cách 1: Dùng sqlcmd**
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i INSERT_SAMPLE_SUBSCRIPTION.sql
```

**Cách 2: Dùng SSMS**
1. Mở SQL Server Management Studio
2. Connect to server
3. Open file: `backend/INSERT_SAMPLE_SUBSCRIPTION.sql`
4. Execute (F5)

**Cách 3: Dùng Azure Data Studio**
1. Connect to database
2. Open file
3. Click "Run"

### Cấu hình mặc định:
- 👤 **User ID**: 4
- 📍 **Location**: Hanoi (Province level)
- 💳 **Billing**: Monthly (500,000 VND)
- 📅 **Duration**: 1 month
- ✅ **Status**: Active
- 🔄 **Auto-renew**: Enabled

---

## 🎨 Option 2: Insert Tùy chỉnh

Script này cho phép bạn tùy chỉnh đầy đủ các thông số.

### Chạy script:

1. **Mở file**: `backend/INSERT_CUSTOM_SUBSCRIPTION.sql`

2. **Sửa cấu hình** (đầu file):

```sql
-- ============================================
-- CONFIGURATION - Thay đổi các giá trị này
-- ============================================

DECLARE @UserId INT = 4;                          -- Thay đổi User ID
DECLARE @ProvinceId INT = 1;                      -- 1=Hanoi, 2=HCMC, 3=Danang
DECLARE @DistrictId INT = NULL;                   -- NULL hoặc ID của district
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';   -- 'Monthly', 'Quarterly', 'Yearly'
```

3. **Execute** (F5 hoặc Run)

### Ví dụ cấu hình:

#### Subscription Monthly cho Hanoi:
```sql
DECLARE @UserId INT = 4;
DECLARE @ProvinceId INT = 1;        -- Hanoi
DECLARE @DistrictId INT = NULL;     -- Province-level
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';
-- Price: 500,000 VND
```

#### Subscription Quarterly cho Ba Dinh district:
```sql
DECLARE @UserId INT = 4;
DECLARE @ProvinceId INT = 1;        -- Hanoi
DECLARE @DistrictId INT = 101;      -- Ba Dinh (example)
DECLARE @BillingCycle NVARCHAR(20) = 'Quarterly';
-- Price: 1,425,000 VND (5% discount)
```

#### Subscription Yearly cho HCMC:
```sql
DECLARE @UserId INT = 4;
DECLARE @ProvinceId INT = 2;        -- HCMC
DECLARE @DistrictId INT = NULL;
DECLARE @BillingCycle NVARCHAR(20) = 'Yearly';
-- Price: 5,100,000 VND (15% discount)
```

---

## 📊 Pricing Table

| Billing Cycle | Duration | Monthly Price | Total Price | Discount | Savings |
|---------------|----------|---------------|-------------|----------|---------|
| **Monthly**   | 1 month  | 500,000 VND   | 500,000 VND | 0%       | 0 VND   |
| **Quarterly** | 3 months | 500,000 VND   | 1,425,000 VND | 5%     | 75,000 VND |
| **Yearly**    | 12 months| 500,000 VND   | 5,100,000 VND | 15%    | 900,000 VND |

---

## 🔍 Kiểm tra kết quả

### 1. Xem subscription vừa tạo:

```sql
USE EVDataMarketplace;

SELECT 
    spp.subscription_id,
    u.user_id,
    u.username,
    u.email,
    p.province_name,
    d.district_name,
    spp.billing_cycle,
    spp.total_paid,
    spp.start_date,
    spp.end_date,
    spp.status
FROM SubscriptionPackagePurchase spp
INNER JOIN Consumer c ON spp.consumer_id = c.consumer_id
INNER JOIN [User] u ON c.user_id = u.user_id
INNER JOIN Province p ON spp.province_id = p.province_id
LEFT JOIN District d ON spp.district_id = d.district_id
WHERE u.user_id = 4
ORDER BY spp.purchase_date DESC;
```

### 2. Test qua API:

```bash
# Get my subscriptions
curl -X GET "https://localhost:7001/api/purchases/my-subscriptions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Access dashboard
curl -X GET "https://localhost:7001/api/subscription-packages/{id}/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test qua Frontend:

1. Chạy frontend: `npm run dev`
2. Login với user ID 4
3. Vào trang: **My Purchases**
4. Thấy subscription vừa tạo
5. Click **"Access Dashboard"**
6. Xem analytics data

---

## 🐛 Troubleshooting

### Lỗi: "User ID 4 not found or not a DataConsumer"

**Giải pháp**: Kiểm tra User ID có đúng không

```sql
-- Xem tất cả DataConsumers
SELECT 
    u.user_id,
    u.username,
    u.email,
    c.consumer_id
FROM [User] u
INNER JOIN Consumer c ON u.user_id = c.user_id
ORDER BY u.user_id;
```

Thay đổi `@UserId` trong script thành user_id hợp lệ.

---

### Lỗi: "Province ID not found"

**Giải pháp**: Xem danh sách provinces

```sql
SELECT province_id, province_name FROM Province;
```

Provinces mặc định:
- 1 = Hanoi
- 2 = Ho Chi Minh City  
- 3 = Da Nang
- ... (và nhiều tỉnh khác)

---

### Lỗi: "District ID not found in Province"

**Giải pháp**: Xem districts trong province

```sql
SELECT district_id, district_name 
FROM District 
WHERE province_id = 1  -- Thay 1 bằng province_id bạn muốn
ORDER BY district_name;
```

Hoặc set `@DistrictId = NULL` để dùng province-level subscription.

---

### Lỗi: "SubscriptionPackagePurchase table missing columns"

**Giải pháp**: Chạy migration script

```bash
# Kiểm tra database
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql

# Nếu thiếu cột, chạy migration
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql
```

---

## 📝 Sample Data Templates

### Template 1: Basic Monthly
```sql
-- User 4, Hanoi, Monthly
@UserId = 4
@ProvinceId = 1
@DistrictId = NULL
@BillingCycle = 'Monthly'
```

### Template 2: Premium Yearly
```sql
-- User 4, HCMC, Yearly with District
@UserId = 4
@ProvinceId = 2
@DistrictId = 201  -- Replace with actual district ID
@BillingCycle = 'Yearly'
```

### Template 3: Multiple Subscriptions
```sql
-- Run script multiple times with different configs:
-- 1st run: Hanoi Monthly
-- 2nd run: HCMC Quarterly
-- 3rd run: Danang Yearly
```

---

## 🎯 Next Steps sau khi insert

1. ✅ Verify data trong database
2. ✅ Test API endpoints
3. ✅ Login frontend và xem "My Purchases"
4. ✅ Access Dashboard
5. ✅ Test auto-renew logic (optional)

---

## 📚 Related Files

- `INSERT_SAMPLE_SUBSCRIPTION.sql` - Quick insert với mặc định
- `INSERT_CUSTOM_SUBSCRIPTION.sql` - Insert với tùy chỉnh
- `QUICK_CHECK.sql` - Check database structure
- `UPDATE_SUBSCRIPTION_TABLE.sql` - Migration script

---

## 💡 Pro Tips

1. **Multiple users**: Thay đổi `@UserId` để tạo cho users khác
2. **Test scenarios**: Tạo subscriptions với các billing cycles khác nhau
3. **Expired subscriptions**: Sửa `@StartDate` thành quá khứ để test expired case
4. **Different locations**: Test với nhiều provinces/districts
5. **Backup first**: Luôn backup database trước khi insert data

---

**Created**: November 5, 2025  
**Purpose**: Sample data creation guide  
**Target User**: Customer User ID 4


