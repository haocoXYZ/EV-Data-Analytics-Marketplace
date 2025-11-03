# EV Data Analytics Marketplace - Testing Guide

## 🚀 Quick Start

### Prerequisites
- SQL Server đang chạy
- .NET 8.0 SDK installed
- Node.js 18+ (cho frontend)

### Start Backend
```bash
cd backend/EVDataMarketplace.API
dotnet run
# Backend chạy tại: http://localhost:5258
# Swagger: http://localhost:5258/swagger
```

### Start Frontend (optional)
```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại: http://localhost:5173
```

---

## 👥 Test Accounts

Database được seed với 4 tài khoản test:

| Role | Email | Password | Mô tả |
|------|-------|----------|-------|
| Admin | admin@test.com | Test123! | Quản lý hệ thống, pricing, payouts |
| Moderator | moderator@test.com | Test123! | Duyệt datasets |
| DataProvider | provider@test.com | Test123! | Upload datasets |
| DataConsumer | consumer@test.com | Test123! | Mua và download data |

---

## 📊 Sample Data

### Provinces (63 tỉnh thành)
- **Hà Nội** (ID: 1) - 30 districts, 400 records
- **TP.HCM** (ID: 2) - 24 districts, 320 records
- **Đà Nẵng** (ID: 3) - 8 districts, 180 records

### Date Range
- **Start:** 90 ngày trước (động)
- **End:** Hôm nay
- Dữ liệu được tạo ngẫu nhiên trong khoảng này

### SystemPricing
| Package Type | Price | Provider % | Admin % |
|--------------|-------|------------|---------|
| DataPackage | 10 VNĐ/row | 70% | 30% |
| SubscriptionPackage | 500,000 VNĐ/month | 60% | 40% |
| APIPackage | 100 VNĐ/call | 65% | 35% |

---

## 🧪 Testing Flow

### 1. Login

```bash
# Login as Consumer
curl -X POST 'http://localhost:5258/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"consumer@test.com","password":"Test123!"}'

# Response:
{
  "token": "eyJhbGci...",
  "user": {
    "userId": 4,
    "email": "consumer@test.com",
    "role": "DataConsumer"
  }
}
```

Lưu token để dùng cho các request tiếp theo.

---

### 2. Preview Data Before Purchase

```bash
TOKEN="your_token_here"

# Preview dữ liệu Hà Nội
curl -X GET 'http://localhost:5258/api/data-packages/preview?provinceId=1' \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "provinceId": 1,
  "provinceName": "Hà Nội",
  "totalRecords": 400,
  "dateRange": {
    "startDate": "2024-08-05T00:00:00",
    "endDate": "2024-11-03T23:59:59"
  },
  "sampleRecords": [...]
}
```

**Filter options:**
- `provinceId` (required): 1 (Hà Nội), 2 (HCMC), 3 (Đà Nẵng)
- `districtId` (optional): ID của district
- `startDate` (optional): ISO format
- `endDate` (optional): ISO format

---

### 3. Purchase Data Package

```bash
# Mua data Hà Nội - Quận Ba Đình
curl -X POST 'http://localhost:5258/api/data-packages/purchase' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "provinceId": 1,
    "districtId": 1
  }'

# Response:
{
  "message": "Purchase created successfully. Please proceed to payment.",
  "purchaseId": 1,
  "rowCount": 100,
  "totalPrice": 1000,
  "status": "Pending",
  "paymentInfo": {
    "paymentType": "DataPackage",
    "referenceId": 1,
    "amount": 1000
  }
}
```

Lưu `purchaseId` để tạo payment.

---

### 4. Create Payment

```bash
PURCHASE_ID=1  # From previous step

curl -X POST 'http://localhost:5258/api/payments/create' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"paymentType\": \"DataPackage\",
    \"referenceId\": $PURCHASE_ID
  }"

# Response:
{
  "paymentId": 4,
  "checkoutUrl": "https://pay.payos.vn/web/...",
  "amount": 1000,
  "status": "Pending"
}
```

---

### 5. Complete Payment

**Option A: Thanh toán thật qua PayOS**
1. Mở `checkoutUrl` trong browser
2. Scan QR code hoặc nhập thông tin banking
3. Hoàn tất thanh toán
4. PayOS sẽ redirect về `http://localhost:5258/api/payments/callback`
5. Backend tự động xử lý:
   - Cập nhật Payment.Status = "Completed"
   - Kích hoạt Purchase.Status = "Active"
   - Tạo RevenueShare records
6. Redirect đến `http://localhost:5173/payment-success`

**Option B: Simulate webhook (localhost testing)**

Nếu không muốn thanh toán thật, dùng script:

```powershell
# Windows PowerShell
.\process_payment_webhook.ps1 -PaymentId 4 -Token "YOUR_TOKEN"
```

Hoặc manual curl:

```bash
PAYMENT_ID=4
ORDER_CODE=1762150234  # Lấy từ payment response

curl -X POST 'http://localhost:5258/api/payments/webhook' \
  -H 'Content-Type: application/json' \
  -d "{
    \"data\": {
      \"orderCode\": $ORDER_CODE,
      \"status\": \"PAID\",
      \"amount\": 1000,
      \"description\": \"Test payment\",
      \"accountNumber\": \"0123456789\",
      \"reference\": \"TXN_$ORDER_CODE\",
      \"transactionDateTime\": \"$(date -u +%Y-%m-%dT%H:%M:%S)\"
    }
  }"
```

---

### 6. Verify Payment Status

```bash
PAYMENT_ID=4

curl -X GET "http://localhost:5258/api/payments/$PAYMENT_ID/status" \
  -H "Authorization: Bearer $TOKEN"

# Expected:
{
  "paymentId": 4,
  "amount": 1000,
  "status": "Completed",  // ✅
  "paymentType": "DataPackage",
  "referenceId": 1
}
```

---

### 7. Download Data

```bash
PURCHASE_ID=1

curl -X GET "http://localhost:5258/api/data-packages/$PURCHASE_ID/download" \
  -H "Authorization: Bearer $TOKEN" \
  --output hanoi_data.csv

# File CSV sẽ được download với:
# - Tất cả records từ các providers trong Hà Nội
# - Format: StationId, StationName, ProvinceId, DistrictId, ChargingTimestamp, EnergyKwh, ...
```

---

## 🔧 Common Issues & Fixes

### Issue 1: "No data available for selected filters"

**Nguyên nhân:** Date range không khớp với dữ liệu trong DB

**Fix:** Không truyền `startDate` và `endDate` để lấy toàn bộ data:
```json
{
  "provinceId": 1,
  "districtId": 1
  // Không có startDate, endDate
}
```

---

### Issue 2: Payment status vẫn "Pending" sau khi thanh toán

**Nguyên nhân:** PayOS không gọi được webhook về localhost

**Fix:** Dùng script manual:
```powershell
.\process_payment_webhook.ps1 -PaymentId 4 -Token "YOUR_TOKEN"
```

Hoặc gọi webhook endpoint thủ công (xem section 5).

---

### Issue 3: Backend không chạy

**Check port 5258:**
```bash
netstat -an | findstr ":5258"
```

**Nếu port bận:**
```bash
# Kill process
tasklist | findstr "EVDataMarketplace"
taskkill /F /IM EVDataMarketplace.API.exe
```

**Restart:**
```bash
cd backend/EVDataMarketplace.API
dotnet run
```

---

### Issue 4: Database không có data

**Reseed database:**
```bash
cd backend/EVDataMarketplace.API

# Drop database
dotnet ef database drop --force

# Restart backend (sẽ tự động migrate và seed)
dotnet run
```

---

## 📋 All API Endpoints

### Authentication
```
POST /api/auth/register    - Đăng ký tài khoản mới
POST /api/auth/login       - Đăng nhập, nhận JWT token
```

### Data Packages (Consumer)
```
GET  /api/data-packages/preview                    - Preview data trước khi mua
POST /api/data-packages/purchase                   - Tạo purchase
GET  /api/data-packages/{purchaseId}/download      - Download CSV
GET  /api/data-packages/my-purchases               - Danh sách purchases
```

### Subscription Packages (Consumer)
```
POST /api/subscription-packages/purchase           - Subscribe dashboard
GET  /api/subscription-packages/{id}/dashboard     - Xem dashboard
GET  /api/subscription-packages/my-subscriptions   - Danh sách subscriptions
```

### API Packages (Consumer)
```
POST /api/api-packages/purchase                    - Mua API credits
POST /api/api-packages/{id}/generate-key           - Tạo API key
GET  /api/api-packages/my-packages                 - Danh sách packages
GET  /api/data                                     - Public API (cần X-API-Key)
```

### Payments
```
POST /api/payments/create          - Tạo payment với PayOS
GET  /api/payments/callback        - PayOS callback (browser redirect)
POST /api/payments/webhook         - PayOS webhook (async notification)
GET  /api/payments/{id}/status     - Check trạng thái payment
```

### Datasets (Provider)
```
GET  /api/datasets/template        - Download CSV template
POST /api/datasets                 - Upload dataset với CSV
GET  /api/datasets/my-datasets     - Danh sách datasets của provider
```

### Moderation (Moderator)
```
GET /api/moderation/pending              - Datasets chờ duyệt
GET /api/moderation/{id}/preview-data    - Preview records (phân trang)
GET /api/moderation/{id}/download        - Download CSV để review
PUT /api/moderation/{id}/approve         - Duyệt dataset
PUT /api/moderation/{id}/reject          - Từ chối dataset
```

### Pricing (Admin)
```
GET   /api/pricing           - Danh sách pricing configs
PUT   /api/pricing/{id}      - Cập nhật pricing
PATCH /api/pricing/{id}/toggle-active   - Bật/tắt pricing
```

