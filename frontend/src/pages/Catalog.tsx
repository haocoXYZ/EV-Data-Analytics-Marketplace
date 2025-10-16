import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import datasetsData from '../data/datasets.json'

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  const datasets = datasetsData.datasets.filter(d => d.status === 'approved')

  const categories = useMemo(() => {
    const cats = new Set(datasets.map(d => d.category))
    return Array.from(cats)
  }, [datasets])

  const regions = useMemo(() => {
    const regs = new Set(datasets.flatMap(d => d.regions))
    return Array.from(regs)
  }, [datasets])

  const filteredDatasets = useMemo(() => {
    return datasets.filter(ds => {
      const matchSearch = ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.provider.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory = !selectedCategory || ds.category === selectedCategory
      const matchRegion = !selectedRegion || ds.regions.includes(selectedRegion)
      return matchSearch && matchCategory && matchRegion
    })
  }, [datasets, searchTerm, selectedCategory, selectedRegion])

  return (
    <ConsumerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Danh mục dữ liệu trạm sạc</h1>
        
        {/* Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên, nhà cung cấp, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả khu vực</option>
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 text-gray-600">
          Hiển thị <span className="font-semibold">{filteredDatasets.length}</span> bộ dữ liệu
        </div>

        {/* Dataset Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map(dataset => (
            <Link key={dataset.id} to={`/dataset/${dataset.id}`} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1">
                  {dataset.name}
                </h3>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">{dataset.provider}</span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {dataset.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {dataset.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-semibold">{dataset.rating} ★</span>
                </div>
                <div className="text-gray-500">
                  {dataset.totalDownloads.toLocaleString()} lượt tải
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-2 text-xs">
                  {dataset.packages.file && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">File</span>}
                  {dataset.packages.api && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">API</span>}
                  {dataset.packages.subscription && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Theo dõi</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredDatasets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy dữ liệu phù hợp. Hãy thử điều chỉnh bộ lọc.
          </div>
        )}
      </div>
    </ConsumerLayout>
  )
}
