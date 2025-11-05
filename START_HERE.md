# 🚀 START HERE - Subscription Package Purchase Feature

## ⚡ Cách nhanh nhất để bắt đầu

### Windows Users (EASIEST):
```bash
1. Double-click: backend\insert_sample_data.bat
2. Đợi script chạy xong
3. Done! ✅
```

### Manual (All Platforms):
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i INSERT_SAMPLE_SUBSCRIPTION.sql
```

---

## 📖 Có gì trong package này?

✅ **Frontend**:
- UI đẹp cho subscription purchase
- Dashboard với 3 charts
- My Purchases page
- Payment integration (PayOS)

✅ **Backend**:
- REST APIs đầy đủ
- Controllers, Services, DTOs
- Database models
- PayOS integration

✅ **Database**:
- Migration scripts
- Check scripts
- Sample data scripts

✅ **Documentation**:
- 7 files hướng dẫn chi tiết
- SQL scripts với comments đầy đủ
- Troubleshooting guides

---

## 🎯 Bạn muốn làm gì?

### 1️⃣ Tạo dữ liệu mẫu cho User ID 4
👉 **Đọc**: `INSERT_DATA_FOR_USER4.md`  
🚀 **Chạy**: `backend\insert_sample_data.bat`

### 2️⃣ Kiểm tra database có OK không
👉 **Đọc**: `HOW_TO_CHECK_DATABASE.md`  
🔍 **Chạy**: `backend\QUICK_CHECK.sql`

### 3️⃣ Setup toàn bộ feature từ đầu
👉 **Đọc**: `SUBSCRIPTION_PURCHASE_SETUP.md`  
📚 **Follow**: Step-by-step guide

### 4️⃣ Chạy nhanh trong 5 phút
👉 **Đọc**: `QUICK_START.md`  
⚡ **Follow**: Quick checklist

### 5️⃣ Hiểu các SQL scripts
👉 **Đọc**: `backend\SQL_SCRIPTS_README.md`  
📝 **Browse**: 8 SQL files với docs

### 6️⃣ Insert custom subscription data
👉 **Đọc**: `HOW_TO_INSERT_SAMPLE_DATA.md`  
🎨 **Edit**: `backend\INSERT_CUSTOM_SUBSCRIPTION.sql`

---

## 📁 File Structure

```
📦 EV-Data-Analytics-Marketplace-cuongbe
├── 📄 START_HERE.md                    ← You are here!
├── 📄 QUICK_START.md                   ← 5-minute setup
├── 📄 SUBSCRIPTION_PURCHASE_SETUP.md   ← Full documentation
├── 📄 HOW_TO_CHECK_DATABASE.md         ← DB verification
├── 📄 HOW_TO_INSERT_SAMPLE_DATA.md     ← Insert guide
├── 📄 INSERT_DATA_FOR_USER4.md         ← User 4 specific
│
├── 📁 backend/
│   ├── 📄 SQL_SCRIPTS_README.md        ← SQL docs
│   ├── 🔧 TEST_CONNECTION.sql
│   ├── 🔍 QUICK_CHECK.sql
│   ├── 📋 CHECK_SUBSCRIPTION_TABLE.sql
│   ├── ⚙️ UPDATE_SUBSCRIPTION_TABLE.sql
│   ├── 📝 INSERT_SAMPLE_SUBSCRIPTION.sql
│   ├── 🎨 INSERT_CUSTOM_SUBSCRIPTION.sql
│   ├── 🚀 RUN_ALL_SETUP.sql
│   └── 💻 insert_sample_data.bat
│
├── 📁 backend/EVDataMarketplace.API/
│   ├── Controllers/
│   │   ├── SubscriptionPackageController.cs
│   │   ├── PaymentsController.cs
│   │   └── PurchasesController.cs
│   └── Models/
│       └── SubscriptionPackagePurchase.cs
│
└── 📁 frontend/
    ├── src/pages/
    │   ├── SubscriptionPurchase.tsx
    │   └── MyPurchases.tsx
    └── src/api/
        ├── subscriptions.ts
        └── purchases.ts
