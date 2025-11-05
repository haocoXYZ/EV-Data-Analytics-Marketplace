# PayOS Payment Integration - Fix & Debug Guide

## 🐛 Vấn Đề Gặp Phải

Khi thanh toán qua PayOS, frontend nhận lỗi **404 Not Found** từ backend.

## 🔍 Nguyên Nhân

### 1. **Mismatch PaymentType** (Vấn đề chính)
Frontend gửi sai giá trị `paymentType` không khớp với backend:

| Nơi | Frontend (Sai) | Backend (Đúng) |
|-----|----------------|----------------|
| `Checkout.tsx` | `'OneTimePurchase'` | `'DataPackage'` |
| `Checkout.tsx` | `'Subscription'` | `'SubscriptionPackage'` |
| ✅ Both | `'APIPackage'` | `'APIPackage'` |

### 2. **Sai tên method API**
- `APIPackagePurchase.tsx` và `SubscriptionPurchase.tsx` gọi `paymentsApi.createPayment()`
- Nhưng API thực tế là `paymentsApi.create()`

## ✅ Giải Pháp Đã Áp Dụng

### Fix 1: `frontend/src/pages/Checkout.tsx`
```typescript
// ❌ TRƯỚC (Sai)
const paymentType = purchaseType === 'onetime' ? 'OneTimePurchase' : 
                    purchaseType === 'api' ? 'APIPackage' : 
                    'Subscription'

// ✅ SAU (Đúng)
const paymentType = purchaseType === 'onetime' ? 'DataPackage' : 
                    purchaseType === 'api' ? 'APIPackage' : 
                    'SubscriptionPackage'
```

### Fix 2: `frontend/src/pages/APIPackagePurchase.tsx`
```typescript
// ❌ TRƯỚC
const paymentResponse = await paymentsApi.createPayment({...})

// ✅ SAU
const paymentResponse = await paymentsApi.create({...})
```

### Fix 3: `frontend/src/pages/SubscriptionPurchase.tsx`
```typescript
// ❌ TRƯỚC
const paymentResponse = await paymentsApi.createPayment({...})

// ✅ SAU
const paymentResponse = await paymentsApi.create({...})
```

## 📋 Backend Validation Logic

Backend `PaymentsController.cs` chỉ chấp nhận 3 giá trị:

```csharp
switch (request.PaymentType)
{
    case "DataPackage":      // ✅ One-time data package
    case "SubscriptionPackage": // ✅ Subscription
    case "APIPackage":       // ✅ API access package
    default:
        return BadRequest(new { message = "Invalid payment type..." });
}
```

## 🔧 PayOS Configuration

### Backend: `appsettings.json`
```json
{
  "PayOS": {
    "ClientId": "98a8f6fa-70a5-4f8e-aa10-b03b4041a70a",
    "ApiKey": "7f4c63e7-c2f4-4391-8b86-58de5f986e7e",
    "ChecksumKey": "9c2a819053d28f2febeab363cb6bd88113342833ad63001852907ac4b33b5919",
    "ReturnUrl": "http://localhost:5258/api/payments/callback",
    "CancelUrl": "http://localhost:5258/api/payments/callback"
  }
}
```

⚠️ **Lưu ý**: Đây là API keys của team, không phải của bạn cá nhân.

### PayOS SDK Version
- Package: `payOS` v1.0.9 (đã cài trong `.csproj`)
- Namespace: `Net.payOS` và `Net.payOS.Types`

## 🧪 Cách Test

### 1. Start Backend
```bash
cd backend\EVDataMarketplace.API
dotnet run
```

Backend chạy tại: `https://localhost:5258`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

### 3. Test Payment Flow

#### A. Data Package (One-time)
1. Login as **Consumer** (email: `consumer1@example.com`, password: `Consumer123!`)
2. Navigate: **Catalog** → **Data Package**
3. Chọn Province, District, Date range → **Preview**
4. Click **Purchase** → Chuyển đến trang Checkout
5. Click **"Thanh toán qua PayOS"**
6. Kiểm tra:
   - ✅ Không bị lỗi 404
   - ✅ Redirect đến PayOS checkout page
   - ✅ Có QR code hoặc link thanh toán

#### B. API Package
1. Navigate: **Catalog** → **API Package**
2. Chọn scope (Nationwide/Province/District)
3. Chọn số API calls
4. Click **"Mua ngay"**
5. Verify redirect to PayOS

#### C. Subscription Package
1. Navigate: **Catalog** → **Subscription**
2. Chọn Province, District (optional)
3. Chọn Billing Cycle (Monthly/Quarterly/Yearly)
4. Click **"Đăng ký ngay"**
5. Verify redirect to PayOS

### 4. Check Backend Logs

Nếu vẫn gặp lỗi, kiểm tra console backend:

