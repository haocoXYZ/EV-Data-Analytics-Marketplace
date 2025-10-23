// Lightweight mock layer using localStorage (replace with real API later)

export type Role = 'provider' | 'consumer'
export type Bucket = 'available' | 'pending' | 'onHold'
export type Direction = 'credit' | 'debit'
export type Reason = 'correction' | 'refund' | 'promo' | 'penalty' | 'manual'

export interface Wallet {
  userId: string
  role: Role
  availableUsd: number
  pendingUsd: number
  onHoldUsd: number
  lifetimeEarningsUsd?: number   // provider
  lifetimeSpendUsd?: number      // consumer
}

export interface LedgerEntry {
  id: string
  userId: string
  role: Role
  ts: string
  adminId: string
  action: 'adjust'
  delta: { bucket: Bucket; direction: Direction; amountUsd: number }
  reason: Reason
  note?: string
  prev: { availableUsd: number; pendingUsd: number; onHoldUsd: number }
  next: { availableUsd: number; pendingUsd: number; onHoldUsd: number }
}

export interface AdjustPayload {
  bucket: Bucket
  direction: Direction
  amountUsd: number
  reason: Reason
  note?: string
  notify?: boolean
}

const WKEY = 'demo.wallets.v1'
const LKEY = 'demo.ledger.v1'

// ====== Đồng bộ với danh sách tài khoản từ admin.ts ======
import { listAccountsForWalletIndex } from './admin'

// seed demo (provider, consumer) — sẽ bị dọn nếu không khớp accounts thật
function seed() {
  if (!localStorage.getItem(WKEY)) {
    const wallets: Wallet[] = [
      { userId: 'provider', role: 'provider', availableUsd: 1294, pendingUsd: 120, onHoldUsd: 0, lifetimeEarningsUsd: 1847 },
      { userId: 'consumer', role: 'consumer', availableUsd: 0, pendingUsd: 0, onHoldUsd: 0, lifetimeSpendUsd: 512 },
    ]
    localStorage.setItem(WKEY, JSON.stringify(wallets))
  }
  if (!localStorage.getItem(LKEY)) localStorage.setItem(LKEY, JSON.stringify([]))
}
seed()

function readWallets(): Wallet[] {
  return JSON.parse(localStorage.getItem(WKEY) || '[]')
}
function writeWallets(rows: Wallet[]) {
  localStorage.setItem(WKEY, JSON.stringify(rows))
}
function readLedger(): LedgerEntry[] {
  return JSON.parse(localStorage.getItem(LKEY) || '[]')
}
function writeLedger(rows: LedgerEntry[]) {
  localStorage.setItem(LKEY, JSON.stringify(rows))
}

/** Đồng bộ ví với danh sách provider/customer theo ID; tạo thiếu và dọn ví mồ côi */
async function syncWalletsWithAccounts() {
  const accounts = listAccountsForWalletIndex()
  const wallets = readWallets()
  const byId = new Map(wallets.map(w => [w.userId, w]))
  let dirty = false

  // Tạo ví còn thiếu
  for (const a of accounts) {
    if (!byId.has(a.id)) {
      wallets.push({
        userId: a.id,
        role: a.role,
        availableUsd: 0,
        pendingUsd: 0,
        onHoldUsd: 0,
        ...(a.role === 'provider'
          ? { lifetimeEarningsUsd: 0 }
          : { lifetimeSpendUsd: 0 }),
      })
      dirty = true
    }
  }

  // Dọn ví mồ côi (không còn user tương ứng)
  const validIds = new Set(accounts.map(a => a.id))
  const pruned = wallets.filter(w => validIds.has(w.userId))
  if (pruned.length !== wallets.length) {
    writeWallets(pruned)
    return
  }
  if (dirty) writeWallets(wallets)
}

export async function listWallets(role?: Role, query?: string): Promise<Wallet[]> {
  try { await syncWalletsWithAccounts() } catch { /* ignore mock sync errors */ }
  const rows = readWallets()
  return rows.filter(w =>
    (!role || w.role === role) &&
    (!query || w.userId.toLowerCase().includes((query || '').toLowerCase()))
  )
}

export async function getWallet(userId: string): Promise<Wallet | undefined> {
  try { await syncWalletsWithAccounts() } catch {}
  return readWallets().find(w => w.userId === userId)
}

export async function getLedger(userId: string): Promise<LedgerEntry[]> {
  return readLedger()
    .filter(x => x.userId === userId)
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
}

export async function adjustWallet(
  userId: string,
  payload: AdjustPayload,
  adminId: string
): Promise<{ wallet: Wallet; entry: LedgerEntry }> {
  const wallets = readWallets()
  const idx = wallets.findIndex(w => w.userId === userId)
  if (idx < 0) throw new Error('Wallet not found')

  // Validate số dương
  if (!Number.isFinite(payload.amountUsd) || payload.amountUsd <= 0) {
    throw new Error('Số tiền phải là số dương')
  }

  const w = wallets[idx]
  const prev = { availableUsd: w.availableUsd, pendingUsd: w.pendingUsd, onHoldUsd: w.onHoldUsd }

  const sign = payload.direction === 'credit' ? 1 : -1
  const amount = Math.round(payload.amountUsd * 100) / 100

  if (payload.bucket === 'available') w.availableUsd = +(w.availableUsd + sign * amount).toFixed(2)
  if (payload.bucket === 'pending')   w.pendingUsd   = +(w.pendingUsd   + sign * amount).toFixed(2)
  if (payload.bucket === 'onHold')    w.onHoldUsd    = +(w.onHoldUsd    + sign * amount).toFixed(2)

  if (w.availableUsd < 0 || w.pendingUsd < 0 || w.onHoldUsd < 0) {
    throw new Error('Số dư không được âm')
  }

  // demo: cộng dồn lifetime
  if (w.role === 'provider' && payload.bucket === 'available' && payload.direction === 'credit') {
    w.lifetimeEarningsUsd = +(Number(w.lifetimeEarningsUsd || 0) + amount).toFixed(2)
  }
  if (w.role === 'consumer' && payload.direction === 'debit') {
    w.lifetimeSpendUsd = +(Number(w.lifetimeSpendUsd || 0) + amount).toFixed(2)
  }

  wallets[idx] = w
  writeWallets(wallets)

  const entry: LedgerEntry = {
    id: 'led_' + Math.random().toString(36).slice(2, 10),
    userId: w.userId,
    role: w.role,
    ts: new Date().toISOString(),
    adminId,
    action: 'adjust',
    delta: { bucket: payload.bucket, direction: payload.direction, amountUsd: amount },
    reason: payload.reason,
    note: payload.note,
    prev,
    next: { availableUsd: w.availableUsd, pendingUsd: w.pendingUsd, onHoldUsd: w.onHoldUsd },
  }
  const ledger = readLedger()
  ledger.push(entry)
  writeLedger(ledger)

  return { wallet: w, entry }
}
