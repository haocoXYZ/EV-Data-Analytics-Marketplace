# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EV Data Analytics Marketplace - A platform for buying and selling electric vehicle charging data. The system facilitates a marketplace where Data Providers can upload EV charging datasets, Moderators review them, and Data Consumers can purchase access through various pricing models (one-time purchase, API access, or subscription).

**Tech Stack:**
- Backend: ASP.NET Core 8.0 Web API with Entity Framework Core
- Frontend: React 19 + TypeScript + Vite + TailwindCSS
- Database: SQL Server
- Authentication: JWT with BCrypt
- Payment: PayOS integration (placeholder implementation ready for real integration)

## Development Commands

### Backend (.NET)

**Location:** `backend/EVDataMarketplace.API/`

```bash
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the API (starts on https://localhost:7xxx)
dotnet run

# Apply database migrations
dotnet ef database update

# Create new migration
dotnet ef migrations add MigrationName

# Remove last migration
dotnet ef migrations remove
```

**Connection String:** Update in `backend/EVDataMarketplace.API/appsettings.Development.json`
- Default: `Server=localhost;Database=EVDataMarketplace;User Id=sa;Password=12345;`

### Frontend (React)

**Location:** `frontend/`

```bash
# Install dependencies
npm install

# Run development server (starts on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture & Core Flow

### 7-Step Business Flow

The system implements a complete marketplace flow:

1. **Admin provides pricing tiers** - Admin sets up Basic/Standard/Premium pricing with commission splits
2. **Data Provider uploads datasets** - Providers upload CSV files with metadata (category, description, size)
3. **Moderator reviews datasets** - Moderators approve/reject datasets before they go public
4. **Data Consumer searches datasets** - Browse approved datasets by category, search, region
5. **Consumer purchases access** - Three purchase types:
   - **OneTime**: Download CSV file for specific date range (max 3 downloads)
   - **Subscription**: Unlimited access to specific province data (monthly/quarterly/yearly)
   - **API Package**: Purchase API call quota with generated API key
6. **Payment processing** - PayOS integration for payment, auto-creates revenue share records
7. **Revenue management** - Admin generates monthly payouts for providers based on commission split

### Backend Architecture

**Database Context:** `EVDataMarketplaceDbContext` manages all entities with proper relationships

**Key Entities:**
- **User hierarchy**: User → DataProvider / DataConsumer (one-to-one)
- **Dataset flow**: Dataset → DatasetModeration → PricingTier
- **Purchase types**: OneTimePurchase, Subscription, APIPackage
- **Payment flow**: Payment → RevenueShare → Payout

**Controllers (8 total):**
- `AuthController` - JWT authentication (register/login)
- `PricingTiersController` - CRUD for pricing tiers (Admin only)
- `DatasetsController` - Dataset upload/download with file service
- `ModerationController` - Dataset review workflow (Moderator only)
- `PurchasesController` - All three purchase types
- `PaymentsController` - Payment creation, webhook, completion
- `PayoutsController` - Revenue summary and payout generation (Admin only)
- `HealthController` - Health checks

**Services:**
- `IAuthService` - JWT token generation, BCrypt password hashing
- `IPayOSService` - Payment gateway integration (placeholder ready for real PayOS SDK)
- `IFileService` - CSV/Excel file upload/download to `Uploads/datasets/`

**Auto-seeding:** On first run, database is seeded with:
- Admin: `admin@evdatamarket.com` / `Admin@123`
- Moderator: `moderator@evdatamarket.com` / `Moderator@123`
- 3 Providers (VinFast, EVN, GreenCharge) - password: `Provider@123`
- 2 Consumers (Toyota, EV Analytics) - password: `Consumer@123`
- 3 Pricing tiers (Basic/Standard/Premium)
- 8 Provinces (Hà Nội, TP HCM, Đà Nẵng, etc.)
- 4 Sample datasets (3 approved, 1 pending)

### Frontend Architecture

**Routing:** React Router v7 with route-based code splitting

**Key Pages:**
- `Home` - Landing page
- `Login` - Authentication
- `Catalog` - Browse datasets with filters
- `DatasetDetail` - View dataset info and purchase options
- `Checkout` - Payment flow
- `MyPurchases` - User's purchase history
- **Admin pages**: `AdminDashboard`, `AdminPricing`, `AdminPayouts`
- **Provider pages**: `ProviderDashboard`, `ProviderNew` (upload)
- **Moderator pages**: `ModeratorReview`

**Layouts:**
- `SmartLayout` - Role-based layout switching
- `DashboardLayout` - Admin/Provider/Moderator dashboards
- `ConsumerLayout` - Consumer-facing pages

**Authentication:** `AuthContext` manages JWT token and user state

**CORS:** Backend configured to allow `http://localhost:5173` (configurable in `appsettings.Development.json`)

