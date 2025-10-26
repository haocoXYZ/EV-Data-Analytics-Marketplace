# EV Data Analytics Marketplace - Backend

## 📁 Cấu trúc Project

```
backend/
├── EVDataMarketplace.API/     # Main API project
│   ├── Controllers/           # API Controllers
│   ├── Models/               # Database models
│   ├── Services/             # Business logic services
│   ├── Data/                 # DbContext & Seeder
│   └── Migrations/           # EF Core migrations
├── 1.sql                     # Database schema SQL
├── README_DATABASE.md        # Database documentation
├── IMPLEMENTATION_SUMMARY.md # Implementation details
├── CORE_FLOW_CHECKLIST.md   # Core features checklist
└── FIX_PENDING_PAYMENT.md   # PayOS payment troubleshooting

```

## 🚀 Quick Start

### 1. Prerequisites
- .NET 8.0 SDK
- SQL Server (LocalDB hoặc SQL Server)
- Visual Studio 2022 hoặc VS Code

### 2. Configuration

Cập nhật `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EVDataMarketplace;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "PayOS": {
    "ClientId": "your-payos-client-id",
    "ApiKey": "your-payos-api-key",
    "ChecksumKey": "your-payos-checksum-key"
  }
}
```

### 3. Run

```bash
cd backend/EVDataMarketplace.API
dotnet restore
dotnet run
```

Backend sẽ chạy tại: `http://localhost:5258`  
Swagger UI: `http://localhost:5258/swagger`

## 🎯 Tính năng chính

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based authorization (Admin, Moderator, DataProvider, DataConsumer)
- ✅ User registration & login

### Dataset Management
- ✅ Upload datasets với file CSV/Excel
- ✅ Dataset moderation workflow
- ✅ Public dataset catalog
- ✅ CSV data parsing và storage

### Payment Integration (PayOS)
- ✅ Tạo payment links
- ✅ Callback & webhook handlers
- ✅ Manual payment status check
- ✅ Revenue sharing (Provider/Admin)

### Purchase Types
- ✅ One-time purchase
- ✅ Subscription (Monthly/Quarterly/Yearly)
- ✅ API packages

### Payout Management
- ✅ Provider payout tracking
- ✅ Admin revenue tracking
- ✅ Automated revenue share calculation

## 📚 API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/datasets` - Danh sách datasets public
- `GET /api/datasets/{id}` - Chi tiết dataset
- `GET /health` - Health check

### DataProvider Endpoints
- `GET /api/datasets/my` - Datasets của provider
- `POST /api/datasets` - Upload dataset mới
- `PUT /api/datasets/{id}` - Update dataset
- `DELETE /api/datasets/{id}` - Xóa dataset

### DataConsumer Endpoints
- `POST /api/purchases/onetime` - Mua dataset 1 lần
- `POST /api/purchases/subscription` - Đăng ký subscription
- `POST /api/purchases/api-package` - Mua API package
- `GET /api/purchases/my` - Danh sách purchases
- `GET /api/datasets/{id}/download` - Download dataset đã mua

### Payment Endpoints
- `POST /api/payments/create` - Tạo payment link
- `GET /api/payments/my` - Lịch sử thanh toán
- `GET /api/payments/{id}/check-status` - Kiểm tra và update payment status
- `GET /api/payments/callback` - PayOS callback (auto)
- `POST /api/payments/webhook` - PayOS webhook (auto)

### Moderator Endpoints
- `GET /api/moderation/pending` - Datasets chờ duyệt
- `POST /api/moderation/{id}/approve` - Duyệt dataset
- `POST /api/moderation/{id}/reject` - Từ chối dataset

### Admin Endpoints
- `GET /api/pricingtiers` - Quản lý pricing tiers
- `POST /api/pricingtiers` - Tạo pricing tier mới
- `GET /api/payouts/providers` - Provider payouts
- `GET /api/payouts/admin` - Admin revenue

## 💾 Database

Xem chi tiết trong: `README_DATABASE.md`

**Main Tables:**
- `User` - Users & authentication
- `DataProvider` / `DataConsumer` - User profiles
- `Dataset` - Dataset metadata
- `DatasetRecord` - CSV data storage
- `OneTimePurchase` / `Subscription` / `APIPackage` - Purchase types
- `Payment` - Payment transactions
- `RevenueShare` - Revenue distribution
- `Payout` - Payout tracking
- `PricingTier` - Pricing tiers

## 🔧 PayOS Integration

### Development (Localhost)
- ❌ Webhook KHÔNG hoạt động (PayOS không gọi được localhost)
- ✅ Callback hoạt động (redirect sau thanh toán)
- ✅ Manual check status: `GET /api/payments/{id}/check-status`

### Production
- ✅ Webhook hoạt động (cấu hình trên PayOS Dashboard)
- ✅ Callback hoạt động
- ✅ Manual check vẫn available

**Xử lý Payment Pending:**
Xem chi tiết: `FIX_PENDING_PAYMENT.md`

## 🧪 Testing

### Swagger UI
```
http://localhost:5258/swagger
```

### Test Flow:
1. Register → Login (lấy token)
2. Provider: Upload dataset
3. Moderator: Approve dataset
4. Consumer: Create purchase
5. Consumer: Create payment → Thanh toán trên PayOS
6. Consumer: Check payment status (nếu cần)
7. Consumer: Download dataset

## 📦 Dependencies

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.11" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.11" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="payOS" Version="1.0.9" />
<PackageReference Include="CsvHelper" Version="33.1.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.9.0" />
```

## 🛠️ Troubleshooting

### Payment stuck at "Pending"
→ Xem `FIX_PENDING_PAYMENT.md`

### Database connection error
→ Kiểm tra connection string trong `appsettings.json`

### PayOS errors
→ Verify ClientId, ApiKey, ChecksumKey

### File upload errors
→ Kiểm tra folder `Uploads/datasets/` có quyền write

## 📖 Documentation Files

- `README_DATABASE.md` - Chi tiết database schema
- `IMPLEMENTATION_SUMMARY.md` - Tổng hợp implementation
- `CORE_FLOW_CHECKLIST.md` - Core features status
- `FIX_PENDING_PAYMENT.md` - PayOS payment troubleshooting

## 🔐 Security Notes

- JWT tokens expire sau 1440 phút (24h)
- Passwords được hash với BCrypt
- File uploads được validate extension và size
- Role-based access control trên tất cả endpoints
- PayOS credentials nên được lưu trong environment variables cho production

## 📝 License

MIT License - Xem file LICENSE trong root project

## 👥 Team

SWP391 - SU25 - EV Data Analytics Marketplace

---

**Backend Status**: ✅ Production Ready  
**Last Updated**: October 2025

