# 🎯 Subscription Purchase Feature - Setup Guide

## Tổng quan

Feature này cho phép người dùng mua gói đăng ký (subscription) để truy cập dashboard phân tích dữ liệu EV theo thời gian thực cho một khu vực cụ thể (tỉnh/huyện).

## ✅ Đã hoàn thành

### 1. Frontend (React + TypeScript)

#### Trang mới tạo:
- **`SubscriptionPurchase.tsx`**: Trang mua subscription
  - Chọn tỉnh/thành và quận/huyện
  - Chọn chu kỳ thanh toán (Monthly/Quarterly/Yearly)
  - Tính toán giá với discount tự động
  - Tích hợp PayOS

#### API Integration:
- **`api/purchases.ts`**: Đã có `createSubscription()`
- **`api/subscriptions.ts`**: Đã cập nhật để map đúng format từ backend
  - `getDashboard()`: Transform nested response
  - `getEnergyOverTime()`: Transform dataPoints array
  - `getStationDistribution()`: Transform station data
  - `getPeakHours()`: Transform hourly data

#### Cập nhật các trang:
- **`Home.tsx`**: 
  - Thêm button "Đăng ký Dashboard" ở hero section
  - Card "Dashboard thời gian thực" có link đến subscription purchase
  - CTA section có button subscription
  
- **`MyPurchases.tsx`**:
  - Thêm button "Buy Subscription" khi chưa có subscription
  - Button "Browse Catalog" cho API packages tab

- **`App.tsx`**: Thêm route `/buy-subscription`

### 2. Backend (ASP.NET Core + C#)

#### Controllers:
- **`SubscriptionPackageController.cs`**: ✅ Đã có sẵn
  - `POST /api/subscription-packages/purchase`: Tạo subscription
  - `GET /api/subscription-packages/{id}/dashboard`: Dashboard data
  - `GET /api/subscription-packages/{id}/charts/energy-over-time`: Chart data
  - `GET /api/subscription-packages/{id}/charts/station-distribution`: Station data
  - `GET /api/subscription-packages/{id}/charts/peak-hours`: Peak hours data
  - `POST /api/subscription-packages/{id}/cancel`: Cancel subscription

- **`PaymentsController.cs`**: ✅ Đã hỗ trợ SubscriptionPackage
  - Xử lý thanh toán qua PayOS
  - Webhook để cập nhật status

- **`PurchasesController.cs`**: ✅ Đã có
  - `GET /api/purchases/my-purchases`: Lấy tất cả purchases
  - `GET /api/purchases/my-subscriptions`: Lấy subscriptions

#### Models:
- **`SubscriptionPackagePurchase.cs`**: ✅ Model đầy đủ
  ```csharp
  - SubscriptionId (PK)
  - ConsumerId (FK)
  - ProvinceId, DistrictId
  - StartDate, EndDate
  - BillingCycle (Monthly/Quarterly/Yearly)
  - MonthlyPrice, TotalPaid
  - Status (Pending/Active/Cancelled/Expired)
  - AutoRenew, CancelledAt
  - DashboardAccessCount, LastAccessDate
  ```

#### DTOs:
- **`PurchaseSubscriptionDto.cs`**: ✅ Đã có
  ```csharp
  - ProvinceId
  - DistrictId (optional)
  - BillingCycle
  ```

### 3. Database

⚠️ **QUAN TRỌNG**: Cần chạy migration script!

#### Migration Script:
File: `backend/UPDATE_SUBSCRIPTION_TABLE.sql`

Script này sẽ:
- Thêm cột `billing_cycle` (NVARCHAR(50))
- Thêm cột `purchase_date` (DATETIME2)
- Thêm cột `cancelled_at` (DATETIME2, nullable)
- Thêm cột `dashboard_access_count` (INT)
- Thêm cột `last_access_date` (DATETIME2, nullable)
- Xóa cột `duration_months` cũ (nếu có)

## 🚀 Hướng dẫn Setup

### Bước 0: Kiểm tra Database trước (QUAN TRỌNG!)

**⚠️ BẮT BUỘC: Kiểm tra database có đủ cột chưa!**

```bash
# Chạy quick check
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql

# Hoặc dùng SSMS:
# 1. Mở SQL Server Management Studio
# 2. Connect to server
# 3. Open file QUICK_CHECK.sql
# 4. Execute (F5)
# 5. Xem kết quả trong Messages tab
```

**Đọc kết quả**:
- Tất cả ✓ (checkmark) → Database OK, skip bước 1
- Có ❌ (cross mark) → Cần chạy bước 1

Chi tiết xem file: `HOW_TO_CHECK_DATABASE.md`

---

### Bước 1: Cập nhật Database (Nếu cần)

**⚠️ CHỈ chạy nếu bước 0 có ❌**

```bash
# Kết nối SQL Server và chạy script
cd backend
sqlcmd -S localhost -d EVDataMarketplace -i UPDATE_SUBSCRIPTION_TABLE.sql

# Hoặc dùng SSMS:
# 1. Mở SQL Server Management Studio
# 2. Connect to server
# 3. Open file UPDATE_SUBSCRIPTION_TABLE.sql
# 4. Execute (F5)
```

