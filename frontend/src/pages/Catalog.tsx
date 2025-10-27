import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { datasetsApi } from '../api'
import { Dataset } from '../types'

export default function Catalog() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [filteredDatasets, setFilteredDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const categories = [
    'All',
    'Charging Stations',
    'Battery Data',
    'Routing',
    'Infrastructure',
    'Grid Impact',
    'User Behavior',
    'Maintenance',
    'Network Planning'
  ]

  useEffect(() => {
    loadDatasets()
  }, [])

  useEffect(() => {
    filterAndSort()
  }, [datasets, searchTerm, selectedCategory, sortBy])

  const loadDatasets = async () => {
    try {
      setLoading(true)
      const data = await datasetsApi.getAll()
      setDatasets(data)
    } catch (error) {
      console.error('Failed to load datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSort = () => {
    let filtered = [...datasets]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(d => d.category === selectedCategory)
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.providerName?.toLowerCase().includes(term)
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        break
      case 'price-low':
        filtered.sort((a, b) => (a.basePricePerMb || 0) - (b.basePricePerMb || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.basePricePerMb || 0) - (a.basePricePerMb || 0))
        break
      case 'size':
        filtered.sort((a, b) => (b.dataSizeMb || 0) - (a.dataSizeMb || 0))
        break
    }

    setFilteredDatasets(filtered)
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Miễn phí'
    return `${price.toLocaleString('vi-VN')} đ/MB`
  }

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-3">B4: Khám phá Datasets</h1>
            <p className="text-blue-100 text-lg">Tìm kiếm và lựa chọn dữ liệu EV phù hợp với nhu cầu của bạn</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm datasets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp → cao</option>
                  <option value="price-high">Giá cao → thấp</option>
                  <option value="size">Kích thước lớn nhất</option>
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    (cat === 'All' && !selectedCategory) || selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-600">
              Tìm thấy <span className="font-semibold text-gray-900">{filteredDatasets.length}</span> datasets
            </div>
          </div>

          {/* Datasets Grid */}
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredDatasets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map((dataset) => (
                <Link
                  key={dataset.datasetId}
                  to={`/dataset/${dataset.datasetId}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {dataset.category}
                      </span>
                      <span className="text-2xl">📊</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {dataset.name}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {dataset.description || 'Không có mô tả'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {dataset.dataSizeMb?.toFixed(2)} MB
                        </span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {dataset.tierName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {dataset.providerName}
                      </div>
                      <div className="font-bold text-lg text-blue-600">
                        {formatPrice(dataset.basePricePerMb)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-center group-hover:shadow-lg transition-all">
                        Xem chi tiết →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy datasets</h3>
              <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </ConsumerLayout>
  )
}
