<!--
SYNC IMPACT REPORT
==================
Version Change: N/A → 1.0.0
Modified Principles: N/A (Initial creation)
Added Sections:
  - Core Principles (5 principles)
  - Technology Stack & Architecture
  - Quality Standards
  - Governance
Removed Sections: N/A
Templates Requiring Updates:
  ✅ plan-template.md - No updates needed (constitution check placeholder accommodates any principles)
  ✅ spec-template.md - No updates needed (requirements structure is compatible)
  ✅ tasks-template.md - No updates needed (task organization supports all principles)
Follow-up TODOs: None
==================
-->

# EV Data Analytics Marketplace Constitution

## Core Principles

### I. Core Flow First (NON-NEGOTIABLE)

**Rule**: Focus exclusively on the essential marketplace flow before adding advanced features.

The seven-step core flow MUST be fully functional before any enhancement:
- B1: Admin provides pricing tiers for data providers
- B2: Data Provider uploads datasets to platform
- B3: Moderator reviews and approves datasets
- B4: Data Consumer searches and browses datasets
- B5: Data Consumer selects and purchases via package options (One-time CSV download, API access with request limits, Regional subscription)
- B6: Data Consumer completes payment and accesses purchased data
- B7: Admin processes payments and distributes revenue to providers monthly

**Rationale**: As a student project with real-world scope, completing the core transactional flow ensures a functional MVP. Advanced analytics, AI recommendations, and complex dashboards are explicitly deferred to prevent scope creep and ensure graduation deliverables are met.

**Testing Requirement**: Each step (B1-B7) must be independently verifiable via manual testing or basic integration tests.

---

### II. Database-First Design

**Rule**: The existing SQL Server schema (1.sql) is the source of truth for all data models.

- Entity models in C# MUST map directly to tables defined in 1.sql
- Schema changes require SQL migration scripts first, then code updates
- No ORM magic that diverges from explicit database structure
- Foreign key relationships and constraints defined in SQL must be respected in application logic

**Rationale**: The database schema already exists and defines the marketplace structure. Working backward from a pre-defined schema reduces architectural decisions and ensures data integrity from day one.

**Enforcement**: Code reviews must verify that all Entity Framework models or Dapper queries align with 1.sql schema definitions.

---

### III. Role-Based Access Control (RBAC)

**Rule**: Every API endpoint and UI feature MUST enforce role-based permissions.

The three roles have distinct, non-overlapping responsibilities:
- **Admin**: Manages pricing tiers, oversees moderation, processes payouts, views platform-wide analytics
- **Data Provider**: Uploads datasets, sets sharing policies (within admin-defined tiers), views own revenue reports
- **Data Consumer**: Searches datasets, purchases packages, accesses purchased data via CSV download or API

**Implementation Requirements**:
- Authentication via JWT tokens containing user role claims
- Authorization middleware validates role on every protected endpoint
- No role escalation paths (e.g., Provider cannot access Admin functions)
- Database role field (`User.role`) is single source of truth

**Rationale**: A marketplace with financial transactions requires strict access control to prevent unauthorized data access, fraudulent purchases, or payment manipulation.

---

### IV. Payment Integration Integrity

**Rule**: All payment flows MUST integrate with PayOS and maintain transactional consistency.

- Payment records (`Payment` table) MUST be created before granting data access
- Revenue sharing calculations (`RevenueShare` table) MUST be atomic with payment completion
- Failed payments MUST NOT create purchase history records
- Monthly payout processing (`Payout` table) MUST reconcile against all `RevenueShare` entries for that period

**PayOS Integration Requirements**:
- Use PayOS webhook for payment confirmation (not client-side callbacks)
- Store `transaction_ref` from PayOS in `Payment.transaction_ref`
- Implement idempotency for webhook retries (prevent duplicate credits)

**Rationale**: Financial correctness is non-negotiable. Decoupling payment from data access or revenue sharing creates opportunities for fraud, lost revenue, or provider distrust.

---

### V. Pragmatic Simplicity

**Rule**: Choose the simplest viable implementation that satisfies functional requirements.

