# Frontend Testing Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend/EVDataMarketplace.API
dotnet run
```
✅ Backend running at: `http://localhost:5258`

### 2. Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```
✅ Frontend running at: `http://localhost:5173`

---

## 👥 Test Accounts

### Created in Backend (via DbSeeder):
```
Admin/Moderator:
  Email: admin@test.com
  Password: Test123!
  Role: Admin

Provider:
  Email: provider@test.com
  Password: Test123!
  Role: DataProvider

Consumer:
  Email: consumer@test.com
  Password: Test123!
  Role: DataConsumer
```

---

## 🧪 Test Scenarios

### Scenario 1: Admin Setup (B1)
**Goal:** Tạo pricing tiers cho platform

1. Open `http://localhost:5173/login`
2. Click "Admin" quick fill button
3. Login với: `admin@test.com` / `Test123!`
4. Navigate to `/admin/pricing` (B1: Quản lý Bảng Giá)
5. Click "Tạo Pricing Tier"
6. Fill form:
   ```
   Tier Name: Standard
   Description: Gói cơ bản cho providers
   Base Price (File): 1000 đ/MB
   API Price: 10 đ/call
   Subscription Price: 50000 đ/region
   Provider Commission: 70%
   Admin Commission: 30%
   ```
7. Click "Tạo Tier"
8. ✅ Verify: Tier xuất hiện trong grid

**Expected:**
- Tier được tạo thành công
- Revenue split 70/30 hiển thị
- Tier có status "Active"

---

### Scenario 2: Provider Upload (B2)
**Goal:** Provider upload dataset lên platform

1. Logout → Login as Provider
   - Email: `provider@test.com`
   - Password: `Test123!`
2. Navigate to `/provider/dashboard`
3. Click "Upload Dataset Mới"
4. Fill form (`/provider/new`):
   ```
   Tên Dataset: Dữ liệu trạm sạc Hà Nội 2024
   Category: Charging Stations
   Description: Dataset chứa thông tin 100 trạm sạc tại Hà Nội...
   Tier: Standard (chọn tier vừa tạo)
   File: Upload file CSV (test.csv)
   ```
5. Check "Tôi xác nhận..."
6. Click "Upload Dataset"
7. ✅ Verify: Navigate về dashboard, dataset hiển thị với status "Pending"

**Expected:**
- Dataset uploaded successfully
- Status: Pending
- Moderation Status: Pending
- File size calculated

---

### Scenario 3: Moderator Review (B3)
**Goal:** Kiểm duyệt và approve dataset

1. Logout → Login as Admin (có quyền Moderator)
2. Navigate to `/moderation/review`
3. See dataset "Dữ liệu trạm sạc Hà Nội 2024" trong queue
4. Review dataset info (provider, size, tier, category)
5. Click "Phê duyệt" (green button)
6. (Optional) Add comments: "Dataset chất lượng tốt"
7. Click "Xác nhận phê duyệt"
8. ✅ Verify: Dataset biến mất khỏi pending queue

**Expected:**
- Dataset approved
- Moderation Status → Approved
- Status → Active
- Dataset xuất hiện trong public catalog

---

### Scenario 4: Consumer Browse (B4)
**Goal:** Tìm kiếm datasets

1. Logout → Login as Consumer
   - Email: `consumer@test.com`
   - Password: `Test123!`
2. Navigate to `/catalog` (hoặc click "Khám phá dữ liệu" ở Home)
3. See dataset "Dữ liệu trạm sạc Hà Nội 2024"
4. Test search: Type "Hà Nội" → dataset hiển thị
5. Test category filter: Click "Charging Stations"
6. Test sort: Change to "Giá thấp → cao"
7. Click vào dataset card

**Expected:**
- Datasets load từ API
- Search filter hoạt động
- Category filter hoạt động
- Sort hoạt động
- Click vào dataset → navigate to detail page

---

### Scenario 5: Consumer Select Package (B5)
**Goal:** Chọn gói mua phù hợp

At `/dataset/{id}` page:

1. Review dataset information
2. See 3 package options (nếu tier có đủ):
   
   **Option A: Gói File (One-time)**
   - Select "Gói File"
   - Choose dates: 
     - Start: 2025-01-01
     - End: 2025-12-31
   - License: Research
   - Price: 10,000 đ (fixed for testing)
   
   **Option B: Gói API**
   - Select "Gói API"
   - API calls: 1000
   - Price: 10 đ × 1000 = 10,000 đ
   
   **Option C: Gói Thuê bao**
   - Select "Gói Thuê bao"
   - Province: Hà Nội
   - Cycle: Monthly
   - Duration: 1 month
   - Price: 50,000 đ

