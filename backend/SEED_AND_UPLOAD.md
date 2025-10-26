# EV Data Analytics Marketplace - SEED DATA & FILE UPLOAD

## ✅ HOÀN THÀNH

### 1. Seed Data đã tạo ✅

**File**: `Data/DbSeeder.cs`

Seed data bao gồm:

#### Provinces (8 tỉnh/thành)
- Hà Nội, TP HCM, Đà Nẵng, Hải Phòng, Cần Thơ, Bình Dương, Đồng Nai, Khánh Hòa

#### Users & Accounts

**Admin**
- Email: `admin@evdatamarket.com`
- Password: `Admin@123`
- Role: Admin

**Moderator**
- Email: `moderator@evdatamarket.com`
- Password: `Moderator@123`
- Role: Moderator

**Data Providers (3)**
1. VinFast Charging
   - Email: `provider1@vinfast.vn`
   - Password: `Provider@123`

2. EVN Charging Network
   - Email: `provider2@evn.vn`
   - Password: `Provider@123`

3. GreenCharge Vietnam
   - Email: `provider3@greencharge.vn`
   - Password: `Provider@123`

**Data Consumers (2)**
1. Toyota Research Vietnam
   - Email: `consumer1@toyota.vn`
   - Password: `Consumer@123`

2. EV Analytics Startup
   - Email: `consumer2@evanalytics.vn`
   - Password: `Consumer@123`

#### Pricing Tiers (3)

**Basic Tier**
- Base Price: 0.3 VND/MB
- API Price: 0.05 VND/call
- Subscription: 500 VND/region
- Commission: Provider 65% | Admin 35%

**Standard Tier**
- Base Price: 0.5 VND/MB
- API Price: 0.1 VND/call
- Subscription: 1000 VND/region
- Commission: Provider 70% | Admin 30%

**Premium Tier**
- Base Price: 1.0 VND/MB
- API Price: 0.2 VND/call
- Subscription: 2000 VND/region
- Commission: Provider 75% | Admin 25%

#### Sample Datasets (4)

1. **Dữ liệu sạc xe điện Hà Nội Q1/2025** (Approved)
   - Provider: VinFast
   - Tier: Standard
   - Size: 150.5 MB
   - Category: Charging Session

2. **Phân tích hiệu suất pin xe điện TP.HCM** (Approved)
   - Provider: EVN
   - Tier: Standard
   - Size: 200.3 MB
   - Category: Battery Performance

3. **Dữ liệu trạm sạc Đà Nẵng 2024** (Approved)
   - Provider: GreenCharge
   - Tier: Basic
   - Size: 50.0 MB
   - Category: Charging Station

4. **Hành vi lái xe điện miền Bắc** (Pending)
   - Provider: VinFast
   - Tier: Standard
   - Size: 120.0 MB
   - Category: Driving Behavior
   - Status: Chờ kiểm duyệt

### 2. File Upload Service ✅

**File**: `Services/FileService.cs`

#### Features:
- ✅ Upload CSV/Excel files (.csv, .xlsx, .xls)
- ✅ Auto generate unique filename (GUID)
- ✅ Create Uploads directory structure
- ✅ File validation (extension, size)
- ✅ Download with permission check
- ✅ Delete file
- ✅ Check file exists

#### Folder Structure:
```
EVDataMarketplace.API/
└── Uploads/
    └── datasets/
        └── {guid}_{original_filename}.csv
```

### 3. Dataset Controller Updates ✅

**New Endpoints**:

#### Upload Dataset với File
```
POST /api/datasets
Content-Type: multipart/form-data

Form Data:
- name: string
- description: string
- category: string
- tierId: int
- dataFormat: string
- file: file (CSV/Excel)
```

#### Download Dataset
```
GET /api/datasets/{id}/download
Authorization: Bearer {token}
```

**Features**:
- ✅ Check purchase trước khi download
- ✅ Limit số lần download (max_download)
- ✅ Auto increment download_count
- ✅ Return file stream

### 4. Auto Seed on Startup ✅

**File**: `Program.cs`

Khi run application:
1. Auto apply migrations
2. Auto seed data nếu chưa có
3. Xử lý exception gracefully

## Cách Test

### Test 1: Login với Seed Accounts

**Admin**:
```json
POST /api/auth/login
{
  "email": "admin@evdatamarket.com",
  "password": "Admin@123"
}
```

**Provider**:
```json
POST /api/auth/login
{
  "email": "provider1@vinfast.vn",
  "password": "Provider@123"
}
```

**Consumer**:
```json
POST /api/auth/login
{
  "email": "consumer1@toyota.vn",
  "password": "Consumer@123"
}
```

### Test 2: Browse Datasets
```
GET /api/datasets
```
Sẽ thấy 3 datasets đã approved

### Test 3: Upload Dataset với File

**Postman Steps**:
1. Login as Provider → Copy JWT token
2. POST `/api/datasets`
3. Authorization: Bearer {token}
4. Body: form-data
   - name: "Test Dataset"
   - description: "Test upload"
   - category: "Test"
   - tierId: 2
   - file: [Select CSV file]

### Test 4: Moderator Approve Dataset
```
POST /api/moderation/review
{
  "datasetId": 4,
  "moderationStatus": "Approved"
}
```

### Test 5: Consumer Purchase & Download
1. Consumer mua dataset:
```
POST /api/purchases/onetime
{
  "datasetId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "licenseType": "Research"
}
```

2. Complete payment:
```
POST /api/payments/create
{
  "paymentType": "OneTimePurchase",
  "referenceId": 1
}

POST /api/payments/{paymentId}/complete
```

3. Download file:
```
GET /api/datasets/1/download
Authorization: Bearer {consumer_token}
```

## Migrations

Database đã có migration sẵn: `20251025122718_InitialCreate`

```bash
# Apply migration
dotnet ef database update

# Run app (auto seed)
dotnet run
```

## Notes

- Password đều là `{Role}@123` cho dễ nhớ
- Seed data chỉ chạy khi database trống
- File upload vào thư mục `Uploads/datasets/`
- Download có kiểm tra quyền và limit số lần
- Sample datasets không có file thật, chỉ có metadata

## Next Steps (Optional)

1. ✅ DONE: Seed data
2. ✅ DONE: File upload/download
3. 🔜 TODO (nếu cần): Real PayOS integration
4. 🔜 TODO (nếu cần): API endpoint cho Consumer access data
5. 🔜 TODO (nếu cần): Email notifications
