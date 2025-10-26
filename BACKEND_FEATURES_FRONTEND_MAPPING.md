# Backend Features → Frontend UI Mapping

## 📊 Phân tích Backend để thiết kế Frontend

### 🎯 Backend có 7 Core Flows

---

## 1️⃣ Admin cung cấp bảng giá

### Backend Endpoints:
```
GET  /api/pricingtiers              → Xem tất cả pricing tiers
POST /api/pricingtiers              → Tạo tier mới
PUT  /api/pricingtiers/{id}         → Update tier
DELETE /api/pricingtiers/{id}       → Deactivate tier
```

### Frontend Pages cần:

#### **`/admin/pricing` - Pricing Tiers Management**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Pricing Tiers Management                  │
│ [+ Create New Tier] Button                │
├────────────────────────────────────────────┤
│ Tier List (Table/Cards):                  │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ Standard Tier                       │   │
│ │ ├─ Base Price/MB: 1,000 VND        │   │
│ │ ├─ API Price/Call: 100 VND         │   │
│ │ ├─ Subscription/Region: 50,000 VND │   │
│ │ ├─ Provider Commission: 70%        │   │
│ │ ├─ Admin Commission: 30%           │   │
│ │ └─ Status: Active                  │   │
│ │ [Edit] [Deactivate] Buttons        │   │
│ └────────────────────────────────────┘   │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ Premium Tier                        │   │
│ │ ... (similar layout)                │   │
│ └────────────────────────────────────┘   │
└────────────────────────────────────────────┘

Modal for Create/Edit:
- Tier Name
- Description
- Base Price per MB
- API Price per Call
- Subscription Price per Region
- Provider Commission % (default 70)
- Admin Commission % (default 30)
```

---

## 2️⃣ Data Provider cung cấp thông tin

### Backend Endpoints:
```
POST /api/datasets                  → Upload dataset + CSV file
GET  /api/datasets/my               → Provider's datasets
PUT  /api/datasets/{id}             → Update (only if pending)
DELETE /api/datasets/{id}           → Soft delete
```

### Frontend Pages cần:

#### **`/provider/dashboard` - Provider Dashboard**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Welcome, {Company Name}                    │
│ Stats Cards:                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ 10   │ │  5   │ │ 2    │ │500K  │      │
│ │Total │ │Apprv │ │Pend  │ │Revenue│     │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
├────────────────────────────────────────────┤
│ My Datasets                                │
│ [+ Upload New Dataset] Button              │
│                                            │
│ Table/Grid:                                │
│ Name | Category | Size | Status | Actions │
│ ───────────────────────────────────────────│
│ Hanoi EV Stations | Charging | 2.5MB |    │
│ Approved | [View] [Edit] [Delete]         │
│                                            │
│ HCMC Energy Data | Energy | 5MB |          │
│ Pending | [View] [Edit] [Delete]          │
│                                            │
│ Traffic Analysis | Traffic | 1.2MB |       │
│ Rejected | [View] [Edit] [Delete]         │
└────────────────────────────────────────────┘

Status Colors:
- Approved: Green
- Pending: Yellow
- Rejected: Red
```

#### **`/provider/upload` - Upload Dataset**
```tsx
UI Form:
┌────────────────────────────────────────────┐
│ Upload New Dataset                         │
├────────────────────────────────────────────┤
│ Basic Information:                         │
│ ├─ Dataset Name* [          ]             │
│ ├─ Description*  [          ]             │
│ ├─ Category*     [▼ Select  ]             │
│ │    Options: Charging Stations,          │
│ │             Energy Consumption,         │
│ │             Traffic Data, etc.          │
│ └─ Pricing Tier* [▼ Select  ]             │
│      Options from /api/pricingtiers       │
├────────────────────────────────────────────┤
│ Upload File:                               │
│ ┌────────────────────────────────────┐   │
│ │  📁 Drag & drop CSV/Excel file     │   │
│ │     or click to browse             │   │
│ │                                    │   │
│ │  Supported: .csv, .xlsx           │   │
│ │  Max size: 50MB                    │   │
│ └────────────────────────────────────┘   │
│                                            │
│ File Preview (after upload):               │
│ ├─ File name: data.csv                    │
│ ├─ Size: 2.5 MB                           │
│ ├─ Rows: 1,500                            │
│ └─ Columns: latitude, longitude, power... │
├────────────────────────────────────────────┤
│ [Cancel] [Submit for Review] Buttons       │
└────────────────────────────────────────────┘

API Call:
FormData with:
- Name, Description, Category, TierId
- file (IFormFile)
```

