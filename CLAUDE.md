# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EV Data Analytics Marketplace is a full-stack web application for buying and selling electric vehicle charging station data. Providers upload structured EV charging data (stored directly in database), Moderators review datasets, and Consumers purchase data through three package types: Data Packages (buy by location), Subscription Packages (real-time dashboard access), and API Packages (programmatic access).

**Stack:**
- Backend: .NET 8.0 Web API, Entity Framework Core, SQL Server
- Frontend: React 19, TypeScript, Vite, TailwindCSS, React Router, Axios
- Auth: JWT with role-based access control (Admin, Moderator, DataProvider, DataConsumer)
- Payment: PayOS integration with automatic revenue sharing
- Data Storage: All data in database (no file storage)

## Common Commands

### Backend (.NET API)

```bash
cd backend/EVDataMarketplace.API

# Restore dependencies
dotnet restore

# Run the API (starts on http://localhost:5258)
dotnet run

# Build (check for errors)
dotnet build

# Create new migration (after modifying models)
dotnet ef migrations add MigrationName

# Apply migrations to database
dotnet ef database update

# Drop and recreate database (WARNING: deletes all data)
dotnet ef database drop --force
dotnet ef database update

# View Swagger documentation
# Navigate to http://localhost:5258/swagger after starting the API
```

