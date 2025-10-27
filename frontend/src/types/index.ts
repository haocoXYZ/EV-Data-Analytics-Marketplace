// ===================================
// TypeScript Types from Backend DTOs
// ===================================

// ============= AUTH TYPES =============

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  role: 'DataProvider' | 'DataConsumer'
  companyName?: string
  companyWebsite?: string
  organizationName?: string
}

export interface AuthResponse {
  token: string
  userId: number
  fullName: string
  email: string
  role: string
  expiresAt: string
}

export interface User {
  userId: number
  fullName: string
  email: string
  role: string
  token: string
  expiresAt: string
}

// ============= DATASET TYPES =============

export interface DatasetCreateRequest {
  name: string
  description?: string
  category?: string
  tierId?: number
  dataFormat?: string
}

export interface Dataset {
  datasetId: number
  providerId?: number
  providerName?: string
  name?: string
  description?: string
  category?: string
  dataFormat?: string
  dataSizeMb?: number
  uploadDate?: string
  status?: string
  moderationStatus?: string
  tierName?: string
  basePricePerMb?: number
  apiPricePerCall?: number
  subscriptionPricePerRegion?: number
}

// ============= PURCHASE TYPES =============

export interface OneTimePurchaseRequest {
  datasetId: number
  startDate: string
  endDate: string
  licenseType: string
}

export interface SubscriptionRequest {
  datasetId: number
  provinceId: number
  renewalCycle: string
  durationMonths: number
}

export interface APIPackageRequest {
  datasetId: number
  apiCallsCount: number
}

export interface Purchase {
  purchaseId: number
  consumerId: number
  datasetId: number
  datasetName?: string
  purchaseType: string
  amount: number
  purchaseDate: string
  purchaseStatus: string
  startDate?: string
  endDate?: string
  licenseType?: string
}

// ============= PAYMENT TYPES =============

export interface PaymentCreateRequest {
  paymentType: string
  referenceId: number
}

export interface PaymentResponse {
  paymentId: number
  payosOrderId?: string
  checkoutUrl?: string
  qrCode?: string
  amount?: number
  status?: string
}

export interface Payment {
  paymentId: number
  consumerId: number
  amount: number
  paymentDate: string
  paymentStatus: string
  paymentMethod?: string
  transactionRef?: string
}

// ============= PRICING TYPES =============

export interface PricingTier {
  tierId: number
  tierName: string
  description?: string
  basePricePerMb?: number
  apiPricePerCall?: number
  subscriptionPricePerRegion?: number
  providerCommissionPercent?: number
  adminCommissionPercent?: number
  isActive: boolean
}

export interface PricingTierCreate {
  tierName: string
  description?: string
  basePricePerMb?: number
  apiPricePerCall?: number
  subscriptionPricePerRegion?: number
  providerCommissionPercent: number
  adminCommissionPercent: number
}

// ============= MODERATION TYPES =============

export interface DatasetModeration {
  datasetId: number
  moderationStatus: 'Approved' | 'Rejected'
  comments?: string
}

export interface DatasetModerationRequest {
  datasetId: number
  moderationStatus: string
  comments?: string
}

// ============= PAYOUT TYPES =============

export interface RevenueSummary {
  monthYear: string
  providers: ProviderRevenue[]
  totalProviderPayout: number
  totalAdminRevenue: number
}

export interface ProviderRevenue {
  providerId: number
  providerName: string
  email: string
  totalDue: number
  transactionCount: number
  adminShare: number
}

export interface Payout {
  payoutId: number
  providerId: number
  providerName?: string
  providerEmail?: string
  monthYear: string
  totalDue: number
  payoutDate?: string
  payoutStatus: string
  paymentMethod?: string
  bankAccount?: string
  transactionRef?: string
}

export interface CompletePayoutRequest {
  transactionRef?: string
  bankAccount?: string
  notes?: string
}

// ============= COMMON TYPES =============

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

