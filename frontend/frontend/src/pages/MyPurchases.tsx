import React, { useState, useEffect } from 'react'
import ConsumerLayout from '../components/ConsumerLayout'
import datasetsData from '../data/datasets.json'

interface Purchase {
  id: string
  datasetId: string
  datasetName: string
  package: string
  price: number
  purchaseDate: string
  status: 'active' | 'expired'
}

export default function MyPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])

  useEffect(() => {
    // Load purchases from localStorage
    const stored = localStorage.getItem('myPurchases')
    if (stored) {
      setPurchases(JSON.parse(stored))
    }
  }, [])

  const getDatasetById = (id: string) => {
    return datasetsData.datasets.find(d => d.id === id)
  }

  const getPackageLabel = (pkg: string) => {
    const labels: Record<string, string> = {
      file: 'Tệp dữ liệu',
      api: 'API Access',
      subscription: 'Theo dõi thời gian thực'
    }
    return labels[pkg] || pkg
  }

  if (purchases.length === 0) {
    return (
      <ConsumerLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Dữ liệu đã mua</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-gray-400">?</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa có giao dịch nào</h2>
            <p className="text-gray-600 mb-6">Bạn chưa mua dữ liệu nào. Hãy khám phá danh mục của chúng tôi!</p>
            <a
              href="/catalog"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Xem danh mục
            </a>
          </div>
        </div>
      </ConsumerLayout>
    )
  }

  return (
    <ConsumerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Dữ liệu đã mua</h1>

        <div className="space-y-4">
          {purchases.map((purchase) => {
            const dataset = getDatasetById(purchase.datasetId)
            return (
              <div
                key={purchase.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {purchase.datasetName}
                    </h3>
                    {dataset && (
                      <p className="text-sm text-gray-600">
                        Nhà cung cấp: {dataset.provider}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      purchase.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {purchase.status === 'active' ? 'Đang hoạt động' : 'Đã hết hạn'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Gói dữ liệu</div>
                    <div className="font-medium">{getPackageLabel(purchase.package)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Giá trị</div>
                    <div className="font-medium text-blue-600">${purchase.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Ngày mua</div>
                    <div className="font-medium">
                      {new Date(purchase.purchaseDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Tải xuống
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    Xem chi tiết
                  </button>
                  {purchase.package === 'api' && (
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                      API Key
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ConsumerLayout>
  )
}
