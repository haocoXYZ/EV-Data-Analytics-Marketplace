# EV Data Analytics Marketplace - Backend API

## Tổng quan
Backend API được xây dựng bằng C# .NET 8.0 Web API, Entity Framework Core và SQL Server.

## Công nghệ sử dụng
- **.NET 8.0**: Framework chính
- **Entity Framework Core 8.0**: ORM cho database
- **SQL Server**: Database
- **JWT Authentication**: Bảo mật API
- **Swagger/OpenAPI**: API Documentation
- **BCrypt.Net**: Mã hóa mật khẩu
- **PayOS**: Tích hợp thanh toán (placeholder)

## Cấu trúc dự án

```
EVDataMarketplace.API/
├── Controllers/         # API Controllers
│   └── HealthController.cs
├── Data/               # DbContext
│   └── EVDataMarketplaceDbContext.cs
├── DTOs/               # Data Transfer Objects
│   └── CommonDTOs.cs
├── Models/             # Entity Models
│   ├── User.cs
│   ├── DataProvider.cs
│   ├── DataConsumer.cs
│   ├── PricingTier.cs
│   ├── Dataset.cs
│   ├── DatasetModeration.cs
│   ├── OneTimePurchase.cs
│   ├── Subscription.cs
│   ├── APIPackage.cs
│   ├── Payment.cs
│   ├── RevenueShare.cs
│   ├── Payout.cs
│   └── Province.cs
├── Repositories/       # Repository Pattern
│   ├── IRepository.cs
│   └── Repository.cs
├── Services/           # Business Logic Services
│   └── PayOSService.cs
├── Middleware/         # Custom Middleware (empty for now)
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

## Cấu hình

### 1. Connection String (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EVDataMarketplace;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

### 2. JWT Settings
```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJWTTokenGeneration123456",
    "Issuer": "EVDataMarketplace",
    "Audience": "EVDataMarketplaceUsers",
    "ExpiryInMinutes": 1440
  }
}
```

### 3. PayOS Settings
```json
{
  "PayOS": {
    "ClientId": "your-payos-client-id",
    "ApiKey": "your-payos-api-key",
    "ChecksumKey": "your-payos-checksum-key",
    "ReturnUrl": "http://localhost:5173/payment/callback",
    "CancelUrl": "http://localhost:5173/payment/cancel"
  }
}
```

## Cài đặt và Chạy

### 1. Restore dependencies
```bash
cd backend/EVDataMarketplace.API
dotnet restore
```

### 2. Cập nhật Connection String
Sửa `appsettings.Development.json` với thông tin SQL Server của bạn.

### 3. Tạo Database Migration
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 4. Chạy ứng dụng
```bash
dotnet run
```

API sẽ chạy tại: `https://localhost:7xxx` hoặc `http://localhost:5xxx`

### 5. Truy cập Swagger UI
Mở trình duyệt: `https://localhost:7xxx/swagger`

## API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra trạng thái API
- `GET /health` - Health check endpoint

## Features đã implement

### ✅ Đã hoàn thành
1. **Project Structure**: Cấu trúc dự án chuẩn
2. **Entity Models**: Tất cả models theo database schema
3. **DbContext**: EF Core context với relationships
4. **JWT Authentication**: Middleware xác thực
5. **Repository Pattern**: Generic repository
6. **CORS**: Hỗ trợ frontend
7. **Swagger**: API documentation với JWT support
8. **PayOS Integration**: Placeholder service (cần implement thực tế)

### 🚧 Cần implement tiếp
1. **Authentication Controller**: Login/Register
2. **User Management**: CRUD operations
3. **Dataset Management**: Upload, moderation
4. **Purchase Flow**: OneTime, Subscription, API packages
5. **Payment Integration**: PayOS thực tế
6. **Revenue Sharing**: Tính toán và payout
7. **File Upload**: CSV dataset storage
8. **Authorization Policies**: Role-based access

## Roles trong hệ thống
- **Admin**: Quản trị hệ thống, quản lý pricing tiers
- **Moderator**: Kiểm duyệt datasets
- **DataProvider**: Cung cấp dữ liệu
- **DataConsumer**: Mua/sử dụng dữ liệu

## Database Indexes
Các indexes được tạo tự động:
- `User.Email` (unique)
- `User.Role`
- `Dataset.Status`
- `Dataset.Category`
- `Dataset.ModerationStatus`
- `Payment.Status`
- `Payment.PaymentDate`
- `APIPackage.ApiKey` (unique)

## Bước tiếp theo

### Ưu tiên cao
1. Implement Authentication Controller (Login/Register)
2. Implement Dataset Controller (Upload, List, Detail)
3. Implement Purchase Controllers (3 loại gói)
4. Integrate PayOS SDK thực tế

### Ưu tiên trung bình
1. File upload service cho CSV
2. Admin dashboard APIs
3. Provider dashboard APIs
4. Consumer dashboard APIs

### Ưu tiên thấp
1. Email notifications
2. Advanced filtering/search
3. Analytics APIs
4. Caching layer

## Testing
```bash
# Build project
dotnet build

# Run tests (nếu có)
dotnet test

# Check for errors
dotnet build --no-incremental
```

## Lưu ý bảo mật
- ⚠️ Đổi JWT SecretKey trong production
- ⚠️ Đổi PayOS credentials với thông tin thực
- ⚠️ Không commit appsettings.Development.json có thông tin nhạy cảm
- ⚠️ Sử dụng User Secrets cho development
- ⚠️ Sử dụng Azure Key Vault hoặc tương tự cho production

## Contributors
Team sinh viên SWP391_SU25