```

---

## 🎯 Common Tasks

### Task: Tạo subscription cho customer
```bash
# Quick way
cd backend
insert_sample_data.bat

# Manual way
sqlcmd -S localhost -d EVDataMarketplace -i INSERT_SAMPLE_SUBSCRIPTION.sql
```

### Task: Kiểm tra database
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql
```

### Task: Fix missing columns
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql
```

### Task: Chạy ứng dụng
```bash
# Backend
cd backend/EVDataMarketplace.API
dotnet run

# Frontend (terminal mới)
cd frontend
npm run dev
```

---

## 🐛 Quick Troubleshooting

### Lỗi connection?
```bash
# Check SQL Server
net start | findstr SQL

# Start nếu chưa chạy
net start MSSQLSERVER
```

### Database thiếu cột?
```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql
```

### User ID 4 không tồn tại?
```bash
# Check available users
sqlcmd -S localhost -d EVDataMarketplace -Q "SELECT u.user_id, u.username FROM [User] u INNER JOIN Consumer c ON u.user_id = c.user_id"
```

---

## 📚 Documentation Map

```
START_HERE.md (you are here)
    ↓
    ├── Quick start? → QUICK_START.md
    ├── Insert data? → INSERT_DATA_FOR_USER4.md
    ├── Check DB? → HOW_TO_CHECK_DATABASE.md
    ├── Full setup? → SUBSCRIPTION_PURCHASE_SETUP.md
    └── SQL scripts? → backend/SQL_SCRIPTS_README.md
```

---

## 🎉 Success Indicators

Sau khi setup xong, bạn sẽ thấy:

✅ Database có đủ 15 columns trong SubscriptionPackagePurchase  
✅ User ID 4 có ít nhất 1 subscription  
✅ Backend chạy tại https://localhost:7001  
✅ Frontend chạy tại http://localhost:5173  
✅ Swagger UI accessible tại https://localhost:7001/swagger  
✅ Login được với User 4 credentials  
✅ "My Purchases" page hiển thị subscriptions  
✅ Dashboard accessible với charts  

---

## 🔗 Quick Links

| Task | Link |
|------|------|
| 5-min setup | [QUICK_START.md](QUICK_START.md) |
| Insert data for User 4 | [INSERT_DATA_FOR_USER4.md](INSERT_DATA_FOR_USER4.md) |
| Check database | [HOW_TO_CHECK_DATABASE.md](HOW_TO_CHECK_DATABASE.md) |
| Full documentation | [SUBSCRIPTION_PURCHASE_SETUP.md](SUBSCRIPTION_PURCHASE_SETUP.md) |
| SQL scripts | [backend/SQL_SCRIPTS_README.md](backend/SQL_SCRIPTS_README.md) |
| Sample data guide | [HOW_TO_INSERT_SAMPLE_DATA.md](HOW_TO_INSERT_SAMPLE_DATA.md) |

---

## 💡 Tips

1. **Luôn kiểm tra database trước** bằng QUICK_CHECK.sql
2. **Backup database** trước khi chạy migration
3. **Test trên dev** environment trước
4. **Dùng batch file** trên Windows cho nhanh
5. **Đọc error messages** kỹ - chúng rất chi tiết!

---

## 🎯 Next Steps

1. ✅ Chọn một task ở trên
2. ✅ Đọc file hướng dẫn tương ứng
3. ✅ Chạy scripts cần thiết
4. ✅ Verify kết quả
5. ✅ Start backend & frontend
6. ✅ Test feature!

---

**Ready to go?** 🚀  
**Start with**: `INSERT_DATA_FOR_USER4.md` or `QUICK_START.md`

**Need help?** Check the troubleshooting section in each guide.

**Questions?** All scripts have detailed comments and error messages!

---

**Created**: November 5, 2025  
**Version**: 1.0  
**Feature**: Subscription Package Purchase  
**Status**: ✅ Ready to use


