import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'

// ===================== Types =====================
type Order = {
  orderId: string
  datasetName: string
  package: 'file' | 'api' | 'subscription' | string
  price: number
  provider: string
  timestamp: string // ISO date (yyyy-mm-dd) or ISO datetime
  buyerEmail?: string
  buyerName?: string
}

type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'

type ProviderPayout = {
  id: string
  provider: string
  period: string // e.g. '2025-10'
  gross: number
  platformFee: number
  providerNet: number
  orderIds: string[]
  status: PayoutStatus
  method?: string
  txRef?: string
  notes?: string
  paidAt?: string
}

type CustomerPayout = {
  id: string
  customerEmail: string
  customerName?: string
  period: string
  provider: string
  orderId: string
  amount: number
  reason: 'refund' | 'cashback' | 'adjustment'
  status: PayoutStatus
  method?: string
  txRef?: string
  notes?: string
  paidAt?: string
}

type Severity = 'low' | 'medium' | 'high'

type RiskFlag = {
  id: string
  type: 'provider' | 'customer'
  targetId: string // provider name or customer email
  severity: Severity
  reason: string
  createdAt: string
  resolved?: boolean
}

type CustomerInsight = {
  email: string
  name?: string
  orderCount: number
  spentTotal: number
  avgOrder: number
  providersCount: number
  lastPurchase: string
  refundsAmount: number
  refundsCount: number
  netAfterRefunds: number
  score: number
  tier: 'Tiềm năng' | 'Theo dõi' | 'Rủi ro'
}

// ===================== LocalStorage Keys =====================
const LS_ORDERS = 'ev.admin.demo.orders' // demo-only bucket
const LS_PAYOUTS = 'ev.admin.payouts'
const LS_CUSTOMER_PAYOUTS = 'ev.admin.customer.payouts'
const LS_PLATFORM_RATE = 'ev.admin.platform.rate' // 0.3 = 30%
const LS_RISK_FLAGS = 'ev.admin.risk.flags'
const LS_BLOCKED_PROVIDERS = 'ev.admin.blockedProviders'

// ===================== Helpers =====================
const fmt = (n: number) => `$${n.toFixed(2)}`
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

