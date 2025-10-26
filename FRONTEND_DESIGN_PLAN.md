# Frontend Design Plan - Based on Backend Analysis

## 🎯 Backend Analysis Summary

### Backend có sẵn:
1. **4 User Roles**: Admin, Moderator, DataProvider, DataConsumer
2. **3 Purchase Types**: One-Time, Subscription, API Package
3. **Payment Integration**: PayOS với callback/webhook
4. **Dataset Management**: Upload CSV, moderation workflow, download
5. **Revenue System**: Auto revenue share, payout tracking

---

## 📋 Frontend Pages cần thiết (Based on Backend)

### 🏠 Public Pages (Không cần login)

#### 1. **Home Page** (`/`)
**Backend Support:**
- `GET /api/datasets` - Featured datasets (approved only)
- Categories: Charging Stations, Energy Consumption, Traffic Data, etc.

**UI Components cần:**
- Hero section với search bar
- Featured datasets carousel
- Categories grid
- Stats counter (total datasets, providers, consumers)
- Call-to-action buttons

#### 2. **Catalog Page** (`/catalog`)
**Backend Support:**
- `GET /api/datasets?category={cat}&search={query}`
- Filter by category, search by keywords

**UI Components cần:**
- Search & filter sidebar (category, price range, data format)
- Dataset cards grid with pagination
- Sort options (newest, popular, price)
- Loading states
- Empty state

#### 3. **Dataset Detail Page** (`/dataset/:id`)
**Backend Support:**
- `GET /api/datasets/{id}` - Chi tiết dataset
- `GET /api/pricingtiers` - Pricing info

**UI Components cần:**
- Dataset info (name, description, category, size, format, upload date)
- Provider info (company name, website)
- Pricing tiers tabs (One-Time, Subscription, API)
- Sample data preview (nếu có)
- Purchase/Login button
- Download history (if purchased)

#### 4. **Login Page** (`/login`) ✅ Done
#### 5. **Register Page** (`/register`)
**Backend Support:**
- `POST /api/auth/register` - Register DataProvider or DataConsumer

**UI Components cần:**
- Role selection (Provider vs Consumer)
- Form fields based on role:
  - Provider: fullName, email, password, companyName, companyWebsite
  - Consumer: fullName, email, password, organizationName

---

### 👤 Consumer Pages (`/consumer/*`)

#### 1. **Consumer Dashboard** (`/consumer/dashboard` or `/`)
**Backend Support:**
- `GET /api/datasets/my-purchases` - Purchased datasets
- `GET /api/payments/my` - Payment history
- `GET /api/purchases/my/onetime` - One-time purchases
- `GET /api/purchases/my/subscriptions` - Active subscriptions

**UI Sections:**
```
┌─────────────────────────────────────┐
│ Welcome Back, {Name}                │
│ Quick Stats:                        │
│ - 5 Datasets Purchased              │
│ - 2 Active Subscriptions            │
│ - 10,000 API Calls Remaining        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ My Purchased Datasets               │
│ [Dataset Card] [Dataset Card]       │
│ - Download button                   │
│ - View records button               │
│ - Download count: 2/5               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Recent Transactions                 │
│ Date | Dataset | Amount | Status    │
└─────────────────────────────────────┘
```

#### 2. **My Purchases Page** (`/consumer/purchases`)
**Backend Support:**
- `GET /api/purchases/my/onetime`
- `GET /api/purchases/my/subscriptions`
- `GET /api/purchases/my/api`

**UI Components:**
- Tabs: One-Time | Subscriptions | API Packages
- Purchase cards with:
  - Dataset name
  - Purchase date, expiry date
  - Price, license type
  - Download/Access button
  - Download count (X/5)

#### 3. **Checkout Page** (`/checkout/:datasetId`)
**Backend Flow:**
1. User selects dataset → choose purchase type
2. `POST /api/purchases/onetime` → get purchaseId
3. `POST /api/payments/create` → get checkoutUrl
4. Redirect to PayOS → thanh toán
5. PayOS redirects back → check payment status
6. Show success/failure

**UI Sections:**
```
┌─────────────────────────────────────┐
│ Checkout - {Dataset Name}           │
├─────────────────────────────────────┤
│ 1. Select Purchase Type:            │
│    ( ) One-Time Purchase            │
│    ( ) Subscription                 │
│    ( ) API Package                  │
├─────────────────────────────────────┤
│ 2. Configure Purchase:              │
│    [Based on type selected]         │
│    - One-Time: Date range, license  │
│    - Subscription: Province, cycle  │
│    - API: Number of calls           │
├─────────────────────────────────────┤
│ 3. Price Summary:                   │
│    Subtotal: 100,000 VND            │
│    Tax: 0 VND                       │
│    Total: 100,000 VND               │
│                                     │
│    [Proceed to Payment] Button      │
└─────────────────────────────────────┘
```

