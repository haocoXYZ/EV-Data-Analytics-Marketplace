# Các Chức Năng Backend Đã Code Nhưng Chưa Làm Frontend

## Phân Tích So Sánh Backend vs Frontend

### 1. SUBSCRIPTION PACKAGE - Thiếu Endpoint GET My Subscriptions

**Backend có:**
- `GET /api/purchases/my-subscriptions` ✅ (trong PurchasesController)

**Backend KHÔNG có:**
- `GET /api/subscription-packages/my-subscriptions` ❌

**Frontend đang gọi:**
- `GET /api/subscription-packages/my-subscriptions` (trong purchases.ts line 96)

**Vấn đề:** Frontend đang gọi endpoint sai, cần sửa thành `/purchases/my-subscriptions`

---

### 2. DATA PACKAGE - Endpoint Download

**Backend có:**
- `GET /api/purchases/download/{purchaseId}` ✅ (trong PurchasesController line 288)
- `GET /api/data-packages/{purchaseId}/download` ✅ (trong DataPackageController line 246)

**Frontend đang gọi:**
- `GET /api/purchases/download/{purchaseId}` ✅ (trong purchases.ts line 55)

**Trạng thái:** Đã có frontend, nhưng có 2 endpoint trùng chức năng cần xem xét hợp nhất

---

## 3. CHỨC NĂNG CHƯA CÓ FRONTEND HOÀN CHỈNH

### A. API Package - Query Data Endpoint (Public API)

**Backend có:**
```
GET /api/data (Public endpoint - AllowAnonymous)
Header: X-API-Key
Query params: provinceId, districtId, startDate, endDate, page, pageSize
```
- File: APIPackageController.cs (line 276-423)
- Chức năng: Query dữ liệu bằng API key cho external users
- Trả về: Paginated data với remaining calls

**Frontend có:**
- API service có sẵn trong `apiKeys.ts` (line 39-52) ✅
- Nhưng CHƯA CÓ UI/Page để test và sử dụng API key này

**Thiếu:** 
- ❌ Page để test API endpoint với API key
- ❌ API Documentation page cho consumers
- ❌ API playground/testing interface

---

### B. Subscription Package - Missing My Subscriptions Endpoint

**Backend có:**
```
GET /api/purchases/my-subscriptions
```
- File: PurchasesController.cs (line 180-224)
- Trả về: Danh sách subscription với đầy đủ thông tin

**Frontend:**
- ❌ Đang gọi sai endpoint: `/subscription-packages/my-subscriptions` (không tồn tại)
- ✅ Có UI page: MyPurchases.tsx

**Cần fix:** Sửa purchases.ts line 96 từ `/subscription-packages/my-subscriptions` → `/purchases/my-subscriptions`

---

### C. Moderation - Download Dataset CSV

**Backend có:**
```
GET /api/moderation/{datasetId}/download
```
- File: ModerationController.cs (line 171-208)
- Chức năng: Moderator download full dataset để review
- Authorization: Moderator, Admin

**Frontend:**
- ✅ Có API service: moderation.ts line 49-54
- ✅ Có UI: ModeratorReview.tsx
- ✅ HOÀN CHỈNH

---

### D. Payouts - Provider View Their Payouts

**Backend có:**
```
GET /api/payouts/provider/{providerId}
Authorization: DataProvider, Admin
```
- File: PayoutsController.cs (line 229-251)
- Chức năng: Data Provider xem lịch sử thanh toán của mình

**Frontend:**
- ✅ Có API service: payouts.ts line 47-50
- ❌ CHƯA CÓ UI trong ProviderDashboard.tsx
- ❌ Provider không thể xem được payouts của họ

**Thiếu:**
- ❌ Section trong ProviderDashboard để hiển thị payouts
- ❌ Page riêng cho Provider Payouts History

---

### E. Pricing - Toggle Active Status

**Backend có:**
```
PATCH /api/pricing/{id}/toggle-active
Authorization: Admin
```
- File: PricingController.cs (line 151-172)
- Chức năng: Bật/tắt pricing configuration

**Frontend:**
- ✅ Có API service: pricing.ts line 35-39
- ⚠️ Có UI nhưng CHƯA IMPLEMENT toggle button
- File: AdminPricing.tsx

**Thiếu:**
- ❌ Toggle button/switch trong AdminPricing.tsx
- ❌ Confirmation dialog trước khi toggle

---

## 4. ENDPOINTS TRÙNG LẶP CẦN REVIEW

### A. Get My Data Packages

**Backend có 2 endpoints:**
1. `GET /api/purchases/my-data-packages` (PurchasesController line 134)
2. `GET /api/data-packages/my-purchases` (DataPackageController line 338)

**Frontend đang dùng:**
- `GET /api/data-packages/my-purchases` ✅

