# Fix: Consumer không xem được dataset sau khi mua

## 🐛 Các lỗi đã phát hiện

### Lỗi 1: `GET /api/Datasets/my` → 403 Forbidden ❌

**Nguyên nhân:**
- Endpoint này dành cho **DataProvider**, không phải DataConsumer
- Consumer đang dùng sai endpoint!

**Giải pháp:**
Consumer phải dùng endpoint mới: `/api/Datasets/my-purchases`

---

### Lỗi 2: `GET /api/Datasets/{id}/records` → 500 Internal Server Error ❌

**Nguyên nhân:**
- Lỗi internal server (có thể do dependency injection hoặc dataset không có data)

**Giải pháp:**
- Đã fix và test lại
- Đảm bảo dataset có records trong database

---

### Lỗi 3: `GET /api/Datasets/1/download` → 404 "No data found for this dataset" ❌

**Nguyên nhân:**
- Dataset ID 1 không có data trong `DatasetRecords` table
- Dataset không có FilePath

**Giải pháp:**
- Provider cần upload dataset với CSV file
- Hoặc dataset phải có records trong database

---

## ✅ Endpoint đúng cho Consumer

### 1. Xem danh sách datasets đã mua (MỚI)
```http
GET /api/datasets/my-purchases
Authorization: Bearer {consumer-token}
```

**Response:**
```json
[
  {
    "otpId": 1,
    "datasetId": 1,
    "dataset": {
      "datasetId": 1,
      "providerId": 1,
      "providerName": "EV Charging Corp",
      "name": "Hanoi EV Charging Stations 2024",
      "description": "...",
      "category": "Charging Stations",
      "dataFormat": "CSV",
      "dataSizeMb": 2.5,
      "uploadDate": "2025-01-15T...",
      "status": "Active",
      "moderationStatus": "Approved",
      "tierName": "Standard",
      "basePricePerMb": 1000
    },
    "purchase": {
      "otpId": 1,
      "purchaseDate": "2025-10-26T...",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "totalPrice": 10000,
      "licenseType": "Research",
      "downloadCount": 0,
      "maxDownload": 5,
      "status": "Completed"
    }
  }
]
```

### 2. Download dataset đã mua
```http
GET /api/datasets/{id}/download
Authorization: Bearer {consumer-token}
```

**Điều kiện:**
- ✅ Purchase status = "Completed"
- ✅ DownloadCount < MaxDownload
- ✅ Dataset có data (file hoặc records)

### 3. Xem records online
```http
GET /api/datasets/{id}/records?page=1&pageSize=100
Authorization: Bearer {consumer-token}
```

**Điều kiện:**
- ✅ Purchase status = "Completed"
- ✅ Dataset có records trong database

---

## 📋 Flow đúng cho Consumer

### Bước 1: Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "consumer@test.com",
  "password": "Test123!"
}
```

→ Lưu token (role = "DataConsumer")

### Bước 2: Xem datasets có sẵn
```http
GET /api/datasets
```

→ Public endpoint, không cần auth

### Bước 3: Tạo purchase
```http
POST /api/purchases/onetime
Authorization: Bearer {token}
Content-Type: application/json

{
  "datasetId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "licenseType": "Research"
}
```

→ Nhận `otpId`

### Bước 4: Tạo payment
```http
POST /api/payments/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentType": "OneTimePurchase",
  "referenceId": {otpId}
}
```

→ Nhận `checkoutUrl` và `paymentId`

### Bước 5: Thanh toán
- Mở `checkoutUrl` trong browser
- Thanh toán trên PayOS
- Đợi redirect về

### Bước 6: Check payment status (nếu cần)
```http
GET /api/payments/{paymentId}/check-status
Authorization: Bearer {token}
```

→ Tự động update purchase status thành "Completed"

### Bước 7: Xem datasets đã mua ✨ (ENDPOINT MỚI)
```http
GET /api/datasets/my-purchases
Authorization: Bearer {token}
```

→ Danh sách tất cả datasets đã mua với purchase info

### Bước 8: Download hoặc xem data
```http
# Download CSV
GET /api/datasets/{id}/download
Authorization: Bearer {token}