**Important Notes:**
- Database auto-migrates and seeds on startup via `Program.cs`
- Connection string in `appsettings.json`: `Server=localhost;Database=EVDataMarketplace;User=sa;Password=12345`
- Dataset files are NOT stored on disk - all records stored in `DatasetRecords` table

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Run development server (starts on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Running the Full Stack

1. Start backend: `cd backend/EVDataMarketplace.API && dotnet run`
2. Start frontend: `cd frontend && npm run dev`
3. Access frontend at http://localhost:5173
4. Access Swagger docs at http://localhost:5258/swagger

## Architecture

### Backend Architecture

**Layers:**
- **Controllers**: API endpoints (AuthController, DatasetsController, DataPackageController, SubscriptionPackageController, APIPackageController, PurchasesController, PaymentsController, ModerationController, PayoutsController, PricingController)
- **Services**: Business logic (AuthService, PayOSService, CsvParserService)
- **Repositories**: Data access layer (generic repository pattern)
- **Models**: Entity models matching database schema
- **DTOs**: Data transfer objects for API requests/responses
- **Data**: DbContext and database seeding (EVDataMarketplaceDbContext, DbSeeder)

**Key Services:**
- `AuthService`: JWT token generation and validation
- `PayOSService`: Payment gateway integration with webhook handling
- `CsvParserService`: Parsing and validating CSV files with template, storing structured records in DatasetRecords table

**Important Architecture Changes (Jan 2025):**
- **No file storage**: All dataset records stored directly in database, no files on disk
- **Three package types**: DataPackage (location-based), SubscriptionPackage (real-time dashboard), APIPackage (API calls)
- **SystemPricing**: Single pricing table replacing PricingTier, controls revenue split percentages
- **District support**: 62 districts for Hanoi, HCMC, Danang for granular location filtering
- **Structured DatasetRecords**: Fixed schema with fields like station_id, energy_kwh, voltage, etc.

**Database Context:**
The application uses Entity Framework Core with SQL Server. The DbContext (`EVDataMarketplaceDbContext`) defines all entity relationships and indexes. Database seeding happens automatically on startup via `DbSeeder.SeedData()` in Program.cs.

**Authentication Flow:**
JWT tokens are issued by AuthController and validated via the JWT Bearer middleware configured in Program.cs. Tokens expire after 1440 minutes (24 hours). Role-based authorization uses the `[Authorize(Roles = "...")]` attribute.

### Frontend Architecture

**Routing:**
The app uses React Router with routes defined in `src/routes.tsx`. Routes are role-specific:
- Public: `/`, `/login`, `/catalog`, `/dataset/:id`
- Consumer: `/my-purchases`, `/checkout`, `/success`
- Provider: `/provider/dashboard`, `/provider/new`, `/provider/datasets`, `/provider/earnings`
- Admin/Moderator: `/admin/dashboard`, `/admin/pricing`, `/admin/payouts`, `/moderator/review`

**Layouts:**
Role-based layouts wrap pages and provide navigation:
- `SmartLayout`: Auto-selects layout based on user role
- `ConsumerLayout`: Header + footer for consumers
- `ProviderLayout`: Sidebar navigation for data providers
- `AdminLayout`: Sidebar for admin users
- `ModeratorLayout`: Sidebar for moderators

**State Management:**
- `AuthContext` (`src/contexts/AuthContext.tsx`): Global authentication state, user info, login/logout functions
- Local component state via React hooks
- User data and JWT token stored in localStorage

**API Integration:**
API client files in `src/api/`:
- `client.ts`: Axios instance with JWT token injection, 401 handling, and error responses
- `auth.ts`: Login and registration endpoints
- `datasets.ts`: Dataset CRUD, download CSV template, upload with CSV parsing
- `purchases.ts`: Creating all three purchase types (DataPackage, SubscriptionPackage, APIPackage)
- `payments.ts`: Payment creation with PayOS checkout, webhook handling, status checking
- `pricing.ts`: SystemPricing management (Admin only)
- `moderation.ts`: Dataset approval/rejection with preview and download
- `payouts.ts`: Revenue shares and payout management
- `index.ts`: Exports all API functions

**Note**: Frontend integration is partial - many components still use mock data. See `frontend/FRONTEND_BACKEND_INTEGRATION.md` for integration status.

**Base API URL:**
Configured via environment variable `VITE_API_URL` or defaults to `http://localhost:5258/api` (see `src/api/client.ts:4`).

### Database Schema

**Core Entities:**
- `User`: Base user account (role: Admin, Moderator, DataProvider, DataConsumer)
- `DataProvider`: Extended info for providers (company details, province_id)
- `DataConsumer`: Extended info for consumers (organization)
- `Dataset`: Uploaded datasets with metadata and moderation status (no pricing - admin controls via SystemPricing)
- `DatasetRecord`: Structured data records with fixed schema (station_id, energy_kwh, voltage, current, power_kw, duration_minutes, etc.)
- `SystemPricing`: Single pricing configuration per package type with revenue split percentages

**Purchase Types (New Model):**
- `DataPackagePurchase`: Buy data by province/district, merged CSV from multiple providers
- `SubscriptionPackagePurchase`: Subscribe to real-time dashboard for a region (province)
- `APIPackagePurchase`: Purchase API call credits with generated API keys

**Revenue Flow:**
- `Payment`: Consumer payments (linked via PaymentType: "DataPackage"/"SubscriptionPackage"/"APIPackage" and ReferenceId)
- `RevenueShare`: Automatic split based on SystemPricing percentages and data contribution
- `Payout`: Provider payouts by month

**Moderation:**
- `DatasetModeration`: Approval/rejection history for datasets

**Location:**
- `Province`: 63 Vietnamese provinces
- `District`: 62 districts (30 in Hanoi, 24 in HCMC, 8 in Danang)

**API Access:**
- `APIKey`: Generated keys for API package users (format: evdata_xxxxx)

**Key Relationships:**
- User 1-1 DataProvider or DataConsumer (role-based)
- Dataset belongs to DataProvider (moderation status required for visibility)
- DataPackagePurchase aggregates data from multiple providers by location
- Payment links to purchases via polymorphic PaymentType + ReferenceId
- RevenueShare calculated based on data contribution (row count for DataPackage, equal split for others)

### User Roles and Permissions

**Admin:**
- Full system access
- Manage pricing tiers (`/admin/pricing`)
- View all revenue and process payouts (`/admin/payouts`)
- System dashboard (`/admin/dashboard`)

**Moderator:**
- Review and approve/reject uploaded datasets (`/moderator/review`)
- Preview and download datasets for quality check
- Cannot manage pricing or payouts

**DataProvider:**
- Upload new datasets (`/provider/new`)
- View own datasets and earnings (`/provider/dashboard`)
- Receive payouts from platform

**DataConsumer:**
- Browse and purchase datasets (`/catalog`, `/dataset/:id`)
- View purchased data (`/my-purchases`)
- Download datasets, view paginated records, and access API

**Backend Role Mapping:**
The backend uses exact role strings: "Admin", "Moderator", "DataProvider", "DataConsumer". The frontend normalizes these for simplicity (see `AuthContext.tsx:104-106`).

## Important Implementation Details

### CSV Template and Upload Flow

**Template Download:**
- Providers download CSV template: `GET /api/datasets/template`
- Template includes headers and sample data for all required fields
- Template enforces structure: StationId, StationName, ProvinceId, DistrictId, ChargingTimestamp, EnergyKwh, etc.

**Dataset Upload Flow:**
1. Frontend sends multipart/form-data with CSV file + metadata to `POST /api/datasets`
2. `CsvParserService.ParseCsvAsync()` validates CSV structure:
   - Checks all required fields present
   - Validates ProvinceId and DistrictId exist in database
   - Parses dates, numbers with proper error handling
3. Parsed records stored directly in `DatasetRecords` table (NO file storage)
4. Dataset status set to "Active", moderation status "Pending"
5. Moderators can:
   - Preview paginated data: `GET /api/moderation/{id}/preview-data?page=1&pageSize=50`
   - Download full dataset as CSV: `GET /api/moderation/{id}/download`
   - Approve: `PUT /api/moderation/{id}/approve`
   - Reject: `PUT /api/moderation/{id}/reject`

**Important**: Files are NOT stored on disk. All data goes directly into structured database records.

### Payment Flow (Three Package Types)

**Step 1: Create Purchase**
Consumer creates one of three purchase types:
- `POST /api/data-packages/purchase` (ProvinceId, DistrictId, DateRange)
- `POST /api/subscription-packages/purchase` (ProvinceId, DurationMonths)
- `POST /api/api-packages/purchase` (NumberOfCalls)

Returns: purchaseId, totalPrice, status="Pending"

**Step 2: Create Payment**
- Frontend calls `POST /api/payments/create` with:
  ```json
  {
    "paymentType": "DataPackage",  // or "SubscriptionPackage" or "APIPackage"
    "referenceId": 123  // the purchase ID from step 1
  }
  ```
- Backend calculates amount from SystemPricing
- Returns PayOS checkout URL

**Step 3: PayOS Payment**
User redirects to PayOS, completes payment externally

**Step 4: Payment Callback**
After payment completion, PayOS redirects browser to `GET /api/payments/callback`:
1. Finds payment by orderCode
2. Updates Payment.Status to "Completed" (if code=00 and status=PAID)
3. Updates Purchase status to "Active"
4. Creates RevenueShare records:
   - **DataPackage**: Split by provider contribution (row count percentage)
   - **SubscriptionPackage**: Equal split among all providers in province
   - **APIPackage**: Equal split among all providers
5. Applies commission percentages from SystemPricing
6. Redirects user to frontend success/failure page

**Note:** For production with public URL, PayOS can also call `POST /api/payments/webhook` asynchronously. For localhost development, the callback endpoint handles the redirect flow.

### Revenue Sharing

Configured in `SystemPricing` table (3 rows, one per package type):
- `ProviderCommissionPercent`: Provider share (e.g., 70% for DataPackage)
- `AdminCommissionPercent`: Platform share (e.g., 30% for DataPackage)
- Current defaults:
  - DataPackage: 10 VNĐ/row, 70/30 split
  - SubscriptionPackage: 500,000 VNĐ/month, 60/40 split
  - APIPackage: 100 VNĐ/call, 65/35 split

**Revenue Distribution Logic:**

1. **DataPackage**: Proportional by contribution
   - Provider A contributes 600 rows (60%) → 60% of provider share
   - Provider B contributes 400 rows (40%) → 40% of provider share
   - Formula: `providerAmount = totalPrice × providerCommissionPercent × (rowCount / totalRows)`

2. **SubscriptionPackage**: Equal split
   - 3 providers in province → each gets 33.33% of provider share
   - Formula: `providerAmount = totalPrice × providerCommissionPercent / numberOfProviders`

3. **APIPackage**: Equal split
   - Formula: Same as SubscriptionPackage

On payment completion, `RevenueShare` records created for each provider. Monthly payouts aggregate RevenueShares via `GET /api/payouts`.

### Dataset Access Control

**Three Access Patterns:**

1. **DataPackage Purchase**
   - Consumer gets merged CSV from multiple providers
   - Download via `GET /api/data-packages/{purchaseId}/download`
   - Filters by ProvinceId, DistrictId, and DateRange specified at purchase
   - Returns combined data as single CSV file

2. **SubscriptionPackage Purchase**
   - Consumer gets dashboard access for real-time analytics
   - Dashboard endpoint: `GET /api/subscription-packages/{purchaseId}/dashboard`
   - Chart endpoints:
     - `GET /api/subscription-packages/{id}/charts/energy-over-time`
     - `GET /api/subscription-packages/{id}/charts/station-distribution`
     - `GET /api/subscription-packages/{id}/charts/peak-hours`
   - Aggregates data from all providers in subscribed province

3. **APIPackage Purchase**
   - Consumer generates API keys: `POST /api/api-packages/{purchaseId}/generate-key`
   - Public API endpoint: `GET /api/data?provinceId=1&districtId=5&startDate=...&endDate=...`
   - Requires header: `X-API-Key: evdata_xxxxx`
   - Tracks `APICallsUsed` against `TotalAPICalls` limit
   - Returns 429 when limit exceeded

**Moderation Preview (No Purchase Required):**
Moderators have special endpoints bypassing purchase requirements:
- `GET /api/moderation/{id}/preview-data?page=1&pageSize=50`: Preview paginated records
- `GET /api/moderation/{id}/download`: Download full dataset as CSV for quality check
- Restricted to Moderator role only

### CORS Configuration

Backend allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative dev server)