**Sau khi chạy, verify lại**:
```bash
sqlcmd -S localhost -d EVDataMarketplace -i QUICK_CHECK.sql
# Phải thấy tất cả ✓ mới OK!
```

### Bước 2: Kiểm tra Backend

```bash
cd backend/EVDataMarketplace.API
dotnet restore
dotnet build
dotnet run
```

Kiểm tra endpoints:
- `GET /api/subscription-packages/{id}/dashboard`
- `POST /api/subscription-packages/purchase`

### Bước 3: Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

### Bước 4: Test Flow

1. **Đăng nhập** với tài khoản DataConsumer
2. **Vào trang chủ** (http://localhost:5173)
3. **Click "Đăng ký Dashboard"** button
4. **Chọn location**:
   - Chọn tỉnh (Hanoi, HCMC, hoặc Danang)
   - Chọn quận/huyện (optional)
5. **Chọn billing cycle**:
   - Monthly: Không discount
   - Quarterly: Giảm 5%
   - Yearly: Giảm 15%
6. **Click "Proceed to Payment"**
7. **Thanh toán qua PayOS** (test mode)
8. **Truy cập Dashboard** từ My Purchases

## 📊 Pricing Logic

```typescript
Base Price: 500,000 VND/month

Monthly:    500,000 × 1  = 500,000 VND
Quarterly:  500,000 × 3 × 0.95 = 1,425,000 VND (save 75,000)
Yearly:     500,000 × 12 × 0.85 = 5,100,000 VND (save 900,000)
```

## 🔄 API Flow

### 1. Create Subscription
```
POST /api/subscription-packages/purchase
Body: {
  provinceId: 1,
  districtId: 2,
  billingCycle: "Monthly"
}

Response: {
  subscriptionId: 123,
  monthlyPrice: 500000,
  totalPaid: 500000,
  status: "Pending",
  paymentInfo: {
    paymentType: "SubscriptionPackage",
    referenceId: 123,
    amount: 500000
  }
}
```

### 2. Create Payment
```
POST /api/payments/create
Body: {
  paymentType: "SubscriptionPackage",
  referenceId: 123
}

Response: {
  checkoutUrl: "https://payos.vn/checkout/..."
}
```

### 3. PayOS Webhook (tự động)
```
POST /api/payments/webhook
-> Cập nhật status = "Active"
```

### 4. Access Dashboard
```
GET /api/subscription-packages/123/dashboard

Response: {
  subscription: {...},
  statistics: {
    totalRecords: 1500,
    totalEnergyKwh: 45000,
    uniqueStations: 25
  }
}
```

## 🎨 UI/UX Features

### Trang Subscription Purchase:
- ✅ Beautiful gradient design (purple/indigo theme)
- ✅ Province & District selection
- ✅ Billing cycle cards with discount badges
- ✅ Real-time price calculation
- ✅ Discount visualization
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

### Home Page:
- ✅ "Đăng ký Dashboard" button in hero section
- ✅ Clickable "Dashboard thời gian thực" card
- ✅ Multiple entry points for subscription

### My Purchases:
- ✅ "Buy Subscription" button when empty
- ✅ Clear subscription status display
- ✅ Dashboard access link

## 🔐 Security

- ✅ All endpoints require authentication (`[Authorize]`)
- ✅ Consumer role validation
- ✅ Ownership verification (consumer can only access their own subscriptions)
- ✅ Payment verification through PayOS

## 🐛 Troubleshooting

### Lỗi: "Column 'billing_cycle' does not exist"
**Giải pháp**: Chạy migration script `UPDATE_SUBSCRIPTION_TABLE.sql`

### Lỗi: "Subscription pricing not configured"
**Giải pháp**: Kiểm tra table `SystemPricing` có record cho `SubscriptionPackage`:
```sql
INSERT INTO SystemPricing (PackageType, SubscriptionMonthlyBase, IsActive)
VALUES ('SubscriptionPackage', 500000, 1);
```

### Dashboard không hiển thị dữ liệu
**Nguyên nhân**: Chưa có data trong `DatasetRecords`
**Giải pháp**: 
1. Providers upload datasets
2. Admin approve datasets
3. Data sẽ hiển thị trong dashboard

### Payment không redirect
**Kiểm tra**:
1. PayOS credentials đúng trong `appsettings.json`
2. Frontend API base URL đúng
3. Network tab trong browser

## 📝 Notes

- Subscription status tự động chuyển từ `Pending` → `Active` sau khi thanh toán
- Dashboard tự động update `DashboardAccessCount` mỗi lần truy cập
- Có thể cancel subscription bất kỳ lúc nào
- Expired subscriptions sẽ không thể access dashboard

## 🎉 Summary

✅ **Frontend**: Hoàn chỉnh, UI đẹp, UX tốt
✅ **Backend**: Đầy đủ endpoints, business logic đúng
⚠️ **Database**: Cần chạy migration script
✅ **Integration**: API mapping đã được sửa để tương thích

**Next Steps**:
1. Chạy `UPDATE_SUBSCRIPTION_TABLE.sql`
2. Test flow từ đầu đến cuối
3. Verify payment integration với PayOS
4. Test dashboard với real data

---

Created: November 5, 2025
Feature: Subscription Purchase & Dashboard Access
Status: ✅ Ready for Testing (after DB migration)