#### 4. **Payment Success Page** (`/payment/success`)
**Backend Support:**
- `GET /api/payments/{id}/check-status` - Verify payment

**UI:**
- Success animation
- Order summary
- Download button
- Back to purchases button

#### 5. **Download Dataset Page** (`/consumer/dataset/:id`)
**Backend Support:**
- `GET /api/datasets/{id}/download` - Download CSV
- `GET /api/datasets/{id}/records?page=1&pageSize=100` - View online

**UI Options:**
```
[Download Full CSV] [View Online]

If View Online:
- Data table with pagination
- Export options
- Filter/Search within data
```

---

### 🏢 Provider Pages (`/provider/*`)

#### 1. **Provider Dashboard** (`/provider/dashboard`)
**Backend Support:**
- `GET /api/datasets/my` - My datasets
- `GET /api/payouts/provider/{id}` - My earnings & payouts

**UI Sections:**
```
┌─────────────────────────────────────┐
│ Welcome, {Company Name}             │
│ Quick Stats:                        │
│ - 10 Datasets Uploaded              │
│ - 5 Approved, 2 Pending, 3 Active   │
│ - Total Revenue: 1,000,000 VND      │
│ - Pending Payout: 500,000 VND       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ My Datasets                         │
│ [+ Upload New Dataset]              │
│                                     │
│ Dataset List:                       │
│ - Name, Category, Size              │
│ - Status: Pending/Approved/Rejected │
│ - Edit/Delete buttons (if pending)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Revenue & Payouts                   │
│ Month | Revenue | Payout | Status   │
└─────────────────────────────────────┘
```

#### 2. **Upload Dataset Page** (`/provider/upload`)
**Backend Support:**
- `POST /api/datasets` - Upload with file (multipart/form-data)

**UI Form:**
```
Dataset Information:
- Name* (text)
- Description (textarea)
- Category* (dropdown)
- Pricing Tier* (dropdown from /api/pricingtiers)
- Data Format (CSV/Excel - auto-detect)

Upload File:
- [Drag & Drop or Browse]
- Max size: 50MB
- Accepted: .csv, .xlsx

[Submit for Review] Button
```

#### 3. **Dataset Edit Page** (`/provider/dataset/:id/edit`)
**Backend Support:**
- `PUT /api/datasets/{id}` - Update (only if pending)

**UI:**
- Same form as upload
- Can only edit if status = Pending
- Show moderation comments if rejected

---

### 👨‍💼 Admin/Moderator Pages (`/admin/*`)

#### 1. **Admin Dashboard** (`/admin/dashboard`)
**Backend Support:**
- Statistics from multiple endpoints

**UI Sections:**
```
┌─────────────────────────────────────┐
│ System Overview                     │
│ - Total Users: 1000                 │
│ - Total Datasets: 500               │
│ - Pending Moderation: 10            │
│ - Total Revenue: 10M VND            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Quick Actions                       │
│ [Review Datasets] [Manage Pricing]  │
│ [Process Payouts] [View Users]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Recent Activities                   │
│ Timeline of recent actions          │
└─────────────────────────────────────┘
```

#### 2. **Moderation Page** (`/admin/moderation`)
**Backend Support:**
- `GET /api/moderation/pending` - Datasets cần review
- `POST /api/moderation/{id}/approve`
- `POST /api/moderation/{id}/reject`

**UI:**
```
Pending Datasets:

[Dataset Card]
- Preview dataset info
- View uploaded file
- Provider info
- [Approve] [Reject] buttons
- Comment field for rejection
```

#### 3. **Pricing Management Page** (`/admin/pricing`)
**Backend Support:**
- `GET /api/pricingtiers`
- `POST /api/pricingtiers`
- `PUT /api/pricingtiers/{id}`
- `DELETE /api/pricingtiers/{id}`

**UI:**
```
Pricing Tiers:

[+ Add New Tier]

Tier List:
- Tier Name
- Base Price/MB
- API Price/Call
- Subscription Price/Region
- Provider Commission: 70%
- Admin Commission: 30%
- Status: Active/Inactive
- [Edit] [Delete] buttons
```

#### 4. **Payout Management Page** (`/admin/payouts`)
**Backend Support:**
- `GET /api/payouts/providers` - Provider payouts
- `GET /api/payouts/admin` - Admin revenue
- `POST /api/payouts` - Create payout