**Khuyến nghị:** Giữ endpoint trong DataPackageController, xóa trong PurchasesController

---

### B. Download Data Package

**Backend có 2 endpoints:**
1. `GET /api/purchases/download/{purchaseId}` (PurchasesController line 288)
2. `GET /api/data-packages/{purchaseId}/download` (DataPackageController line 246)

**Frontend đang dùng:**
- `GET /api/purchases/download/{purchaseId}` ✅

**Sự khác biệt:**
- PurchasesController: Generate mock CSV data
- DataPackageController: Query real data từ DatasetRecords

**Khuyến nghị:** 
- Xóa endpoint trong PurchasesController (mock data)
- Frontend nên dùng `/data-packages/{purchaseId}/download` (real data)
- Update purchases.ts line 55

---

## 5. TÓM TẮT CÁC TASK CẦN LÀM

### 🔴 Priority 1 - Bugs Cần Fix Ngay:

1. **Fix Wrong Endpoint Call:**
   - File: `frontend/src/api/purchases.ts` line 96
   - Sửa: `/subscription-packages/my-subscriptions` → `/purchases/my-subscriptions`

2. **Fix Download Endpoint:**
   - File: `frontend/src/api/purchases.ts` line 55
   - Sửa: `/purchases/download/{purchaseId}` → `/data-packages/{purchaseId}/download`

### 🟡 Priority 2 - Missing Features:

3. **Provider Payouts View:**
   - Thêm section trong `ProviderDashboard.tsx`
   - Hiển thị payouts history cho data provider
   - API đã có sẵn: `payouts.getProviderPayouts(providerId)`

4. **API Testing/Documentation Page:**
   - Tạo page mới: `APITesting.tsx` hoặc `APIDocs.tsx`
   - Cho phép consumer test API key
   - Hiển thị example code và documentation
   - API đã có sẵn: `apiKeys.getData()`

5. **Pricing Toggle Active:**
   - Thêm toggle switch trong `AdminPricing.tsx`
   - API đã có sẵn: `pricing.toggleActive(id)`
   - Thêm confirmation dialog

### 🟢 Priority 3 - Code Cleanup:

6. **Remove Duplicate Endpoints:**
   - Xóa `GET /api/purchases/my-data-packages` trong PurchasesController
   - Xóa `GET /api/purchases/download/{purchaseId}` trong PurchasesController
   - Giữ các endpoint trong DataPackageController

---

## 6. CHI TIẾT ENDPOINTS BACKEND ĐÃ CÓ

### ✅ Đã có Frontend đầy đủ:

