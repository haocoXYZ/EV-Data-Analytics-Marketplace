# Frontend Changelog

## [2.0.0] - 2025-11-03

### 🎉 Major Release - Complete Frontend Rebuild

Complete rewrite of frontend to align with new backend architecture (3 purchase types model).

---

### ✨ Added

#### New Pages
- **DataPackagePurchase** (`/buy-data`) - Location-based data purchase with preview
- **SubscriptionDashboard** (`/subscriptions/:id/dashboard`) - Real-time analytics dashboard
- **APIPackageKeys** (`/api-packages/:id/keys`) - API key management
- **PaymentSuccess** (`/payment-success`) - Payment verification page
- **PaymentFailed** (`/payment-failed`) - Payment failure page

#### New API Modules
- `api/subscriptions.ts` - Dashboard and chart data endpoints
- `api/apiKeys.ts` - API key generation and management

#### New Types
- `DataPackagePurchase` - Location-based purchase type
- `SubscriptionPackagePurchase` - Subscription with dashboard
- `APIPackagePurchase` - API credits purchase
- `SystemPricing` - System-wide pricing configuration
- `DataPackagePreview` - Preview before purchase
- `APIKey` - API key management
- `SubscriptionDashboardData` - Dashboard analytics
- `ChartDataPoint` - Chart data structure

---

### 🔄 Changed

#### Complete Rewrites
- **MyPurchases.tsx** - Now displays 3 tabs (Data/Subscription/API packages)
- **AdminPricing.tsx** - SystemPricing management (3 configs)
- **ModeratorReview.tsx** - Paginated preview, approve/reject workflow
- **Home.tsx** - Location-based purchasing focus
- **Catalog.tsx** - Browse-only mode with location purchase CTA
- **DatasetDetail.tsx** - Information display without direct purchase
- **Login.tsx** - Fixed demo credentials

#### Major Updates
- **ProviderNew.tsx** - CSV template download, correct FormData fields
- **ProviderDashboard.tsx** - Updated to show rowCount, moderationStatus
- **types/index.ts** - Complete rewrite for new backend model

#### API Client Updates
- **datasets.ts** - Fixed `/my-datasets` endpoint, added template download
- **purchases.ts** - 3 package types (Data/Subscription/API)
- **payments.ts** - Changed `checkStatus` to `getStatus`
- **moderation.ts** - PUT approve/reject, paginated preview
- **pricing.ts** - SystemPricing endpoints

---

### ❌ Removed

#### Deprecated Types
- `OneTimePurchaseRequest` - Replaced with DataPackagePurchaseRequest
- `PricingTier` - Replaced with SystemPricing
- `PricingTierCreate` - No longer needed

#### Removed API Functions
- `datasets.download()` - Use purchases.downloadDataPackage()
- `datasets.getRecords()` - Use moderation preview or purchase
- `datasets.getMyPurchases()` - Use purchases.getMy()
- `datasets.getMySubscriptions()` - Use purchases.getMySubscriptions()
- `datasets.getMyAPIPackages()` - Use purchases.getMyAPIPackages()
- `pricing.create()` - SystemPricing is predefined
- `pricing.delete()` - SystemPricing cannot be deleted
- `payments.getMy()` - Not yet implemented on backend

#### Removed Fields
From Dataset type:
- `tierName` - No longer using pricing tiers
- `basePricePerMb` - No per-dataset pricing
- `dataSizeMb` - Using rowCount instead

---

### 🐛 Fixed

- ✅ Dataset upload now uses `CsvFile` field name (not `file`)
- ✅ Moderation preview uses pagination (page/pageSize) not sampleSize
- ✅ Payment success uses correct endpoint (`/payments/{id}/status`)
- ✅ Demo login credentials match backend test accounts
- ✅ All API endpoints aligned with backend routes

---

### 🔧 Backend Changes

- ✅ Added `GET /api/moderation/{id}/download` endpoint
- ✅ ModerationController now supports CSV download for review

