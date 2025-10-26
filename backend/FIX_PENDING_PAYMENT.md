# Cách Khắc Phục Payment Pending

## Vấn đề
Bạn đã thanh toán thành công trên PayOS nhưng trong database status vẫn là "Pending".

## Nguyên nhân
- **Webhook không hoạt động** trong development (localhost) vì PayOS không thể gọi về localhost
- Webhook chỉ hoạt động khi backend có public URL (production hoặc ngrok)

## Giải pháp: Manual Check Status

### Cách 1: Dùng Swagger UI (Đơn giản nhất)

1. **Mở Swagger**: http://localhost:5258/swagger

2. **Tìm endpoint**: `GET /api/Payments/{id}/check-status`

3. **Authorize** với Bearer token của bạn (token từ login)

4. **Execute** với Payment ID = 7 (từ screenshot của bạn)

5. **Kết quả**: Payment sẽ tự động được cập nhật thành "Completed" nếu PayOS confirm đã thanh toán

### Cách 2: Dùng cURL

```bash
curl -X GET "http://localhost:5258/api/Payments/7/check-status" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Cách 3: Dùng Postman/Thunder Client

```
GET http://localhost:5258/api/Payments/7/check-status
Authorization: Bearer {your-token}
```

## Expected Response

Nếu thanh toán thành công, bạn sẽ nhận được:

```json
{
  "message": "Payment status updated successfully",
  "paymentId": 7,
  "oldStatus": "Pending",
  "newStatus": "Completed",
  "paymentDate": "2025-10-26T22:48:19"
}
```

## Sau khi Update

Payment sẽ được tự động:
- ✅ Status đổi thành "Completed"
- ✅ Purchase/Subscription status được cập nhật
- ✅ Revenue Share record được tạo (chia sẻ doanh thu Provider/Admin)

## Verify Results

Gọi lại `GET /api/Payments/my` để kiểm tra:

```json
{
  "paymentId": 7,
  "amount": 10000,
  "paymentDate": "2025-10-26T22:48:19",
  "paymentMethod": "PayOS",
  "paymentType": "OneTimePurchase",
  "referenceId": 1,
  "status": "Completed",  // ✅ Đã đổi từ Pending
  "transactionRef": "1761493699"
}
```

## Tại sao cần Manual Check?

**Development (localhost)**:
- ❌ Webhook KHÔNG hoạt động (PayOS không gọi được về localhost)
- ✅ Callback endpoint hoạt động (user redirect về)
- ✅ Manual check hoạt động (gọi API để kiểm tra)

**Production (public domain)**:
- ✅ Webhook hoạt động (PayOS tự động gọi về)
- ✅ Callback endpoint hoạt động
- ✅ Manual check vẫn hữu ích (backup)

## Production Setup

Khi deploy lên production:

1. Cấu hình webhook URL trên PayOS Dashboard:
   ```
   https://yourdomain.com/api/payments/webhook
   ```

2. Webhook sẽ tự động cập nhật payment status

3. Không cần manual check nữa (nhưng vẫn giữ để backup)

## Troubleshooting

### Nếu vẫn Pending sau khi check-status

1. **Kiểm tra TransactionRef**:
   ```sql
   SELECT * FROM Payment WHERE PaymentId = 7;
   ```
   TransactionRef phải khớp với OrderCode trên PayOS (1761493699)

2. **Kiểm tra PayOS status**:
   - Đăng nhập PayOS Dashboard
   - Tìm transaction với OrderCode
   - Confirm status là "PAID"

3. **Kiểm tra logs**:
   - Xem backend logs
   - Tìm errors khi gọi PayOS API

### Error: "Payment has no transaction reference"

- Payment chưa có OrderCode
- Tạo lại payment mới

### Error: "Consumer profile not found"

- Token không hợp lệ
- Login lại để lấy token mới

---

**Quick Fix cho Payment ID 7 của bạn:**

```bash
# Swagger UI
http://localhost:5258/swagger

# Hoặc cURL với token hiện tại
curl -X GET "http://localhost:5258/api/Payments/7/check-status" \
  -H "Authorization: Bearer eyJhbGc...{your-full-token}"
```

Chỉ cần gọi 1 lần là xong! 🎉

