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
}

export interface Dataset {
  datasetId: number
  providerId?: number
  providerName?: string
  companyName?: string
  name: string
  description?: string
  category?: string
  rowCount: number
  uploadDate: string
  lastUpdated?: string
  status: string
  moderationStatus: string
  provider?: {
    providerId: number
    companyName: string
    contactEmail?: string
  }
}

export interface DatasetRecord {
  recordId: number
  stationId: string
  stationName: string
  stationAddress?: string
  stationOperator?: string
  provinceName: string
  districtName: string
  chargingTimestamp: string
  energyKwh: number
  voltage: number
  current: number
  powerKw: number
  durationMinutes: number
  chargingCost: number
  vehicleType?: string
  batteryCapacityKwh?: number
  socStart?: number
  socEnd?: number
  dataSource?: string
}

// ============= PURCHASE TYPES (NEW MODEL) =============

// Data Package Purchase
export interface DataPackagePurchaseRequest {
  provinceId: number
  districtId?: number
  startDate?: string
  endDate?: string
}

export interface DataPackagePurchase {
  purchaseId: number
  consumerId?: number
  provinceId?: number
  provinceName: string
  districtId?: number
  districtName?: string
  startDate?: string  // Optional - may be null
  endDate?: string    // Optional - may be null
  rowCount: number
  pricePerRow?: number
  totalPrice: number
  status: string
  purchaseDate?: string
  downloadCount: number
  maxDownload: number
  lastDownloadDate?: string
}

// Subscription Package Purchase
export interface SubscriptionPurchaseRequest {
  provinceId: number
  districtId?: number
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly'
}

export interface SubscriptionPackagePurchase {
  subscriptionId: number
  consumerId: number
  provinceId: number
  provinceName: string
  districtId?: number
  districtName?: string
  billingCycle: string
  monthlyPrice: number
  totalPaid: number
  status: string
  startDate: string
  endDate?: string
  nextBillingDate?: string
  purchaseDate: string
  autoRenew: boolean
  cancelledAt?: string
  dashboardAccessCount: number
  lastAccessDate?: string
}

// API Package Purchase
export interface APIPackagePurchaseRequest {
  apiCallsPurchased: number
  provinceId?: number
  districtId?: number
}

export interface APIPackagePurchase {
  purchaseId: number
  consumerId: number
  totalAPICalls: number
  apiCallsUsed: number
  apiCallsRemaining: number
  pricePerCall: number
  totalPrice: number
  status: string
  purchaseDate: string
  expiryDate?: string
  provinceId?: number
  districtId?: number
}

// Combined purchases response
export interface MyPurchasesResponse {
  dataPackages: DataPackagePurchase[]
  subscriptions: SubscriptionPackagePurchase[]
  apiPackages: APIPackagePurchase[]
}

// Preview response
export interface DataPackagePreview {
  provinceId: number
  provinceName: string
  districtId?: number
  districtName?: string
  totalRecords: number
  dateRange: {
    startDate: string
    endDate: string
  }
  pricePerRow: number
  totalPrice: number
  sampleRecords: DatasetRecord[]
}

// ============= PAYMENT TYPES =============

export interface PaymentCreateRequest {
  paymentType: 'DataPackage' | 'SubscriptionPackage' | 'APIPackage'
  referenceId: number
}

export interface PaymentResponse {
  paymentId: number
  checkoutUrl: string
  amount: number
  status: string
}

export interface Payment {
  paymentId: number
  amount: number
  status: string
  paymentType: string
  referenceId: number
  paymentDate?: string
  orderCode?: string
}

// ============= PRICING TYPES (NEW SYSTEM PRICING) =============

export interface SystemPricing {
  pricingId: number
  packageType: 'DataPackage' | 'SubscriptionPackage' | 'APIPackage'
  pricePerRow?: number
  subscriptionMonthlyBase?: number
  apiPricePerCall?: number
  providerCommissionPercent: number
  adminCommissionPercent: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemPricingUpdate {
  pricePerRow?: number
  subscriptionMonthlyBase?: number
  apiPricePerCall?: number
  providerCommissionPercent: number
  adminCommissionPercent: number
}

// ============= MODERATION TYPES =============

export interface ModerationActionDto {
  comments?: string
}

export interface DatasetModerationDetail {
  datasetId: number
  name: string
  description?: string
  category?: string
  rowCount: number
  uploadDate: string
  lastUpdated?: string
  status: string
  moderationStatus: string
  provider: {
    providerId: number
    companyName: string
    contactEmail: string
    contactPhone?: string
  }
  moderationHistory: {
    moderationId: number
    reviewDate: string
    status: string
    comments?: string
    moderatorName?: string
  }[]
}

export interface DataPreviewResponse {
  datasetId: number
  datasetName: string
  totalRecords: number
  currentPage: number
  pageSize: number
  totalPages: number
  records: DatasetRecord[]
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

export interface ProviderEarnings {
  providerId: number
  providerName: string
  totalEarnings: number
  pendingPayouts: number
  completedPayouts: number
  revenueShares: RevenueShare[]
  payouts: Payout[]
}

export interface RevenueShare {
  shareId: number
  paymentId: number
  purchaseType: string
  purchaseDate: string
  providerShare: number
  adminShare: number
  status: string
}

// ============= API KEY TYPES =============

export interface APIKey {
  keyId: number
  apiKey: string
  keyName?: string
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
}

export interface APIKeyGenerateRequest {
  keyName?: string
}

// ============= SUBSCRIPTION DASHBOARD TYPES =============

export interface SubscriptionDashboardData {
  subscriptionId: number
  provinceName: string
  districtName?: string
  totalStations: number
  totalEnergyKwh: number
  averageChargingDuration: number
  totalChargingSessions: number
  dateRange: {
    startDate: string
    endDate: string
  }
}

export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

// ============= LOCATION TYPES =============

export interface Province {
  provinceId: number
  name: string
  code: string
}

export interface District {
  districtId: number
  provinceId: number
  name: string
  code: string
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
