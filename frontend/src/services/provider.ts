// src/services/provider.ts
import type {
  ProviderDataset, DatasetStatus, DatasetVersion, EarningRecord,
  WalletBalance, WalletTransaction, Payout, KycProfile, Message
} from '../types/provider'

// ===== Pricing / Fee helpers =====
export function getPlatformFeePercent(): number {
  // TODO: lấy từ AdminPricing (mock), tạm thời 30%
  return 30
}
export function getProviderShare(): number {
  return 1 - getPlatformFeePercent() / 100
}

// ===== My Datasets =====
export async function getMyDatasets(params?: {
  status?: DatasetStatus[], category?: string[], updatedFrom?: string, updatedTo?: string, q?: string
}): Promise<ProviderDataset[]> {
  // TODO: fetch từ API; hiện trả demo
  return []
}
export async function updateDataset(partial: Partial<ProviderDataset> & { id: string }): Promise<ProviderDataset> {
  // TODO
  return { ...partial } as ProviderDataset
}
export async function createDatasetVersion(datasetId: string, ver: Omit<DatasetVersion,'id'|'createdAt'>): Promise<DatasetVersion> {
  // TODO
  return { ...ver, id: 'ver_' + Date.now(), createdAt: new Date().toISOString() }
}
export async function setCurrentVersion(datasetId: string, versionId: string): Promise<void> {}

// ===== Earnings =====
export async function getEarnings(params: {
  from: string, to: string, datasetId?: string
}): Promise<EarningRecord[]> {
  // TODO
  return []
}

// ===== Wallet (Ví ảo) =====
export async function getWalletBalance(): Promise<WalletBalance> {
  // TODO: tính từ transactions
  return { availableUsd: 0, pendingUsd: 0, onHoldUsd: 0, lifetimeEarningsUsd: 0 }
}
export async function getWalletTransactions(params?: {
  from?: string, to?: string, type?: ('credit_sale'|'debit_refund'|'debit_payout'|'adjustment')[]
}): Promise<WalletTransaction[]> {
  // TODO
  return []
}
export async function requestPayout(amountUsd: number): Promise<Payout> {
  // TODO: trừ available -> onHold; tạo payout record
  return { id: 'po_' + Date.now(), amountUsd, scheduledFor: new Date().toISOString(), status: 'pending' }
}

// ===== KYC & Payout Profile =====
export async function getKycProfile(): Promise<KycProfile> { return { status: 'unverified' } }
export async function saveKycProfile(p: KycProfile): Promise<KycProfile> { return p }
export async function linkPayoutMethod(payload: { type: 'stripe'|'paypal'|'bank', accountRef: string }): Promise<void> {}

// ===== Messaging =====
export async function getMessages(): Promise<Message[]> { return [] }
export async function sendMessage(msg: Omit<Message,'id'|'createdAt'|'read'|'from'> & { toBuyerId: string }): Promise<void> {}
export async function markMessageRead(id: string): Promise<void> {}