3. Click "Mua ngay"

**Expected:**
- Purchase record created in backend
- Navigate to `/checkout` với purchase info

---

### Scenario 6: Payment via PayOS (B6)
**Goal:** Thanh toán và hoàn tất đơn hàng

At `/checkout` page:

1. Review order summary:
   - Dataset name
   - Package type
   - Total price
   - Revenue split (70/30)

2. Click "Thanh toán qua PayOS"

3. **Redirected to PayOS checkout page:**
   - Scan QR code (test với PayOS sandbox)
   - Or use test payment method
   - Complete payment

4. **Redirected back to** `/success?orderId=xxx&paymentId=xxx`

5. See success message!

6. Click "Xem Datasets của tôi"

**Expected:**
- Payment created với status "Pending"
- Redirect to PayOS
- After payment: status → "Completed"
- Purchase status → "Completed"
- Revenue share record created

---

### Scenario 7: Download Dataset (B6)
**Goal:** Download dataset đã mua

At `/my-purchases` page:

1. See purchased dataset trong "Datasets đã mua" tab

2. Verify purchase info:
   - Download count: 0/5
   - Status: Completed
   - Price paid
   - License type

3. Click "Download CSV"

4. ✅ **File downloaded!**

5. Check download count: Now 1/5

**Expected:**
- CSV file downloaded to your computer
- Download count incremented
- Max 5 downloads allowed

**If Payment Still Pending:**
- Switch to "Lịch sử thanh toán" tab
- Find payment with status "Pending"
- Click "Kiểm tra" button
- Status auto-updates to "Completed"
- Go back to Datasets tab
- Now can download!

---

### Scenario 8: Admin Payout (B7)
**Goal:** Admin trả tiền cho Provider

1. Login as Admin
2. Navigate to `/admin/payouts`
3. See provider payouts summary:
   - Provider name
   - Pending amount (70% of revenue)
   - Completed amount
   - Total

4. Click "Thanh toán {amount}" cho provider

5. Confirm payout

6. ✅ Verify: Status changed to "Completed"

**Expected:**
- Payout record created
- Provider's pending amount → 0
- Completed amount increases
- Admin revenue (30%) tracked

---

## 🔍 Debugging Tips

### Issue 1: "401 Unauthorized"
**Solution:**
- Check token in localStorage (DevTools → Application → Local Storage)
- Token expired? Login again
- Check backend is running

### Issue 2: "CORS Error"
**Solution:**
- Check backend CORS config includes `http://localhost:5173`
- Restart backend after config changes

### Issue 3: "Network Error"
**Solution:**
- Check backend is running on port 5258
- Check `API_BASE_URL` in `src/utils/api.ts`

### Issue 4: Payment Pending After PayOS
**Solution:**
1. Go to `/my-purchases`
2. Switch to "Lịch sử thanh toán" tab
3. Find payment
4. Click "Kiểm tra" button
5. Status will auto-update

### Issue 5: Cannot Download
**Solution:**
- Check purchase status = "Completed"
- Check download count < 5
- Check dataset has data (file or records)

---

## 📊 Feature Checklist

### Authentication ✅
- [x] Login page
- [x] JWT token storage
- [x] Auto token expiration
- [x] Role-based routing

### B1: Admin Pricing ✅
- [x] View tiers
- [x] Create tier
- [x] Edit tier
- [x] Delete tier
- [x] Commission config

### B2: Provider ✅
- [x] Upload dataset
- [x] View my datasets
- [x] Dataset status tracking
- [x] Tier selection

### B3: Moderation ✅
- [x] View pending queue
- [x] Approve dataset
- [x] Reject dataset
- [x] Comments

### B4: Consumer Browse ✅
- [x] Search datasets
- [x] Filter by category
- [x] Sort options
- [x] Dataset cards

### B5: Package Selection ✅
- [x] One-time purchase
- [x] API package
- [x] Subscription
- [x] Price calculation

### B6: Payment & Download ✅
- [x] Create payment
- [x] PayOS integration
- [x] Payment callback
- [x] Check payment status
- [x] View purchases
- [x] Download CSV

### B7: Payouts ✅
- [x] View provider payouts
- [x] Create payout
- [x] Track admin revenue
- [x] Revenue split (70/30)

---

## 🎯 Performance Testing

### Load Time Targets
- Home page: < 2s
- Catalog page: < 3s
- Login: < 1s
- API calls: < 500ms

### Test with Chrome DevTools
1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Check:
   - Total load time
   - API response times
   - Asset sizes

---

## ✅ Ready for Production!

All core features implemented and tested.

**Next:** Deploy to production servers! 🚀



