---

## Migration Guide

### For Developers

**Before:**
```typescript
// Old purchase flow
const purchase = await purchasesApi.createOneTime({
  datasetId: 123,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  licenseType: 'Standard'
})
```

**After:**
```typescript
// New purchase flow
const preview = await purchasesApi.previewDataPackage({
  provinceId: 1,
  districtId: 1,
  startDate: '2024-01-01',
  endDate: '2024-12-31'
})

const purchase = await purchasesApi.createDataPackage({
  provinceId: 1,
  districtId: 1,
  startDate: '2024-01-01',
  endDate: '2024-12-31'
})

const payment = await paymentsApi.create({
  paymentType: 'DataPackage',
  referenceId: purchase.purchaseId
})

// Redirect to payment.checkoutUrl
window.location.href = payment.checkoutUrl
```

### For Users

**Consumer Changes:**
- Data is now purchased by location (province/district), not individual datasets
- 3 purchase options: Data Package (CSV), Subscription (dashboard), API (programmatic)
- Payment flow: Select location → Preview → Purchase → PayOS → Download

**Provider Changes:**
- Upload datasets via CSV template (download at /provider/new)
- FormData field name changed to `CsvFile`
- Datasets show moderation status (Pending/Approved/Rejected)

**Admin Changes:**
- Pricing is now SystemPricing (3 configs: DataPackage, SubscriptionPackage, APIPackage)
- No create/delete, only update and toggle active
- Commission percentages must sum to 100%

**Moderator Changes:**
- Preview now uses pagination (50 records per page)
- Download CSV for offline review
- Approve/Reject with comments

---

## Routes Changed

### New Routes
- `/buy-data` - Data package purchase page
- `/payment-success` - Payment success with verification
- `/payment-failed` - Payment failure page
- `/subscriptions/:subscriptionId/dashboard` - Subscription dashboard
- `/api-packages/:purchaseId/keys` - API key management

### Removed Routes
- None (kept for backward compatibility)

---

## Dependencies

No new dependencies added. All features built with existing stack:
- React 19
- TypeScript
- Tailwind CSS
- React Router
- Axios

**Optional future additions:**
- Chart.js or Recharts for better visualizations
- React Query for better data fetching
- Zustand for global state management

---

## Breaking Changes

⚠️ **IMPORTANT:** This is a breaking change. Frontend v2.0.0 requires backend v2.0.0+

1. **API Endpoints Changed:**
   - `/datasets/my` → `/datasets/my-datasets`
   - `/payments/{id}/check-status` → `/payments/{id}/status`
   - `/moderation/review` (POST) → `/moderation/{id}/approve` (PUT) or `/moderation/{id}/reject` (PUT)

2. **Types Removed:**
   - `OneTimePurchaseRequest`
   - `PricingTier`
   - Old `Purchase` type

3. **Purchase Flow Completely Changed:**
   - No more per-dataset purchases
   - All purchases are location-based or package-based

---

## Testing

All changes tested manually with backend v2.0.0.

### Test Coverage
- ✅ Consumer: Data package purchase flow
- ✅ Consumer: Subscription dashboard
- ✅ Consumer: API key management
- ✅ Provider: Dataset upload with CSV
- ✅ Moderator: Dataset review and approval
- ✅ Admin: SystemPricing management
- ✅ Payment flow: PayOS integration

### Known Issues
- None

---

## Contributors

- AI Assistant (Amp/Claude) - Complete implementation

---

## Next Version Preview

**Planned for v2.1.0:**
- [ ] Add charting library (Chart.js)
- [ ] Implement pagination for catalog
- [ ] Add location endpoints to avoid hardcoding
- [ ] Global error boundary
- [ ] Subscription auto-renewal
- [ ] Payment history page

---

**Full Documentation:** See [FRONTEND_IMPLEMENTATION_COMPLETE.md](./FRONTEND_IMPLEMENTATION_COMPLETE.md)