function yyyymm(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function parseDate(s: string) {
  // Accept 'YYYY-MM-DD' or full ISO
  const safe = s.length === 10 ? `${s}T00:00:00` : s
  return new Date(safe)
}

function inPeriod(dateStr: string, period: string) {
  try {
    const d = parseDate(dateStr)
    return yyyymm(d) === period
  } catch {
    return false
  }
}

function download(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`
}

// Seed demo orders once (idempotent)
function seedDemoOrders(extra?: Order[]) {
  const seeded = localStorage.getItem(LS_ORDERS)
  if (seeded) return JSON.parse(seeded) as Order[]
  const base: Order[] = [
    { orderId: 'ORD-1001', datasetName: 'EV Charging Station Usage Data - Vietnam', package: 'file', price: 109, provider: 'VinFast Charging Network', timestamp: '2025-10-10', buyerEmail: 'alice@example.com', buyerName: 'Alice Nguyen' },
    { orderId: 'ORD-1002', datasetName: 'Battery Health Telemetry Dataset', package: 'api', price: 20, provider: 'TechEV Analytics', timestamp: '2025-10-12', buyerEmail: 'bob@example.com', buyerName: 'Bob Tran' },
    { orderId: 'ORD-1003', datasetName: 'Smart City EV Integration Data', package: 'subscription', price: 398, provider: 'SmartCity IoT', timestamp: '2025-10-13', buyerEmail: 'carol@example.com', buyerName: 'Carol Pham' },
  ]
  const mappedExtra = (extra || []).map(o => ({ ...o, buyerEmail: o.buyerEmail || 'guest@example.com' }))
  const data = [...base, ...mappedExtra]
  localStorage.setItem(LS_ORDERS, JSON.stringify(data))
  return data
}

function seedCustomerPayouts(period: string): CustomerPayout[] {
  const seeded = localStorage.getItem(LS_CUSTOMER_PAYOUTS)
  if (seeded) return JSON.parse(seeded) as CustomerPayout[]
  const demo: CustomerPayout[] = [
    {
      id: uid('cp'),
      customerEmail: 'alice@example.com',
      customerName: 'Alice Nguyen',
      period,
      provider: 'TechEV Analytics',
      orderId: 'ORD-1002',
      amount: 10,
      reason: 'refund',
      status: 'pending'
    },
    {
      id: uid('cp'),
      customerEmail: 'bob@example.com',
      customerName: 'Bob Tran',
      period,
      provider: 'VinFast Charging Network',
      orderId: 'ORD-1001',
      amount: 15,
      reason: 'cashback',
      status: 'pending'
    },
  ]
  localStorage.setItem(LS_CUSTOMER_PAYOUTS, JSON.stringify(demo))
  return demo
}

// ===================== Dev Self-Tests =====================
function runDevTests() {
  try {
    const a: string | undefined = undefined
    const b: string | undefined = 'note'
    const result = (a ?? b) || undefined
    console.assert(result === 'note', 'TEST1 failed')

    const csv = ['row1', 'row2'].join('\n')
    console.assert(csv === 'row1\nrow2', 'TEST2 failed')

    console.assert(inPeriod('2025-10-01', '2025-10'), 'TEST3 failed')
  } catch {
    // noop — tests are best-effort
  }
}

// ===================== Component =====================
export default function AdminPayouts() {
  // =============== State ===============
  const [activeTab, setActiveTab] = useState<'provider' | 'customer' | 'risk'>('provider')
  const [orders, setOrders] = useState<Order[]>([])
  const [period, setPeriod] = useState<string>(() => yyyymm(new Date()))
  const [providerQuery, setProviderQuery] = useState('')
  const [pkgFilter, setPkgFilter] = useState<string>('all')
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({})
  const [payouts, setPayouts] = useState<ProviderPayout[]>([])
  const [customerPayouts, setCustomerPayouts] = useState<CustomerPayout[]>([])
  const [platformRate, setPlatformRate] = useState<number>(() => {
    const v = localStorage.getItem(LS_PLATFORM_RATE)
    return v ? Number(v) : 0.3
  })
  const [blockedProviders, setBlockedProviders] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_BLOCKED_PROVIDERS) || '[]') } catch { return [] }
  })
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_RISK_FLAGS) || '[]') } catch { return [] }
  })

  // Drawers
  const [openProvider, setOpenProvider] = useState<string | null>(null)
  const [payMethod, setPayMethod] = useState('Bank Transfer')
  const [txRef, setTxRef] = useState('')
  const [note, setNote] = useState('')

  const [openCustomerPayout, setOpenCustomerPayout] = useState<CustomerPayout | null>(null)
  const [openCustomerInsights, setOpenCustomerInsights] = useState<string | null>(null)

  // =============== Effects ===============
  useEffect(() => {
    runDevTests()
    const completed = localStorage.getItem('completedOrder')
    const extra: Order[] = completed ? [{ ...JSON.parse(completed), buyerEmail: 'guest@example.com' }] : []
    const data = seedDemoOrders(extra)
    setOrders(data)

    const ps = localStorage.getItem(LS_PAYOUTS)
    setPayouts(ps ? JSON.parse(ps) : [])

    const cps = seedCustomerPayouts(yyyymm(new Date()))
    setCustomerPayouts(cps)
  }, [])

  useEffect(() => { localStorage.setItem(LS_PLATFORM_RATE, String(platformRate)) }, [platformRate])
  useEffect(() => { localStorage.setItem(LS_PAYOUTS, JSON.stringify(payouts)) }, [payouts])
  useEffect(() => { localStorage.setItem(LS_CUSTOMER_PAYOUTS, JSON.stringify(customerPayouts)) }, [customerPayouts])
  useEffect(() => { localStorage.setItem(LS_RISK_FLAGS, JSON.stringify(riskFlags)) }, [riskFlags])
  useEffect(() => { localStorage.setItem(LS_BLOCKED_PROVIDERS, JSON.stringify(blockedProviders)) }, [blockedProviders])

  // =============== Derived ===============
  const filteredOrders = useMemo(() => {
    return orders.filter(o => inPeriod(o.timestamp, period))
      .filter(o => (pkgFilter === 'all' ? true : o.package === pkgFilter))
      .filter(o => o.provider.toLowerCase().includes(providerQuery.toLowerCase()))
  }, [orders, period, pkgFilter, providerQuery])

  const grouped = useMemo(() => {
    const g: Record<string, { total: number; orders: Order[] }> = {}
    for (const o of filteredOrders) {
      const key = o.provider
      if (!g[key]) g[key] = { total: 0, orders: [] }
      g[key].total += o.price
      g[key].orders.push(o)
    }
    return g
  }, [filteredOrders])

  const totals = useMemo(() => {
    const revenue = filteredOrders.reduce((s, o) => s + o.price, 0)
    const fee = revenue * platformRate
    const provider = revenue - fee
    return { revenue, fee, provider }
  }, [filteredOrders, platformRate])

  // ---------- Customer Insights ----------
  const customerInsightsMap = useMemo(() => {
    const map = new Map<string, CustomerInsight>()
    const ordersInPeriod = filteredOrders.filter(o => o.buyerEmail)

    for (const o of ordersInPeriod) {
      const email = o.buyerEmail as string
      const cur = map.get(email) || {
        email,
        name: o.buyerName,
        orderCount: 0,
        spentTotal: 0,
        avgOrder: 0,
        providersCount: 0,
        lastPurchase: o.timestamp,
        refundsAmount: 0,
        refundsCount: 0,
        netAfterRefunds: 0,
        score: 0,
        tier: 'Theo dõi' as const,
      }
      cur.orderCount += 1
      cur.spentTotal += o.price
      cur.lastPurchase = parseDate(o.timestamp) > parseDate(cur.lastPurchase) ? o.timestamp : cur.lastPurchase
      map.set(email, cur)
    }

    // providers count per customer
    const providersByCustomer: Record<string, Set<string>> = {}
    for (const o of ordersInPeriod) {
      const email = o.buyerEmail as string
      if (!providersByCustomer[email]) providersByCustomer[email] = new Set<string>()
      providersByCustomer[email].add(o.provider)
    }

    // refunds/cashbacks in period
    const payoutsInPeriod = customerPayouts.filter(c => c.period === period)
    for (const c of payoutsInPeriod) {
      const cur = map.get(c.customerEmail)
      if (!cur) continue
      if (c.reason === 'refund' || c.reason === 'cashback') {
        cur.refundsAmount += c.amount
        cur.refundsCount += 1
      }
    }

    // finalize metrics
    for (const [email, cur] of map) {
      cur.providersCount = providersByCustomer[email]?.size || 0
      cur.avgOrder = cur.orderCount ? cur.spentTotal / cur.orderCount : 0
      cur.netAfterRefunds = cur.spentTotal - cur.refundsAmount

      const spentScore = clamp((cur.spentTotal / 500) * 40, 0, 40)      // 500$ -> 40pts
      const freqScore = clamp((cur.orderCount / 5) * 30, 0, 30)         // 5 orders -> 30pts
      const diversityScore = clamp((cur.providersCount / 3) * 20, 0, 20)// 3 providers -> 20pts
      const refundRatio = cur.orderCount ? cur.refundsCount / cur.orderCount : 0
      const refundPenalty = -clamp(refundRatio * 100, 0, 30)            // up to -30

      cur.score = Math.round(spentScore + freqScore + diversityScore + refundPenalty)
      cur.tier = cur.score >= 70 ? 'Tiềm năng' : cur.score >= 45 ? 'Theo dõi' : 'Rủi ro'
    }

    return map
  }, [filteredOrders, customerPayouts, period])

  const customerInsights = useMemo(() => Array.from(customerInsightsMap.values())
    .sort((a, b) => b.spentTotal - a.spentTotal), [customerInsightsMap])

  const customersTotals = useMemo(() => {
    const spent = customerInsights.reduce((s, c) => s + c.spentTotal, 0)
    const net = customerInsights.reduce((s, c) => s + c.netAfterRefunds, 0)
    return { spent, net, count: customerInsights.length }
  }, [customerInsights])

  function exportCSVCustomerInsights() {
    const header = ['Email','Name','Orders','Spent','AvgOrder','Providers','RefundsCount','RefundsAmount','NetAfterRefunds','LastPurchase','Score','Tier']
    const rows = [header.join(',')]
    customerInsights.forEach(c => {
      rows.push([
        c.email,
        c.name || '',
        String(c.orderCount),
        c.spentTotal.toFixed(2),
        c.avgOrder.toFixed(2),
        String(c.providersCount),
        String(c.refundsCount),
        c.refundsAmount.toFixed(2),
        c.netAfterRefunds.toFixed(2),
        c.lastPurchase,
        String(c.score),
        c.tier
      ].map(x => (String(x).includes(',') ? `"${x}"` : String(x))).join(','))
    })
    download(`customers-insights-${period}.csv`, rows.join('\n'))
  }

  function findPayout(provider: string): ProviderPayout | undefined {
    return payouts
      .filter(p => p.period === period && p.provider === provider)
      .sort((a, b) => (b.paidAt ? Date.parse(b.paidAt) : 0) - (a.paidAt ? Date.parse(a.paidAt) : 0))[0]
  }

  // =============== Actions ===============
  function toggleSelect(provider: string, checked: boolean) {
    setSelectedProviders(prev => ({ ...prev, [provider]: checked }))
  }

  function buildPayout(provider: string): ProviderPayout {
    const data = grouped[provider]
    const gross = data.total
    const platformFee = Math.round((gross * platformRate) * 100) / 100
    const providerNet = Math.round((gross - platformFee) * 100) / 100
    return {
      id: uid('payout'),
      provider,
      period,
      gross,
      platformFee,
      providerNet,
      orderIds: data.orders.map(o => o.orderId),
      status: 'pending',
    }
  }

  function upsertPayout(record: ProviderPayout) {
    setPayouts(prev => {
      const next = prev.filter(p => !(p.provider === record.provider && p.period === record.period && (p.status === 'pending' || p.status === 'processing')))
      return [...next, record]
    })
  }

  function markPaidProvider(provider: string, method?: string, ref?: string, noteText?: string) {
    const base = findPayout(provider) || buildPayout(provider)
    const paid: ProviderPayout = {
      ...base,
      status: 'paid',
      method: method || payMethod,
      txRef: ref || txRef || `MANUAL-${Date.now()}`,
      notes: (noteText ?? note) || undefined,
      paidAt: new Date().toISOString(),
    }
    upsertPayout(paid)
    alert(`Đã ghi nhận thanh toán cho ${provider}: ${fmt(paid.providerNet)}`)
  }

  function bulkPaySelected() {
    const providers = Object.entries(selectedProviders).filter(([, v]) => v).map(([k]) => k)
    if (providers.length === 0) { alert('Hãy chọn ít nhất 1 provider để thanh toán.'); return }
    if (!confirm(`Xác nhận thanh toán cho ${providers.length} provider?`)) return
    for (const p of providers) { if (!blockedProviders.includes(p)) markPaidProvider(p, 'Bank Transfer', `BULK-${Date.now()}`) }
    setSelectedProviders({})
  }

  function exportCSVProviders() {
    const header = ['Period', 'Provider', 'Orders', 'Gross', 'Platform Fee', 'Provider Net', 'Status', 'Paid At', 'Method', 'TxRef']
    const rows: string[] = [header.join(',')]
    Object.keys(grouped).forEach(provider => {
      const p = findPayout(provider)
      const data = grouped[provider]
      const gross = data.total
      const platformFee = gross * platformRate
      const providerNet = gross - platformFee
      rows.push([
        period,
        provider,
        String(data.orders.length),
        gross.toFixed(2),
        platformFee.toFixed(2),
        providerNet.toFixed(2),
        p?.status || 'pending',
        p?.paidAt || '',
        p?.method || '',
        p?.txRef || '',
      ].map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : String(cell)).join(','))
    })
    download(`payouts-${period}.csv`, rows.join('\n'))
  }

  // ===== Customer payouts actions =====
  function markPaidCustomer(record: CustomerPayout, method?: string, ref?: string, noteText?: string) {
    setCustomerPayouts(prev => prev.map(cp => cp.id === record.id ? {
      ...cp,
      status: 'paid',
      method: method || 'Bank Transfer',
      txRef: ref || `CUST-${Date.now()}`,
      notes: noteText || cp.notes,
      paidAt: new Date().toISOString()
    } : cp))
    alert(`Đã chi trả cho ${record.customerEmail}: ${fmt(record.amount)}`)
  }

  function exportCSVCustomers() {
    const header = ['Period','Customer','Email','Provider','OrderId','Amount','Reason','Status','PaidAt','Method','TxRef']
    const rows: string[] = [header.join(',')]
    customerPayouts.filter(c => c.period === period).forEach(c => {
      rows.push([
        c.period,
        c.customerName || '',
        c.customerEmail,
        c.provider,
        c.orderId,
        c.amount.toFixed(2),
        c.reason,
        c.status,
        c.paidAt || '',
        c.method || '',
        c.txRef || ''
      ].map(x => String(x)).join(','))
    })
    download(`customer-payouts-${period}.csv`, rows.join('\n'))
  }

  // ===== Risk scoring =====
  const riskView = useMemo(() => {
    const flags: RiskFlag[] = []
    const revenueTotal = filteredOrders.reduce((s, o) => s + o.price, 0) || 1
    // By provider
    Object.keys(grouped).forEach(provider => {
      const g = grouped[provider]
      const share = g.total / revenueTotal
      const avg = g.total / (g.orders.length || 1)
      const providerRefundCount = customerPayouts.filter(c => c.provider === provider && c.reason === 'refund' && c.period === period).length
      const refundRate = providerRefundCount / (g.orders.length || 1)
      if (share > 0.5) flags.push({ id: uid('risk'), type: 'provider', targetId: provider, severity: 'high', reason: `Doanh thu chiếm ${(share*100).toFixed(0)}% kỳ ${period}`, createdAt: new Date().toISOString() })
      if (avg > 250) flags.push({ id: uid('risk'), type: 'provider', targetId: provider, severity: 'medium', reason: `AOV cao: ${fmt(avg)}`, createdAt: new Date().toISOString() })
      if (refundRate > 0.2) flags.push({ id: uid('risk'), type: 'provider', targetId: provider, severity: 'medium', reason: `Tỉ lệ hoàn tiền ${(refundRate*100).toFixed(0)}%`, createdAt: new Date().toISOString() })
    })
    // By customer
    const byCustomer: Record<string, number> = {}
    customerPayouts.filter(c => c.period === period && c.reason === 'refund').forEach(c => {
      byCustomer[c.customerEmail] = (byCustomer[c.customerEmail] || 0) + 1
    })
    Object.keys(byCustomer).forEach(email => {
      if (byCustomer[email] >= 2) flags.push({ id: uid('risk'), type: 'customer', targetId: email, severity: 'low', reason: `Nhiều yêu cầu hoàn tiền (${byCustomer[email]})`, createdAt: new Date().toISOString() })
    })
    return flags
  }, [grouped, filteredOrders, customerPayouts, period])

  function refreshRisk() {
    setRiskFlags(prev => {
      const map = new Map<string, RiskFlag>()
      for (const f of prev) map.set(`${f.targetId}|${f.reason}`, f)
      for (const f of riskView) {
        const key = `${f.targetId}|${f.reason}`
        if (!map.has(key)) map.set(key, f)
      }
      return Array.from(map.values())
    })
  }

  function resolveFlag(id: string) {
    setRiskFlags(prev => prev.map(f => f.id === id ? { ...f, resolved: true } : f))
  }

  function toggleBlockProvider(provider: string, blocked: boolean) {
    setBlockedProviders(prev => {
      const set = new Set(prev)
      if (blocked) {
        set.add(provider)
      } else {
        set.delete(provider)
      }
      return Array.from(set)
    })
  }

  // Details for the opened provider
  const details = useMemo(() => {
    if (!openProvider) return null
    const data = grouped[openProvider]
    if (!data) return null
    const fee = data.total * platformRate
    const net = data.total - fee
    return { ...data, fee, net }
  }, [openProvider, grouped, platformRate])

  const insightDetail = useMemo(() => {
    if (!openCustomerInsights) return null
    return customerInsightsMap.get(openCustomerInsights) || null
  }, [openCustomerInsights, customerInsightsMap])

  // =============== UI ===============
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Đối soát & Thanh toán</h1>
          <div className="flex rounded-xl border overflow-hidden">
            <button className={`px-4 py-2 ${activeTab==='provider' ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={()=>setActiveTab('provider')}>Providers</button>
            <button className={`px-4 py-2 ${activeTab==='customer' ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={()=>setActiveTab('customer')}>Customers</button>
            <button className={`px-4 py-2 ${activeTab==='risk' ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={()=>{ setActiveTab('risk'); refreshRisk() }}>Risk</button>
          </div>
        </div>

        {/* Filters & Config (shared) */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Kỳ đối soát (YYYY-MM)</label>
              <input value={period} onChange={e => setPeriod(e.target.value)} placeholder="2025-10" className="w-full input" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lọc theo provider</label>
              <input value={providerQuery} onChange={e => setProviderQuery(e.target.value)} placeholder="Nhập tên provider..." className="w-full input" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Gói</label>
              <select value={pkgFilter} onChange={e => setPkgFilter(e.target.value)} className="w-full input">
                <option value="all">Tất cả</option>
                <option value="file">File</option>
                <option value="api">API</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tỉ lệ phí nền tảng</label>
              <div className="flex items-center gap-2">
                <input type="number" step="0.01" min={0} max={1} value={platformRate} onChange={e => setPlatformRate(Math.max(0, Math.min(1, Number(e.target.value))))} className="w-full input" />
                <span className="text-sm text-gray-500 whitespace-nowrap">(vd: 0.3 = 30%)</span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'provider' && (
          <>
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-sm text-gray-600 mb-1">Tổng doanh thu kỳ {period}</div>
                <div className="text-3xl font-bold text-blue-700">{fmt(totals.revenue)}</div>
              </div>
              <div className="card bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-sm text-gray-600 mb-1">Trả cho Providers ({Math.round((1 - platformRate) * 100)}%)</div>
                <div className="text-3xl font-bold text-green-700">{fmt(totals.provider)}</div>
              </div>
              <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-sm text-gray-600 mb-1">Phí nền tảng ({Math.round(platformRate * 100)}%)</div>
                <div className="text-3xl font-bold text-purple-700">{fmt(totals.fee)}</div>
              </div>
            </div>

            {/* Provider Payouts Table */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chi tiết thanh toán theo Provider</h2>
                <div className="flex items-center gap-2">
                  <button onClick={exportCSVProviders} className="btn-secondary">📊 Xuất báo cáo CSV</button>
                  <button onClick={bulkPaySelected} className="btn-primary">💸 Thanh toán hàng loạt</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4"><input type="checkbox"
                        aria-label="select all"
                        onChange={(e) => {
                          const checked = e.target.checked
                          const all: Record<string, boolean> = {}
                          Object.keys(grouped).forEach(p => { all[p] = checked })
                          setSelectedProviders(all)
                        }}
                        checked={Object.keys(grouped).length > 0 && Object.keys(grouped).every(p => selectedProviders[p])}
                      /></th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Số đơn</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Doanh thu</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Phí nền tảng</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Provider nhận</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[280px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(grouped).map((provider) => {
                      const data = grouped[provider]
                      const fee = data.total * platformRate
                      const net = data.total - fee
                      const payout = findPayout(provider)
                      const status: PayoutStatus = blockedProviders.includes(provider) ? 'failed' : (payout?.status || 'pending')
                      const color = status === 'paid' ? 'bg-green-100 text-green-700' : status === 'processing' ? 'bg-blue-100 text-blue-700' : status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      return (
                        <tr key={provider} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-center">
                            <input type="checkbox" checked={!!selectedProviders[provider]} onChange={e => toggleSelect(provider, e.target.checked)} />
                          </td>
                          <td className="py-3 px-4 font-medium flex items-center gap-2">
                            <span>{provider}</span>
                            {blockedProviders.includes(provider) && <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">ĐANG CHẶN</span>}
                          </td>
                          <td className="py-3 px-4 text-right">{data.orders.length}</td>
                          <td className="py-3 px-4 text-right font-semibold">{fmt(data.total)}</td>
                          <td className="py-3 px-4 text-right">{fmt(fee)}</td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">{fmt(net)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm ${color}`}>
                              {status === 'pending' && 'Chờ thanh toán'}
                              {status === 'processing' && 'Đang xử lý'}
                              {status === 'paid' && 'Đã thanh toán'}
                              {status === 'failed' && 'Tạm dừng / Lỗi'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2 whitespace-nowrap">
                              <button className="btn-secondary" onClick={() => setOpenProvider(provider)}>🔎 Chi tiết</button>
                              <button className="btn-secondary" onClick={() => toggleBlockProvider(provider, !blockedProviders.includes(provider))}>
                                {blockedProviders.includes(provider) ? '🔓 Gỡ chặn' : '⛔ Chặn' }
                              </button>
                              <button
                                className="btn-primary disabled:opacity-50"
                                disabled={status === 'paid' || blockedProviders.includes(provider)}
                                onClick={() => markPaidProvider(provider)}
                              >
                                💸 Thanh toán
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-3 px-4" colSpan={2}>Tổng cộng</td>
                      <td className="py-3 px-4 text-right">{filteredOrders.length}</td>
                      <td className="py-3 px-4 text-right">{fmt(totals.revenue)}</td>
                      <td className="py-3 px-4 text-right">{fmt(totals.fee)}</td>
                      <td className="py-3 px-4 text-right text-green-700">{fmt(totals.provider)}</td>
                      <td className="py-3 px-4" colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'customer' && (
          <>
            {/* ==== Customers Overview ==== */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="card">
                <div className="text-sm text-gray-600">Tổng chi tiêu KH (có email)</div>
                <div className="text-2xl font-bold">{fmt(customersTotals.spent)}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600">Số KH mua hàng trong kỳ</div>
                <div className="text-2xl font-bold">{customersTotals.count}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600">Net sau hoàn tiền</div>
                <div className="text-2xl font-bold text-green-700">{fmt(customersTotals.net)}</div>
              </div>
            </div>

            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Tổng quan khách hàng</h2>
                <div className="flex gap-2">
                  <button onClick={exportCSVCustomerInsights} className="btn-secondary">📥 Xuất CSV Insights</button>
                </div>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Khách hàng</th>
                      <th className="text-right py-3 px-4">Số đơn</th>
                      <th className="text-right py-3 px-4">Chi tiêu</th>
                      <th className="text-right py-3 px-4">AOV</th>
                      <th className="text-right py-3 px-4">Số provider</th>
                      <th className="text-right py-3 px-4">Hoàn tiền (#/$)</th>
                      <th className="text-right py-3 px-4">Net</th>
                      <th className="text-left py-3 px-4">Gần nhất</th>
                      <th className="text-left py-3 px-4">Điểm</th>
                      <th className="text-right py-3 px-4 w-[160px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInsights.map(c => (
                      <tr key={c.email} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{c.name || '-'}</div>
                          <div className="text-xs text-gray-500">{c.email}</div>
                        </td>
                        <td className="py-3 px-4 text-right">{c.orderCount}</td>
                        <td className="py-3 px-4 text-right font-semibold">{fmt(c.spentTotal)}</td>
                        <td className="py-3 px-4 text-right">{fmt(c.avgOrder)}</td>
                        <td className="py-3 px-4 text-right">{c.providersCount}</td>
                        <td className="py-3 px-4 text-right">{c.refundsCount} / {fmt(c.refundsAmount)}</td>
                        <td className="py-3 px-4 text-right text-green-700">{fmt(c.netAfterRefunds)}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(c.lastPurchase).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${c.tier==='Tiềm năng'?'bg-green-100 text-green-700':c.tier==='Theo dõi'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                            {c.tier} • {c.score}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <button className="btn-secondary" onClick={() => setOpenCustomerInsights(c.email)}>🔎 Chi tiết</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customerInsights.length === 0 && (
                      <tr><td colSpan={10} className="py-6 text-center text-gray-500">Chưa có dữ liệu khách hàng trong kỳ.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ==== Customer payouts (giữ nguyên) ==== */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Chi trả cho Customer (refund/cashback)</h2>
                <div className="flex gap-2">
                  <button onClick={exportCSVCustomers} className="btn-secondary">📥 Tải CSV Chi trả</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Khách hàng</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Provider</th>
                      <th className="text-left py-3 px-4">Order</th>
                      <th className="text-right py-3 px-4">Số tiền</th>
                      <th className="text-left py-3 px-4">Lý do</th>
                      <th className="text-center py-3 px-4">Trạng thái</th>
                      <th className="text-right py-3 px-4 w-[220px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPayouts.filter(c => c.period === period).map(cp => (
                      <tr key={cp.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{cp.customerName || '-'}</td>
                        <td className="py-3 px-4">{cp.customerEmail}</td>
                        <td className="py-3 px-4">{cp.provider}</td>
                        <td className="py-3 px-4">{cp.orderId}</td>
                        <td className="py-3 px-4 text-right font-semibold">{fmt(cp.amount)}</td>
                        <td className="py-3 px-4 capitalize">{cp.reason}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm ${cp.status==='paid'?'bg-green-100 text-green-700':cp.status==='failed'?'bg-red-100 text-red-700':cp.status==='processing'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>
                            {cp.status === 'pending' ? 'Chờ thanh toán' : cp.status === 'paid' ? 'Đã thanh toán' : cp.status === 'processing' ? 'Đang xử lý' : 'Lỗi'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <button className="btn-secondary" onClick={() => setOpenCustomerPayout(cp)}>🔎 Chi tiết</button>
                            <button className="btn-primary" disabled={cp.status==='paid'} onClick={() => markPaidCustomer(cp)}>💸 Thanh toán</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'risk' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="card">
                <div className="text-sm text-gray-600">Tổng doanh thu</div>
                <div className="text-2xl font-bold">{fmt(totals.revenue)}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600">Số flags hiện tại</div>
                <div className="text-2xl font-bold">{riskFlags.filter(f=>!f.resolved).length}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600">Providers đang chặn</div>
                <div className="text-2xl font-bold">{blockedProviders.length}</div>
              </div>
            </div>

            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Cảnh báo rủi ro</h2>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={refreshRisk}>🔁 Quét lại</button>
                </div>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left">Đối tượng</th>
                      <th className="py-3 px-4 text-left">Mức độ</th>
                      <th className="py-3 px-4 text-left">Lý do</th>
                      <th className="py-3 px-4 text-left">Thời gian</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskFlags.map(f => (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{f.type === 'provider' ? `Provider: ${f.targetId}` : `Customer: ${f.targetId}`}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${f.severity==='high'?'bg-red-100 text-red-700':f.severity==='medium'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-700'}`}>{f.severity.toUpperCase()}</span>
                          {f.resolved && <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">RESOLVED</span>}
                        </td>
                        <td className="py-3 px-4">{f.reason}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(f.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {f.type === 'provider' && (
                            <button className="btn-secondary" onClick={() => toggleBlockProvider(f.targetId, !blockedProviders.includes(f.targetId))}>
                              {blockedProviders.includes(f.targetId) ? '🔓 Gỡ chặn' : '⛔ Chặn'}
                            </button>
                          )}
                          {!f.resolved && <button className="btn-primary" onClick={() => resolveFlag(f.id)}>✔️ Xác nhận</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Recent Orders (always visible) */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Giao dịch gần đây</h2>
          <div className="space-y-3">
            {filteredOrders.slice(0, 5).map(order => (
              <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{order.orderId}</div>
                  <div className="text-sm text-gray-600 truncate">{order.datasetName}</div>
                  <div className="text-xs text-gray-500">{order.timestamp || 'Recent'}</div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-blue-600">{fmt(order.price)}</div>
                  <div className="text-xs text-gray-500 capitalize">{order.package}</div>
                </div>
              </div>
            ))}
          </div>
          {activeTab === 'provider' && (
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={exportCSVProviders} className="btn-secondary">📥 Tải CSV đối soát</button>
              <button onClick={bulkPaySelected} className="btn-primary">💸 Thực hiện thanh toán hàng loạt</button>
            </div>
          )}
          {activeTab === 'customer' && (
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={exportCSVCustomerInsights} className="btn-secondary">📥 Tải CSV Insights</button>
              <button onClick={exportCSVCustomers} className="btn-secondary">📥 Tải CSV Chi trả</button>
            </div>
          )}
        </div>
      </div>

      {/* Provider Drawer */}
      {openProvider && details && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenProvider(null)}></div>
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Chi tiết: {openProvider}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setOpenProvider(null)}>✕</button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Số đơn</div>
                <div className="text-xl font-bold">{details.orders.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Doanh thu</div>
                <div className="text-xl font-bold">{fmt(details.total)}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Provider nhận</div>
                <div className="text-xl font-bold text-green-700">{fmt(details.net)}</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Đơn hàng trong kỳ {period}</h4>
              <div className="border rounded-lg divide-y">
                {details.orders.map(o => (
                  <div key={o.orderId} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.orderId}</div>
                      <div className="text-sm text-gray-500">{o.datasetName}</div>
                      <div className="text-xs text-gray-400">{o.timestamp}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fmt(o.price)}</div>
                      <div className="text-xs text-gray-500">{o.package}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Thanh toán thủ công</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phương thức</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full input">
                    <option>Bank Transfer</option>
                    <option>Stripe</option>
                    <option>Momo</option>
                    <option>ZaloPay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mã giao dịch / Ref</label>
                  <input value={txRef} onChange={e => setTxRef(e.target.value)} placeholder="Nhập mã tham chiếu (tuỳ chọn)" className="w-full input" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú nội bộ..." className="w-full input h-20" />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button className="btn-secondary" onClick={() => setOpenProvider(null)}>Huỷ</button>
                  <button className="btn-primary" onClick={() => { markPaidProvider(openProvider!); setOpenProvider(null) }}>Xác nhận thanh toán</button>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">* Lưu ý: Ghi nhận thanh toán sẽ cập nhật trạng thái sang <b>Đã thanh toán</b> trong bảng tổng hợp.</div>
          </div>
        </div>
      )}

      {/* Customer Insights Drawer */}
      {openCustomerInsights && insightDetail && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenCustomerInsights(null)}></div>
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Khách hàng: {insightDetail.name || insightDetail.email}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setOpenCustomerInsights(null)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Tổng chi tiêu</div>
                <div className="text-xl font-bold">{fmt(insightDetail.spentTotal)}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Số đơn</div>
                <div className="text-xl font-bold">{insightDetail.orderCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">AOV</div>
                <div className="text-xl font-bold">{fmt(insightDetail.avgOrder)}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Số provider</div>
                <div className="text-xl font-bold">{insightDetail.providersCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Hoàn tiền</div>
                <div className="text-xl font-bold">{insightDetail.refundsCount} / {fmt(insightDetail.refundsAmount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Net sau hoàn</div>
                <div className="text-xl font-bold text-green-700">{fmt(insightDetail.netAfterRefunds)}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm"><b>Gần nhất:</b> {new Date(insightDetail.lastPurchase).toLocaleString()}</div>
              <div className="text-sm mt-1">
                <b>Đánh giá:</b>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${insightDetail.tier==='Tiềm năng'?'bg-green-100 text-green-700':insightDetail.tier==='Theo dõi'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                  {insightDetail.tier} • {insightDetail.score}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500">* Điểm tiềm năng dựa trên chi tiêu, tần suất mua, đa dạng provider và tỉ lệ hoàn tiền.</div>
          </div>
        </div>
      )}

      {/* Customer Payout Drawer (giữ) */}
      {openCustomerPayout && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpenCustomerPayout(null)}></div>
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Chi tiết khách: {openCustomerPayout.customerName || openCustomerPayout.customerEmail}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setOpenCustomerPayout(null)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Số tiền</div>
                <div className="text-xl font-bold">{fmt(openCustomerPayout.amount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-xs text-gray-500">Lý do</div>
                <div className="text-xl font-bold capitalize">{openCustomerPayout.reason}</div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="text-sm"><b>Provider:</b> {openCustomerPayout.provider}</div>
              <div className="text-sm"><b>Order:</b> {openCustomerPayout.orderId}</div>
              <div className="text-sm"><b>Kỳ:</b> {openCustomerPayout.period}</div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Thanh toán thủ công</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phương thức</label>
                  <select value={openCustomerPayout.method || 'Bank Transfer'} onChange={e => setOpenCustomerPayout(prev => (prev ? { ...prev, method: e.target.value } : prev))} className="w-full input">
                    <option>Bank Transfer</option>
                    <option>Stripe</option>
                    <option>Momo</option>
                    <option>ZaloPay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mã giao dịch / Ref</label>
                  <input value={openCustomerPayout.txRef || ''} onChange={e => setOpenCustomerPayout(prev => (prev ? { ...prev, txRef: e.target.value } : prev))} placeholder="Nhập mã tham chiếu (tuỳ chọn)" className="w-full input" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                  <textarea value={openCustomerPayout.notes || ''} onChange={e => setOpenCustomerPayout(prev => (prev ? { ...prev, notes: e.target.value } : prev))} placeholder="Ghi chú nội bộ..." className="w-full input h-20" />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button className="btn-secondary" onClick={() => setOpenCustomerPayout(null)}>Huỷ</button>
                  <button className="btn-primary" onClick={() => { markPaidCustomer(openCustomerPayout); setOpenCustomerPayout(null) }}>Xác nhận thanh toán</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

/* =====================
 * Minimal Tailwind-ish utility classes expected in the host app:
 * .card { @apply p-4 rounded-xl border border-gray-200 bg-white shadow-sm; }
 * .btn-primary { @apply inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700; }
 * .btn-secondary { @apply inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200; }
 * .input { @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500; }
 * ===================== */