# Hoặc xem online
GET /api/datasets/{id}/records?page=1&pageSize=10
Authorization: Bearer {token}
```

---

## ⚠️ Lỗi thường gặp và cách fix

### Lỗi: "You need to purchase this dataset first"

**Check 1: Purchase status**
```http
GET /api/purchases/my/onetime
Authorization: Bearer {token}
```

→ Status phải là "Completed"

**Check 2: Payment status**
```http
GET /api/payments/my
Authorization: Bearer {token}
```

→ Status phải là "Completed"

**Fix:**
```http
GET /api/payments/{paymentId}/check-status
Authorization: Bearer {token}
```

### Lỗi: "No data found for this dataset"

**Nguyên nhân:**
- Dataset không có records trong database
- Provider chưa upload CSV file

**Fix:**
1. Provider phải upload dataset với CSV file
2. Hoặc provider phải upload dataset và data được lưu vào DatasetRecords

**Check trong database:**
```sql
SELECT COUNT(*) FROM DatasetRecord WHERE DatasetId = {id};
```

→ Phải có records

### Lỗi: "Download limit exceeded"

**Check:**
```http
GET /api/purchases/my/onetime
Authorization: Bearer {token}
```

→ `downloadCount` >= `maxDownload` (thường là 5)

**Fix:**
- Mua lại dataset
- Hoặc contact admin

### Lỗi: 403 Forbidden

**Nguyên nhân:**
- Dùng sai endpoint (DataProvider endpoint)
- Token không hợp lệ
- Role không đúng

**Fix:**
- Consumer phải dùng endpoints có `[Authorize(Roles = "DataConsumer")]`
- Kiểm tra token còn hạn chưa
- Login lại nếu cần

---

## 📚 Endpoints Summary

### Public Endpoints (Không cần token)
```
GET  /api/datasets                    → Danh sách datasets public
GET  /api/datasets/{id}               → Chi tiết dataset
POST /api/auth/login                  → Login
POST /api/auth/register               → Register
```

### DataConsumer Endpoints (Cần token với role = "DataConsumer")
```
POST /api/purchases/onetime           → Tạo purchase
GET  /api/purchases/my/onetime        → Xem purchases
GET  /api/purchases/my/subscriptions  → Xem subscriptions
GET  /api/purchases/my/api            → Xem API packages

POST /api/payments/create             → Tạo payment link
GET  /api/payments/my                 → Xem payments
GET  /api/payments/{id}/check-status  → Check & update payment

GET  /api/datasets/my-purchases       → ✨ Xem datasets đã mua (MỚI)
GET  /api/datasets/{id}/download      → Download dataset
GET  /api/datasets/{id}/records       → Xem records online
```

### DataProvider Endpoints (Cần token với role = "DataProvider")
```
GET  /api/datasets/my                 → ❌ CHỈ CHO PROVIDER
POST /api/datasets                    → Upload dataset
PUT  /api/datasets/{id}               → Update dataset
DELETE /api/datasets/{id}             → Delete dataset
```

---

## 🎯 Quick Test

### Test với Swagger UI: `http://localhost:5258/swagger`

1. **Login as Consumer**
   - POST `/api/auth/login`
   - Email: `consumer@test.com`
   - Password: `Test123!`
   - Copy token

2. **Authorize**
   - Click "Authorize" button
   - Paste token: `Bearer {token}`

3. **Check purchases**
   - GET `/api/purchases/my/onetime`
   - Verify status = "Completed"

4. **Xem datasets đã mua** ✨
   - GET `/api/datasets/my-purchases`
   - Sẽ thấy tất cả datasets đã mua

5. **Download dataset**
   - GET `/api/datasets/{id}/download`
   - File CSV sẽ được download

---

## 🔧 Database Check Commands

```sql
-- Check Consumer
SELECT * FROM DataConsumer WHERE UserId = {userId};

-- Check Purchases
SELECT * FROM OneTimePurchase 
WHERE ConsumerId = {consumerId} 
ORDER BY PurchaseDate DESC;

-- Check Payments
SELECT * FROM Payment 
WHERE ConsumerId = {consumerId} 
ORDER BY PaymentDate DESC;

-- Check Dataset có data không
SELECT COUNT(*) FROM DatasetRecord WHERE DatasetId = {datasetId};

-- Check Dataset info
SELECT DatasetId, Name, FilePath, Status, ModerationStatus
FROM Dataset 
WHERE DatasetId = {datasetId};
```

---

## ✅ Summary

### Đã fix:
1. ✅ Thêm endpoint `/api/datasets/my-purchases` cho Consumer
2. ✅ Fix logic download hỗ trợ cả file và database records
3. ✅ Clarify endpoints cho từng role

### Consumer phải dùng:
- ✅ `/api/datasets/my-purchases` → Xem datasets đã mua
- ❌ KHÔNG dùng `/api/datasets/my` → Đó là cho Provider!

### Để download được:
1. Purchase status = "Completed"
2. Dataset phải có data (file hoặc records)
3. DownloadCount < MaxDownload

---

**Hãy test lại với endpoint mới: `/api/datasets/my-purchases`** 🎉

