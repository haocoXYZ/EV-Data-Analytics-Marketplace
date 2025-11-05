# ⚡ Quick Start - Subscription Feature

## 🎯 Mục tiêu
Chạy tính năng Subscription Package Purchase trong 5 phút!

---

## ✅ Checklist nhanh

### 1️⃣ Kiểm tra Database (30 giây)

```bash
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql
```

**Kết quả mong đợi**: Tất cả ✓ (15 cột)

❌ **Nếu có cột thiếu** → Chạy migration:
```bash
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql
```

---

### 2️⃣ Khởi động Backend (1 phút)

```bash
cd backend/EVDataMarketplace.API
dotnet restore
dotnet run
```

✅ **Kiểm tra**: `https://localhost:7001/swagger` phải mở được

---

### 3️⃣ Khởi động Frontend (1 phút)

```bash
cd frontend
npm install
npm run dev
```

✅ **Kiểm tra**: `http://localhost:5173` phải mở được

---

### 4️⃣ Test Flow (2 phút)

1. **Login** với DataConsumer account
   - Email: `consumer@test.com`
   - Password: `Test123!`

2. **Vào trang chủ** 
   - Click button **"Đăng ký Dashboard"**

3. **Chọn location**
   - Tỉnh: Hanoi / HCMC / Danang
   - Quận (optional)

4. **Chọn billing cycle**
   - Monthly: 500,000 VND
   - Quarterly: 1,425,000 VND (save 5%)
   - Yearly: 5,100,000 VND (save 15%)

5. **Click "Proceed to Payment"**
   - Redirect sang PayOS
   - Test payment
   - Redirect về trang success

6. **Vào "My Purchases"**
   - Xem subscription vừa mua
   - Click "Access Dashboard"

---

## 🔧 Các API endpoints quan trọng

### Subscription Purchase:
```http
POST /api/subscription-packages/purchase
Body: {
  "provinceId": 1,
  "districtId": null,
  "billingCycle": "Monthly"
}
```

### Dashboard Analytics:
```http
GET /api/subscription-packages/{id}/dashboard
GET /api/subscription-packages/{id}/charts/energy-over-time
GET /api/subscription-packages/{id}/charts/station-distribution
GET /api/subscription-packages/{id}/charts/peak-hours
```

### My Purchases:
```http
GET /api/purchases/my-subscriptions
```

---

## 🐛 Troubleshooting nhanh

### Backend không chạy?
```bash
# Check port
netstat -ano | findstr :7001

# Kill process nếu port bị chiếm
taskkill /PID <PID> /F
```

### Frontend không chạy?
```bash
# Check port
netstat -ano | findstr :5173

# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database lỗi?
```bash
# Check SQL Server có chạy không
net start | findstr SQL

# Start SQL Server
net start MSSQLSERVER
```

### PayOS không hoạt động?
- Kiểm tra `appsettings.json`:
  ```json
  "PayOS": {
    "ClientId": "...",
    "ApiKey": "...",
    "ChecksumKey": "..."
  }
  ```

---

## 📝 Files quan trọng

### Scripts:
- ✅ `backend/QUICK_CHECK.sql` - Kiểm tra database
- ✅ `backend/UPDATE_SUBSCRIPTION_TABLE.sql` - Migration
- ✅ `backend/CHECK_SUBSCRIPTION_TABLE.sql` - Chi tiết check

### Docs:
- ✅ `HOW_TO_CHECK_DATABASE.md` - Hướng dẫn check DB
- ✅ `SUBSCRIPTION_PURCHASE_SETUP.md` - Setup đầy đủ
- ✅ `QUICK_START.md` - File này!

### Frontend:
- ✅ `frontend/src/pages/SubscriptionPurchase.tsx`
- ✅ `frontend/src/api/subscriptions.ts`
- ✅ `frontend/src/api/purchases.ts`

### Backend:
- ✅ `backend/EVDataMarketplace.API/Controllers/SubscriptionPackageController.cs`
- ✅ `backend/EVDataMarketplace.API/Controllers/PaymentsController.cs`
- ✅ `backend/EVDataMarketplace.API/Models/SubscriptionPackagePurchase.cs`

---

## ✨ Demo Account

Dùng account sau để test:

**DataConsumer**:
- Email: `consumer@test.com`
- Password: `Test123!`
- Role: DataConsumer

**DataProvider** (để upload dataset):
- Email: `provider@test.com`
- Password: `Test123!`
- Role: DataProvider

**Admin** (để approve dataset):
- Email: `admin@test.com`
- Password: `Admin123!`
- Role: Admin

---

## 🎉 Success Indicators

✅ Database check: All ✓  
✅ Backend running on port 7001  
✅ Frontend running on port 5173  
✅ Can access /buy-subscription page  
✅ Location dropdowns work  
✅ Price calculation correct  
✅ Payment redirect works  
✅ Dashboard accessible after purchase  

**→ Feature is working!** 🚀

---

## 📚 Xem thêm

- Chi tiết setup: `SUBSCRIPTION_PURCHASE_SETUP.md`
- Database guide: `HOW_TO_CHECK_DATABASE.md`
- API docs: Swagger UI tại `https://localhost:7001/swagger`

---

**Thời gian ước tính**: 5-10 phút  
**Độ khó**: ⭐⭐☆☆☆ (Dễ)  
**Status**: ✅ Ready to use