Configured in `appsettings.json` under `Cors.AllowedOrigins` (see Program.cs:25-35).

## API Endpoints Reference

### Authentication & User Management
```
POST   /api/auth/register         - Register new user (role required)
POST   /api/auth/login            - Login, returns JWT token
```

### Datasets (Provider)
```
GET    /api/datasets/template              - Download CSV template with sample data
POST   /api/datasets                       - Upload dataset with CSV file
GET    /api/datasets                       - List all approved datasets (public)
GET    /api/datasets/{id}                  - Get dataset details
GET    /api/datasets/my-datasets           - Provider's own datasets
```

### Data Packages (Consumer)
```
GET    /api/data-packages/preview          - Preview data before purchase (provinceId, districtId params)
POST   /api/data-packages/purchase         - Purchase data package by location
GET    /api/data-packages/{purchaseId}/download  - Download merged CSV from all providers
GET    /api/data-packages/my-purchases     - List consumer's data package purchases
```

### Subscription Packages (Consumer)
```
POST   /api/subscription-packages/purchase           - Subscribe to province dashboard
GET    /api/subscription-packages/{id}/dashboard     - Get real-time dashboard data
GET    /api/subscription-packages/{id}/charts/energy-over-time
GET    /api/subscription-packages/{id}/charts/station-distribution
GET    /api/subscription-packages/{id}/charts/peak-hours
POST   /api/subscription-packages/{id}/cancel        - Cancel subscription
GET    /api/subscription-packages/my-subscriptions   - List consumer's subscriptions
```

