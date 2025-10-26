# 🎯 Hướng dẫn cấu hình Webhook URL cho PayOS

## 📌 Webhook URL là gì?

Webhook URL là endpoint mà PayOS sẽ gọi về server của bạn khi:
- ✅ Thanh toán thành công
- ❌ Thanh toán thất bại
- 🔄 Cập nhật trạng thái thanh toán

## 🔧 Endpoint Webhook đã implement

```
POST /api/payments/webhook
```

Code trong `PaymentsController.cs`:
```csharp
[HttpPost("webhook")]
[AllowAnonymous]
public async Task<IActionResult> PaymentWebhook([FromBody] WebhookRequestDto webhookData)
{
    // Xác thực webhook từ PayOS
    // Cập nhật trạng thái thanh toán
    // Kích hoạt purchase/subscription
}
```

## 🌐 Cách expose localhost ra internet

### **Option 1: Dùng ngrok (Recommend)**

#### Bước 1: Cài đặt ngrok
```bash
# Download từ: https://ngrok.com/download
# Hoặc dùng winget (Windows 10+)
winget install ngrok
```

#### Bước 2: Chạy API server
```bash
cd backend/EVDataMarketplace.API
dotnet run
# API chạy trên: http://localhost:5258
```

#### Bước 3: Expose port 5258
```bash
ngrok http 5258
```

Bạn sẽ nhận được URL công khai, ví dụ:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5258
```

#### Bước 4: Cập nhật Webhook URL trong PayOS Dashboard

Vào: https://my.payos.vn/store/settings

**Webhook URL:** 
```
https://abc123.ngrok-free.app/api/payments/webhook
```

---

### **Option 2: Dùng localtunnel**

#### Bước 1: Cài đặt localtunnel
```bash
npm install -g localtunnel
```

#### Bước 2: Expose port 5258
```bash
lt --port 5258 --subdomain evmarketplace
```

Bạn sẽ nhận được:
```
your url is: https://evmarketplace.loca.lt
```

#### Bước 3: Cập nhật Webhook URL
```
https://evmarketplace.loca.lt/api/payments/webhook
```

---

### **Option 3: Deploy lên server (Production)**

Khi deploy lên Azure/AWS/VPS:
```
https://yourdomain.com/api/payments/webhook
```

## 📝 Cách test Webhook

### Test với ngrok:

1. Chạy API + ngrok như hướng dẫn trên
2. Cập nhật Webhook URL trong PayOS Dashboard
3. Tạo payment thử:
   ```bash
   POST http://localhost:5258/api/payments/create
   ```
4. Thanh toán test bằng QR code
5. PayOS sẽ gọi webhook về ngrok URL
6. Kiểm tra log của API để thấy webhook được xử lý

### Test log bạn sẽ thấy:

```
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      Received PayOS webhook for Payment ID: 6
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      Webhook verified successfully
info: EVDataMarketplace.API.Controllers.PaymentsController[0]
      Payment status updated: Success
```

## 🎯 Tóm tắt các bước

1. ✅ **Chạy API:** `dotnet run` (port 5258)
2. ✅ **Chạy ngrok:** `ngrok http 5258`
3. ✅ **Copy URL:** `https://abc123.ngrok-free.app`
4. ✅ **Cập nhật PayOS Dashboard:** 
   - Webhook URL: `https://abc123.ngrok-free.app/api/payments/webhook`
5. ✅ **Test payment flow**

## ⚠️ Lưu ý quan trọng

- **Ngrok free:** URL thay đổi mỗi lần khởi động lại → phải cập nhật lại PayOS Dashboard
- **Ngrok paid:** Có thể fix subdomain (ví dụ: `evmarketplace.ngrok.io`)
- **Production:** Deploy lên server thật và dùng domain name

## 🔐 Bảo mật Webhook

Code đã implement verification:
```csharp
var isValid = await _payOSService.VerifyPaymentWebhookAsync(webhookData);
if (!isValid)
{
    return Unauthorized(new { message = "Invalid webhook signature" });
}
```

PayOS SDK tự động verify signature bằng ChecksumKey → an toàn!

