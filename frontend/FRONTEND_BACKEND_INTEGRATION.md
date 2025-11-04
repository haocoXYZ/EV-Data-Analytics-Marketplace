# Frontend-Backend Integration Guide

## 🎯 Tổng quan

Frontend (React + TypeScript) đã được tích hợp với Backend (.NET Core API).

---

## 📁 Files đã tạo/cập nhật

### 1. **`src/utils/api.ts`** (MỚI)
API client với tất cả endpoints:
- Auth (login, register)
- Datasets (CRUD, download, records)
- Purchases (one-time, subscription, API package)
- Payments (create, check status)
- Moderation (approve, reject)
- Pricing Tiers (CRUD)
- Payouts (provider, admin)

### 2. **`src/contexts/AuthContext.tsx`** (CẬP NHẬT)
- Tích hợp với API login thực
- Lưu JWT token
- Auto-check token expiration
- Map backend roles → frontend roles

### 3. **`src/pages/Login.tsx`** (CẬP NHẬT)
- Gọi API login thực
- Hiển thị loading state
- Error handling
- Cập nhật credentials demo

---

## 🔑 API Configuration

### Base URL
```typescript
const API_BASE_URL = 'http://localhost:5258/api'
```

### Authentication
Tất cả requests đều tự động thêm JWT token:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📚 Cách sử dụng API

### Import
```typescript
import api from '../utils/api'
```

### Examples

#### 1. Login
```typescript
const handleLogin = async () => {
  try {
    const response = await api.auth.login(email, password)
    // Response includes: token, userId, fullName, email, role, expiresAt
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

#### 2. Get Datasets
```typescript
// Public datasets
const datasets = await api.datasets.getAll()

// Filter by category
const evChargers = await api.datasets.getAll('Charging Stations')

// Search
const results = await api.datasets.getAll(undefined, 'hanoi')
```

#### 3. Consumer - Get Purchased Datasets
```typescript
const myDatasets = await api.datasets.getMyPurchases()
// Returns: array of { dataset, purchase } objects
```

#### 4. Create Purchase
```typescript
const purchase = await api.purchases.createOneTime({
  datasetId: 1,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  licenseType: 'Research'
})
```

#### 5. Create Payment
```typescript
const payment = await api.payments.create({
  paymentType: 'OneTimePurchase',
  referenceId: purchase.otpId
})
// Redirect to: payment.checkoutUrl
```

#### 6. Download Dataset
```typescript
const blob = await api.datasets.download(datasetId)
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'dataset.csv'
a.click()
```

#### 7. View Dataset Records
```typescript
const data = await api.datasets.getRecords(datasetId, 1, 100)
// Returns paginated records
```

---

## 🎨 Components cần cập nhật

### Priority 1: Authentication & Core
- [x] `Login.tsx` - Đã cập nhật
- [ ] `Home.tsx` - Cần load datasets từ API
- [ ] `Catalog.tsx` - Cần load datasets từ API

### Priority 2: Consumer Flow
- [ ] `DatasetDetail.tsx` - Load chi tiết từ API
- [ ] `Checkout.tsx` - Tạo purchase & payment
- [ ] `MyPurchases.tsx` - Load purchased datasets
- [ ] `Consumer/Dashboard.tsx` - Consumer dashboard

### Priority 3: Provider Flow
- [ ] `ProviderDashboard.tsx` - Load provider datasets
- [ ] `ProviderNew.tsx` - Upload dataset với file
- [ ] `Provider/Analytics.tsx` - Provider analytics

### Priority 4: Admin Flow
- [ ] `AdminDashboard.tsx` - Admin stats
- [ ] `AdminPricing.tsx` - Manage pricing tiers
- [ ] `AdminPayouts.tsx` - Manage payouts
- [ ] `ModeratorReview.tsx` - Approve/reject datasets

---

## 🔧 Cập nhật Component Example

### Before (Mock data)
```typescript
import datasetsData from '../data/datasets.json'