### API Packages (Consumer)
```
POST   /api/api-packages/purchase                - Purchase API call credits
POST   /api/api-packages/{id}/generate-key       - Generate API key
GET    /api/api-packages/{id}/keys               - List API keys for package
POST   /api/api-packages/keys/{keyId}/revoke     - Revoke API key
GET    /api/api-packages/my-packages             - List consumer's API packages
GET    /api/data                                  - Public API endpoint (requires X-API-Key header)
```

### Purchases (Consumer)
```
GET    /api/purchases/my-purchases        - All purchases (all types)
```

### Payments
```
POST   /api/payments/create              - Create payment with PayOS (paymentType, referenceId)
POST   /api/payments/webhook             - PayOS webhook callback (for production)
GET    /api/payments/callback            - PayOS callback after payment (browser redirect)
GET    /api/payments/{id}/status         - Check payment status
```

### Moderation
```
GET    /api/moderation/pending           - List pending datasets
GET    /api/moderation/all               - List all datasets (any status)
GET    /api/moderation/{id}              - Get dataset details
GET    /api/moderation/{id}/preview-data - Preview records (paginated)
GET    /api/moderation/{id}/download     - Download dataset CSV for review
PUT    /api/moderation/{id}/approve      - Approve dataset
PUT    /api/moderation/{id}/reject       - Reject dataset (reason required)
```