| Controller | Endpoint | Method | Frontend API | Frontend Page |
|------------|----------|--------|--------------|---------------|
| Auth | /api/auth/register | POST | ✅ auth.ts | ✅ Register.tsx |
| Auth | /api/auth/login | POST | ✅ auth.ts | ✅ Login.tsx |
| Datasets | /api/datasets | GET | ✅ datasets.ts | ✅ Catalog.tsx |
| Datasets | /api/datasets/{id} | GET | ✅ datasets.ts | ✅ DatasetDetail.tsx |
| Datasets | /api/datasets | POST | ✅ datasets.ts | ✅ ProviderNew.tsx |
| Datasets | /api/datasets/my-datasets | GET | ✅ datasets.ts | ✅ ProviderDashboard.tsx |
| Datasets | /api/datasets/template | GET | ✅ datasets.ts | ✅ ProviderNew.tsx |
| DataPackage | /api/data-packages/preview | GET | ✅ purchases.ts | ✅ DataPackagePurchase.tsx |
| DataPackage | /api/data-packages/purchase | POST | ✅ purchases.ts | ✅ DataPackagePurchase.tsx |
| DataPackage | /api/data-packages/my-purchases | GET | ✅ purchases.ts | ✅ MyPurchases.tsx |
| Subscription | /api/subscription-packages/purchase | POST | ✅ purchases.ts | ✅ SubscriptionPurchase.tsx |
| Subscription | /api/subscription-packages/{id}/dashboard | GET | ✅ subscriptions.ts | ✅ SubscriptionDashboard.tsx |
| Subscription | /api/subscription-packages/{id}/charts/* | GET | ✅ subscriptions.ts | ✅ SubscriptionDashboard.tsx |
| Subscription | /api/subscription-packages/{id}/cancel | POST | ✅ purchases.ts | ✅ MyPurchases.tsx |
| APIPackage | /api/api-packages/purchase | POST | ✅ purchases.ts | ✅ Checkout.tsx |
| APIPackage | /api/api-packages/{id}/generate-key | POST | ✅ apiKeys.ts | ✅ APIPackageKeys.tsx |
| APIPackage | /api/api-packages/{id}/keys | GET | ✅ apiKeys.ts | ✅ APIPackageKeys.tsx |
| APIPackage | /api/api-packages/keys/{id}/revoke | POST | ✅ apiKeys.ts | ✅ APIPackageKeys.tsx |
| Moderation | /api/moderation/pending | GET | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Moderation | /api/moderation/all | GET | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Moderation | /api/moderation/{id} | GET | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Moderation | /api/moderation/{id}/preview-data | GET | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Moderation | /api/moderation/{id}/approve | PUT | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Moderation | /api/moderation/{id}/reject | PUT | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Moderation | /api/moderation/{id}/download | GET | ✅ moderation.ts | ✅ ModeratorReview.tsx |
| Payouts | /api/payouts/revenue-summary | GET | ✅ payouts.ts | ✅ AdminPayouts.tsx |
| Payouts | /api/payouts/generate | POST | ✅ payouts.ts | ✅ AdminPayouts.tsx |
| Payouts | /api/payouts | GET | ✅ payouts.ts | ✅ AdminPayouts.tsx |
| Payouts | /api/payouts/{id}/complete | PUT | ✅ payouts.ts | ✅ AdminPayouts.tsx |
| Pricing | /api/pricing | GET | ✅ pricing.ts | ✅ AdminPricing.tsx |
| Pricing | /api/pricing/{id} | GET | ✅ pricing.ts | ✅ AdminPricing.tsx |
| Pricing | /api/pricing/{id} | PUT | ✅ pricing.ts | ✅ AdminPricing.tsx |
| Payments | /api/payments/create | POST | ✅ payments.ts | ✅ Checkout.tsx |
| Payments | /api/payments/{id}/status | GET | ✅ payments.ts | ✅ PaymentSuccess.tsx |
| Payments | /api/payments/webhook | POST | ✅ (Backend only) | N/A |
| Payments | /api/payments/callback | GET | ✅ (Browser redirect) | N/A |
| Purchases | /api/purchases/my-purchases | GET | ✅ purchases.ts | ✅ MyPurchases.tsx |
| Purchases | /api/purchases/my-api-packages | GET | ✅ purchases.ts | ✅ MyPurchases.tsx |

---

### ⚠️ Có Backend nhưng Frontend chưa đầy đủ:

| Controller | Endpoint | Method | Frontend API | Frontend UI | Thiếu gì |
|------------|----------|--------|--------------|-------------|----------|
| APIPackage | /api/data | GET | ✅ apiKeys.ts | ❌ | API Testing Page |
| Payouts | /api/payouts/provider/{id} | GET | ✅ payouts.ts | ❌ | Provider Payouts UI |
| Pricing | /api/pricing/{id}/toggle-active | PATCH | ✅ pricing.ts | ⚠️ | Toggle button chưa implement |

---

### ❌ Endpoints Frontend gọi sai:

| Frontend Call | Status | Backend Reality | Fix Required |
|--------------|--------|-----------------|--------------|
| GET /subscription-packages/my-subscriptions | ❌ 404 | Không tồn tại | Sửa thành /purchases/my-subscriptions |
| GET /purchases/download/{id} | ⚠️ | Trả mock data | Nên dùng /data-packages/{id}/download |

---

## 7. ROADMAP THỰC HIỆN

### Sprint 1 - Bug Fixes (1-2 ngày):
1. Fix endpoint calls sai trong purchases.ts
2. Test lại các chức năng purchase và download

### Sprint 2 - Provider Features (2-3 ngày):
1. Implement Provider Payouts view
2. Add revenue stats trong ProviderDashboard

### Sprint 3 - API Features (3-4 ngày):
1. Tạo API Documentation page
2. Tạo API Testing playground
3. Add example code và usage guide

### Sprint 4 - Admin Enhancements (1-2 ngày):
1. Add toggle active trong Pricing page
2. Add confirmation dialogs
3. Improve UX

### Sprint 5 - Code Cleanup (1 ngày):
1. Remove duplicate endpoints trong backend
2. Refactor và optimize code
3. Update API documentation

---

## 8. KẾT LUẬN

**Tổng quan:**
- ✅ **Phần lớn chức năng backend đã có frontend tương ứng** (90%+)
- ⚠️ **Có 2-3 bugs nhỏ cần fix ngay** (wrong endpoint calls)
- ❌ **Thiếu 2-3 features UI** (Provider Payouts, API Docs, Toggle Active)
- 🔧 **Cần cleanup code trùng lặp** (duplicate endpoints)

**Ưu điểm:**
- Backend API design rất đầy đủ và consistent
- Frontend đã cover được hầu hết use cases chính
- Authentication và authorization đã hoàn chỉnh

**Cần cải thiện:**
- Provider experience (chưa thấy được payouts)
- API consumer experience (chưa có docs/testing tool)
- Admin UX (thiếu một số action buttons)

