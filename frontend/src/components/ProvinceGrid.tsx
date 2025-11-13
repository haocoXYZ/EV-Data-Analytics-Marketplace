import { useState, useMemo } from 'react'
import { Province } from '../types'
import ProvinceCard from './ProvinceCard'

interface ProvinceGridProps {
  provinces: Province[]
  selectedProvinceId?: number
  onProvinceSelect: (provinceId: number) => void
  provinceData?: Record<number, { totalRecords: number; loading: boolean }>
}

// Vietnam regions mapping (simplified)
const REGION_MAPPING: Record<string, string> = {
  // Northern Vietnam
  'HAN': 'North', 'HPH': 'North', 'QNI': 'North', 'BNI': 'North', 'HNO': 'North',
  'LCI': 'North', 'BCN': 'North', 'DIN': 'North', 'TQU': 'North', 'VPH': 'North',
  'PTH': 'North', 'YBA': 'North', 'HGI': 'North', 'BCG': 'North', 'LAI': 'North',
  'LAO': 'North', 'SLA': 'North', 'TUY': 'North', 'NBN': 'North', 'HBA': 'North',

  // Central Vietnam
  'THA': 'Central', 'NGE': 'Central', 'HTI': 'Central', 'QBI': 'Central', 'QTR': 'Central',
  'TTH': 'Central', 'DNG': 'Central', 'QNA': 'Central', 'QNG': 'Central', 'BDI': 'Central',
  'PHU': 'Central', 'KHA': 'Central', 'NTH': 'Central',

  // Central Highlands
  'KTU': 'Highlands', 'GLA': 'Highlands', 'DLA': 'Highlands', 'DNO': 'Highlands', 'LAM': 'Highlands',

  // Southern Vietnam
  'HCM': 'South', 'DNI': 'South', 'BAR': 'South', 'BTH': 'South', 'TNI': 'South',
  'BDU': 'South', 'LAN': 'South', 'TGI': 'South', 'BLI': 'South', 'VLO': 'South',
  'TVI': 'South', 'DTA': 'South', 'AGI': 'South', 'BLU': 'South', 'CTO': 'South',
  'HGI': 'South', 'KGI': 'South', 'STR': 'South', 'BGI': 'South', 'CMU': 'South',
}

const REGIONS = [
  { id: 'all', name: 'All Regions', icon: '🇻🇳' },
  { id: 'North', name: 'Northern Vietnam', icon: '⛰️' },
  { id: 'Central', name: 'Central Vietnam', icon: '🏖️' },
  { id: 'Highlands', name: 'Central Highlands', icon: '🌄' },
  { id: 'South', name: 'Southern Vietnam', icon: '🌴' },
]

export default function ProvinceGrid({
  provinces,
  selectedProvinceId,
  onProvinceSelect,
  provinceData
}: ProvinceGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'data'>('name')

  // Filter and sort provinces
  const filteredProvinces = useMemo(() => {
    let filtered = provinces

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(p => REGION_MAPPING[p.code] === selectedRegion)
    }

    // Sort
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    } else {
      filtered = [...filtered].sort((a, b) => {
        const aData = provinceData?.[a.provinceId]?.totalRecords || 0
        const bData = provinceData?.[b.provinceId]?.totalRecords || 0
        return bData - aData
      })
    }

    return filtered
  }, [provinces, searchQuery, selectedRegion, sortBy, provinceData])

  // Group by region for display
  const provincesByRegion = useMemo(() => {
    const grouped: Record<string, Province[]> = {}

    if (selectedRegion === 'all') {
      REGIONS.slice(1).forEach(region => {
        grouped[region.id] = filteredProvinces.filter(p => REGION_MAPPING[p.code] === region.id)
      })
    } else {
      grouped[selectedRegion] = filteredProvinces
    }

    return grouped
  }, [filteredProvinces, selectedRegion])

  // Statistics
  const stats = useMemo(() => {
    const totalProvinces = filteredProvinces.length
    const provincesWithData = filteredProvinces.filter(p => (provinceData?.[p.provinceId]?.totalRecords || 0) > 0).length
    const totalRecords = filteredProvinces.reduce((sum, p) => sum + (provinceData?.[p.provinceId]?.totalRecords || 0), 0)

    return { totalProvinces, provincesWithData, totalRecords }
  }, [filteredProvinces, provinceData])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Province
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'data')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Province Name (A-Z)</option>
              <option value="data">Data Availability</option>
            </select>
          </div>
        </div>

        {/* Region Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {REGIONS.map(region => {
            const isActive = selectedRegion === region.id
            const count = region.id === 'all'
              ? provinces.length
              : provinces.filter(p => REGION_MAPPING[p.code] === region.id).length

            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="mr-1">{region.icon}</span>
                {region.name}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">Total Provinces</div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalProvinces}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
            <div className="text-xs text-green-600 font-medium">With Data</div>
            <div className="text-2xl font-bold text-green-900">{stats.provincesWithData}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">Total Records</div>
            <div className="text-2xl font-bold text-purple-900">{stats.totalRecords.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Province Grid by Region */}
      {Object.entries(provincesByRegion).map(([regionId, regionProvinces]) => {
        if (regionProvinces.length === 0) return null

        const region = REGIONS.find(r => r.id === regionId)

        return (
          <div key={regionId} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2 text-2xl">{region?.icon}</span>
              {region?.name}
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {regionProvinces.length} provinces
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regionProvinces.map(province => {
                const data = provinceData?.[province.provinceId]
                return (
                  <ProvinceCard
                    key={province.provinceId}
                    province={province}
                    isSelected={selectedProvinceId === province.provinceId}
                    recordCount={data?.totalRecords || 0}
                    loading={data?.loading}
                    onClick={() => onProvinceSelect(province.provinceId)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* No results */}
      {filteredProvinces.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No provinces found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
