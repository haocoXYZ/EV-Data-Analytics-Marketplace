# 🎯 Insert Sample Subscription cho User ID 4

## ⚡ Cách nhanh nhất (Windows)

### Option 1: Double-click batch file
```
1. Mở Windows Explorer
2. Navigate tới: D:\EV-Data-Analytics-Marketplace-cuongbe\backend
3. Double-click file: insert_sample_data.bat
4. Đợi script chạy xong
5. Done!
```

### Option 2: Command line
```bash
cd backend
insert_sample_data.bat
```

---

## 🔧 Cách chi tiết (Step by step)

### Bước 1: Test connection
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i TEST_CONNECTION.sql
```

**Kết quả mong đợi**: Tất cả ✅

### Bước 2: Insert data
```bash
sqlcmd -S localhost -d EVDataMarketplace -i INSERT_SAMPLE_SUBSCRIPTION.sql
```

**Kết quả mong đợi**: 
```
✅✅✅ SUCCESS! ✅✅✅

🎉 Subscription created successfully!
   Subscription ID: [số ID mới]
```

---

## 📊 Data sẽ được tạo

### Thông tin Subscription:

| Field | Value |
|-------|-------|
| **User ID** | 4 |
| **Province** | Hanoi (ID: 1) |
| **District** | NULL (Province-level) |
| **Billing Cycle** | Monthly |
| **Monthly Price** | 500,000 VND |
| **Total Paid** | 500,000 VND |
| **Duration** | 1 month |
| **Status** | Active |
| **Auto Renew** | Enabled |
| **Start Date** | Ngày hiện tại |
| **End Date** | +1 tháng từ hôm nay |

---

## 🔍 Verify Data

### Cách 1: SQL Query
```sql
USE EVDataMarketplace;

SELECT 
    spp.subscription_id,
    u.username,
    u.email,
    p.province_name,
    spp.billing_cycle,
    spp.total_paid,
    spp.start_date,
    spp.end_date,
    spp.status
FROM SubscriptionPackagePurchase spp
INNER JOIN Consumer c ON spp.consumer_id = c.consumer_id
INNER JOIN [User] u ON c.user_id = u.user_id
INNER JOIN Province p ON spp.province_id = p.province_id
WHERE u.user_id = 4;
```

### Cách 2: SSMS
1. Mở SQL Server Management Studio
2. Connect to localhost
3. Expand EVDataMarketplace database
4. Right-click `SubscriptionPackagePurchase` table
5. Select "Select Top 1000 Rows"
6. Find subscription với `consumer_id` tương ứng user_id 4

### Cách 3: Frontend UI
1. Start backend:
```bash
cd backend/EVDataMarketplace.API
dotnet run
```

2. Start frontend:
```bash
cd frontend
npm run dev
```

3. Open browser: `http://localhost:5173`

4. Login với user ID 4:
   - Email: (check trong database)
   - Password: (check trong database)

5. Vào trang **"My Purchases"**

6. Thấy subscription vừa tạo

7. Click **"Access Dashboard"**

---

## 🎨 Tùy chỉnh Data (Optional)

Nếu muốn tùy chỉnh billing cycle, location, etc:

### Dùng Custom Script:
```bash
cd backend
# Mở file INSERT_CUSTOM_SUBSCRIPTION.sql
# Edit các dòng này:
```

```sql
DECLARE @UserId INT = 4;                          -- User ID
DECLARE @ProvinceId INT = 1;                      -- Province
DECLARE @DistrictId INT = NULL;                   -- District (optional)
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';   -- Billing cycle
```

**Billing Cycle Options**:
- `'Monthly'` - 500,000 VND/month (no discount)
- `'Quarterly'` - 1,425,000 VND/3 months (5% off)
- `'Yearly'` - 5,100,000 VND/12 months (15% off)

**Province IDs**:
- 1 = Hanoi
- 2 = Ho Chi Minh City
- 3 = Da Nang
- ... (see Province table for more)

Sau đó execute:
```bash
sqlcmd -S localhost -d EVDataMarketplace -i INSERT_CUSTOM_SUBSCRIPTION.sql
```

---

## 🐛 Troubleshooting

### Lỗi: "User ID 4 not found"

**Kiểm tra users có sẵn**:
```sql
SELECT 
    u.user_id,
    u.username,
    u.email,
    c.consumer_id
FROM [User] u
INNER JOIN Consumer c ON u.user_id = c.user_id;
```

**Giải pháp**: Thay đổi User ID trong script thành ID có trong database.

---

### Lỗi: "Cannot connect to database"

**Kiểm tra SQL Server**:
```bash
# Check if SQL Server is running
net start | findstr SQL
```

**Start SQL Server**:
```bash
net start MSSQLSERVER
```

---

### Lỗi: "Database EVDataMarketplace not found"

**Tạo database**:
```bash
cd backend
sqlcmd -S localhost -i CREATE_NEW_DATABASE.sql
```

---

### Lỗi: "Column 'billing_cycle' not found"

**Database thiếu cột**, chạy migration:
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql
```

Sau đó chạy lại insert script.

---

### Lỗi: "sqlcmd not found"

**Cài đặt SQL Server Command Line Tools**:
1. Download từ: https://aka.ms/sqlcmd-windows
2. Install
3. Restart terminal
4. Thử lại

---

## 📝 All Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `TEST_CONNECTION.sql` | Test DB connection | Chạy trước tiên |
| `QUICK_CHECK.sql` | Check table structure | Verify columns |
| `INSERT_SAMPLE_SUBSCRIPTION.sql` | Insert default data | Quick insert |
| `INSERT_CUSTOM_SUBSCRIPTION.sql` | Insert custom data | Advanced |
| `RUN_ALL_SETUP.sql` | All-in-one | Automated |
| `insert_sample_data.bat` | Windows batch | Double-click |

---

## 🚀 Quick Command Summary

```bash
# 1. Test connection
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i TEST_CONNECTION.sql

# 2. Check database structure
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql

# 3. Insert sample subscription
sqlcmd -S localhost -d EVDataMarketplace -i INSERT_SAMPLE_SUBSCRIPTION.sql

# 4. Verify
sqlcmd -S localhost -d EVDataMarketplace -Q "SELECT * FROM SubscriptionPackagePurchase WHERE consumer_id = (SELECT consumer_id FROM Consumer WHERE user_id = 4)"

# Done!
```

---

## ✅ Success Checklist

- [ ] SQL Server đang chạy
- [ ] Database EVDataMarketplace tồn tại
- [ ] Table SubscriptionPackagePurchase có đủ columns
- [ ] User ID 4 là DataConsumer
- [ ] Script chạy thành công (no errors)
- [ ] Data hiển thị trong database
- [ ] Frontend có thể fetch được subscription
- [ ] Dashboard accessible

**→ Ready to test! 🎉**

---

## 📞 Need Help?

Xem thêm:
- `HOW_TO_CHECK_DATABASE.md` - Database troubleshooting
- `HOW_TO_INSERT_SAMPLE_DATA.md` - Detailed insert guide
- `SUBSCRIPTION_PURCHASE_SETUP.md` - Full feature documentation
- `QUICK_START.md` - 5-minute quick start

---

**Created**: November 5, 2025  
**Target**: User ID 4  
**Purpose**: Sample subscription data creation  
**Estimated Time**: 2 minutes


