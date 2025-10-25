// src/types/provider.ts
export type DatasetStatus = 'draft' | 'pending' | 'active' | 'suspended' | 'rejected'

export type DatasetVersion = {
  id: string
  version: string // e.g. "v1.0", "v1.1"
  createdAt: string
  changelog?: string
  fileSizeMB?: number
  sampleUrl?: string
}

export type DatasetKpi = {
  views: number
  addToCart: number
  conversionRate: number // 0..1
  downloads30d: number
  refundRate: number // 0..1
}

export type ProviderDataset = {
  id: string
  name: string
  priceUsd: number
  status: DatasetStatus
  category: string
  regions: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  versions: DatasetVersion[]
  currentVersionId?: string
  kpi?: DatasetKpi
}

export type EarningRecord = {
  id: string
  date: string
  orderId: string
  buyerId: string
  datasetId: string
  datasetName: string
  grossUsd: number
  feeUsd: number
  netUsd: number
  couponCode?: string
  status: 'completed' | 'refunded'
  trafficSource?: string
}

export type WalletBalance = {
  availableUsd: number
  pendingUsd: number
  onHoldUsd: number
  lifetimeEarningsUsd: number
}

export type WalletTxnType = 'credit_sale' | 'debit_refund' | 'debit_payout' | 'adjustment'
export type WalletTxnStatus = 'pending' | 'available' | 'settled' | 'reversed'

export type WalletTransaction = {
  id: string
  type: WalletTxnType
  status: WalletTxnStatus
  amountUsd: number // dương cho credit, âm cho debit
  createdAt: string
  orderId?: string
  payoutId?: string
  note?: string
}

export type Payout = {
  id: string
  amountUsd: number
  scheduledFor: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
}

export type KycProfile = {
  status: 'unverified' | 'pending' | 'verified' | 'rejected'
  legalName?: string
  taxId?: string
  country?: string
  contactEmail?: string
  rejectionReason?: string
}

export type Message = {
  id: string
  datasetId?: string
  from: 'buyer' | 'provider' | 'system'
  subject: string
  body: string
  createdAt: string
  read: boolean
}
