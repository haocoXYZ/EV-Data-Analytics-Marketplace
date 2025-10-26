# Hướng dẫn Download Dataset sau khi mua

## 🔍 Vấn đề: Không download được dataset sau khi thanh toán

### ✅ Checklist trước khi download:

1. **Payment đã Completed chưa?**
   ```
   GET /api/payments/my
   ```
   → Status phải là **"Completed"**

2. **Purchase đã Completed chưa?**
   ```
   GET /api/purchases/my/onetime
   ```
   → Status phải là **"Completed"**

3. **Có quyền download chưa?**
   - `DownloadCount < MaxDownload` (thường là 0 < 5)

---

## 📥 Cách download Dataset

### Endpoint 1: Download file CSV (Recommended)
```http
GET /api/datasets/{id}/download
Authorization: Bearer {token}
```

**Response:**
- File CSV được download trực tiếp
- Tự động tăng `DownloadCount`
- Có thể download từ file hoặc generate từ database

### Endpoint 2: Xem records (View online)
```http
GET /api/datasets/{id}/records?page=1&pageSize=100
Authorization: Bearer {token}
```

**Response:**
```json
{
  "datasetId": 1,
  "page": 1,
  "pageSize": 100,
  "totalRecords": 500,
  "totalPages": 5,
  "records": [
    {
      "recordId": 1,
      "rowNumber": 1,
      "recordData": "{\"column1\":\"value1\",\"column2\":\"value2\"}",
      "createdAt": "2025-10-26T..."
    }
  ]
}
```

---

## 🔧 Khắc phục vấn đề thường gặp

### Issue 1: Payment Completed nhưng Purchase vẫn Pending

**Nguyên nhân:** Webhook không update purchase status

**Giải pháp:**
```http
GET /api/payments/{paymentId}/check-status
Authorization: Bearer {token}
```

Endpoint này sẽ:
- ✅ Check status từ PayOS
- ✅ Update Payment status
- ✅ Update Purchase status (tự động)
- ✅ Create Revenue Share record

### Issue 2: "You need to purchase this dataset first"

**Check:**
```sql
SELECT * FROM OneTimePurchase 
WHERE DatasetId = {id} AND ConsumerId = {consumerId};
```

**Status phải là "Completed"**, nếu không:
1. Check Payment status
2. Run `check-status` endpoint
3. Verify trong database đã update

### Issue 3: "Dataset file not found"

**Nguyên nhân:**
- Dataset không có FilePath (data trong database)
- File đã bị xóa

**Giải pháp:**
- Endpoint download đã được update để handle cả 2 cases:
  - Có file → download file
  - Không có file → generate CSV từ database

### Issue 4: "Download limit exceeded"

**Check:**
```sql
SELECT DownloadCount, MaxDownload 
FROM OneTimePurchase 
WHERE DatasetId = {id} AND ConsumerId = {consumerId};
```

**Nếu DownloadCount >= MaxDownload:**
- Mua lại dataset
- Hoặc liên hệ admin để tăng limit

---

## 🧪 Test Flow hoàn chỉnh

### 1. Đăng nhập Consumer
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "consumer@test.com",
  "password": "Test123!"
}
```

→ Lưu token

### 2. Tạo Purchase
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

→ Lưu `otpId`

### 3. Tạo Payment
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

### 4. Thanh toán trên PayOS
- Mở `checkoutUrl` trong browser
- Quét QR hoặc thanh toán test
- Đợi redirect về

### 5. Check Payment Status (Nếu cần)
```http
GET /api/payments/{paymentId}/check-status
Authorization: Bearer {token}
```

→ Xác nhận "Completed"

### 6. Verify Purchase Status
```http
GET /api/purchases/my/onetime
Authorization: Bearer {token}
```

→ Confirm status = "Completed"

### 7. Download Dataset
```http
GET /api/datasets/1/download
Authorization: Bearer {token}
```

→ File CSV downloaded! 🎉

### 8. Xem Records (Optional)
```http
GET /api/datasets/1/records?page=1&pageSize=10
Authorization: Bearer {token}
```

→ View data online

---

## 📊 Database Schema

### OneTimePurchase Table
```sql
CREATE TABLE OneTimePurchase (
    OtpId INT PRIMARY KEY,
    DatasetId INT,
    ConsumerId INT,
    Status NVARCHAR(50),        -- Pending → Completed
    DownloadCount INT DEFAULT 0,
    MaxDownload INT DEFAULT 5,
    TotalPrice DECIMAL(18,2),
    PurchaseDate DATETIME,
    ...
)
```

### Payment Table
```sql
CREATE TABLE Payment (
    PaymentId INT PRIMARY KEY,
    ConsumerId INT,
    Amount DECIMAL(18,2),
    Status NVARCHAR(50),        -- Pending → Completed
    PaymentType NVARCHAR(50),   -- OneTimePurchase
    ReferenceId INT,            -- = OtpId
    TransactionRef NVARCHAR(255), -- PayOS OrderCode
    ...
)
```

### Flow:
```
Payment.Status = Completed 
    ↓
OneTimePurchase.Status = Completed (auto update via webhook/callback)
    ↓
Can download dataset
```

---

## 🚀 Quick Debug Commands

### Check Payment
```sql
SELECT PaymentId, Status, TransactionRef, ReferenceId 
FROM Payment 
WHERE ConsumerId = {consumerId}
ORDER BY PaymentDate DESC;
```

### Check Purchase
```sql
SELECT OtpId, DatasetId, Status, DownloadCount, MaxDownload
FROM OneTimePurchase 
WHERE ConsumerId = {consumerId}
ORDER BY PurchaseDate DESC;
```

### Check Dataset Records
```sql
SELECT COUNT(*) as RecordCount
FROM DatasetRecord 
WHERE DatasetId = {datasetId};
```

### Check Revenue Share
```sql
SELECT * FROM RevenueShare 
WHERE PaymentId = {paymentId};
```

---

## ✨ New Features (Vừa thêm)

### 1. Auto-generate CSV from Database
- Nếu dataset không có file upload
- Data được lưu trong `DatasetRecords` table
- Endpoint tự động generate CSV khi download

### 2. View Records Online
- Xem data trực tiếp qua API
- Pagination support
- Không tốn download count

### 3. Flexible Download
- Download file nếu có
- Generate CSV nếu không có file
- Always works! 🎯

---

**TL;DR:**
1. Payment Complete → Run `check-status` để update Purchase
2. Purchase Complete → Download tại `/api/datasets/{id}/download`
3. Nếu lỗi → Check status trong database hoặc logs

🎊 Happy downloading!