---

## 3️⃣ Moderator kiểm duyệt

### Backend Endpoints:
```
GET  /api/moderation/pending        → Datasets chờ duyệt
POST /api/moderation/{id}/approve   → Approve dataset
POST /api/moderation/{id}/reject    → Reject với comments
```

### Frontend Pages cần:

#### **`/admin/moderation` - Dataset Moderation**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Dataset Moderation                         │
│ Tabs: [Pending (5)] [Approved] [Rejected] │
├────────────────────────────────────────────┤
│ Pending Review (5):                        │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ Hanoi EV Charging Stations 2024    │   │
│ │ ├─ Provider: EV Corp               │   │
│ │ ├─ Category: Charging Stations     │   │
│ │ ├─ Size: 2.5 MB                    │   │
│ │ ├─ Uploaded: 2025-10-26            │   │
│ │ ├─ Tier: Standard                  │   │
│ │ │                                  │   │
│ │ ├─ [View Details] Button           │   │
│ │ │                                  │   │
│ │ └─ Actions:                        │   │
│ │    [✓ Approve]                     │   │
│ │    [✗ Reject] → Show comment field│   │
│ └────────────────────────────────────┘   │
│                                            │
│ Details Modal (when View Details):        │
│ - Full dataset info                       │
│ - Preview uploaded file (first 10 rows)   │
│ - Provider info                           │
│ - Pricing details                         │
└────────────────────────────────────────────┘
```

---

## 4️⃣ Data Consumer tìm kiếm

### Backend Endpoints:
```
GET /api/datasets                   → Public datasets (approved only)
GET /api/datasets/{id}              → Dataset details
Query params: ?category=...&search=...
```

### Frontend Pages cần:

#### **`/` - Home Page**
```tsx
UI Sections:
┌────────────────────────────────────────────┐
│ Hero Section:                              │
│ ├─ Tagline: "Marketplace for EV Data"     │
│ ├─ Search bar: [🔍 Search datasets...]    │
│ └─ [Browse Catalog] CTA                    │
├────────────────────────────────────────────┤
│ Featured Categories:                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │ ⚡  │ │ 🔌   │ │ 🚗  │ │ 📊   │      │
│ │Charge│ │Energy│ │Traffi│ │Analyc│      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
├────────────────────────────────────────────┤
│ Popular Datasets:                          │
│ [Dataset Card] [Dataset Card] [Card]       │
│ - Name, Provider, Price, Size              │
│ - Quick view button                        │
├────────────────────────────────────────────┤
│ Stats:                                     │
│ 500+ Datasets | 100+ Providers | 1000+ Users│
└────────────────────────────────────────────┘
```

#### **`/catalog` - Dataset Catalog**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Dataset Catalog                            │
│ Search: [🔍 Search...]  [🔎 Search Btn]   │
├──────────┬─────────────────────────────────┤
│ Filters: │ Results (12 datasets)           │
│          │ Sort: [Newest ▼]               │
│ Category:│                                 │
│ □ All    │ ┌─────────────────────────┐   │
│ □ Chargng│ │ Dataset Card:            │   │
│ □ Energy │ │ ├─ Name                 │   │
│ □ Traffic│ │ ├─ Provider              │   │
│          │ │ ├─ Category              │   │
│ Price:   │ │ ├─ Size: 2.5 MB         │   │
│ [Min-Max]│ │ ├─ Format: CSV          │   │
│          │ │ ├─ Price: 10,000 VND    │   │
│ Format:  │ │ └─ [View Details] Btn   │   │
│ □ CSV    │ └─────────────────────────┘   │
│ □ Excel  │                                 │
│          │ [More cards...]                 │
│          │                                 │
│          │ [< Prev] [1] [2] [3] [Next >]  │
└──────────┴─────────────────────────────────┘
```

