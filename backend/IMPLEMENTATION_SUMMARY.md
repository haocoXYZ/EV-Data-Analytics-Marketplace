# EV Data Analytics Marketplace - Core Flow Implementation

## ✅ HOÀN THÀNH - Build thành công (0 Errors, 0 Warnings)

## Tổng quan Core Flow đã implement

### B1: Admin cung cấp bảng giá ✅
**Controller**: `PricingTiersController`
- `GET /api/pricingtiers` - Public xem bảng giá
- `POST /api/pricingtiers` - Admin tạo pricing tier
- `PUT /api/pricingtiers/{id}` - Admin cập nhật
- `DELETE /api/pricingtiers/{id}` - Admin deactivate

### B2: Data Provider cung cấp thông tin ✅
**Controller**: `DatasetsController`
- `POST /api/datasets` - Provider upload dataset
- `GET /api/datasets/my` - Provider xem datasets của mình
- `PUT /api/datasets/{id}` - Provider edit dataset (chỉ khi chưa approved)
- `DELETE /api/datasets/{id}` - Provider xóa dataset

### B3: Moderator kiểm duyệt ✅
**Controller**: `ModerationController`
- `GET /api/moderation/pending` - Xem datasets chờ kiểm duyệt
- `POST /api/moderation/review` - Approve/Reject dataset
- `GET /api/moderation/history/{datasetId}` - Lịch sử kiểm duyệt

### B4: Data Consumer tìm kiếm ✅
**Controller**: `DatasetsController`
- `GET /api/datasets` - Browse datasets (chỉ approved)
- `GET /api/datasets/{id}` - Xem chi tiết dataset
- Query params: `?category=...&search=...`

### B5: Data Consumer mua theo gói ✅
**Controller**: `PurchasesController`

#### Gói OneTime
- `POST /api/purchases/onetime` - Mua 1 lần theo time range
- `GET /api/purchases/my/onetime` - Xem purchases của mình

#### Gói Subscription
- `POST /api/purchases/subscription` - Thuê bao theo province
- `GET /api/purchases/my/subscriptions` - Xem subscriptions

#### Gói API
- `POST /api/purchases/api` - Mua API calls
- `GET /api/purchases/my/api` - Xem API packages

### B6: Thanh toán (PayOS) ✅
**Controller**: `PaymentsController`
- `POST /api/payments/create` - Tạo payment & checkout URL
- `POST /api/payments/webhook` - PayOS callback
- `POST /api/payments/{id}/complete` - Complete payment (test)
- `GET /api/payments/my` - Xem payments của mình
- **Auto calculate revenue share** khi payment complete

### B7: Admin quản lý revenue & payout ✅
**Controller**: `PayoutsController`
- `GET /api/payouts/revenue-summary` - Tổng quan revenue
- `POST /api/payouts/generate` - Generate payouts cho tháng
- `GET /api/payouts` - Xem tất cả payouts
- `PUT /api/payouts/{id}/complete` - Đánh dấu đã trả
- `GET /api/payouts/provider/{providerId}` - Provider xem payouts

## Authentication ✅
**Controller**: `AuthController`
- `POST /api/auth/register` - Đăng ký (Provider/Consumer)
- `POST /api/auth/login` - Đăng nhập
- JWT token với roles

## Cấu trúc Files đã tạo

```
EVDataMarketplace.API/
├── Controllers/
│   ├── AuthController.cs ✅
│   ├── PricingTiersController.cs ✅
│   ├── DatasetsController.cs ✅
│   ├── ModerationController.cs ✅
│   ├── PurchasesController.cs ✅
│   ├── PaymentsController.cs ✅
│   ├── PayoutsController.cs ✅
│   └── HealthController.cs ✅
├── Services/
│   ├── AuthService.cs ✅ (JWT + BCrypt)
│   └── PayOSService.cs ✅ (Placeholder)
├── Models/ (11 models) ✅
├── Data/
│   └── EVDataMarketplaceDbContext.cs ✅
├── DTOs/
│   └── CommonDTOs.cs ✅
├── Repositories/
│   ├── IRepository.cs ✅
│   └── Repository.cs ✅
├── Program.cs ✅ (Configured)
└── README.md ✅
```

## API Endpoints Summary

