import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getPricing, savePricing } from '../api/admin'
import type { PricingConfig, PricingMonthlyOption, MonthlyTerm, PlanMeta } from '../types/admin'

type EditTarget = 'api' | 'oneTime' | 'monthly' | 'commission' | null

const TERM_LABEL: Record<MonthlyTerm, string> = {
  1: '1 tháng',
  3: '3 tháng',
  6: '6 tháng',
  9: '9 tháng',
  12: '12 tháng',
}

export default function AdminPricing() {
  const [cfg, setCfg] = useState<PricingConfig | null>(null)
  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [draft, setDraft] = useState<PricingConfig | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => setCfg(getPricing()), [])

  const providerPercent = useMemo(() => {
    const p = cfg?.commission.platformPercent ?? 0
    return Math.max(0, 100 - p)
  }, [cfg])

  const minMonthly = useMemo(() => {
    if (!cfg?.monthly?.options?.length) return null
    return cfg.monthly.options.reduce(
      (min, o) =>
        o.pricePerRegionPerMonthUSD < min.pricePerRegionPerMonthUSD ? o : min,
      cfg.monthly.options[0]
    )
  }, [cfg])

  function openEditor(target: EditTarget) {
    if (!cfg) return
    setEditTarget(target)
    setDraft(JSON.parse(JSON.stringify(cfg)))
  }
  function closeEditor() { setEditTarget(null); setDraft(null) }

  function setMonthlyPrice(months: MonthlyTerm, price: number) {
    if (!draft) return
    const opts = [...(draft.monthly?.options || [])]
    const i = opts.findIndex(o => o.months === months)
    if (i >= 0) opts[i] = { ...opts[i], pricePerRegionPerMonthUSD: price }
    else opts.push({ months, pricePerRegionPerMonthUSD: price })
    opts.sort((a, b) => a.months - b.months)
    setDraft({ ...draft, monthly: { ...draft.monthly, options: opts as PricingMonthlyOption[] } })
  }

  // ==== helpers cho meta (title/description/features) ====
  function getMeta(target: Exclude<EditTarget, 'commission'>): PlanMeta {
    const d = draft!
    return target === 'api' ? d.api.meta : target === 'oneTime' ? d.oneTime.meta : d.monthly.meta
  }
  function setMeta(target: Exclude<EditTarget, 'commission'>, patch: Partial<PlanMeta>) {
    if (!draft) return
    if (target === 'api') setDraft({ ...draft, api: { ...draft.api, meta: { ...draft.api.meta, ...patch } } })
    if (target === 'oneTime') setDraft({ ...draft, oneTime: { ...draft.oneTime, meta: { ...draft.oneTime.meta, ...patch } } })
    if (target === 'monthly') setDraft({ ...draft, monthly: { ...draft.monthly, meta: { ...draft.monthly.meta, ...patch } } })
  }
  function setFeature(target: Exclude<EditTarget, 'commission'>, idx: number, value: string) {
    const meta = getMeta(target)
    const next = [...meta.features]
    next[idx] = value
    setMeta(target, { features: next })
  }
  function addFeature(target: Exclude<EditTarget, 'commission'>) {
    const meta = getMeta(target)
    setMeta(target, { features: [...meta.features, ''] })
  }
  function removeFeature(target: Exclude<EditTarget, 'commission'>, idx: number) {
    const meta = getMeta(target)
    const next = meta.features.filter((_, i) => i !== idx)
    setMeta(target, { features: next })
  }

  function saveCurrent() {
    if (!cfg || !draft || !editTarget) return
    const next: PricingConfig = { ...cfg }

    if (editTarget === 'api') {
      next.api = {
        pricePerRequest: Math.max(0, Number(draft.api.pricePerRequest) || 0),
        note: draft.api.note || undefined,
        meta: {
          title: draft.api.meta.title?.trim() || 'API',
          description: draft.api.meta.description?.trim(),
          features: (draft.api.meta.features || []).filter(s => s.trim().length > 0),
        },
      }
    }

    if (editTarget === 'oneTime') {
      next.oneTime = {
        priceUSD: Math.max(0, Number(draft.oneTime.priceUSD) || 0),
        lookbackDays: Math.max(1, Math.floor(Number(draft.oneTime.lookbackDays) || 30)),
        meta: {
          title: draft.oneTime.meta.title?.trim() || 'Gói mua 1 lần',
          description: draft.oneTime.meta.description?.trim(),
          features: (draft.oneTime.meta.features || []).filter(s => s.trim().length > 0),
        },
      }
    }

    if (editTarget === 'monthly') {
      next.monthly = {
        options: (draft.monthly.options || [])
          .filter(o => o && o.months && o.pricePerRegionPerMonthUSD >= 0)
          .sort((a, b) => a.months - b.months) as PricingMonthlyOption[],
        meta: {
          title: draft.monthly.meta.title?.trim() || 'Gói tháng (3/6/9/12 tháng)',
          description: draft.monthly.meta.description?.trim(),
          features: (draft.monthly.meta.features || []).filter(s => s.trim().length > 0),
        },
      }
    }

    if (editTarget === 'commission') {
      next.commission = {
        platformPercent: Math.min(100, Math.max(0, Number(draft.commission.platformPercent) || 0)),
      }
    }

    next.updatedAt = new Date().toISOString()
    savePricing(next)
    setCfg(next)
    closeEditor()
  }

  async function copyForProvider() {
    if (!cfg) return
    const lines: string[] = []
    lines.push('BẢNG GIÁ DATA PROVIDERS')
    lines.push('')
    lines.push(`${cfg.api.meta.title}: $${cfg.api.pricePerRequest.toFixed(3)}/request`)
    lines.push(
      `${cfg.oneTime.meta.title}: $${cfg.oneTime.priceUSD.toFixed(0)} (dữ liệu từ ${cfg.oneTime.lookbackDays} ngày trước đến hôm nay)`
    )
    if (cfg.monthly.options?.length) {
      lines.push(`${cfg.monthly.meta.title}:`)
      cfg.monthly.options.forEach(o =>
        lines.push(` - ${o.months} tháng: $${o.pricePerRegionPerMonthUSD}/khu vực/tháng`)
      )
    }
    lines.push('')
    lines.push(
      `Chia sẻ doanh thu: Nền tảng giữ ${cfg.commission.platformPercent}% — Provider nhận ${100 - cfg.commission.platformPercent}%`
    )
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // Mô tả gói one-time hỗ trợ {lookbackDays}
  function renderOneTimeDesc() {
    const d = cfg?.oneTime.meta.description
    if (!cfg) return ''
    return (d || `Dữ liệu được cập nhật từ ${cfg.oneTime.lookbackDays} ngày trước đến hôm nay`)
      .replace('{lookbackDays}', String(cfg.oneTime.lookbackDays))
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bảng giá cho Data Providers</h1>
          <p className="text-gray-600">
            Các nhà cung cấp dữ liệu sẽ dựa vào bảng giá này để quyết định tham gia nền tảng
          </p>
        </div>

        {!cfg ? (
          <div className="text-gray-500">Đang tải cấu hình…</div>
        ) : (
          <>
            {/* Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* API */}
              <div className="card hover:shadow-xl transition-shadow relative">
                <button
                  onClick={() => openEditor('api')}
                  className="absolute right-3 top-3 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  ✏️ Sửa
                </button>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">🔌</div>
                  <h2 className="text-2xl font-bold mb-2">{cfg.api.meta.title}</h2>
                  <p className="text-gray-600 text-sm">{cfg.api.meta.description}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      ${cfg.api.pricePerRequest.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">mỗi request</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold mb-2">Tính năng:</div>
                  {(cfg.api.meta.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* One-time */}
              <div className="card hover:shadow-xl transition-shadow relative">
                <button
                  onClick={() => openEditor('oneTime')}
                  className="absolute right-3 top-3 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  ✏️ Sửa
                </button>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">📁</div>
                  <h2 className="text-2xl font-bold mb-2">{cfg.oneTime.meta.title}</h2>
                  <p className="text-gray-600 text-sm">{renderOneTimeDesc()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-700">${cfg.oneTime.priceUSD.toFixed(0)}</div>
                    <div className="text-sm text-gray-600 mt-1">mỗi lần</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold mb-2">Tính năng:</div>
                  {(cfg.oneTime.meta.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly */}
              <div className="card hover:shadow-xl transition-shadow relative">
                <button
                  onClick={() => openEditor('monthly')}
                  className="absolute right-3 top-3 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  ✏️ Sửa
                </button>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">🌍</div>
                  <h2 className="text-2xl font-bold mb-2">{cfg.monthly.meta.title}</h2>
                  <p className="text-gray-600 text-sm">{cfg.monthly.meta.description}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      {minMonthly ? `$${minMonthly.pricePerRegionPerMonthUSD.toFixed(0)}` : '$—'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">giá thấp nhất / khu vực / tháng</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold mb-2">Kỳ hạn &amp; đơn giá:</div>
                  {(cfg.monthly.options || []).map((o) => (
                    <div key={o.months} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span className="text-gray-700">
                        {TERM_LABEL[o.months]} — ${o.pricePerRegionPerMonthUSD}/khu vực/tháng
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mt-3">
                  <div className="font-semibold mb-2">Tính năng:</div>
                  {(cfg.monthly.meta.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue share */}
            <div className="card bg-blue-50 border-blue-200 relative">
              <button
                onClick={() => openEditor('commission')}
                className="absolute right-3 top-3 text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                ✏️ Sửa
              </button>
              <h2 className="text-xl font-bold mb-4">💼 Chính sách chia sẻ doanh thu</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Data Provider nhận</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <span className="font-semibold">{providerPercent}%</span> doanh thu từ bán dữ liệu</li>
                    <li>• Thanh toán hàng tháng vào ngày 1</li>
                    <li>• Báo cáo chi tiết giao dịch</li>
                    <li>• Không phí ẩn</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Nền tảng giữ lại</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <span className="font-semibold">{cfg.commission.platformPercent}%</span> phí dịch vụ nền tảng</li>
                    <li>• Bao gồm: hosting, API, payment gateway, support</li>
                    <li>• Marketing &amp; promotion</li>
                    <li>• Quality assurance</li>
                  </ul>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3">
                Cập nhật lần cuối: {new Date(cfg.updatedAt).toLocaleString()}
              </div>
            </div>

            <div className="mt-6 text-center space-x-2">
              <button onClick={copyForProvider} className="btn-primary">
                📋 Sao chép bảng giá cho Provider
              </button>
              {copied && <span className="text-green-600 text-sm">Đã sao chép!</span>}
            </div>
          </>
        )}

        {/* Modal Editor — chỉnh theo từng gói, bao gồm mô tả & tính năng */}
        {editTarget && draft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeEditor} />
            <div className="relative bg-white w-full max-w-2xl rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editTarget === 'api' && 'Sửa gói API'}
                  {editTarget === 'oneTime' && 'Sửa gói mua 1 lần'}
                  {editTarget === 'monthly' && 'Sửa gói tháng'}
                  {editTarget === 'commission' && 'Sửa chính sách chia sẻ doanh thu'}
                </h3>
                <button onClick={closeEditor} className="text-gray-500 hover:text-gray-700">✖</button>
              </div>

              {/* API editor */}
              {editTarget === 'api' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Tiêu đề</label>
                    <input className="input" value={draft.api.meta.title}
                      onChange={(e) => setMeta('api', { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Mô tả</label>
                    <textarea className="textarea" rows={2} value={draft.api.meta.description || ''}
                      onChange={(e) => setMeta('api', { description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Giá / request (USD)</label>
                    <input type="number" step="0.001" min={0} className="input"
                      value={draft.api.pricePerRequest}
                      onChange={(e) => setDraft({ ...draft, api: { ...draft.api, pricePerRequest: Number(e.target.value) } })}/>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Tính năng</div>
                    {(draft.api.meta.features || []).map((f, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input className="input flex-1" value={f} onChange={(e) => setFeature('api', i, e.target.value)} />
                        <button className="btn-secondary" onClick={() => removeFeature('api', i)}>Xóa</button>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={() => addFeature('api')}>+ Thêm dòng</button>
                  </div>
                </div>
              )}

              {/* One-time editor */}
              {editTarget === 'oneTime' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Tiêu đề</label>
                    <input className="input" value={draft.oneTime.meta.title}
                      onChange={(e) => setMeta('oneTime', { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Mô tả (có thể dùng {`{lookbackDays}`})</label>
                    <textarea className="textarea" rows={2} value={draft.oneTime.meta.description || ''}
                      onChange={(e) => setMeta('oneTime', { description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Giá (USD)</label>
                      <input type="number" min={0} step="1" className="input"
                        value={draft.oneTime.priceUSD}
                        onChange={(e) => setDraft({ ...draft, oneTime: { ...draft.oneTime, priceUSD: Number(e.target.value) } })}/>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Số ngày lookback</label>
                      <input type="number" min={1} step="1" className="input"
                        value={draft.oneTime.lookbackDays}
                        onChange={(e) => setDraft({ ...draft, oneTime: { ...draft.oneTime, lookbackDays: Number(e.target.value) } })}/>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Tính năng</div>
                    {(draft.oneTime.meta.features || []).map((f, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input className="input flex-1" value={f} onChange={(e) => setFeature('oneTime', i, e.target.value)} />
                        <button className="btn-secondary" onClick={() => removeFeature('oneTime', i)}>Xóa</button>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={() => addFeature('oneTime')}>+ Thêm dòng</button>
                  </div>
                </div>
              )}

              {/* Monthly editor */}
              {editTarget === 'monthly' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">Tiêu đề</label>
                    <input className="input" value={draft.monthly.meta.title}
                      onChange={(e) => setMeta('monthly', { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Mô tả</label>
                    <textarea className="textarea" rows={2} value={draft.monthly.meta.description || ''}
                      onChange={(e) => setMeta('monthly', { description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 3, 6, 9, 12].map((m) => {
                      const opt = draft.monthly.options.find((o) => o.months === (m as MonthlyTerm))
                      return (
                        <div key={m}>
                          <label className="block text-sm mb-1">{TERM_LABEL[m as MonthlyTerm]} — USD/khu vực/tháng</label>
                          <input type="number" min={0} step="1" className="input"
                            value={opt ? opt.pricePerRegionPerMonthUSD : 0}
                            onChange={(e) => setMonthlyPrice(m as MonthlyTerm, Number(e.target.value))}/>
                        </div>
                      )
                    })}
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Tính năng</div>
                    {(draft.monthly.meta.features || []).map((f, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input className="input flex-1" value={f} onChange={(e) => setFeature('monthly', i, e.target.value)} />
                        <button className="btn-secondary" onClick={() => removeFeature('monthly', i)}>Xóa</button>
                      </div>
                    ))}
                    <button className="btn-secondary" onClick={() => addFeature('monthly')}>+ Thêm dòng</button>
                  </div>
                </div>
              )}

              {/* Commission editor */}
              {editTarget === 'commission' && (
                <div>
                  <label className="block text-sm mb-1">Nền tảng giữ lại (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="1"
                    value={draft.commission.platformPercent}
                    onChange={(e) =>
                      setDraft({ ...draft, commission: { platformPercent: Number(e.target.value) } })
                    }
                    className="input"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Provider nhận: <b>{Math.max(0, 100 - Number(draft.commission.platformPercent))}%</b>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-6">
                <button className="btn-secondary" onClick={closeEditor}>Hủy</button>
                <button className="btn-primary" onClick={saveCurrent}>Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