#### **`/dataset/:id` - Dataset Detail**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ [< Back to Catalog]                        │
├────────────────────────────────────────────┤
│ Hanoi EV Charging Stations 2024            │
│ by EV Charging Corp                        │
├────────────────────────────────────────────┤
│ Overview:                                  │
│ ├─ Category: Charging Stations            │
│ ├─ Format: CSV                            │
│ ├─ Size: 2.5 MB                           │
│ ├─ Uploaded: 2025-10-26                   │
│ └─ Records: 1,500 rows                    │
│                                            │
│ Description:                               │
│ [Full description text...]                 │
├────────────────────────────────────────────┤
│ Pricing Options (Tabs):                   │
│ [One-Time] [Subscription] [API Package]   │
│                                            │
│ One-Time Purchase:                         │
│ ├─ Base price: 1,000 VND/MB               │
│ ├─ Total: 2,500 VND                       │
│ ├─ License: Research/Commercial           │
│ ├─ Download limit: 5 times                │
│ └─ [Purchase Now] Button                  │
├────────────────────────────────────────────┤
│ Sample Data Preview:                       │
│ Table showing first 5 rows of data        │
└────────────────────────────────────────────┘
```

---

## 5️⃣ Data Consumer mua theo gói

### Backend Endpoints:
```
POST /api/purchases/onetime         → Create one-time purchase
POST /api/purchases/subscription    → Create subscription
POST /api/purchases/api-package     → Create API package
GET  /api/purchases/my/onetime
GET  /api/purchases/my/subscriptions
GET  /api/purchases/my/api
```

### Frontend Pages cần:

#### **`/checkout/:datasetId` - Checkout Page**
```tsx
UI Flow:
┌────────────────────────────────────────────┐
│ Checkout - {Dataset Name}                 │
├────────────────────────────────────────────┤
│ Step 1: Select Purchase Type              │
│ ┌────────┐ ┌────────┐ ┌────────┐         │
│ │ (•)    │ │ ( )    │ │ ( )    │         │
│ │One-Time│ │Subscrip│ │  API   │         │
│ │Purchase│ │  tion  │ │Package │         │
│ │        │ │        │ │        │         │
│ │ 2,500  │ │50,000/ │ │100/call│         │
│ │  VND   │ │ month  │ │        │         │
│ └────────┘ └────────┘ └────────┘         │
├────────────────────────────────────────────┤
│ Step 2: Configure (based on type):        │
│                                            │
│ If One-Time:                              │
│ ├─ Start Date: [Date Picker]              │
│ ├─ End Date: [Date Picker]                │
│ └─ License Type: (•) Research             │
│                   ( ) Commercial          │
│                                            │
│ If Subscription:                          │
│ ├─ Province: [▼ Select Province]          │
│ ├─ Renewal Cycle: (•) Monthly             │
│ │                 ( ) Quarterly           │
│ │                 ( ) Yearly              │
│ └─ Duration: [1] months                   │
│                                            │
│ If API Package:                           │
│ └─ API Calls: [1000] calls                │
│    Price: 100,000 VND                     │
├────────────────────────────────────────────┤
│ Step 3: Summary                           │
│ Dataset: Hanoi EV Stations                │
│ Type: One-Time Purchase                   │
│ License: Research                         │
│ Period: 2025-01-01 to 2025-12-31         │
│ ──────────────────────────────────        │
│ Subtotal: 2,500 VND                       │
│ Tax (0%): 0 VND                           │
│ Total: 2,500 VND                          │
│                                            │
│ [← Back] [Proceed to Payment →]           │
└────────────────────────────────────────────┘

Backend Flow:
1. POST /api/purchases/onetime → get otpId
2. POST /api/payments/create → get checkoutUrl
3. Redirect to checkoutUrl (PayOS)
```

---

## 6️⃣ Thanh toán (PayOS)

### Backend Endpoints:
```
POST /api/payments/create           → Create payment + checkout URL
GET  /api/payments/my               → Payment history
GET  /api/payments/{id}/check-status → Manual status check
GET  /api/payments/callback         → PayOS redirect back
POST /api/payments/webhook          → PayOS webhook
```

### Frontend Pages cần:

#### **`/payment/processing` - Payment Processing**
```tsx
After click "Proceed to Payment":