### Pricing (Admin)
```
GET    /api/pricing                - List all SystemPricing configs
GET    /api/pricing/{id}           - Get pricing by ID
PUT    /api/pricing/{id}           - Update pricing config
PATCH  /api/pricing/{id}/toggle-active - Toggle active status
```

### Payouts (Admin & Provider)
```
GET    /api/payouts                     - List all payouts (Admin)
GET    /api/payouts/provider/earnings   - Provider's earnings and revenue shares
POST   /api/payouts/process             - Process monthly payout (Admin)
```

## Configuration

### Backend Configuration

**appsettings.json** contains:
- `ConnectionStrings.DefaultConnection`: SQL Server connection (currently uses sa user with password 12345)
- `JwtSettings`: Secret key, issuer, audience, token expiry
- `PayOS`: Payment gateway credentials
- `Cors.AllowedOrigins`: Allowed frontend URLs

**IMPORTANT:** Never commit real credentials to git. Use User Secrets for development and Azure Key Vault or environment variables for production.

### Frontend Configuration

**Environment Variables:**
Create `.env` file in `frontend/` directory:
```
VITE_API_URL=http://localhost:5258/api
```

If not set, defaults to `http://localhost:5258/api`.

## Testing Credentials

The database seeder creates test accounts (see `backend/EVDataMarketplace.API/Data/DbSeeder.cs`):
- Admin: `admin@test.com` / `Test123!`
- Moderator: `moderator@test.com` / `Test123!`
- Provider: `provider@test.com` / `Test123!`
- Consumer: `consumer@test.com` / `Test123!`

## Key Files to Know

**Backend:**
- `Program.cs`: Dependency injection, middleware pipeline, JWT config, CORS, auto-migrations, seeding
- `Data/EVDataMarketplaceDbContext.cs`: Entity relationships, indexes, decimal precision
- `Data/DbSeeder.cs`: Seeds 63 provinces, 62 districts, 3 pricing configs, 4 test users
- `Services/PayOSService.cs`: Payment gateway integration, webhook signature validation
- `Services/CsvParserService.cs`: CSV parsing with template validation, DatasetRecord creation
- `Controllers/DatasetsController.cs`: Upload with CSV parsing, template download, provider datasets
- `Controllers/DataPackageController.cs`: Preview, purchase, download merged CSV by location
- `Controllers/SubscriptionPackageController.cs`: Purchase, dashboard, chart endpoints
- `Controllers/APIPackageController.cs`: Purchase, API key generation, public data endpoint
- `Controllers/PurchasesController.cs`: List all purchases by type for consumer
- `Controllers/PaymentsController.cs`: Payment creation, PayOS webhook, status checking
- `Controllers/ModerationController.cs`: Pending/all datasets, preview, approve/reject
- `Controllers/PricingController.cs`: SystemPricing CRUD (Admin only)
- `Models/DatasetRecord.cs`: Structured schema with 17 fields for EV charging data
- `Models/SystemPricing.cs`: Pricing config per package type with revenue splits
- `Models/District.cs`: 62 districts for granular location filtering
- `DTOs/`: UploadDatasetDto, PurchaseDataPackageDto, PurchaseSubscriptionDto, PurchaseAPIPackageDto, etc.

