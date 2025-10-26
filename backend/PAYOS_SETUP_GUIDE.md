# 🔧 Hướng dẫn Setup PayOS

## ⚠️ VẤN ĐỀ HIỆN TẠI

PayOS API trả về lỗi **"code": "20"** - "Thông tin truyền lên không đúng"

### Nguyên nhân có thể:

1. **ClientId/ApiKey không hợp lệ** (test credentials đã hết hạn)
2. **Tài khoản PayOS chưa được kích hoạt**
3. **Môi trường sandbox vs production**

## 📝 Các bước để có PayOS credentials hợp lệ:

### Bước 1: Đăng ký tài khoản PayOS

1. Truy cập: https://payos.vn
2. Đăng ký tài khoản doanh nghiệp/cá nhân
3. Xác thực thông tin (CCCD, giấy phép KD nếu là DN)
4. Chờ PayOS approve (1-2 ngày làm việc)

### Bước 2: Lấy API Credentials

1. Đăng nhập vào: https://my.payos.vn
2. Vào **Settings** > **API Keys**
3. Tạo API Key mới hoặc copy credentials hiện có:
   - **Client ID**
   - **API Key** 
   - **Checksum Key**

### Bước 3: Cấu hình Webhook

1. Vào **Settings** > **Webhook**
2. Nhập URL webhook của bạn:
   - Local testing (dùng ngrok): `https://abc123.ngrok.io/api/payments/webhook`
   - Production: `https://yourdomain.com/api/payments/webhook`
3. Copy **Webhook Signature Key**

### Bước 4: Update appsettings.Development.json

```json
{
  "PayOS": {
    "ClientId": "YOUR_REAL_CLIENT_ID",
    "ApiKey": "YOUR_REAL_API_KEY",
    "ChecksumKey": "YOUR_REAL_CHECKSUM_KEY",
    "ReturnUrl": "http://localhost:5173/payment/callback",
    "CancelUrl": "http://localhost:5173/payment/cancel"
  }
}
```

## 🧪 Test với PayOS Sandbox

PayOS có môi trường **sandbox** để test mà không cần tài khoản thật:

### Cách sử dụng Sandbox:

1. Đăng ký tài khoản test tại: https://test.payos.vn
2. Lấy test credentials
3. Thay đổi base URL trong code:
   ```csharp
   // Test environment
   var response = await _httpClient.PostAsync("https://api-test.payos.vn/v2/payment-requests", content);
   
   // Production environment  
   var response = await _httpClient.PostAsync("https://api-merchant.payos.vn/v2/payment-requests", content);
   ```

## 🔍 Cách test credentials có hợp lệ không:

### Test 1: Health Check

```bash
curl -X GET https://api-merchant.payos.vn/health \
  -H "x-client-id: YOUR_CLIENT_ID" \
  -H "x-api-key: YOUR_API_KEY"
```

Expected: Status 200 OK

### Test 2: Create Payment Request

```bash
# Sử dụng script test-payos-signature.ps1
cd backend
powershell -ExecutionPolicy Bypass -File test-payos-signature.ps1
```

Expected response:
```json
{
  "code": "00",
  "desc": "Success",
  "data": {
    "checkoutUrl": "https://pay.payos.vn/...",
    "qrCode": "data:image/png;base64,...",
    "orderCode": 1234567890
  }
}
```

## 📞 Liên hệ Support PayOS

Nếu credentials vẫn không hoạt động:

- **Email**: support@payos.vn
- **Hotline**: (028) 7300 7885
- **Documentation**: https://payos.vn/docs
- **Facebook**: https://www.facebook.com/payosvn

## 🎯 Giải pháp tạm thời (Development)

Nếu chưa có PayOS credentials hợp lệ, bạn có thể:

### Option 1: Mock Payment (đã implement)

Code hiện tại đã có fallback tự động:
- Khi PayOS API fail → trả về mock checkout URL
- Frontend vẫn hiển thị được giao diện thanh toán
- Có thể test flow mà không cần PayOS thật

### Option 2: Manual Payment Completion

Dùng endpoint test:
```http
POST /api/payments/{id}/complete
Authorization: Bearer {token}
```

Endpoint này sẽ:
- Đánh dấu payment là Completed
- Tạo revenue share
- Update purchase status

Flow test:
1. Tạo purchase → nhận `purchaseId`
2. Tạo payment → nhận `paymentId`
3. Gọi manual complete → payment completed
4. Check purchase status → status = "Completed"

## ✅ Checklist

- [ ] Đã đăng ký tài khoản PayOS
- [ ] Tài khoản đã được approve
- [ ] Đã lấy được ClientId, ApiKey, ChecksumKey
- [ ] Đã update vào appsettings.Development.json
- [ ] Test credentials với script test-payos-signature.ps1
- [ ] PayOS trả về code "00" (Success)
- [ ] Nhận được checkoutUrl và qrCode hợp lệ

## 📚 Resources

- PayOS Docs: https://payos.vn/docs
- PayOS .NET SDK: https://github.com/payOSvn/payos-lib-dotnet
- PayOS Dashboard: https://my.payos.vn
- Test Payment Cards: https://payos.vn/docs/testing

---

**Lưu ý**: Credentials trong code hiện tại có thể là **test credentials** hoặc **đã hết hạn**. Bạn cần lấy credentials mới từ tài khoản PayOS thật của mình.

