# 🎯 PayOS QR Code Integration - Hướng dẫn sử dụng

## ✅ ĐÃ CẬP NHẬT: API giờ trả về cả Checkout URL VÀ QR Code!

## 📋 Thay đổi mới:

### 1. PaymentResponseDto (DTO)
```csharp
public class PaymentResponseDto
{
    public int PaymentId { get; set; }
    public string? PayosOrderId { get; set; }
    public string? CheckoutUrl { get; set; }      // ← URL thanh toán web
    public string? QrCode { get; set; }            // ← MÃ QR CODE (Base64)
    public decimal? Amount { get; set; }
    public string? Status { get; set; }
}
```

### 2. PayOSPaymentResult (Service)
```csharp
public class PayOSPaymentResult
{
    public string CheckoutUrl { get; set; }        // Link thanh toán
    public string QrCode { get; set; }             // QR code base64
    public long OrderCode { get; set; }            // Mã đơn hàng
}
```

## 🧪 Test với Swagger

### Endpoint: POST /api/payments/create

**Request:**
```json
{
  "paymentType": "OneTimePurchase",
  "referenceId": 15
}
```

**Response MỚI (có QR code):**
```json
{
  "paymentId": 42,
  "payosOrderId": "a1b2c3d4e5f6",
  "checkoutUrl": "https://pay.payos.vn/web/1730012345",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "amount": 500000,
  "status": "Pending"
}
```

## 🎨 Cách hiển thị QR Code trong Frontend

### React/Vue/Angular:

```jsx
// Component PaymentQRCode.jsx
function PaymentQRCode({ paymentResponse }) {
  if (!paymentResponse.qrCode) {
    return <p>Không có mã QR, vui lòng dùng link thanh toán</p>;
  }

  return (
    <div className="payment-qr">
      <h3>Quét mã QR để thanh toán</h3>
      
      {/* Hiển thị QR Code */}
      <img 
        src={paymentResponse.qrCode} 
        alt="PayOS QR Code" 
        className="qr-image"
        style={{ width: '300px', height: '300px' }}
      />
      
      <p>Hoặc</p>
      
      {/* Link thanh toán web */}
      <a 
        href={paymentResponse.checkoutUrl} 
        target="_blank"
        className="btn btn-primary"
      >
        Thanh toán trên web
      </a>
      
      <div className="payment-info">
        <p>Số tiền: {paymentResponse.amount.toLocaleString('vi-VN')} VNĐ</p>
        <p>Mã thanh toán: {paymentResponse.paymentId}</p>
      </div>
    </div>
  );
}
```

### HTML + JavaScript thuần:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Thanh toán PayOS</title>
    <style>
        .payment-container {
            max-width: 500px;
            margin: 50px auto;
            text-align: center;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
        }
        .qr-code {
            width: 300px;
            height: 300px;
            margin: 20px auto;
        }
        .btn-payment {
            background-color: #4CAF50;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="payment-container" id="paymentContainer">
        <!-- Nội dung sẽ được điền bằng JS -->
    </div>

    <script>
        async function createPayment() {
            try {
                // Gọi API tạo payment
                const response = await fetch('http://localhost:5258/api/payments/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_JWT_TOKEN'
                    },
                    body: JSON.stringify({
                        paymentType: 'OneTimePurchase',
                        referenceId: 15
                    })
                });

                const payment = await response.json();

                // Hiển thị QR code và link thanh toán
                const container = document.getElementById('paymentContainer');
                
                let html = '<h2>Thanh toán đơn hàng</h2>';
                
                if (payment.qrCode) {
                    html += `
                        <h3>Quét mã QR để thanh toán</h3>
                        <img src="${payment.qrCode}" class="qr-code" alt="QR Code">
                        <p>Hoặc</p>
                    `;
                }
                
                html += `
                    <a href="${payment.checkoutUrl}" target="_blank" class="btn-payment">
                        Thanh toán trên web
                    </a>
                    <div style="margin-top: 20px;">
                        <p><strong>Số tiền:</strong> ${payment.amount.toLocaleString('vi-VN')} VNĐ</p>
                        <p><strong>Mã thanh toán:</strong> ${payment.paymentId}</p>
                        <p><strong>Trạng thái:</strong> ${payment.status}</p>
                    </div>
                `;
                
                container.innerHTML = html;
                
            } catch (error) {
                console.error('Lỗi tạo payment:', error);
                alert('Có lỗi xảy ra khi tạo thanh toán');
            }
        }

        // Tự động gọi khi tải trang
        createPayment();
    </script>
