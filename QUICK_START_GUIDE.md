# Quick Start Guide - EV Data Analytics Marketplace

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống
- .NET 8.0 SDK
- Node.js 18+ và npm
- SQL Server (LocalDB hoặc SQL Server Express)

### Bước 1: Clone Project
```bash
cd EV-Data-Analytics-Marketplace-haicuongbe
```

### Bước 2: Khởi Động Backend

```bash
# Di chuyển vào thư mục backend
cd backend/EVDataMarketplace.API

# Restore dependencies
dotnet restore

# Chạy backend (tự động migrate & seed database)
dotnet run
```

Backend sẽ chạy tại: **http://localhost:5258**  
Swagger UI: **http://localhost:5258/swagger**

### Bước 3: Khởi Động Frontend

Mở terminal mới:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

---

## 👤 Tài Khoản Demo

Database tự động tạo 4 tài khoản test:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@test.com | Test123! | /admin/dashboard |
| **Moderator** | moderator@test.com | Test123! | /moderator/review |
| **Data Provider** | provider@test.com | Test123! | /provider/dashboard |
| **Data Consumer** | consumer@test.com | Test123! | / (Home) |

---

## 🎯 Luồng Hoạt Động Chính

### 1. Provider Upload Dataset

1. **Login** với `provider@test.com`
2. Navigate: **Provider Dashboard** → **Upload Dataset**
3. Download CSV template
4. Fill data và upload
5. Chờ moderator duyệt

### 2. Moderator Review

1. **Login** với `moderator@test.com`
2. Navigate: **Moderator Review**
3. Xem dataset pending
4. Preview data (charts & tables)
5. Download CSV để kiểm tra
6. Approve hoặc Reject

### 3. Consumer Mua Data

#### Option A: Data Package (Buy by Location)
1. **Login** với `consumer@test.com`
2. Navigate: **Buy Data**
3. Chọn **Province** (VD: Hà Nội)
4. Chọn **District** (Optional)
5. Chọn **Date Range** (Optional)
6. Click **Preview Data** → Xem số lượng records
7. Click **Purchase** → Redirect to PayOS
8. Sau khi thanh toán → Download CSV

#### Option B: Subscription (Dashboard Access)
1. Navigate: **Subscribe**
2. Chọn region (Province/District)
3. Chọn billing cycle:
   - Monthly: 500,000 VNĐ
   - Quarterly: 1,425,000 VNĐ (Save 5%)
   - Yearly: 5,100,000 VNĐ (Save 15%)
4. Purchase → Access real-time dashboard với:
   - Energy charts
   - Station distribution
   - Peak hours analysis

#### Option C: API Package
1. Navigate: **Buy API**
2. Chọn số lượng API calls (1000, 5000, 10000, 50000, hoặc custom)
3. Chọn scope:
   - Nationwide: Toàn quốc
   - Province: Một tỉnh
   - District: Một quận/huyện
4. Purchase → Generate API key
5. Use API key để call `/api/data`

### 4. Admin Quản Lý

1. **Login** với `admin@test.com`
2. **Pricing Management**: Cập nhật giá và % chia sẻ doanh thu
3. **Payouts**: Xem revenue shares và process payouts cho providers
4. **Dashboard**: Thống kê tổng quan

---

## 📊 Tính Năng Mới (Vừa Hoàn Thành)

### ✅ 1. Dynamic Locations
- **63 tỉnh thành** từ database
- **62 quận/huyện** (Hà Nội: 30, HCMC: 24, Đà Nẵng: 8)
- Cascading dropdowns
- Real-time loading

### ✅ 2. Interactive Charts (Recharts)
- **Line Chart**: Energy over time
- **Pie Chart**: Station distribution
- **Bar Chart**: Peak hours
- Responsive, interactive tooltips

### ✅ 3. Toast Notifications
- Success messages (green)
- Error messages (red)
- Loading states
- Auto-dismiss sau 4s

### ✅ 4. Error Boundary
- Catch React errors
- Friendly error page
- Reload/Go Home buttons
- Stack trace in dev mode

---

## 🔧 API Endpoints (Mới)

