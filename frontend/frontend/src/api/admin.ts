import type {
  Provider, ProviderStatus, ProviderApproval,
  Customer, CustomerStatus,
  ProviderKyc, ProviderMessage,
  CustomerKyc, CustomerMessage,
  // ===== Pricing types =====
  PricingConfig, PricingMonthlyOption
} from '../types/admin'

// ================== STORAGE KEYS ==================
const KEYS = {
  providers: 'ev.admin.providers',
  approvals: 'ev.admin.provider.approvals',
  customers: 'ev.admin.customers',
  blocked:   'ev.admin.blockedEmails',
  pricing:   'ev.admin.pricing',            // <— cấu hình bảng giá & hoa hồng
}

// Các key mở rộng phục vụ Bảo mật & Thông báo (mock)
const KEYS_EXTRA = {
  providerSessions: 'ev.admin.provider.sessions', // Record<providerId, ProviderSession[]>
  providerNotify:   'ev.admin.provider.notify',   // Record<providerId, NotifyLog[]>
  pwResetFlags:     'ev.admin.provider.pwreset',  // Record<providerId, boolean>
  reset2FAFlags:    'ev.admin.provider.reset2fa', // Record<providerId, boolean>
}

// ================== STORAGE KEYS (CUSTOMER EXTRA) ==================
const KEYS_CUSTOMER_EXTRA = {
  sessions: 'ev.admin.customer.sessions', // Record<customerId, CustomerSession[]>
  notify:   'ev.admin.customer.notify',   // Record<customerId, CustomerNotifyLog[]>
  pwReset:  'ev.admin.customer.pwreset',  // Record<customerId, boolean>
  reset2FA: 'ev.admin.customer.reset2fa', // Record<customerId, boolean>
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

/* ================== PRICING (API / ONE-TIME / MONTHLY) ================== */

function defaultPricing(): PricingConfig {
  return {
    api: {
      pricePerRequest: 0.02,
      meta: {
        title: 'API',
        description: 'Pay-per-request cho dữ liệu thời gian thực',
        features: ['Truy cập dữ liệu thời gian thực', 'RESTful API', 'JSON response', 'Pay-as-you-go'],
      },
    },
    oneTime: {
      priceUSD: 49,
      lookbackDays: 30,
      perDayUSD: 2, // 👈 thêm giá mỗi ngày để FE tính đúng
      meta: {
        title: 'Gói mua 1 lần',
        description: 'Dữ liệu được cập nhật từ {lookbackDays} ngày trước đến hôm nay',
        features: ['Tải xuống CSV', 'Dữ liệu lịch sử gần nhất', 'Thanh toán một lần', 'Chọn phạm vi ngày'],
      },
    },
    monthly: {
      options: [
        { months: 1,  pricePerRegionPerMonthUSD: 199 },
        { months: 3,  pricePerRegionPerMonthUSD: 189 },
        { months: 6,  pricePerRegionPerMonthUSD: 179 },
        { months: 9,  pricePerRegionPerMonthUSD: 169 },
        { months: 12, pricePerRegionPerMonthUSD: 159 },
      ],
      meta: {
        title: 'Gói tháng (3/6/9/12 tháng)',
        description: 'Unlimited API + truy cập dữ liệu theo khu vực',
        features: ['Không giới hạn request', 'Dữ liệu theo khu vực', 'Thanh toán định kỳ', 'Hỗ trợ ưu tiên'],
      },
    },
    commission: { platformPercent: 20 }, // Nền tảng giữ lại 20% (provider nhận 80%)
    updatedAt: new Date().toISOString(),
  }
}

export function getPricing(): PricingConfig {
  try {
    const raw = localStorage.getItem(KEYS.pricing)
    if (!raw) {
      const d = defaultPricing()
      write(KEYS.pricing, d)
      return d
    }
    const parsed = JSON.parse(raw) as PricingConfig
    // Ghép với mặc định để đảm bảo tương thích về sau
    const d = defaultPricing()
    return {
      ...d,
      ...parsed,
      api: {
        ...d.api,
        ...(parsed as any).api,
        meta: { ...d.api.meta, ...(parsed as any)?.api?.meta },
      },
      oneTime: {
        ...d.oneTime,
        ...(parsed as any).oneTime,
        // 👇 đảm bảo có perDayUSD ngay cả khi dữ liệu cũ chưa có
        perDayUSD: (parsed as any)?.oneTime?.perDayUSD ?? d.oneTime.perDayUSD,
        meta: { ...d.oneTime.meta, ...(parsed as any)?.oneTime?.meta },
      },
      monthly: {
        ...d.monthly,
        ...(parsed as any).monthly,
        options:
          (parsed as any)?.monthly?.options?.length
            ? (parsed as any).monthly.options
            : d.monthly.options,
        meta: { ...d.monthly.meta, ...(parsed as any)?.monthly?.meta },
      },
      commission: { ...d.commission, ...(parsed as any).commission },
    }
  } catch {
    const d = defaultPricing()
    write(KEYS.pricing, d)
    return d
  }
}

export function savePricing(cfg: PricingConfig): void {
  const toSave: PricingConfig = { ...cfg, updatedAt: new Date().toISOString() }
  write(KEYS.pricing, toSave)
}

/* ================== SEED DEMO DATA ================== */
function seed() {
  // --- MIGRATE dữ liệu customer cũ 2 trạng thái → 4 trạng thái ---
  try {
    const existing = read<Customer[]>(KEYS.customers, [])
    if (existing.length) {
      let changed = false
      for (const c of existing) {
        // @ts-ignore: tương thích dữ liệu rất cũ
        if (c.status === 'active') { (c as any).status = 'kyc'; changed = true }
        // @ts-ignore
        if (c.status === 'blocked') { (c as any).status = 'suspended'; changed = true }
      }
      if (changed) write(KEYS.customers, existing)
    }
  } catch {}

  // Seed Pricing nếu chưa có
  if (!localStorage.getItem(KEYS.pricing)) {
    write(KEYS.pricing, defaultPricing())
  }

  if (!localStorage.getItem(KEYS.providers)) {
    const now = new Date().toISOString()
    const prov: Provider[] = [
      {
        id: 'prov_001',
        name: 'GreenFleet Solutions',
        email: 'ops@greenfleet.com',
        company: 'GreenFleet',
        datasets: 12,
        revenue: 2480,
        status: 'kyc',
        createdAt: now,
        kyc: {
          company: 'GreenFleet',
          legalName: 'GreenFleet JSC',
          businessRegNo: '0312-123-456',
          taxCode: 'GF-9988-11',
          address: '01 Le Duan, District 1, HCMC',
          representative: 'Nguyen Van A',
          phone: '+84 90 123 4567',
          bankName: 'VCB',
          bankAccount: '0123456789',
          documents: [{ label: 'Giấy ĐKKD (PDF)' }, { label: 'CMND người đại diện (ảnh)' }],
        },
      },
      {
        id: 'prov_002',
        name: 'TechEV Analytics',
        email: 'contact@techev.io',
        company: 'TechEV',
        datasets: 7,
        revenue: 1240,
        status: 'pending',
        createdAt: now,
        kyc: { company: 'TechEV', representative: 'Tran B', phone: '+84 93 777 8888' },
      },
      {
        id: 'prov_003',
        name: 'CityCharge Ops',
        email: 'ops@citycharge.vn',
        company: 'CityCharge',
        datasets: 0,
        revenue: 0,
        status: 'suspended',
        createdAt: now,
      },
    ]
    write(KEYS.providers, prov)
  }

  if (!localStorage.getItem(KEYS.customers)) {
    const now = new Date().toISOString()
    const customers: Customer[] = [
      {
        id: 'cus_001',
        name: 'Nguyễn Minh',
        email: 'minh.nguyen@gmail.com',
        org: 'Freelancer',
        purchases: 9,
        spent: 850.5,
        status: 'kyc',
        createdAt: now,
        kyc: {
          fullName: 'Nguyễn Minh',
          dob: '1992-08-15',
          nationalId: '07909200xxx',
          address: '12 Nguyễn Trãi, Q.1, TP.HCM',
          phone: '+84 90 111 2222',
          bankName: 'TPBank',
          bankAccount: '123456789',
          documents: [{ label: 'CCCD mặt trước' }, { label: 'CCCD mặt sau' }],
        },
      },
      {
        id: 'cus_002',
        name: 'Trần Văn B',
        email: 'b.tran@gmail.com',
        purchases: 2,
        spent: 120,
        status: 'pending',
        createdAt: now,
        kyc: { fullName: 'Trần Văn B', phone: '+84 93 777 8888' },
      },
      {
        id: 'cus_003',
        name: 'Công ty ABC (đại diện: Lê A)',
        email: 'buyer@abc.vn',
        org: 'ABC Corp',
        purchases: 4,
        spent: 520.0,
        status: 'pending',
        createdAt: now,
      },
    ]
    write(KEYS.customers, customers)
  }

  if (!localStorage.getItem(KEYS.blocked)) {
    write<string[]>(KEYS.blocked, [])
  }

  // seed trống cho phần bảo mật/thông báo (Provider)
  if (!localStorage.getItem(KEYS_EXTRA.providerSessions)) {
    write(KEYS_EXTRA.providerSessions, {} as Record<string, any[]>)
  }
  if (!localStorage.getItem(KEYS_EXTRA.providerNotify)) {
    write(KEYS_EXTRA.providerNotify, {} as Record<string, any[]>)
  }
  if (!localStorage.getItem(KEYS_EXTRA.pwResetFlags)) {
    write(KEYS_EXTRA.pwResetFlags, {} as Record<string, boolean>)
  }
  if (!localStorage.getItem(KEYS_EXTRA.reset2FAFlags)) {
    write(KEYS_EXTRA.reset2FAFlags, {} as Record<string, boolean>)
  }

  // ---- Customer security/notify seed ----
  if (!localStorage.getItem(KEYS_CUSTOMER_EXTRA.sessions)) {
    write(KEYS_CUSTOMER_EXTRA.sessions, {} as Record<string, any[]>)
  }
  if (!localStorage.getItem(KEYS_CUSTOMER_EXTRA.notify)) {
    write(KEYS_CUSTOMER_EXTRA.notify, {} as Record<string, any[]>)
  }
  if (!localStorage.getItem(KEYS_CUSTOMER_EXTRA.pwReset)) {
    write(KEYS_CUSTOMER_EXTRA.pwReset, {} as Record<string, boolean>)
  }
  if (!localStorage.getItem(KEYS_CUSTOMER_EXTRA.reset2FA)) {
    write(KEYS_CUSTOMER_EXTRA.reset2FA, {} as Record<string, boolean>)
  }
}
seed()

// ===================================================
// ========== BLOCKLIST (email bị vô hiệu hóa) =======
// ===================================================
export function listBlocked(): string[] {
  return read<string[]>(KEYS.blocked, [])
}

export function isAccountBlocked(email: string): boolean {
  const bl = read<string[]>(KEYS.blocked, [])
  return bl.includes(email.toLowerCase())
}

export async function blockAccount(email: string) {
  const e = email.toLowerCase()
  const bl = read<string[]>(KEYS.blocked, [])
  if (!bl.includes(e)) {
    bl.push(e)
    write(KEYS.blocked, bl)
  }
}

export async function unblockAccount(email: string) {
  const e = email.toLowerCase()
  const bl = read<string[]>(KEYS.blocked, [])
  write(KEYS.blocked, bl.filter(x => x !== e))
}

// ===================================================
// ========== PROVIDERS ==============================
// ===================================================
export async function listProviders(): Promise<Provider[]> {
  return read<Provider[]>(KEYS.providers, [])
}

export async function getProvider(id: string): Promise<Provider | undefined> {
  return read<Provider[]>(KEYS.providers, []).find((p) => p.id === id)
}

export async function saveProvider(p: Provider) {
  const all = read<Provider[]>(KEYS.providers, [])
  const idx = all.findIndex((x) => x.id === p.id)
  if (idx >= 0) all[idx] = p
  else all.unshift(p)
  write(KEYS.providers, all)
}

export async function setProviderStatus(id: string, status: ProviderStatus) {
  const all = read<Provider[]>(KEYS.providers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    all[i].status = status
    write(KEYS.providers, all)
  }
}

export async function saveProviderKyc(id: string, kyc: ProviderKyc) {
  const all = read<Provider[]>(KEYS.providers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    all[i].kyc = { ...(all[i].kyc || {}), ...kyc }
    write(KEYS.providers, all)
  }
}

export async function deleteProvider(id: string) {
  const all = read<Provider[]>(KEYS.providers, [])
  write(KEYS.providers, all.filter((x) => x.id !== id))
}

export async function markProviderPending(id: string) {
  await setProviderStatus(id, 'pending')
}

export async function approveProviderKyc(id: string) {
  await setProviderStatus(id, 'kyc')
}

export async function sendProviderMessage(
  id: string,
  type: ProviderMessage['type'],
  content: string,
) {
  const all = read<Provider[]>(KEYS.providers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    const msg: ProviderMessage = {
      id: 'msg_' + Math.random().toString(36).slice(2, 8),
      type, content,
      createdAt: new Date().toISOString(),
    }
    all[i].messages = [...(all[i].messages || []), msg]
    write(KEYS.providers, all)
  }
}

export async function suspendProvider(id: string, reason: string) {
  const all = read<Provider[]>(KEYS.providers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    all[i].status = 'suspended'
    const msg: ProviderMessage = {
      id: 'msg_' + Math.random().toString(36).slice(2, 8),
      type: 'rejection',
      content: reason,
      createdAt: new Date().toISOString(),
    }
    all[i].messages = [...(all[i].messages || []), msg]
    write(KEYS.providers, all)
  }
}

// Legacy approvals (giữ tương thích)
export async function listProviderApprovals(): Promise<ProviderApproval[]> { return [] }
export async function approveProvider(_: string) { /* no-op */ }
export async function rejectProvider(_: string) { /* no-op */ }

// ===================================================
// ========== PROVIDER SECURITY & NOTIFY (MOCK) ======
// ===================================================
export async function listProviderSessions(
  providerId: string
): Promise<Array<{ id: string; device: string; ip?: string; ua?: string; lastSeen?: string }>> {
  const all = read<Record<string, any[]>>(KEYS_EXTRA.providerSessions, {})
  return all[providerId] || []
}

export async function revokeAllProviderSessions(providerId: string) {
  const all = read<Record<string, any[]>>(KEYS_EXTRA.providerSessions, {})
  all[providerId] = []
  write(KEYS_EXTRA.providerSessions, all)
  await sendProviderMessage(providerId, 'notice', 'Admin đã thu hồi tất cả phiên đăng nhập')
}

export async function requireProviderPasswordReset(providerId: string) {
  const flags = read<Record<string, boolean>>(KEYS_EXTRA.pwResetFlags, {})
  flags[providerId] = true
  write(KEYS_EXTRA.pwResetFlags, flags)
  await sendProviderMessage(providerId, 'notice', 'Admin yêu cầu đổi mật khẩu ở lần đăng nhập kế tiếp')
}

export async function resetProvider2FA(providerId: string) {
  const flags = read<Record<string, boolean>>(KEYS_EXTRA.reset2FAFlags, {})
  flags[providerId] = true
  write(KEYS_EXTRA.reset2FAFlags, flags)
  await sendProviderMessage(providerId, 'notice', 'Admin đã reset 2FA')
}

export async function ProviderNotifyLogs(
  providerId: string
): Promise<Array<{ id: string; channels: string[]; title: string; body: string; createdAt: string }>> {
  const all = read<Record<string, any[]>>(KEYS_EXTRA.providerNotify, {})
  return all[providerId] || []
}
// Alias tương thích code cũ
export { ProviderNotifyLogs as listProviderNotifyLogs }

export async function sendProviderNotification(
  providerId: string,
  channels: string[],
  title: string,
  body: string
) {
  const all = read<Record<string, any[]>>(KEYS_EXTRA.providerNotify, {})
  const logs = all[providerId] || []
  logs.push({
    id: 'notify_' + Math.random().toString(36).slice(2, 8),
    channels, title, body,
    createdAt: new Date().toISOString(),
  })
  all[providerId] = logs
  write(KEYS_EXTRA.providerNotify, all)
  await sendProviderMessage(providerId, 'notice', `[${channels.join(', ')}] ${title} — ${body}`)
}

// ===================================================
// ========== CUSTOMERS (4 trạng thái + KYC) =========
// ===================================================
export async function listCustomers(): Promise<Customer[]> {
  return read<Customer[]>(KEYS.customers, [])
}
export async function getCustomer(id: string): Promise<Customer | undefined> {
  return read<Customer[]>(KEYS.customers, []).find((c) => c.id === id)
}
export async function setCustomerStatus(id: string, status: CustomerStatus) {
  const all = read<Customer[]>(KEYS.customers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) { all[i].status = status; write(KEYS.customers, all) }
}
export async function saveCustomer(c: Customer) {
  const all = read<Customer[]>(KEYS.customers, [])
  const idx = all.findIndex((x) => x.id === c.id)
  if (idx >= 0) all[idx] = c; else all.unshift(c)
  write(KEYS.customers, all)
}
export async function deleteCustomer(id: string) {
  const all = read<Customer[]>(KEYS.customers, [])
  write(KEYS.customers, all.filter((x) => x.id !== id))
}

export async function saveCustomerKyc(id: string, kyc: CustomerKyc) {
  const all = read<Customer[]>(KEYS.customers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) { all[i].kyc = { ...(all[i].kyc || {}), ...kyc }; write(KEYS.customers, all) }
}
export async function approveCustomerKyc(id: string) {
  await setCustomerStatus(id, 'kyc')
}
export async function markCustomerPending(id: string) {
  await setCustomerStatus(id, 'pending')
}
export async function sendCustomerMessage(
  id: string, type: CustomerMessage['type'], content: string
) {
  const all = read<Customer[]>(KEYS.customers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    const msg: CustomerMessage = {
      id: 'cmsg_' + Math.random().toString(36).slice(2, 8),
      type, content,
      createdAt: new Date().toISOString(),
    }
    all[i].messages = [...(all[i].messages || []), msg]
    write(KEYS.customers, all)
  }
}
export async function suspendCustomer(id: string, reason: string) {
  const all = read<Customer[]>(KEYS.customers, [])
  const i = all.findIndex((x) => x.id === id)
  if (i >= 0) {
    all[i].status = 'suspended'
    const msg: CustomerMessage = {
      id: 'cmsg_' + Math.random().toString(36).slice(2, 8),
      type: 'rejection', content: reason,
      createdAt: new Date().toISOString(),
    }
    all[i].messages = [...(all[i].messages || []), msg]
    write(KEYS.customers, all)
  }
}

// ===================================================
// ========== CUSTOMER SECURITY & NOTIFY (MOCK) ======
// ===================================================
type CustomerSession = { id: string; device: string; ip?: string; ua?: string; lastSeen?: string }
type CustomerNotifyLog = { id: string; channels: string[]; title: string; body: string; createdAt: string }

export async function listCustomerSessions(customerId: string): Promise<CustomerSession[]> {
  const all = read<Record<string, any[]>>(KEYS_CUSTOMER_EXTRA.sessions, {})
  return all[customerId] || []
}
export async function revokeAllCustomerSessions(customerId: string) {
  const all = read<Record<string, any[]>>(KEYS_CUSTOMER_EXTRA.sessions, {})
  all[customerId] = []
  write(KEYS_CUSTOMER_EXTRA.sessions, all)
  await sendCustomerMessage(customerId, 'notice', 'Admin đã thu hồi tất cả phiên đăng nhập')
}
export async function requireCustomerPasswordReset(customerId: string) {
  const flags = read<Record<string, boolean>>(KEYS_CUSTOMER_EXTRA.pwReset, {})
  flags[customerId] = true
  write(KEYS_CUSTOMER_EXTRA.pwReset, flags)
  await sendCustomerMessage(customerId, 'notice', 'Admin yêu cầu đổi mật khẩu ở lần đăng nhập kế tiếp')
}
export async function resetCustomer2FA(customerId: string) {
  const flags = read<Record<string, boolean>>(KEYS_CUSTOMER_EXTRA.reset2FA, {})
  flags[customerId] = true
  write(KEYS_CUSTOMER_EXTRA.reset2FA, flags)
  await sendCustomerMessage(customerId, 'notice', 'Admin đã reset 2FA')
}
export async function listCustomerNotifyLogs(customerId: string): Promise<CustomerNotifyLog[]> {
  const all = read<Record<string, any[]>>(KEYS_CUSTOMER_EXTRA.notify, {})
  return all[customerId] || []
}
export async function sendCustomerNotification(
  customerId: string, channels: string[], title: string, body: string
) {
  const all = read<Record<string, any[]>>(KEYS_CUSTOMER_EXTRA.notify, {})
  const logs = all[customerId] || []
  logs.push({ id: 'cnotify_' + Math.random().toString(36).slice(2, 8),
    channels, title, body, createdAt: new Date().toISOString() })
  all[customerId] = logs
  write(KEYS_CUSTOMER_EXTRA.notify, all)
  await sendCustomerMessage(customerId, 'notice', `[${channels.join(', ')}] ${title} — ${body}`)
}

/* ===================================================
   ========== WALLET SYNC SUPPORT (for wallets.ts) ===
   =================================================== */

export type WalletAccountIndex = {
  id: string;
  role: 'provider' | 'consumer';
  email?: string;
  name?: string;
};

/** Trả về danh sách tài khoản chuẩn hoá để wallets.ts dùng làm chỉ mục */
export function listAccountsForWalletIndex(): WalletAccountIndex[] {
  const providers = read<Provider[]>(KEYS.providers, []);
  const customers = read<Customer[]>(KEYS.customers, []);
  return [
    ...providers.map(p => ({
      id: p.id, role: 'provider' as const, email: p.email, name: p.name,
    })),
    ...customers.map(c => ({
      id: c.id, role: 'consumer' as const, email: c.email, name: c.name,
    })),
  ];
}
