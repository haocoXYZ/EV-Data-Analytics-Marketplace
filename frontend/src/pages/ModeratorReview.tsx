import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import datasetsData from '../data/datasets.json'

// ===== Types khớp JSON hiện tại =====
type Dataset = {
  id: string
  name: string
  provider: string
  category: string
  regions: string[]
  sampleData: { totalRecords: number; updateFrequency: string }
  packages: { file?: boolean; api?: boolean; subscription?: boolean }
  description: string
  tags: string[]
  status?: 'pending' | 'approved' | 'rejected'
}

type Checklist = {
  sampleQuality: boolean
  descriptionClear: boolean
  providerVerified: boolean
  noDuplicate: boolean
}

type DecisionStatus = 'approved' | 'rejected'
type Decision = {
  id: string
  datasetId: string
  datasetName: string
  provider: string
  category: string
  packages: string[]
  status: DecisionStatus
  notes?: string
  checklist: Checklist
  moderator: string
  decidedAt: string // ISO
  restored?: boolean // đánh dấu nếu đã khôi phục lại hàng chờ
}

// ===== LocalStorage Keys =====
const LS_DATASETS = 'ev.moderation.datasets'
const LS_HISTORY = 'ev.moderation.decisions'

// ===== Helpers =====
const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`
const fmtInt = (n: number) => n.toLocaleString('en-US')
const fmtDate = (iso: string) => new Date(iso).toLocaleString()
const download = (filename: string, content: string, mime = 'text/csv;charset=utf-8;') => {
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

export default function ModeratorReview() {
  const [activeTab, setActiveTab] = useState<'review' | 'history'>('review')

  // ===== Datasets (hàng chờ + trạng thái) =====
  const [datasets, setDatasets] = useState<Dataset[]>(() => {
    // ưu tiên dữ liệu đã lưu, fallback về JSON
    try {
      const stored = localStorage.getItem(LS_DATASETS)
      if (stored) return JSON.parse(stored) as Dataset[]
    } catch {}
    const seeded: Dataset[] = (datasetsData as any).datasets.map((d: Dataset) => ({
      ...d,
      status: d.status ?? 'pending',
    }))
    localStorage.setItem(LS_DATASETS, JSON.stringify(seeded))
    return seeded
  })

  useEffect(() => {
    localStorage.setItem(LS_DATASETS, JSON.stringify(datasets))
  }, [datasets])

  const pendingDatasets = useMemo(
    () => datasets.filter((d) => d.status === 'pending'),
    [datasets]
  )

  // ===== Checklist & Notes theo dataset (state cục bộ) =====
  const [checks, setChecks] = useState<Record<string, Checklist>>({})
  const [notesById, setNotesById] = useState<Record<string, string>>({})

  const getChecks = (id: string): Checklist =>
    checks[id] ?? {
      sampleQuality: false,
      descriptionClear: false,
      providerVerified: false,
      noDuplicate: false,
    }

  // ===== History (Approved/Rejected) =====
  const [history, setHistory] = useState<Decision[]>(() => {
    try {
      const raw = localStorage.getItem(LS_HISTORY)
      return raw ? (JSON.parse(raw) as Decision[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(history))
  }, [history])

  // ===== Handlers Review =====
  const pushDecision = (d: Dataset, status: DecisionStatus) => {
    const cl = getChecks(d.id)
    const decision: Decision = {
      id: uid('md'),
      datasetId: d.id,
      datasetName: d.name,
      provider: d.provider,
      category: d.category,
      packages: Object.entries(d.packages)
        .filter(([, v]) => !!v)
        .map(([k]) => k),
      status,
      notes: notesById[d.id] || undefined,
      checklist: cl,
      moderator: 'admin',
      decidedAt: new Date().toISOString(),
    }
    setHistory((prev) => [decision, ...prev])
  }

  const handleApprove = (id: string) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'approved' } : d))
    )
    const d = datasets.find((x) => x.id === id)
    if (d) pushDecision(d, 'approved')
    alert(`Dataset ${id} đã được phê duyệt và xuất hiện trong Catalog!`)
  }

  const handleReject = (id: string) => {
    if (confirm('Bạn có chắc muốn từ chối dataset này?')) {
      // giữ lại dataset nhưng gắn cờ rejected để có thể xem ở Lịch sử & khôi phục
      setDatasets((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'rejected' } : d))
      )
      const d = datasets.find((x) => x.id === id)
      if (d) pushDecision(d, 'rejected')
      alert(`Dataset ${id} đã bị từ chối.`)
    }
  }

  // ===== HISTORY filters / actions =====
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DecisionStatus>('all')

  const filteredHistory = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return history.filter(
      (h) =>
        (statusFilter === 'all' ? true : h.status === statusFilter) &&
        (kw === '' ||
          h.datasetName.toLowerCase().includes(kw) ||
          h.provider.toLowerCase().includes(kw) ||
          h.category.toLowerCase().includes(kw))
    )
  }, [history, q, statusFilter])

  const exportHistoryCSV = () => {
    const header = [
      'DatasetId',
      'DatasetName',
      'Provider',
      'Category',
      'Packages',
      'Status',
      'Moderator',
      'DecidedAt',
      'Notes',
      'Check.SampleOK',
      'Check.DescOK',
      'Check.Verified',
      'Check.NoDuplicate',
      'Restored',
    ]
    const rows = [header.join(',')]
    filteredHistory.forEach((d) => {
      rows.push(
        [
          d.datasetId,
          d.datasetName.includes(',') ? `"${d.datasetName}"` : d.datasetName,
          d.provider.includes(',') ? `"${d.provider}"` : d.provider,
          d.category,
          d.packages.join('|'),
          d.status,
          d.moderator,
          d.decidedAt,
          d.notes ? (d.notes.includes(',') ? `"${d.notes}"` : d.notes) : '',
          String(d.checklist.sampleQuality),
          String(d.checklist.descriptionClear),
          String(d.checklist.providerVerified),
          String(d.checklist.noDuplicate),
          String(!!d.restored),
        ].join(',')
      )
    })
    download(
      `moderation-history-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.join('\n')
    )
  }

  const restoreToPending = (rec: Decision) => {
    // chuyển dataset thành pending, đánh dấu record lịch sử là restored
    setDatasets((prev) =>
      prev.map((d) =>
        d.id === rec.datasetId ? { ...d, status: 'pending' } : d
      )
    )
    setHistory((prev) =>
      prev.map((h) => (h.id === rec.id ? { ...h, restored: true } : h))
    )
    alert('Đã khôi phục dataset về hàng chờ.')
  }

  // ===== UI =====
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Kiểm duyệt Dataset</h1>
          <div className="flex rounded-xl border overflow-hidden">
            <button
              className={`px-4 py-2 ${
                activeTab === 'review' ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
              onClick={() => setActiveTab('review')}
            >
              Review
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Lịch sử duyệt
            </button>
          </div>
        </div>

        {/* ================= Review Tab ================= */}
        {activeTab === 'review' && (
          <>
            {pendingDatasets.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2">
                  Không có dataset cần kiểm duyệt
                </h2>
                <p className="text-gray-600">Tất cả submissions đã được xử lý</p>
              </div>
            )}

            <div className="space-y-6">
              {pendingDatasets.map((dataset) => {
                const c = getChecks(dataset.id)
                return (
                  <div key={dataset.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">
                          {dataset.name}
                        </h2>
                        <p className="text-gray-600">
                          Nhà cung cấp:{' '}
                          <span className="font-semibold">
                            {dataset.provider}
                          </span>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        Chờ duyệt
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Danh mục:</span>
                            <span className="font-medium">
                              {dataset.category}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Khu vực:</span>
                            <span className="font-medium">
                              {dataset.regions.join(', ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tổng records:
                            </span>
                            <span className="font-medium">
                              {fmtInt(dataset.sampleData.totalRecords)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cập nhật:</span>
                            <span className="font-medium">
                              {dataset.sampleData.updateFrequency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Gói hỗ trợ</h3>
                        <div className="flex flex-wrap gap-2">
                          {dataset.packages.file && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              📁 File
                            </span>
                          )}
                          {dataset.packages.api && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              🔌 API
                            </span>
                          )}
                          {dataset.packages.subscription && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              🌍 Subscription
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Mô tả</h3>
                      <p className="text-gray-700">{dataset.description}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {dataset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h3 className="font-semibold mb-2">✅ Checklist kiểm duyệt</h3>
                      <div className="space-y-1 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={c.sampleQuality}
                            onChange={(e) =>
                              setChecks((prev) => ({
                                ...prev,
                                [dataset.id]: {
                                  ...getChecks(dataset.id),
                                  sampleQuality: e.target.checked,
                                },
                              }))
                            }
                          />
                          Dữ liệu mẫu đầy đủ, chất lượng tốt
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={c.descriptionClear}
                            onChange={(e) =>
                              setChecks((prev) => ({
                                ...prev,
                                [dataset.id]: {
                                  ...getChecks(dataset.id),
                                  descriptionClear: e.target.checked,
                                },
                              }))
                            }
                          />
                          Mô tả rõ ràng, không vi phạm chính sách
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={c.providerVerified}
                            onChange={(e) =>
                              setChecks((prev) => ({
                                ...prev,
                                [dataset.id]: {
                                  ...getChecks(dataset.id),
                                  providerVerified: e.target.checked,
                                },
                              }))
                            }
                          />
                          Nhà cung cấp uy tín, đã verify
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={c.noDuplicate}
                            onChange={(e) =>
                              setChecks((prev) => ({
                                ...prev,
                                [dataset.id]: {
                                  ...getChecks(dataset.id),
                                  noDuplicate: e.target.checked,
                                },
                              }))
                            }
                          />
                          Không trùng lặp với dataset hiện có
                        </label>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm text-gray-600 mb-1">
                        Ghi chú (nếu có)
                      </label>
                      <textarea
                        className="input w-full h-24"
                        placeholder="Lý do từ chối / lưu ý khi phê duyệt..."
                        value={notesById[dataset.id] || ''}
                        onChange={(e) =>
                          setNotesById((prev) => ({
                            ...prev,
                            [dataset.id]: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(dataset.id)}
                        className="btn-primary flex-1"
                      >
                        ✅ Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(dataset.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex-1"
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ================= History Tab ================= */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Lịch sử duyệt</h2>
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  placeholder="Tìm (dataset / provider / category)..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | DecisionStatus)
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Đã từ chối</option>
                </select>
                <button className="btn-secondary" onClick={exportHistoryCSV}>
                  📥 Xuất CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Dataset</th>
                    <th className="text-left py-3 px-4">Provider</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Packages</th>
                    <th className="text-left py-3 px-4">Moderator</th>
                    <th className="text-left py-3 px-4">Thời gian</th>
                    <th className="text-center py-3 px-4">Trạng thái</th>
                    <th className="text-right py-3 px-4 w-[220px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((d) => {
                    const badge =
                      d.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{d.datasetName}</div>
                          <div className="text-xs text-gray-500">
                            {d.datasetId}
                          </div>
                          {d.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              Note: {d.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">{d.provider}</td>
                        <td className="py-3 px-4">{d.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {d.packages.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs capitalize"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">{d.moderator}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {fmtDate(d.decidedAt)}
                          {d.restored && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                              restored
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm ${badge}`}>
                            {d.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <button
                              className="btn-primary"
                              onClick={() => restoreToPending(d)}
                            >
                              ↩ Khôi phục
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-gray-500"
                      >
                        Chưa có bản ghi phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