### Locations API
```bash
GET /api/locations/provinces              # All 63 provinces
GET /api/locations/provinces/{id}         # Single province
GET /api/locations/provinces/{id}/districts  # Districts by province
GET /api/locations/districts              # All districts
GET /api/locations/districts/{id}         # Single district
GET /api/locations/stats                  # Statistics
```

### Testing với cURL
```bash
# Get all provinces
curl http://localhost:5258/api/locations/provinces

# Get Hanoi districts
curl http://localhost:5258/api/locations/provinces/1/districts

# Get location stats
curl http://localhost:5258/api/locations/stats
```

---

## 🎨 Pages Mới/Cập Nhật

| Page | Route | Features |
|------|-------|----------|
| **Buy Data** | /buy-data | Dynamic locations, toast, preview |
| **Subscription Dashboard** | /subscriptions/:id/dashboard | Recharts (Line, Pie, Bar) |
| **Login** | /login | Toast notifications |

---

## 🧪 Testing Nhanh

### Test 1: Locations API
```bash
# Terminal 1: Backend đang chạy
# Terminal 2:
curl http://localhost:5258/api/locations/provinces | jq
# Kỳ vọng: JSON với 63 provinces
```

### Test 2: Frontend Charts
1. Login với `consumer@test.com`
2. Tạo subscription purchase (fake data OK)
3. Go to dashboard
4. Verify 3 charts hiển thị đúng

### Test 3: Toast Notifications
1. Go to `/login`
2. Login với wrong password
3. See red error toast top-right
4. Login correctly
5. See green success toast

### Test 4: Error Boundary
1. Temporarily add `throw new Error('Test')` vào một component
2. Load page
3. Error boundary hiển thị error page
4. Remove error code

---

## 🐛 Troubleshooting

### Backend không chạy
```bash
# Kiểm tra SQL Server đang chạy
# Windows: Services → SQL Server (SQLEXPRESS)

# Drop & recreate database
dotnet ef database drop --force
dotnet ef database update
```

### Frontend build error
```bash
# Xóa node_modules và rebuild
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port đã được sử dụng
```bash
# Backend (port 5258)
netstat -ano | findstr :5258
taskkill /F /PID <PID>

# Frontend (port 5173)
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

---

## 📚 Tài Liệu Liên Quan

- **PROJECT_PROGRESS_REPORT.md**: Báo cáo chi tiết (Nov 3, 2025)
- **FEATURE_COMPLETION_SUMMARY.md**: Tính năng vừa hoàn thành (Nov 4, 2025)
- **FRONTEND_IMPLEMENTATION_COMPLETE.md**: Frontend implementation details
- **TESTING_GUIDE.md**: Hướng dẫn test đầy đủ
- **CLAUDE.md**: Project overview & architecture

---

## 🎯 Demo Flow (5 phút)

1. **Start Backend & Frontend** (1 phút)
2. **Provider Flow** (1 phút):
   - Login provider → Upload dataset → Show pending
3. **Moderator Flow** (1 phút):
   - Login moderator → Review → Preview charts → Approve
4. **Consumer Flow** (2 phút):
   - Login consumer
   - Buy data → See toast notifications → Preview
   - Show real locations (63 provinces)
   - Show subscription dashboard with Recharts

---

## 💡 Tips

### Development
- Backend auto-reload: Không hỗ trợ (cần restart manual)
- Frontend hot-reload: Automatic (Vite HMR)
- Database reset: `dotnet ef database drop --force && dotnet run`

### Production
- Build frontend: `npm run build` → `/dist`
- Build backend: `dotnet publish -c Release`
- Environment variables: Use .env files

### Debugging
- Backend logs: Console output
- Frontend errors: Browser DevTools (F12)
- API testing: Swagger UI hoặc Postman
- Database: SQL Server Management Studio

---

## 🚀 Next Steps

1. ✅ Test all features manually
2. ✅ Write unit tests
3. ✅ Add E2E tests
4. ✅ Deploy to staging
5. ✅ Production configuration

---

**Chúc bạn coding vui vẻ! 🎉**

**Last Updated**: November 4, 2025