### Payouts (Admin & Provider)
```
GET  /api/payouts                     - Danh sách payouts (Admin)
GET  /api/payouts/provider/earnings   - Earnings của provider
POST /api/payouts/process             - Xử lý payout hàng tháng (Admin)
```

---

## 🎯 Payment Flow Details

### Complete Flow

```
1. Consumer creates purchase
   POST /api/data-packages/purchase
   → purchaseId: 1, status: "Pending", totalPrice: 1000

2. Consumer creates payment
   POST /api/payments/create
   → paymentId: 4, checkoutUrl, status: "Pending"

3. Consumer pays on PayOS
   Opens checkoutUrl
   Completes payment

4. PayOS redirects to callback
   GET /api/payments/callback?code=00&status=PAID&orderCode=...

   Backend processes:
   a. Find payment by orderCode
   b. Update Payment.Status = "Completed"
   c. Update Purchase.Status = "Active"
   d. Create RevenueShare records
   e. Redirect to frontend success page

5. Consumer downloads data
   GET /api/data-packages/{purchaseId}/download
   → CSV file
```

### Revenue Sharing

**DataPackage:** Chia theo tỷ lệ đóng góp
- Provider A: 600 rows (60%) → 60% × 70% × 1000 = 420 VNĐ
- Provider B: 400 rows (40%) → 40% × 70% × 1000 = 280 VNĐ
- Admin: 30% × 1000 = 300 VNĐ

**SubscriptionPackage:** Chia đều
- 3 providers → mỗi provider: 33.33% × 60% × 500,000 = 100,000 VNĐ
- Admin: 40% × 500,000 = 200,000 VNĐ

**APIPackage:** Chia đều
- 5 providers → mỗi provider: 20% × 65% × 10,000 = 1,300 VNĐ
- Admin: 35% × 10,000 = 3,500 VNĐ

---

## 🗄️ Database Schema

### Core Tables
- `User` - Tài khoản người dùng
- `DataProvider` - Thông tin provider (company, province_id)
- `DataConsumer` - Thông tin consumer (organization)
- `Dataset` - Datasets đã upload
- `DatasetRecord` - Dữ liệu EV charging (17 fields)

### Purchase Tables
- `DataPackagePurchase` - Mua data theo location
- `SubscriptionPackagePurchase` - Subscribe dashboard
- `APIPackagePurchase` - Mua API credits

### Payment & Revenue
- `Payment` - Thanh toán qua PayOS
- `RevenueShare` - Chia revenue cho providers
- `Payout` - Payout hàng tháng

### Configuration
- `SystemPricing` - Pricing config (3 rows)
- `Province` - 63 tỉnh thành
- `District` - 62 districts (Hà Nội, HCMC, Đà Nẵng)

### API Access
- `APIKey` - API keys cho APIPackage

---

## 🔐 Security Notes

1. **JWT Token:** Hết hạn sau 24 giờ
2. **Role-based Access:**
   - Admin: Full access
   - Moderator: Chỉ moderation endpoints
   - Provider: Upload datasets, view earnings
   - Consumer: Purchase và download data
3. **Payment Security:**
   - PayOS signature verification
   - OrderCode validation
   - Prevent duplicate processing

---

## 📞 Support

### Backend Logs
Check console output khi chạy `dotnet run` để debug:
```
info: Received PayOS callback - Code: 00, Status: PAID, OrderCode: 1762150234
info: Payment 4 completed via callback
```

### Database Queries
```sql
-- Check payment status
SELECT payment_id, status, amount, payment_type
FROM Payment
WHERE payment_id = 4;

-- Check purchase status
SELECT purchase_id, status, total_price
FROM DataPackagePurchase
WHERE purchase_id = 1;

-- Check revenue shares
SELECT share_id, provider_id, provider_share, admin_share
FROM RevenueShare
WHERE payment_id = 4;
```

---

## ✅ Checklist

### Testing Data Package Purchase
- [ ] Login as consumer
- [ ] Preview data (check record count)
- [ ] Create purchase (status = Pending)
- [ ] Create payment (get checkoutUrl)
- [ ] Complete payment (PayOS or simulate webhook)
- [ ] Verify payment status = Completed
- [ ] Verify purchase status = Active
- [ ] Download CSV successfully

### Testing Payment Flow
- [ ] Payment created with PayOS checkout URL
- [ ] PayOS redirect to callback URL works
- [ ] Payment status updates to Completed
- [ ] Purchase activated automatically
- [ ] RevenueShare records created
- [ ] Frontend redirect works

### Testing Backend
- [ ] Backend starts without errors
- [ ] Database auto-migrates on startup
- [ ] Sample data seeded correctly
- [ ] All API endpoints respond
- [ ] Swagger documentation accessible

---

**Happy Testing! 🎉**