1. Create payment
2. Get checkoutUrl
3. Redirect to PayOS:
   window.location.href = checkoutUrl
```

#### **`/payment/success` - Payment Success**
```tsx
URL: /payment/success?orderId=xxx&paymentId=xxx

UI Layout:
┌────────────────────────────────────────────┐
│           ✅ Payment Successful!           │
│                                            │
│ Order ID: 1761493699                       │
│ Amount: 10,000 VND                         │
│ Status: Completed                          │
├────────────────────────────────────────────┤
│ What's next?                               │
│ Your purchase is ready!                    │
│                                            │
│ [📥 Download Dataset]                      │
│ [📋 View My Purchases]                     │
│ [🏠 Back to Home]                          │
└────────────────────────────────────────────┘

Optional: Auto check status if pending
- Call /api/payments/{id}/check-status
- Update purchase status
```

#### **`/payment/failed` - Payment Failed**
```tsx
UI: Similar to success but with error message
Actions:
- [Try Again]
- [Contact Support]
- [Back to Home]
```

---

## 7️⃣ Consumer download & view data

### Backend Endpoints:
```
GET /api/datasets/my-purchases      → Datasets đã mua
GET /api/datasets/{id}/download     → Download CSV file
GET /api/datasets/{id}/records      → View records online (paginated)
```

### Frontend Pages cần:

#### **`/consumer/purchases` - My Purchases**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ My Purchases                               │
│ Tabs: [One-Time (3)] [Subscriptions (1)]  │
│       [API Packages (0)]                   │
├────────────────────────────────────────────┤
│ One-Time Purchases:                        │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ Hanoi EV Charging Stations         │   │
│ │ ├─ Purchased: 2025-10-26           │   │
│ │ ├─ License: Research               │   │
│ │ ├─ Valid: 2025-01-01 to 12-31     │   │
│ │ ├─ Downloads: 2/5 remaining        │   │
│ │ ├─ Status: ✅ Completed            │   │
│ │ └─ Actions:                        │   │
│ │    [📥 Download CSV]               │   │
│ │    [👁 View Online]                │   │
│ └────────────────────────────────────┘   │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ HCMC Traffic Data                  │   │
│ │ ├─ Status: ⏳ Pending Payment      │   │
│ │ └─ [🔄 Check Payment Status]       │   │
│ └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

#### **`/consumer/dataset/:id/view` - View Dataset Online**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Hanoi EV Charging Stations - Data View    │
│ [📥 Download Full CSV] [← Back]           │
├────────────────────────────────────────────┤
│ Search: [🔍] Filter by column: [▼]        │
├────────────────────────────────────────────┤
│ Data Table:                                │
│ ┌──────┬──────────┬──────────┬────────┐  │
│ │ Row  │Latitude  │Longitude │ Power  │  │
│ ├──────┼──────────┼──────────┼────────┤  │
│ │  1   │ 21.0285  │105.8542  │ 50kW   │  │
│ │  2   │ 21.0293  │105.8551  │ 100kW  │  │
│ │ ...  │ ...      │ ...      │ ...    │  │
│ └──────┴──────────┴──────────┴────────┘  │
│                                            │
│ Showing 1-100 of 1,500 records            │
│ [< Prev] [1] [2] [3] ... [15] [Next >]    │
└────────────────────────────────────────────┘

Backend API:
- GET /api/datasets/{id}/records?page=1&pageSize=100
- Returns paginated JSON records
```

---

## 8️⃣ Admin quản lý revenue & payout

### Backend Endpoints:
```
GET  /api/payouts/providers         → Provider payouts
GET  /api/payouts/admin             → Admin revenue summary
POST /api/payouts                   → Create payout for provider
```

### Frontend Pages cần:

#### **`/admin/dashboard` - Admin Dashboard**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Admin Dashboard                            │
│                                            │
│ Stats Cards:                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │1000  │ │ 500  │ │ 10   │ │ 10M  │      │
│ │Users │ │Datasets│Pending│Revenue│      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
├────────────────────────────────────────────┤
│ Revenue Overview (Chart):                  │
│ Line chart showing revenue over time      │
├────────────────────────────────────────────┤
│ Quick Actions:                             │
│ [Review Datasets (10)]                     │
│ [Process Payouts (5 pending)]             │
│ [Manage Pricing Tiers]                    │
└────────────────────────────────────────────┘
```

#### **`/admin/payouts` - Payout Management**
```tsx
UI Layout:
┌────────────────────────────────────────────┐
│ Payout Management                          │
│ Tabs: [Providers] [Admin Revenue]         │
├────────────────────────────────────────────┤
│ Provider Payouts:                          │
│                                            │
│ Table:                                     │
│ Provider | Total Sales | Provider Share | │
│          |             | (70%)           | │
│          | Admin Share | Payout Status  | │
│          | (30%)       |                 | │
│ ─────────────────────────────────────────│
│ EV Corp  | 1,000,000  | 700,000         | │
│          | 300,000    | ⏳ Pending       | │
│          | [Process Payout] Button      | │
│                                            │
│ ABC Data | 500,000    | 350,000         | │
│          | 150,000    | ✅ Paid Oct 15   | │
└────────────────────────────────────────────┘

Payout Modal:
- Provider name
- Amount to pay
- Payout method (Bank transfer, etc.)
- Confirm button
```

---

## 📱 Responsive Design Requirements

### Mobile View Adjustments:

#### Home Page
- Stack hero vertically
- 2-column category grid
- Vertical dataset cards

#### Catalog
- Move filters to slide-out drawer
- Single column layout
- Sticky search bar

#### Checkout
- Vertical stepper
- Full-width form fields
- Fixed bottom payment button

#### Provider Dashboard
- Stack stats cards 2x2
- Swipeable dataset list
- Mobile-optimized upload

---

## 🎨 Component Library cần tạo

### Reusable Components:

#### 1. **DatasetCard.tsx**
```tsx
Props:
- dataset: DatasetDto
- showProvider: boolean
- showPrice: boolean
- onViewDetails: () => void
- onPurchase?: () => void (if not purchased)
- onDownload?: () => void (if purchased)
```

#### 2. **PurchaseTypeSelector.tsx**
```tsx
Props:
- selectedType: 'onetime' | 'subscription' | 'api'
- pricingTier: PricingTierDto
- datasetSize: number
- onChange: (type) => void
```

#### 3. **PaymentStatusBadge.tsx**
```tsx
Props:
- status: 'Pending' | 'Completed' | 'Failed'

Colors:
- Pending: Yellow
- Completed: Green
- Failed: Red
```

#### 4. **DataTable.tsx**
```tsx
Props:
- records: any[]
- columns: string[]
- page: number
- totalPages: number
- onPageChange: (page) => void
```

#### 5. **FileUploadZone.tsx**
```tsx
Props:
- accept: string (.csv, .xlsx)
- maxSize: number (50MB)
- onFileSelect: (file) => void
- preview: boolean

Features:
- Drag & drop
- File validation
- Preview uploaded file
```

#### 6. **StatCard.tsx**
```tsx
Props:
- title: string
- value: number | string
- icon: ReactNode
- color: string
- trend?: number (% change)
```

---

## 🔄 Data Flow Examples

### Example 1: Consumer mua dataset

```
User Action Flow:
1. Browse catalog → Click dataset
2. View details → Click "Purchase"
3. Select purchase type → Fill form
4. Click "Proceed to Payment"
5. Redirected to PayOS → Pay
6. Redirected back → Success page
7. Download dataset