**Explicitly Deferred** (not in scope for this project):
- AI-powered recommendations or demand forecasting
- Real-time dashboard analytics (basic reports only)
- GDPR/CCPA anonymization workflows (data providers manually anonymize before upload)
- Advanced V2G transaction modeling (focus on charging session data only)
- Complex multi-region subscriptions (subscription is per-province only)

**Simplicity Guidelines**:
- Use ASP.NET Core built-in DI (no complex IoC containers)
- Dapper for queries, Entity Framework for simple CRUD (no repository pattern unless justified)
- CSV export via simple file generation (no streaming for large datasets initially)
- API rate limiting via in-memory counters (no Redis unless performance demands it)

**Justification Requirement**: Any introduction of external libraries, design patterns, or architectural layers beyond MVC + Services must document:
- Problem being solved
- Why simpler alternative is insufficient
- Complexity cost (learning curve, maintenance burden)

**Rationale**: Student teams have limited time and experience. Over-engineering delays delivery and obscures core learning objectives. Functional delivery beats architectural purity.

---

## Technology Stack & Architecture

### Backend

- **Language**: C# with .NET 6 or later
- **Framework**: ASP.NET Core Web API
- **Database**: SQL Server (schema defined in `backend/1.sql`)
- **ORM**: Entity Framework Core for models, Dapper for complex queries
- **Authentication**: JWT tokens with role claims
- **Payment Gateway**: PayOS integration via webhooks

### Frontend

- **Framework**: React with TypeScript
- **State Management**: React Context API (avoid Redux unless complexity demands it)
- **HTTP Client**: Axios with centralized error handling
- **Routing**: React Router

### Project Structure

```
backend/
├── Controllers/        # API endpoints organized by role (Admin, Provider, Consumer)
├── Models/            # EF Core entities matching 1.sql schema
├── Services/          # Business logic layer (payment processing, revenue calculation, etc.)
├── DTOs/              # Request/response data transfer objects
├── Middleware/        # Authentication, authorization, error handling
└── Migrations/        # EF Core migrations (kept in sync with 1.sql)

frontend/
├── components/        # Reusable UI components
├── pages/             # Role-specific dashboards and flows
├── services/          # API client wrappers
└── contexts/          # Authentication and user role state
```

---

## Quality Standards

### Testing

**Minimum Viable Testing** (for student project scope):
- **Manual Testing**: Each core flow step (B1-B7) must be manually verified before demo
- **Integration Tests** (optional but recommended): Payment webhook processing, revenue share calculation
- **Unit Tests** (low priority): Only for complex business logic (e.g., subscription pricing calculation)

**Rationale**: Full TDD is unrealistic for student timelines. Focus testing effort on financial correctness (payments, payouts) and role-based access.

---

### Code Reviews

**Required Checks**:
- Database changes include migration script
- API endpoints have role authorization attributes
- Payment flows update all required tables atomically
- No hardcoded credentials or API keys (use environment variables)

---

### Documentation

**Mandatory Documentation**:
- API endpoint documentation (Swagger/OpenAPI auto-generated)
- Database schema diagram (can be generated from 1.sql)
- Setup instructions (README.md with database setup, PayOS configuration)

**Optional Documentation**:
- Architecture decision records (ADRs) for major technical choices
- User guides for each role

---

## Governance

### Amendment Process

1. Propose constitution change via discussion with team
2. Document rationale and impact on existing code
3. Update version number following semantic versioning
4. Propagate changes to affected template files
5. Commit with message: `docs: amend constitution to vX.Y.Z (description)`

### Versioning Policy

- **MAJOR**: Breaking changes to core principles (e.g., removing role-based access requirement)
- **MINOR**: New principles added or significant expansions
- **PATCH**: Clarifications, typo fixes, non-semantic improvements

### Compliance Reviews

- **Pre-Development**: Review constitution before starting new features
- **Code Review**: Verify principle adherence during pull request reviews
- **Retrospective**: Assess whether constitution principles helped or hindered progress

### Constitution vs. Implementation

- Constitution defines **what** must be done (principles, rules)
- Templates (plan, spec, tasks) define **how** work is organized
- Code implements the actual functionality

**Conflict Resolution**: If constitution conflicts with practical delivery, discuss with team and amend constitution (don't silently ignore).

---

**Version**: 1.0.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