**Frontend:**
- `src/App.tsx`: Router setup, AuthProvider wrapper
- `src/contexts/AuthContext.tsx`: Authentication state, login/logout, JWT token management
- `src/api/client.ts`: Axios instance with JWT injection, 401 auto-logout handling
- `src/api/datasets.ts`: Dataset upload, template download, provider dataset list
- `src/api/purchases.ts`: All three purchase type creation functions
- `src/api/payments.ts`: Payment creation with PayOS
- `src/routes.tsx`: All application routes with role-based access
- `src/components/SmartLayout.tsx`: Auto-selects layout by role
- `src/pages/Login.tsx`: Login with demo credential quick-fill buttons
- `src/pages/ProviderNew.tsx`: Dataset upload form with CSV file handling
- `src/pages/MyPurchases.tsx`: Consumer's purchases (all types) with download/access
- `src/pages/ModeratorReview.tsx`: Dataset moderation with preview and approve/reject

**Note**: Frontend partially integrated with backend - many components still use mock data. Check `frontend/FRONTEND_BACKEND_INTEGRATION.md` for status.

## Known Issues and TODOs

**Current Limitations:**
- **Frontend Integration Incomplete**: Many pages still use mock data instead of API calls
- **Email Notifications**: No email on purchase confirmation, approval, or payout
- **Subscription Auto-Renewal**: Manual renewal only, no automatic billing
- **Dataset Versioning**: Datasets are immutable once uploaded
- **Rate Limiting**: API key rate limiting not implemented globally
- **Caching**: No caching layer for frequently accessed data
- **Payout Automation**: PayoutsController needs update for automatic monthly processing
- **Advanced Analytics**: Limited chart types for subscription dashboard
- **Error Boundaries**: Frontend lacks global error boundary for graceful failures

**Testing Gaps:**
- Unit tests not implemented for services
- Integration tests not set up
- E2E tests not configured
- See `CORE_FLOW_TESTING_GUIDE.md` for manual testing procedures

## Recent Changes

**Major Refactoring (Jan 2025):**
- Replaced file storage with database-only storage
- Introduced three distinct purchase models (DataPackage, SubscriptionPackage, APIPackage)
- Added District model for granular location filtering (62 districts)
- Replaced PricingTier with SystemPricing (3 configs, one per package type)
- Structured DatasetRecord schema with 17 fixed fields
- Created 5 new controllers (DataPackage, SubscriptionPackage, APIPackage, Pricing, updated Moderation)
- Implemented revenue sharing logic with automatic splits
- Added CSV template download and validation

**Git History:**
- **Jan 30**: Complete refactoring with new purchase models and database structure
- **Oct 29**: Updated PurchasesController for all purchase types
- **Oct 27**: Rebuilt frontend with role-based layouts
- **Oct 26**: Added province_id to DataProvider, subscription aggregation
- **Oct 25**: Backend-Frontend integration guide

**Documentation:**
- `IMPLEMENTATION_COMPLETE.md`: Full implementation details and API endpoints
- `CORE_FLOW_TESTING_GUIDE.md`: Manual testing procedures for all flows
- `frontend/FRONTEND_BACKEND_INTEGRATION.md`: Frontend API integration status