**UI:**
```
Provider Payouts:

Filter: [All | Pending | Completed]

Provider List:
- Company Name
- Total Sales
- Provider Share (70%)
- Admin Share (30%)
- Payout Status
- [Process Payout] button
```

---

## 🎨 UI/UX Design Principles

### Color Scheme (EV Theme)
```
Primary: Blue (#2563EB) - Trust, Technology
Secondary: Green (#10B981) - Energy, Sustainability  
Accent: Purple (#8B5CF6) - Innovation
Neutral: Gray (#6B7280) - Content

Success: #10B981
Warning: #F59E0B
Error: #EF4444
```

### Layout Structure
```
┌────────────────────────────────────────┐
│ Header: Logo | Nav | User Menu         │
├────────────────────────────────────────┤
│                                        │
│ Main Content Area                      │
│ (Responsive grid/flex)                 │
│                                        │
├────────────────────────────────────────┤
│ Footer: Links | Social | Copyright     │
└────────────────────────────────────────┘
```

### Component Library Needed
1. **DatasetCard** - Display dataset preview
2. **PurchaseCard** - Show purchase history
3. **PaymentStatus** - Show payment progress
4. **DataTable** - Display CSV data
5. **FileUpload** - Drag & drop upload
6. **StatCard** - Dashboard statistics
7. **Modal** - For confirmations
8. **Toast** - For notifications

---

## 🔄 User Flows

### Consumer Flow: Mua Dataset
```
Home → Browse Catalog → Dataset Detail
  → Login (if not logged in)
  → Select Purchase Type
  → Checkout
  → PayOS Payment
  → Success → Download
```

### Provider Flow: Upload Dataset
```
Provider Dashboard → Upload New
  → Fill Form + Upload File
  → Submit
  → Pending Moderation
  → (Wait for approval)
  → Approved → Listed on Catalog
```

### Admin Flow: Review Dataset
```
Admin Dashboard → Moderation
  → View Pending Dataset
  → Review Info + File
  → Approve/Reject with comments
  → Dataset status updated
```

---

## 📦 State Management Strategy

### Option 1: Context API (Current)
```typescript
AuthContext - User authentication ✅
DatasetContext - Dataset state
PurchaseContext - Purchase state
CartContext - Shopping cart (optional)
```

### Option 2: React Query (Recommended)
```typescript
// Better for API calls
useQuery('datasets', api.datasets.getAll)
useMutation(api.purchases.createOneTime)
```

---

## 🚀 Implementation Priority

### Phase 1: Core Features (Week 1)
- [x] Login page ✅
- [ ] Home page with featured datasets
- [ ] Catalog with search/filter
- [ ] Dataset detail page

### Phase 2: Consumer Flow (Week 2)
- [ ] Checkout flow (3 purchase types)
- [ ] PayOS payment integration
- [ ] My purchases page
- [ ] Download dataset

### Phase 3: Provider Flow (Week 3)
- [ ] Provider dashboard
- [ ] Upload dataset with CSV
- [ ] Edit dataset (if pending)
- [ ] View earnings

### Phase 4: Admin Flow (Week 4)
- [ ] Admin dashboard
- [ ] Moderation page
- [ ] Pricing management
- [ ] Payout management

---

## 📱 Responsive Design

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Mobile-First Components
- Hamburger menu for navigation
- Stacked cards instead of grid
- Touch-friendly buttons (min 44x44px)
- Bottom navigation for main actions

---

## 🔐 Security Considerations

### Frontend
- Store JWT token securely (HttpOnly cookie hoặc localStorage with XSS protection)
- Validate all inputs
- Sanitize user-generated content
- HTTPS only in production

### API Integration
- Always include Authorization header
- Handle 401 (redirect to login)
- Handle 403 (show permission error)
- Retry logic for network errors

---

## 📊 Analytics & Monitoring

### Track User Actions
- Page views
- Dataset views
- Purchase completions
- Payment success/failure rates
- Download counts

---

## ✅ Checklist for Each Page

```markdown
- [ ] Connect to backend API
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Mobile responsive
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] SEO (meta tags, descriptions)
- [ ] Performance (lazy loading, code splitting)
```

---

## 🎯 Next Steps

1. **Create reusable components** (DatasetCard, etc.)
2. **Setup React Query** for better API state management
3. **Implement Home page** - Load featured datasets
4. **Implement Catalog page** - Search & filter
5. **Implement Checkout flow** - 3 purchase types + PayOS

---

**Ready to start implementation!** 🚀

Bạn muốn bắt đầu với page nào trước? Tôi đề xuất:
1. **Home page** - Tạo ấn tượng đầu tiên tốt
2. **Catalog page** - Core functionality
3. **Checkout flow** - Critical for revenue