### Public Endpoints
- `GET /health` - Health check
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/pricingtiers` - View pricing tiers
- `GET /api/datasets` - Browse approved datasets
- `GET /api/datasets/{id}` - View dataset detail

### DataProvider Endpoints
- `POST /api/datasets` - Upload dataset
- `GET /api/datasets/my` - My datasets
- `PUT /api/datasets/{id}` - Update dataset
- `DELETE /api/datasets/{id}` - Delete dataset
- `GET /api/payouts/provider/{id}` - View my payouts

### DataConsumer Endpoints
- `POST /api/purchases/onetime` - Buy onetime package
- `POST /api/purchases/subscription` - Buy subscription
- `POST /api/purchases/api` - Buy API package
- `GET /api/purchases/my/*` - View my purchases
- `POST /api/payments/create` - Create payment
- `POST /api/payments/{id}/complete` - Complete payment
- `GET /api/payments/my` - View my payments

### Admin/Moderator Endpoints
- `POST /api/pricingtiers` - Create pricing tier
- `PUT /api/pricingtiers/{id}` - Update pricing tier
- `DELETE /api/pricingtiers/{id}` - Delete pricing tier
- `GET /api/moderation/pending` - Pending datasets
- `POST /api/moderation/review` - Review dataset
- `GET /api/payouts/revenue-summary` - Revenue summary
- `POST /api/payouts/generate` - Generate payouts
- `PUT /api/payouts/{id}/complete` - Complete payout

## Revenue Sharing Flow

1. Consumer thanh toán → Payment.Status = "Completed"
2. **Auto trigger** `CreateRevenueShare()`:
   - Lấy dataset & pricing tier
   - Tính:
     - Provider share = Amount × ProviderCommissionPercent
     - Admin share = Amount × AdminCommissionPercent
   - Tạo RevenueShare record (PayoutStatus = "Pending")
3. Cuối tháng: Admin gọi `POST /api/payouts/generate`
   - Tổng hợp tất cả RevenueShare pending trong tháng
   - Group by Provider
   - Tạo Payout records
4. Admin trả tiền → `PUT /api/payouts/{id}/complete`
   - Update Payout.PayoutStatus = "Completed"
   - Update tất cả RevenueShare.PayoutStatus = "Paid"

## Cách chạy

### 1. Update Connection String
File: `appsettings.Development.json`
```json
"Server=YOUR_SERVER;Database=EVDataMarketplace;..."
```

### 2. Tạo Database
```bash
cd backend/EVDataMarketplace.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 3. Run
```bash
dotnet run
```

### 4. Test với Swagger
Mở: `https://localhost:7xxx/swagger`

## Test Flow

### Bước 1: Register users
```
POST /api/auth/register
{
  "fullName": "Admin User",
  "email": "admin@test.com",
  "password": "Admin123",
  "role": "Admin"
}
```

### Bước 2: Login
```
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "Admin123"
}
```
Copy JWT token → Click "Authorize" button trong Swagger → Paste token

### Bước 3: Admin tạo pricing tier
```
POST /api/pricingtiers
{
  "tierName": "Standard",
  "basePricePerMb": 0.5,
  "apiPricePerCall": 0.1,
  "subscriptionPricePerRegion": 1000,
  "providerCommissionPercent": 70,
  "adminCommissionPercent": 30
}
```

### Bước 4: Provider upload dataset
(Register provider account → Login → Upload)

### Bước 5: Moderator approve dataset
```
POST /api/moderation/review
{
  "datasetId": 1,
  "moderationStatus": "Approved"
}
```

### Bước 6: Consumer mua dataset
```
POST /api/purchases/onetime
{
  "datasetId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "licenseType": "Research"
}
```

### Bước 7: Complete payment
```
POST /api/payments/create
{
  "paymentType": "OneTimePurchase",
  "referenceId": 1
}

POST /api/payments/{id}/complete
```

### Bước 8: Admin generate payout
```
POST /api/payouts/generate?monthYear=2025-01
```

## Notes

- **PayOS**: ✅ IMPLEMENTED - Real PayOS integration with HMAC-SHA256 signature verification
- **File Upload**: ✅ IMPLEMENTED - CSV parsing and database storage (see CSV_STORAGE_EXPLAINED.md)
- **CSV Database Storage**: ✅ IMPLEMENTED - Each CSV row stored as JSON in DatasetRecords table
- **Webhook Processing**: ✅ IMPLEMENTED - Automatic payment status updates and revenue share creation
- **API Access**: Chưa implement API endpoint để consumer gọi data
- **Download**: ✅ IMPLEMENTED - Download CSV file with purchase verification

## Simple & Core Flow Focused ✅
- Không overengineering
- JWT đơn giản với BCrypt
- Repository pattern cơ bản
- Auto revenue calculation
- Đầy đủ 7 bước core flow

---

# 🚀 NEW FEATURES IMPLEMENTED

## 1. CSV Database Storage ✅

### Architecture
CSV files are now stored in **two locations**:
- **File System**: Original CSV file → `wwwroot/uploads/datasets/`
- **Database**: Each CSV row → `DatasetRecords` table (JSON format)

### Implementation Files
- `Models/DatasetRecord.cs` - Entity model for storing CSV rows
- `Services/CsvParserService.cs` - CSV parsing with CsvHelper library
- `Controllers/DatasetsController.cs` - Updated upload endpoint (lines 153-309)
- `Data/EVDataMarketplaceDbContext.cs` - DbContext with DatasetRecords table

### How It Works
1. Provider uploads CSV via `POST /api/datasets` (multipart/form-data)
2. `CsvParserService` reads CSV and converts to `List<Dictionary<string, object>>`
3. Each row is serialized to JSON and stored in `DatasetRecords.RecordData`
4. Row numbers are preserved for ordering
5. Flexible schema - supports any CSV structure

### Example Storage

**CSV File**:
```csv
station_id,location,power_kw,status
1,Hanoi,50,Active
2,Saigon,100,Active
```

**Database Storage**:
```
RecordId: 1, DatasetId: 5, RowNumber: 1
RecordData: {"station_id":"1","location":"Hanoi","power_kw":"50","status":"Active"}

RecordId: 2, DatasetId: 5, RowNumber: 2
RecordData: {"station_id":"2","location":"Saigon","power_kw":"100","status":"Active"}
```

### Database Migration Required

```bash
cd backend/EVDataMarketplace.API
dotnet ef migrations add AddDatasetRecordsTable
dotnet ef database update
```

**Note**: Stop the running API before creating migrations to avoid file lock errors.

---

## 2. PayOS Payment Integration ✅

### Real API Configuration

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

### Payment Flow

1. Consumer creates payment → `POST /api/payments/create`
2. PayOSService generates HMAC-SHA256 signature
3. API calls PayOS API → `https://api-merchant.payos.vn/v2/payment-requests`
4. Consumer redirected to PayOS checkout page
5. Consumer completes payment on PayOS
6. PayOS sends webhook → `POST /api/payments/webhook`
7. API verifies signature and updates payment status
8. Revenue share auto-created based on pricing tier

### Implementation Files

- `Services/PayOSService.cs` - Full PayOS API integration with signature generation
- `Controllers/PaymentsController.cs` - Webhook handler (lines 119-226)
- `Program.cs` - HttpClientFactory registration

### Signature Verification

**HMAC-SHA256 Algorithm**:
```csharp
using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(checksumKey));
var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
var signature = BitConverter.ToString(hash).Replace("-", "").ToLower();
```

### Webhook Processing

**Endpoint**: `POST /api/payments/webhook` (called by PayOS)

**Headers**:
- `x-signature`: HMAC-SHA256 signature of request body

**Request Body**:
```json
{
  "data": {
    "orderCode": "1234567890",
    "amount": 500000,
    "status": "PAID",
    "transactionDateTime": "2024-01-15T10:30:00"
  }
}
```

**Processing Steps**:
1. Verify signature matches HMAC-SHA256(data, checksumKey)
2. Find payment by orderCode in TransactionRef field
3. Update payment status:
   - `PAID` → `Completed`
   - `CANCELLED` → `Failed`
4. Auto-create RevenueShare:
   - Provider share = amount × (providerCommissionPercent / 100)
   - Admin share = amount × (adminCommissionPercent / 100)
5. Link revenue share to payment and provider

### Testing PayOS

#### 1. Create Payment
```bash
POST /api/payments/create
Authorization: Bearer {consumer_token}
Content-Type: application/json

{
  "paymentType": "OneTimePurchase",
  "referenceId": 15
}
```

**Response**:
```json
{
  "paymentId": 42,
  "payosOrderId": "a1b2c3d4",
  "checkoutUrl": "https://pay.payos.vn/checkout/123456789",
  "amount": 500000,
  "status": "Pending"
}
```

#### 2. Test Webhook Locally

Use ngrok to expose local API:
```bash
ngrok http 5000
```

Configure PayOS webhook URL in dashboard:
```
https://[ngrok-url]/api/payments/webhook
```

#### 3. Verify Revenue Share

```sql
SELECT * FROM Payments WHERE PaymentId = 42;
SELECT * FROM RevenueShares WHERE PaymentId = 42;
```

---

## 3. Dependencies Added

### NuGet Packages

```xml
<PackageReference Include="CsvHelper" Version="33.1.0" />
```

### Services Registered

```csharp
builder.Services.AddHttpClient();
builder.Services.AddScoped<IPayOSService, PayOSService>();
builder.Services.AddScoped<ICsvParserService, CsvParserService>();
builder.Services.AddScoped<IFileService, FileService>();
```

---

## 4. Updated API Endpoints

### CSV Upload with Database Storage

**POST /api/datasets**

```http
POST /api/datasets
Authorization: Bearer {provider_token}
Content-Type: multipart/form-data

{
  "name": "EV Charging Stations 2024",
  "description": "List of charging stations",
  "category": "Infrastructure",
  "dataFormat": "CSV",
  "tierId": 1,
  "file": [CSV file]
}
```

**Response**:
```json
{
  "datasetId": 123,
  "providerId": 5,
  "name": "EV Charging Stations 2024",
  "description": "List of charging stations",
  "category": "Infrastructure",
  "dataFormat": "CSV",
  "dataSizeMb": 2.5,
  "uploadDate": "2024-01-15T10:30:00",
  "status": "Pending",
  "moderationStatus": "Pending"
}
```

**What happens**:
1. CSV file saved to disk
2. CSV parsed into rows
3. Each row stored in DatasetRecords table as JSON
4. Dataset metadata saved to Datasets table
5. Returns dataset info

### Download Dataset

**GET /api/datasets/{id}/download**

```http
GET /api/datasets/5/download
Authorization: Bearer {consumer_token}
```

**Response**: Binary file stream (CSV file)

**Requirements**:
- Consumer must have completed purchase
- Download count must be less than maxDownload
- Purchase status must be "Completed"

---

## 5. Error Handling

### CSV Upload Errors

- **Invalid CSV format**: Returns 400 with detailed error message
- **Missing headers**: Throws `InvalidDataException`
- **File too large**: Configure max file size in `Program.cs`
- **Unsupported format**: Only `.csv` files are parsed

### Payment Webhook Errors

- **Invalid signature**: Returns 400 "Invalid webhook signature"
- **Missing signature**: Returns 400 "Signature required"
- **Payment not found**: Returns 404 "Payment not found"
- **Invalid webhook data**: Returns 400 "Invalid webhook data format"

---

## 6. Next Steps

1. ✅ **Apply database migration**:
   ```bash
   dotnet ef migrations add AddDatasetRecordsTable
   dotnet ef database update
   ```

2. ✅ **Configure PayOS webhook** in PayOS dashboard:
   - Webhook URL: `https://[your-domain]/api/payments/webhook`
   - For local testing: Use ngrok to expose localhost

3. 📋 **Test CSV upload**:
   - Upload sample EV charging station CSV
   - Verify records in DatasetRecords table
   - Check file saved to uploads folder

4. 📋 **Test PayOS payment**:
   - Create payment link
   - Complete payment on PayOS
   - Verify webhook processing
   - Check revenue share creation

5. 📋 **Monitor logs**:
   - Watch for CSV parsing logs
   - Verify webhook signature verification
   - Check revenue share creation logs

---

## 7. Documentation Files

- `IMPLEMENTATION_SUMMARY.md` - This file (overview)
- `CSV_STORAGE_EXPLAINED.md` - Detailed CSV storage architecture
- `API_TESTING_GUIDE.md` - API testing examples
- `CORE_FLOW_CHECKLIST.md` - Core flow checklist
- `SEED_AND_UPLOAD.md` - Database seeding guide
- `README_DATABASE.md` - Database schema documentation