## Important Implementation Details

### File Storage Strategy
- CSV files are stored on **file system** in `backend/EVDataMarketplace.API/Uploads/datasets/`
- Database stores only **file path and metadata** (not file content)
- File naming: `{GUID}_{original_filename}.csv`
- Download requires purchase verification and respects download limits

### Revenue Calculation
- **Automatic**: When payment status changes to "Completed", revenue share is auto-calculated
- Commission split comes from PricingTier (e.g., Provider 70% / Admin 30%)
- Monthly payout generation groups all pending revenue shares by provider
- Payout completion updates all associated revenue shares to "Paid" status

### Authorization Pattern
All controllers use `[Authorize]` with role-based access:
```csharp
[Authorize(Roles = "Admin")]           // Admin only
[Authorize(Roles = "Moderator")]        // Moderator only
[Authorize(Roles = "DataProvider")]     // Provider only
[Authorize(Roles = "DataConsumer")]     // Consumer only
```

### Database Migrations
- Initial migration: `20251025122718_InitialCreate`
- Migrations auto-apply on startup via `Program.cs`
- Use `dotnet ef migrations add <Name>` for schema changes

## Testing the System

### Full Flow Test (using Swagger at `/swagger`):

1. Login as Admin
   ```
   POST /api/auth/login
   { "email": "admin@evdatamarket.com", "password": "Admin@123" }
   ```

2. Create/View pricing tiers
   ```
   GET /api/pricingtiers
   ```

3. Login as Provider, upload dataset
   ```
   POST /api/datasets (multipart/form-data with CSV file)
   ```

4. Login as Moderator, approve dataset
   ```
   POST /api/moderation/review
   { "datasetId": 4, "moderationStatus": "Approved" }
   ```

5. Login as Consumer, browse and purchase
   ```
   GET /api/datasets
   POST /api/purchases/onetime
   POST /api/payments/create
   POST /api/payments/{id}/complete
   ```

6. Download purchased dataset
   ```
   GET /api/datasets/{id}/download
   ```

7. Admin generates payout
   ```
   POST /api/payouts/generate?monthYear=2025-01
   ```

## Common Development Patterns

### Adding a New Entity
1. Create model in `backend/EVDataMarketplace.API/Models/`
2. Add DbSet to `EVDataMarketplaceDbContext`
3. Configure relationships and precision in `OnModelCreating`
4. Create migration: `dotnet ef migrations add AddEntityName`
5. Apply migration: `dotnet ef database update`

### Adding a New API Endpoint
1. Add method to appropriate controller in `backend/EVDataMarketplace.API/Controllers/`
2. Use `[Authorize(Roles = "...")]` for role-based access
3. Follow existing patterns for error handling and responses
4. Test via Swagger UI

### Adding a New Frontend Page
1. Create page component in `frontend/src/pages/`
2. Add route to `frontend/src/routes.tsx`
3. Use SmartLayout for role-based navigation
4. Fetch data from API with JWT token from AuthContext

## Known Limitations

- **PayOS Integration**: Currently uses placeholder service. Real integration requires:
  1. Update `appsettings.Development.json` with real PayOS credentials
  2. Implement actual PayOS SDK in `Services/PayOSService.cs`

- **API Data Access**: Consumers can purchase API packages, but actual data API endpoints are not implemented (out of scope for MVP)

- **Email Notifications**: No email system for approval/payment notifications

- **CSV File Validation**: Basic extension check only, no content validation

## Documentation References

For detailed flow explanations, see:
- `backend/README_DATABASE.md` - Database schema and core flow
- `backend/IMPLEMENTATION_SUMMARY.md` - Complete API implementation
- `backend/CORE_FLOW_CHECKLIST.md` - Feature completion status
- `backend/CSV_STORAGE_EXPLAINED.md` - File storage architecture
- `backend/SEED_AND_UPLOAD.md` - Seed data and file upload details
- `backend/API_TESTING_GUIDE.md` - API testing instructions