```bash
# Backend sẽ log:
[PayOSService] Creating PayOS payment link using SDK for Payment ID: XX, Amount: XXX
[PayOSService] Calling PayOS SDK createPaymentLink for OrderCode: XXXXX
[PayOSService] PayOS SDK returned CheckoutUrl: https://pay.payos.vn/...
```

### 5. Network Debug (Browser DevTools)

**F12 → Network tab:**

```http
POST http://localhost:5258/api/payments/create
Content-Type: application/json

{
  "paymentType": "DataPackage",       // ✅ Phải đúng 1 trong 3 giá trị
  "referenceId": 123
}
```

**Response mong đợi:**
```json
{
  "paymentId": 45,
  "checkoutUrl": "https://pay.payos.vn/checkout/1730712345",
  "amount": 50000,
  "status": "Pending"
}
```

## 🔐 Payment Flow

```
1. [Frontend] User clicks "Thanh toán qua PayOS"
   ↓
2. [Frontend] POST /api/payments/create
   {
     paymentType: "DataPackage" | "SubscriptionPackage" | "APIPackage",
     referenceId: <purchaseId>
   }
   ↓
3. [Backend] PaymentsController validates paymentType
   ↓
4. [Backend] PayOSService.CreatePaymentLinkAsync()
   ↓
5. [PayOS SDK] _payOS.createPaymentLink(paymentData)
   ↓
6. [PayOS API] Returns { checkoutUrl, qrCode, orderCode }
   ↓
7. [Backend] Save orderCode to Payment.TransactionRef
   ↓
8. [Frontend] Redirect: window.location.href = checkoutUrl
   ↓
9. [User] Pay on PayOS page
   ↓
10. [PayOS] Webhook POST /api/payments/webhook (background)
   ↓
11. [PayOS] Redirect GET /api/payments/callback (browser)
   ↓
12. [Backend] Update Payment.Status = "Completed"
   ↓
13. [Backend] Update Purchase.Status = "Active"
   ↓
14. [Backend] Create RevenueShare records
   ↓
15. [Frontend] Redirect to /payment-success
```

## 🚨 Common Errors & Solutions

### Error 1: 404 Not Found
**Nguyên nhân**: Sai `paymentType`  
**Fix**: Sử dụng `"DataPackage"`, `"SubscriptionPackage"`, `"APIPackage"` (case-sensitive)

### Error 2: "paymentsApi.createPayment is not a function"
**Nguyên nhân**: Sai tên method  
**Fix**: Dùng `paymentsApi.create()` thay vì `.createPayment()`

### Error 3: Backend trả về mock URL
**Nguyên nhân**: PayOS SDK throw exception (API keys sai hoặc network issue)  
**Hành vi**: Backend fallback về mock URL: `https://pay.payos.vn/checkout/{orderCode}`  
**Fix**: Kiểm tra API keys trong `appsettings.json`

### Error 4: CORS Error
**Nguyên nhân**: Frontend chạy không đúng port  
**Fix**: Frontend phải chạy tại `http://localhost:5173` (hoặc thêm origin vào `appsettings.json`)

## 📁 Files Changed

1. ✅ `frontend/src/pages/Checkout.tsx` (line 50-52)
2. ✅ `frontend/src/pages/APIPackagePurchase.tsx` (line 101)
3. ✅ `frontend/src/pages/SubscriptionPurchase.tsx` (line 97)

## 📌 Checklist

- [x] Fix `paymentType` values trong Checkout.tsx
- [x] Fix method name từ `createPayment` → `create`
- [x] Verify PayOS package installed (v1.0.9)
- [x] Verify PayOS config trong appsettings.json
- [x] Verify IPayOSService registered trong Program.cs
- [ ] Test Data Package payment
- [ ] Test API Package payment
- [ ] Test Subscription Package payment
- [ ] Test payment callback success
- [ ] Test payment callback cancel
- [ ] Verify revenue share creation

## 🎯 Next Steps

1. **Rebuild frontend** để áp dụng thay đổi:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test lại toàn bộ flow** theo hướng dẫn phía trên

3. **Monitor backend logs** để đảm bảo PayOS SDK hoạt động

4. **Nếu vẫn lỗi**, kiểm tra:
   - Backend có đang chạy không? (`dotnet run`)
   - API keys PayOS có đúng không?
   - Network có kết nối được PayOS API không?

## 📞 Support

Nếu gặp vấn đề:
1. Check backend console logs
2. Check browser DevTools → Network tab
3. Check PayOS dashboard: https://my.payos.vn/
4. Verify payment record trong database: `SELECT * FROM Payments ORDER BY PaymentId DESC`

---

**Tóm tắt**: Lỗi 404 do frontend gửi sai `paymentType` và sai tên method API. Đã fix cả 3 vấn đề.