</body>
</html>
```

## 📱 QR Code Format

PayOS trả về QR code dạng **Data URI**:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

- **Format**: PNG
- **Encoding**: Base64
- **Kích thước**: ~300x300px
- **Có thể dùng trực tiếp** trong thẻ `<img src="...">`

## 🔍 Debug và kiểm tra

### 1. Kiểm tra response có QR code không:

```javascript
console.log('Has QR Code:', !!payment.qrCode);
console.log('QR Code length:', payment.qrCode?.length || 0);
console.log('QR Code starts with:', payment.qrCode?.substring(0, 50));
```

Expected output:
```
Has QR Code: true
QR Code length: 15234
QR Code starts with: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
```

### 2. Kiểm tra logs trong API:

Xem console của API (dotnet run), sẽ thấy:
```
[10:30:45 INF] Creating PayOS payment link for Payment ID: 42, Amount: 500000
[10:30:46 INF] PayOS Response: {"code":"00","desc":"Success","data":{...}}
[10:30:46 INF] PayOS payment link created: https://pay.payos.vn/..., QR: True
```

## ⚠️ Lưu ý quan trọng

### 1. QR Code chỉ có khi gọi PayOS API THÀNH CÔNG

Nếu PayOS API lỗi (do config sai, network lỗi), response sẽ là:
```json
{
  "checkoutUrl": "https://pay.payos.vn/checkout/1730012345",
  "qrCode": "",  // ← RỖNG
  "orderCode": 1730012345
}
```

### 2. Kiểm tra PayOS config

File: `appsettings.Development.json`
```json
{
  "PayOS": {
    "ClientId": "98a8f6fa-70a5-4f8e-aa10-b03b4041a70a",
    "ApiKey": "7f4c63e7-c2f4-4391-8b86-58de5f986e7e",
    "ChecksumKey": "9c2a819053d28f2febeab363cb6bd88113342833ad63001852907ac4b33b5919",
    "ReturnUrl": "http://localhost:5173/payment/callback",
    "CancelUrl": "http://localhost:5173/payment/cancel"
  }
}
```

**⚠️ LƯU Ý**: Không được hoán đổi `ClientId` và `ApiKey`!

### 3. Test với PayOS Sandbox

- PayOS có môi trường **sandbox** để test
- Tài khoản test: https://payos.vn/docs/testing
- Có thể test thanh toán mà không mất tiền thật

### 4. QR Code timeout

- QR code PayOS có thời gian sống **15 phút**
- Sau 15 phút cần tạo payment link mới
- Frontend nên hiển thị countdown timer

## 🎯 Flow hoàn chỉnh

```
User                    Frontend                Backend                 PayOS
  |                        |                       |                       |
  | Click "Mua ngay"       |                       |                       |
  |----------------------->|                       |                       |
  |                        |                       |                       |
  |                        | POST /api/payments/create                     |
  |                        |--------------------->|                       |
  |                        |                       |                       |
  |                        |                       | POST /v2/payment-requests
  |                        |                       |--------------------->|
  |                        |                       |                       |
  |                        |                       | {checkoutUrl, qrCode} |
  |                        |                       |<---------------------|
  |                        |                       |                       |
  |                        | {paymentId, checkoutUrl, qrCode}              |
  |                        |<---------------------|                       |
  |                        |                       |                       |
  | Hiển thị QR + Link     |                       |                       |
  |<-----------------------|                       |                       |
  |                        |                       |                       |
  | Quét QR / Click link   |                       |                       |
  |-------------------------------------------------------------->|
  |                        |                       |                       |
  | Thanh toán thành công  |                       |                       |
  |<--------------------------------------------------------------|
  |                        |                       |                       |
  |                        |                       | POST /api/payments/webhook
  |                        |                       |<---------------------|
  |                        |                       |                       |
  |                        |                       | Update status         |
  |                        |                       | Create revenue share  |
  |                        |                       |                       |
  | Redirect về ReturnUrl  |                       |                       |
  |-------------------------------------------------------------->|
```

## 📞 Support

- PayOS Docs: https://payos.vn/docs
- PayOS Dashboard: https://my.payos.vn
- Support Email: support@payos.vn

## ✅ Checklist test

- [ ] API trả về `checkoutUrl` hợp lệ
- [ ] API trả về `qrCode` (base64 string)
- [ ] QR code hiển thị được trong `<img>` tag
- [ ] Click vào checkout URL mở trang PayOS
- [ ] Quét QR code mở app ngân hàng
- [ ] Sau khi thanh toán, webhook được gọi
- [ ] Payment status update từ Pending → Completed
- [ ] Revenue share được tạo tự động

---

**API đang chạy:** http://localhost:5258/swagger

**Test ngay!** 🚀


