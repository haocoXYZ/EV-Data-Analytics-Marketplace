# 🔍 Hướng dẫn kiểm tra Database

Trước khi làm bất kỳ thao tác nào, hãy kiểm tra database có đủ bảng và cột chưa.

## 🚀 Bước 1: Kiểm tra nhanh

### Option A: Dùng SQL Server Management Studio (SSMS)

1. Mở **SQL Server Management Studio**
2. Connect tới SQL Server của bạn
3. Mở file: `backend/QUICK_CHECK.sql`
4. Nhấn **F5** để execute
5. Xem kết quả trong **Messages** tab

### Option B: Dùng sqlcmd (Command line)

```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql
```

### Option C: Dùng Azure Data Studio

1. Mở **Azure Data Studio**
2. Connect tới database
3. Open file `backend/QUICK_CHECK.sql`
4. Click **Run** button
5. Xem kết quả

---

## 📊 Đọc kết quả

### Kết quả tốt (✓):
```
✓ subscription_id
✓ consumer_id
✓ province_id
✓ district_id
✓ start_date
✓ end_date
✓ billing_cycle
✓ monthly_price
✓ total_paid
✓ purchase_date
✓ status
✓ auto_renew
✓ cancelled_at
✓ dashboard_access_count
✓ last_access_date
```

**→ Database đã sẵn sàng! Không cần migration.**

### Kết quả có vấn đề (❌):
```
✓ subscription_id
✓ consumer_id
✓ province_id
✓ district_id
✓ start_date
✓ end_date
❌ billing_cycle          <- Thiếu cột này
✓ monthly_price
✓ total_paid
❌ purchase_date          <- Thiếu cột này
✓ status
✓ auto_renew
❌ cancelled_at           <- Thiếu cột này
❌ dashboard_access_count <- Thiếu cột này
❌ last_access_date       <- Thiếu cột này
```

**→ Cần chạy migration script!**

---

## 🔧 Bước 2: Nếu thiếu cột → Chạy Migration

### Chạy script UPDATE:

```bash
# Option 1: SSMS
# Mở file backend/UPDATE_SUBSCRIPTION_TABLE.sql
# Execute (F5)

# Option 2: sqlcmd
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql
```

### Script này sẽ:
- ✅ Thêm các cột còn thiếu
- ✅ Migrate data từ `duration_months` sang `billing_cycle` (nếu có)
- ✅ Xóa cột cũ `duration_months`
- ✅ Set default values cho cột mới

---

## 🔍 Bước 3: Check lại sau khi update

Chạy lại `QUICK_CHECK.sql` để verify:

```bash
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql
```

Phải thấy tất cả **✓** (checkmark) thì mới OK!

---

## 📝 Chi tiết kiểm tra đầy đủ (Optional)

Nếu muốn xem chi tiết hơn:

```bash
# Chạy script check đầy đủ
sqlcmd -S localhost -d EVDataMarketplace -i CHECK_SUBSCRIPTION_TABLE.sql
```

Script này sẽ show:
- ✅ Danh sách tất cả columns hiện có
- ✅ Data type và nullable của từng cột
- ✅ List các cột còn thiếu
- ✅ Check deprecated columns
- ✅ Summary report

---

## 🎯 Checklist tổng thể

- [ ] **Step 1**: Chạy `QUICK_CHECK.sql`
- [ ] **Step 2**: Nếu có ❌ → Chạy `UPDATE_SUBSCRIPTION_TABLE.sql`
- [ ] **Step 3**: Chạy lại `QUICK_CHECK.sql` để verify
- [ ] **Step 4**: Tất cả phải ✓ → Ready!

---

## ⚠️ Troubleshooting

### Lỗi: "Database 'EVDataMarketplace' does not exist"
**Giải pháp**: Tạo database mới
```bash
sqlcmd -S localhost -i backend/CREATE_NEW_DATABASE.sql
```

### Lỗi: "Cannot connect to SQL Server"
**Kiểm tra**:
1. SQL Server có đang chạy không?
2. Connection string đúng không?
3. Credentials (username/password) đúng không?

### Lỗi: "Permission denied"
**Giải pháp**: Chạy với admin privileges hoặc dùng account có quyền ALTER TABLE

---

## 💡 Tips

- ✅ **Backup database trước** khi chạy migration (an toàn hơn)
- ✅ Chạy trên **development environment** trước
- ✅ Test kỹ trước khi deploy lên production
- ✅ Giữ lại file log kết quả migration

---

## 🎉 Khi nào Database sẵn sàng?

Database sẵn sàng khi:

✅ Tất cả 15 cột required đều có dấu ✓
✅ Không có cột deprecated (duration_months)
✅ Foreign keys đúng (Consumer, Province, District)
✅ Indexes tồn tại

**→ Lúc này bạn có thể chạy ứng dụng!**

```bash
# Backend
cd backend/EVDataMarketplace.API
dotnet run

# Frontend
cd frontend
npm run dev
```

---

Created: November 5, 2025  
Purpose: Database verification before deployment


