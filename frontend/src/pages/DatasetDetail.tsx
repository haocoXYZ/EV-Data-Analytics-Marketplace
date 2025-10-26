import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import datasetsData from '../data/datasets.json'
import pricingData from '../data/pricing.json'

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dataset = datasetsData.datasets.find(d => d.id === id)

  const [selectedPackage, setSelectedPackage] = useState<'file' | 'api' | 'subscription'>('file')
  const [days, setDays] = useState(30)
  const [requests, setRequests] = useState(1000)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  if (!dataset) {
    return (
      <ConsumerLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy dữ liệu trạm sạc</h1>
        </div>
      </ConsumerLayout>
    )
  }

  const calculatePrice = () => {
    const pkg = pricingData.packages.find(p => p.id === selectedPackage)
    if (!pkg) return 0

    if (selectedPackage === 'file') {
      return (pkg.pricing as any).base + (days * (pkg.pricing as any).perDay)
    } else if (selectedPackage === 'api') {
      return requests * (pkg.pricing as any).perRequest
    } else {
      return selectedRegions.length * (pkg.pricing as any).perRegionPerMonth
    }
  }

  const handlePurchase = () => {
    const price = calculatePrice()
    const orderData = {
      datasetId: dataset.id,
      datasetName: dataset.name,
      package: selectedPackage,
      params: { days, requests, regions: selectedRegions },
      price
    }
    localStorage.setItem('pendingOrder', JSON.stringify(orderData))
    navigate('/checkout')
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    )
  }

  const currentPackage = pricingData.packages.find(p => p.id === selectedPackage)

  return (
    <ConsumerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate('/catalog')} 
          className="text-blue-600 hover:text-blue-700 mb-6 font-medium text-sm"
        >
          &lt; Quay lại danh sách
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Dataset Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.name}</h1>
                <p className="text-gray-600">Nhà cung cấp: <span className="font-medium">{dataset.provider}</span></p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{dataset.description}</p>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tổng records</div>
                  <div className="text-lg font-semibold">{dataset.sampleData.totalRecords.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Khoảng thời gian</div>
                  <div className="text-lg font-semibold">{dataset.sampleData.dateRange}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tần suất cập nhật</div>
                  <div className="text-lg font-semibold">{dataset.sampleData.updateFrequency}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Lượt tải</div>
                  <div className="text-lg font-semibold">{dataset.totalDownloads.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-3">Khu vực hỗ trợ</h2>
              <div className="flex flex-wrap gap-2">
                {dataset.regions.map(region => (
                  <span key={region} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                    {region}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Package Selection */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Chọn gói dữ liệu</h2>

              {/* Package Tabs */}
              <div className="space-y-2 mb-6">
                {pricingData.packages.filter(pkg => (dataset.packages as any)[pkg.id]).map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id as any)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{pkg.name}</div>
                    <div className="text-sm text-gray-600">{pkg.description}</div>
                  </button>
                ))}
              </div>

              {/* Package Config */}
              {currentPackage && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedPackage === 'file' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Số ngày dữ liệu</label>
                      <input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        ${(currentPackage.pricing as any).base} cơ bản + ${(currentPackage.pricing as any).perDay}/ngày
                      </div>
                    </div>
                  )}

                  {selectedPackage === 'api' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Số lượt request</label>
                      <input
                        type="number"
                        value={requests}
                        onChange={(e) => setRequests(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="1"
                        step="100"
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        ${(currentPackage.pricing as any).perRequest}/request
                      </div>
                    </div>
                  )}

                  {selectedPackage === 'subscription' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Chọn khu vực</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {dataset.regions.map(region => (
                          <label key={region} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedRegions.includes(region)}
                              onChange={() => toggleRegion(region)}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm">{region}</span>
                          </label>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        ${(currentPackage.pricing as any).perRegionPerMonth}/khu vực/tháng
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price & CTA */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Tổng cộng</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${calculatePrice().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={selectedPackage === 'subscription' && selectedRegions.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Tiếp tục thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}