function Catalog() {
  const [datasets] = useState(datasetsData.datasets)
  
  return (
    <div>
      {datasets.map(dataset => (
        <DatasetCard key={dataset.id} {...dataset} />
      ))}
    </div>
  )
}
```

### After (API integration)
```typescript
import { useEffect, useState } from 'react'
import api from '../utils/api'

function Catalog() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    loadDatasets()
  }, [])
  
  const loadDatasets = async () => {
    try {
      setLoading(true)
      const data = await api.datasets.getAll()
      setDatasets(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {datasets.map(dataset => (
        <DatasetCard key={dataset.datasetId} {...dataset} />
      ))}
    </div>
  )
}
```

---

## 🚀 Testing

### 1. Start Backend
```bash
cd backend/EVDataMarketplace.API
dotnet run
# Backend: http://localhost:5258
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend: http://localhost:5173
```

### 3. Test Login
1. Mở http://localhost:5173/login
2. Click "Consumer" quick fill button
3. Login với: consumer@test.com / Test123!
4. Kiểm tra console → token được lưu
5. Check localStorage → user object with token

---

## 🔐 Roles & Permissions

### Backend Roles → Frontend Roles Mapping
```typescript
'Admin' | 'Moderator' → 'admin'
'DataProvider' → 'provider'
'DataConsumer' → 'consumer'
```

### Role-based Navigation
```typescript
admin → /admin/dashboard
provider → /provider/dashboard
consumer → / (home)
```

---

## ⚠️ Important Notes

### 1. CORS
Backend đã cấu hình CORS cho `http://localhost:5173`:
```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:3000"
  ]
}
```

### 2. Token Storage
Token được lưu trong localStorage:
```typescript
{
  id: number,
  email: string,
  role: 'admin' | 'provider' | 'consumer',
  name: string,
  token: string,  // JWT token
  expiresAt: string  // ISO date string
}
```

### 3. Token Expiration
- Token expires sau 24h (1440 minutes)
- AuthContext tự động check expiration khi load
- User phải login lại nếu token expired

### 4. File Upload
Upload dataset với file:
```typescript
const formData = new FormData()
formData.append('Name', 'Dataset Name')
formData.append('Description', 'Description')
formData.append('Category', 'Charging Stations')
formData.append('TierId', '1')
formData.append('file', file) // File object

await api.datasets.upload(formData)
```

---

## 📝 TODO List

### Immediate (Sprint 1)
- [x] Setup API client
- [x] Integrate Login
- [ ] Integrate Home page (load datasets)
- [ ] Integrate Catalog page
- [ ] Integrate Dataset Detail page

### Next (Sprint 2)
- [ ] Consumer: Purchase flow
- [ ] Consumer: Payment integration
- [ ] Consumer: Download dataset
- [ ] Consumer: View purchased datasets

### Future (Sprint 3)
- [ ] Provider: Upload dataset
- [ ] Provider: Manage datasets
- [ ] Provider: View earnings

### Admin (Sprint 4)
- [ ] Moderation: Approve/reject datasets
- [ ] Admin: Manage pricing tiers
- [ ] Admin: Manage payouts

---

## 🐛 Common Issues

### Issue 1: CORS Error
**Error:** "Access-Control-Allow-Origin"

**Fix:**
- Check backend is running on port 5258
- Check CORS configuration in backend
- Restart backend

### Issue 2: 401 Unauthorized
**Error:** "Unauthorized"

**Fix:**
- Check token in localStorage
- Check token expiration
- Login again

### Issue 3: Network Error
**Error:** "Failed to fetch"

**Fix:**
- Check backend is running
- Check API_BASE_URL is correct
- Check network connection

---

## 📖 API Documentation

Full API documentation: `backend/README.md`

Swagger UI: `http://localhost:5258/swagger`

---

## 🎯 Next Steps

1. **Cập nhật Home page** - Load datasets từ API
2. **Cập nhật Catalog page** - Search & filter datasets
3. **Cập nhật DatasetDetail** - Show detail + purchase button
4. **Implement Checkout flow** - Purchase + Payment
5. **Implement MyPurchases** - Show purchased datasets

---

**Status:** ✅ Basic integration complete, ready for component updates!



