API Calls:
GET /api/datasets                    (Browse)
GET /api/datasets/{id}               (View details)
POST /api/purchases/onetime          (Create purchase) → otpId
POST /api/payments/create            (Create payment) → checkoutUrl
→ Redirect to PayOS
→ PayOS redirects to /api/payments/callback
→ Frontend redirects to /payment/success
GET /api/payments/{id}/check-status  (Verify)
GET /api/datasets/{id}/download      (Download)
```

### Example 2: Provider upload dataset

```
User Action Flow:
1. Provider dashboard → Upload new
2. Fill form + upload CSV file
3. Submit → Pending moderation
4. Wait for moderator approval
5. Approved → Dataset listed

API Calls:
POST /api/datasets (multipart/form-data)
→ File uploaded + CSV parsed
→ Records saved to database
→ Dataset status: Pending

Moderator:
GET /api/moderation/pending
POST /api/moderation/{id}/approve
→ Dataset status: Approved
→ Listed on public catalog
```

---

## 🎯 Implementation Roadmap

### Week 1: Public Pages + Auth ✅
- [x] Login page - API integrated
- [ ] Home page - Load from API
- [ ] Catalog page - Search & filter
- [ ] Dataset detail - Show full info

### Week 2: Consumer Flow
- [ ] Checkout page - 3 purchase types
- [ ] Payment integration - PayOS redirect
- [ ] Success/Failed pages
- [ ] My Purchases - List với actions
- [ ] Download/View dataset

### Week 3: Provider Flow
- [ ] Provider dashboard - Stats + datasets
- [ ] Upload dataset - Form + file upload
- [ ] Edit dataset - If pending
- [ ] View earnings - Revenue from sales

### Week 4: Admin Flow  
- [ ] Admin dashboard - System stats
- [ ] Moderation page - Approve/reject
- [ ] Pricing management - CRUD tiers
- [ ] Payout management - Process payouts

---

## 🎨 Design System

### Typography
```
Headings: font-bold
- H1: text-4xl (36px)
- H2: text-3xl (30px)
- H3: text-2xl (24px)
- H4: text-xl (20px)

Body: font-normal
- Large: text-lg (18px)
- Base: text-base (16px)
- Small: text-sm (14px)
```

### Spacing
```
Section padding: py-16 (64px)
Card padding: p-6 (24px)
Element margin: mb-4 (16px)
Grid gap: gap-6 (24px)
```

### Buttons
```
Primary: bg-blue-600 hover:bg-blue-700
Secondary: bg-gray-200 hover:bg-gray-300
Success: bg-green-600 hover:bg-green-700
Danger: bg-red-600 hover:bg-red-700

Sizes:
- Small: px-3 py-1.5 text-sm
- Medium: px-4 py-2 text-base
- Large: px-6 py-3 text-lg
```

---

## 📋 Component Checklist

### Shared Components (src/components/shared/)
- [ ] DatasetCard.tsx
- [ ] PurchaseCard.tsx
- [ ] PaymentStatusBadge.tsx
- [ ] StatCard.tsx
- [ ] DataTable.tsx
- [ ] FileUploadZone.tsx
- [ ] Modal.tsx
- [ ] Toast.tsx
- [ ] LoadingSpinner.tsx
- [ ] EmptyState.tsx

### Layout Components (src/components/layout/)
- [ ] Header.tsx (với role-based navigation)
- [ ] Footer.tsx
- [ ] Sidebar.tsx (cho dashboard pages)
- [ ] PageContainer.tsx

### Form Components (src/components/forms/)
- [ ] PurchaseForm.tsx
- [ ] DatasetUploadForm.tsx
- [ ] PricingTierForm.tsx
- [ ] SearchBar.tsx
- [ ] FilterPanel.tsx

---

## ✅ Summary

**Backend:** ✅ Complete với 7 core flows  
**Frontend API:** ✅ Integrated  
**Design Plan:** ✅ Mapped tất cả pages cần thiết  

**Bước tiếp theo:**
1. Tạo shared components
2. Implement Home page
3. Implement Catalog page
4. Implement complete Consumer flow
5. Implement Provider flow
6. Implement Admin flow

---

Bạn muốn bắt đầu implement page nào trước? 🚀

Đề xuất ưu tiên:
1. **Home + Catalog** - Tạo ấn tượng đầu
2. **Consumer Checkout** - Critical cho business
3. **Provider Upload** - Cần có data để test

