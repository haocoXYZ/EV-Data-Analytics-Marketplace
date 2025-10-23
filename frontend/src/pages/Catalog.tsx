import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import datasetsData from '../data/datasets.json'
import { useAuth } from '../contexts/AuthContext'

type RoleGuarded = 'admin' | 'provider' | 'consumer' | 'guest'

// Kiểu dữ liệu dataset theo datasets.json (providerId là optional)
type Dataset = {
  id: string
  name: string
  provider: string
  category: string
  tags?: string[]
  regions?: string[]
  description: string
  status: 'approved' | 'pending' | 'kyc' | 'suspended'
  rating?: number
  totalDownloads?: number
  lastUpdated?: string
  packages?: { file?: boolean; api?: boolean; subscription?: boolean }
  sampleData?: { totalRecords?: number; dateRange?: string; updateFrequency?: string }
  providerId?: string
}

// Ép kiểu dữ liệu JSON
const data = datasetsData as { datasets: Dataset[] }

export default function Catalog() {
  const { user } = useAuth()
  const role: RoleGuarded = (user?.role as RoleGuarded) || 'guest'

  const myId = user?.id || user?.email || ''                 // tuỳ schema Auth
  const myBrand: string = String(user?.name ?? user?.email ?? '')
  const norm = (s?: string) => (s ?? '').trim().toLowerCase()

  // Xác định quyền sở hữu dataset cho provider
  const isOwner = (ds: Dataset) =>
    ds.providerId ? ds.providerId === myId : norm(ds.provider) === norm(myBrand)

  // ====== Filters state ======
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  // ====== Phạm vi theo role ======
  const scopedDatasets = useMemo(() => {
    const all = data.datasets
    if (role === 'admin') return all
    if (role === 'provider') return all.filter(d => d.status === 'approved' || isOwner(d))
    return all.filter(d => d.status === 'approved') // consumer/guest
  }, [role, myId, myBrand])

  // ====== Options cho category/region ======
  const categories = useMemo(() => {
    const s = new Set<string>()
    scopedDatasets.forEach(d => s.add(d.category))
    return Array.from(s).sort()
  }, [scopedDatasets])

  const regions = useMemo(() => {
    const s = new Set<string>()
    scopedDatasets.forEach(d => (d.regions || []).forEach(r => s.add(r)))
    return Array.from(s).sort()
  }, [scopedDatasets])

  // ====== Áp filter ======
  const datasets = useMemo(() => {
    const q = norm(searchTerm)
    return scopedDatasets.filter(ds => {
      const matchSearch =
        !q ||
        norm(ds.name).includes(q) ||
        norm(ds.description).includes(q) ||
        norm(ds.provider).includes(q) ||
        (ds.tags || []).some(t => norm(t).includes(q))

      const matchCat = !selectedCategory || ds.category === selectedCategory
      const matchReg = !selectedRegion || (ds.regions || []).includes(selectedRegion)
      return matchSearch && matchCat && matchReg
    })
  }, [scopedDatasets, searchTerm, selectedCategory, selectedRegion])

  // ====== CTA theo role ======
  const DatasetActions = ({ ds }: { ds: Dataset }) => {
    const owner = role === 'provider' && isOwner(ds)

    if (role === 'admin') {
      return (
        <div className="flex items-center gap-3">
          <Link to={`/moderator/review?datasetId=${ds.id}`} className="text-blue-600 hover:underline">
            Moderate
          </Link>
          <span className="text-xs text-gray-500">status: {ds.status}</span>
        </div>
      )
    }

    if (owner) {
      return (
        <div className="flex items-center gap-3">
          <Link to={`/provider/datasets/${ds.id}/edit`} className="text-blue-600 hover:underline">
            Edit listing
          </Link>
          <Link to={`/provider/earnings?datasetId=${ds.id}`} className="text-blue-600 hover:underline">
            View sales
          </Link>
          {ds.status !== 'approved' && <span className="text-xs text-orange-500">({ds.status})</span>}
        </div>
      )
    }

    if (role === 'consumer') {
      // Đưa tới trang chi tiết để chọn gói -> DatasetDetail sẽ set pendingOrder rồi navigate('/checkout')
      return (
        <Link to={`/dataset/${ds.id}`} className="text-blue-600 hover:underline">
          View & Buy
        </Link>
      )
    }

    // guest
    return (
      <Link to={`/login?next=/dataset/${ds.id}`} className="text-blue-600 hover:underline">
        Login để mua
      </Link>
    )
  }

  return (
    <ConsumerLayout>
      {/* ===== Filters ===== */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Dataset name, description, provider, tags..."
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-56 rounded border px-3 py-2"
          >
            <option value="">All</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="w-56 rounded border px-3 py-2"
          >
            <option value="">All</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-600">
        Found <b>{datasets.length}</b> dataset{datasets.length !== 1 ? 's' : ''}
      </div>

      {/* ===== Grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {datasets.map(ds => (
          <div key={ds.id} className="border rounded-lg p-4 hover:shadow-sm transition">
            <Link to={`/dataset/${ds.id}`}><h3 className="font-semibold text-lg">{ds.name}</h3></Link>
            <p className="text-sm text-gray-600">{ds.provider}</p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs rounded bg-gray-100 px-2 py-1">{ds.category}</span>
              {(ds.tags || []).slice(0, 3).map(t => (
                <span key={t} className="text-xs rounded bg-gray-100 px-2 py-1">#{t}</span>
              ))}
              {role !== 'consumer' && role !== 'guest' && (
                <span className="text-xs rounded bg-gray-100 px-2 py-1">status: {ds.status}</span>
              )}
            </div>

            <p className="text-sm mt-2 line-clamp-2">{ds.description}</p>

            <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
              {ds.rating ? <span>⭐ {ds.rating}</span> : null}
              {typeof ds.totalDownloads === 'number' ? <span>⬇ {ds.totalDownloads}</span> : null}
              {ds.packages && (
                <span className="ml-auto flex gap-2">
                  {ds.packages.file && <span className="rounded bg-gray-100 px-2 py-0.5">File</span>}
                  {ds.packages.api && <span className="rounded bg-gray-100 px-2 py-0.5">API</span>}
                  {ds.packages.subscription && <span className="rounded bg-gray-100 px-2 py-0.5">Subscription</span>}
                </span>
              )}
            </div>

            {/* CTA theo role */}
            <div className="mt-3">
              <DatasetActions ds={ds} />
            </div>
          </div>
        ))}
      </div>

      {datasets.length === 0 && (
        <div className="text-center text-gray-500 py-12">Không có kết quả phù hợp</div>
      )}
    </ConsumerLayout>
  )
}
