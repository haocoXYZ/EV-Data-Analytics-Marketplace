# Test PayOS Integration Flow

## ✅ API đang chạy: http://localhost:5258/swagger

## 📝 Test Steps

### Bước 1: Đăng ký Consumer
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Test Consumer",
  "email": "consumer@test.com",
  "password": "Test123!",
  "role": "DataConsumer"
}
```

### Bước 2: Login để lấy JWT token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "consumer@test.com",
  "password": "Test123!"
}
```

**→ Copy JWT token từ response**
**→ Click nút "Authorize" trong Swagger**
**→ Nhập: Bearer {your_token}**

### Bước 3: Kiểm tra datasets có sẵn
```http
GET /api/datasets
```

**→ Ghi nhớ một `datasetId` để test**

### Bước 4: Tạo One-Time Purchase
```http
POST /api/purchases/onetime
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "datasetId": 1,
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-01-31T23:59:59",
  "licenseType": "Research"
}
```

**Response sẽ trả về:**
```json
{
  "otpId": 15,
  "datasetId": 1,
  "totalPrice": 500000,
  "status": "Pending",
  "message": "One-time purchase created. Proceed to payment."
}
```

**→ Ghi nhớ `otpId`**

### Bước 5: Tạo Payment Link với PayOS
```http
POST /api/payments/create
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "paymentType": "OneTimePurchase",
  "referenceId": 15
}
```

**Response sẽ trả về:**
```json
{
  "paymentId": 42,
  "payosOrderId": "a1b2c3d4e5f6",
  "checkoutUrl": "https://pay.payos.vn/checkout/1730012345",
  "amount": 500000,
  "status": "Pending"
}
```

**✅ NẾU THẤY RESPONSE NÀY = PayOS Integration hoạt động!**

### Bước 6: Test Payment Completion (Manual)
```http
POST /api/payments/42/complete
Authorization: Bearer {your_token}
```

**Response:**
```json
{
  "message": "Payment completed successfully"
}
```

### Bước 7: Kiểm tra Purchases đã complete
```http
GET /api/purchases/my/onetime
Authorization: Bearer {your_token}
```

**Response sẽ có:**
```json
[
  {
    "otpId": 15,
    "status": "Completed",  ← PHẢI LÀ COMPLETED
    ...
  }
]
```

### Bước 8: Kiểm tra Revenue Share đã được tạo
**Vào SQL Server Management Studio:**
```sql
-- Xem payment
SELECT * FROM Payments WHERE PaymentId = 42;

-- Xem revenue share
SELECT * FROM RevenueShares WHERE PaymentId = 42;
```

**Expected Result:**
```
ShareId | PaymentId | ProviderId | ProviderShare | AdminShare | PayoutStatus
--------|-----------|------------|---------------|------------|-------------
   1    |    42     |     5      |   350000      |  150000    | Pending
```

## 🔴 Các lỗi có thể gặp:

### Lỗi 1: "Consumer profile not found"
**Nguyên nhân:** Chưa tạo DataConsumer profile sau khi register
**Giải pháp:** Kiểm tra table DataConsumers trong database

### Lỗi 2: "Dataset not found or not available"
**Nguyên nhân:** Dataset chưa được approve bởi Moderator
**Giải pháp:** Check `status = 'Active'` và `moderationStatus = 'Approved'`

### Lỗi 3: PayOS API returns 401/403
**Nguyên nhân:** ApiKey hoặc ClientId không đúng
**Giải pháp:** Kiểm tra lại config trong appsettings.Development.json

### Lỗi 4: Webhook signature không match
**Nguyên nhân:** ChecksumKey không đúng
**Giải pháp:** Verify ChecksumKey với PayOS dashboard

## ✅ Checklist hoạt động đúng:

- [ ] Consumer có thể tạo purchase (OneTime/Subscription/API)
- [ ] Payment link được tạo với checkoutUrl hợp lệ
- [ ] Webhook nhận được từ PayOS và verify signature thành công
- [ ] Payment status update từ Pending → Completed
- [ ] RevenueShare được tạo tự động
- [ ] Purchase status update từ Pending → Completed

## 🎯 Test với PayOS thật:

### Cấu hình Webhook trong PayOS Dashboard:
1. Vào https://payos.vn/dashboard
2. Tìm phần Webhook Settings
3. Nhập URL: `https://your-domain.com/api/payments/webhook`

### Cho local testing:
1. Cài đặt ngrok: `choco install ngrok` hoặc download từ ngrok.com
2. Chạy: `ngrok http 5258`
3. Copy HTTPS URL (vd: `https://abc123.ngrok.io`)
4. Config webhook: `https://abc123.ngrok.io/api/payments/webhook`
5. Test thanh toán thật trên PayOS

## 📞 PayOS Support:
- Website: https://payos.vn
- Docs: https://payos.vn/docs
- Support: support@payos.vn


