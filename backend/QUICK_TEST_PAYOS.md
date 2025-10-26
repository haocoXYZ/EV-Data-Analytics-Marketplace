# 🚀 Test PayOS Flow - Hướng dẫn nhanh

## ✅ Tình trạng hiện tại:
- ✅ API đang chạy: http://localhost:5258
- ✅ Description đã fix (dưới 25 ký tự)
- ✅ PayOS SDK đã integrate
- ⚠️ **CẦN SETUP WEBHOOK URL**

## 🔧 Bước 1: Setup ngrok (BẮT BUỘC)

### Cài đặt ngrok:
```bash
# Option 1: Download từ web
https://ngrok.com/download

# Option 2: Dùng winget (Windows)
winget install ngrok
```

### Chạy ngrok:
```bash
ngrok http 5258
```

### Output bạn sẽ thấy:
```
Session Status                online
Account                       ...
Version                       3.x.x
Region                        ...
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5258
```

**📝 COPY URL này:** `https://abc123.ngrok-free.app`

---

## 🌐 Bước 2: Cập nhật PayOS Dashboard

### Vào: https://my.payos.vn/store/settings

### Điền thông tin:
- **Tên công ty:** EV Data Marketplace
- **Ngân hàng:** NGUYEN DOAN VAN THANH 0377822732
- **Webhook URL:** 
  ```
  https://abc123.ngrok-free.app/api/payments/webhook
  ```
  (Thay `abc123` bằng subdomain ngrok của bạn)

### Click **LƯU**

---

## 🧪 Bước 3: Test Payment Flow

### 1. Login Frontend
```
Email: consumer1@example.com
Password: password123
```

### 2. Vào Catalog → Chọn Dataset → Click "Mua ngay"

### 3. API sẽ tạo payment:
```json
POST http://localhost:5258/api/purchases/onetimepurchase
{
  "datasetId": 1
}
```

### 4. Response trả về:
```json
{
  "paymentId": 6,
  "payosOrderId": "1761491638",
  "checkoutUrl": "https://pay.payos.vn/web/abc123...",
  "qrCode": "data:image/png;base64,iVBOR...",
  "amount": 10000,
  "status": "Pending"
}
```

### 5. Scan QR Code hoặc mở checkoutUrl

### 6. Thanh toán test (PayOS Sandbox)

### 7. Sau khi thanh toán:
- PayOS gọi webhook về: `https://abc123.ngrok-free.app/api/payments/webhook`
- Backend cập nhật Payment status → "Success"
- Frontend redirect về `/payment/success`

---

## 📋 Kiểm tra log API

Sau khi thanh toán, bạn sẽ thấy log:

```
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      Received PayOS webhook for Payment ID: 6
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      Webhook verified successfully
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      Payment status updated: Success
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      OneTimePurchase activated: OTP ID 1
```

---

## 🎯 Checklist hoàn chỉnh

- [ ] API chạy: `http://localhost:5258` ✅
- [ ] Ngrok chạy: `ngrok http 5258` ⚠️
- [ ] Webhook URL updated trong PayOS Dashboard ⚠️
- [ ] Frontend chạy: `http://localhost:5173` ⚠️
- [ ] Login consumer account ⚠️
- [ ] Tạo OneTimePurchase ⚠️
- [ ] Scan QR code và thanh toán ⚠️
- [ ] Kiểm tra webhook log ⚠️
- [ ] Verify payment status = "Success" ⚠️

---

## ⚠️ Troubleshooting

### Lỗi: "Mô tả tối đa 25 kí tự"
✅ **ĐÃ FIX!** Description giờ là:
- "Mua du lieu 1 lan" (18 chars)
- "Dang ky thue bao" (17 chars)
- "Mua goi API" (11 chars)

### Lỗi: Webhook không được gọi
- ✅ Kiểm tra ngrok có đang chạy không
- ✅ Kiểm tra URL trong PayOS Dashboard đúng chưa
- ✅ Kiểm tra log API có thấy request không

### Lỗi: "Invalid webhook signature"
- ✅ ChecksumKey trong `appsettings.json` phải trùng với PayOS Dashboard
- ✅ PayOS SDK tự động verify signature

### Lỗi: Payment status không update
- ✅ Kiểm tra webhook có được gọi thành công không (HTTP 200)
- ✅ Kiểm tra Payment ID trong webhook có đúng không
- ✅ Kiểm tra database: `SELECT * FROM Payment WHERE payment_id = 6`

---

## 🔥 TÓM TẮT: Điều quan trọng nhất

**WEBHOOK URL trong PayOS Dashboard phải là:**
```
https://<ngrok-url>.ngrok-free.app/api/payments/webhook
```

**KHÔNG phải:**
- ❌ `http://localhost:5258/api/payments/webhook` (không public)
- ❌ Để trống (webhook không được gọi)

**Endpoint đã implement:** `POST /api/payments/webhook` ✅

---

## 📞 Nếu vẫn gặp vấn đề

Check log API và gửi cho tôi:
```bash
# Copy log từ terminal nơi API đang chạy
```

Hoặc test trực tiếp webhook bằng Postman:
```
POST https://<ngrok-url>.ngrok-free.app/api/payments/webhook
Content-Type: application/json

{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 1761491638,
    "amount": 10000,
    "description": "Mua du lieu 1 lan",
    "status": "PAID"
  },
  "signature": "..."
}
```

Chúc bạn test thành công! 🎉

