import React, { useEffect, useState } from 'react'
import ProviderLayout from '../components/ProviderLayout'
import { pricingApi } from '../api'
import { SystemPricing } from '../types'

export default function ProviderPricing() {
  const [pricingConfigs, setPricingConfigs] = useState<SystemPricing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      setLoading(true)
      const data = await pricingApi.getAll()
      setPricingConfigs(data)
    } catch (error) {
      console.error('Failed to load pricing:', error)
      alert('Lỗi tải pricing configurations')
    } finally {
      setLoading(false)
    }
  }

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case 'DataPackage':
        return '📦'
      case 'SubscriptionPackage':
        return '📅'
      case 'APIPackage':
        return '🔌'
      default:
        return '📊'
    }
  }

  const getPackageTitle = (packageType: string) => {
    switch (packageType) {
      case 'DataPackage':
        return 'Data Package'
      case 'SubscriptionPackage':
        return 'Subscription Package'
      case 'APIPackage':
        return 'API Package'
      default:
        return packageType
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-'
    return `${amount.toLocaleString('vi-VN')} đ`
  }

  return (
    <ProviderLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            💰 System Pricing
          </h1>
          <p className="text-gray-600">
            Xem thông tin giá và revenue split cho các package types
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {pricingConfigs.map((config) => (
              <div
                key={config.pricingId}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  config.isActive ? 'border-green-200' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getPackageIcon(config.packageType)}</span>
                      <h3 className="text-xl font-bold">{getPackageTitle(config.packageType)}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      config.isActive 
                        ? 'bg-green-500' 
                        : 'bg-gray-500'
                    }`}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* Price Fields */}
                    {config.packageType === 'DataPackage' && config.pricePerRow !== null && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Price per Row
                        </label>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(config.pricePerRow)}</div>
                      </div>
                    )}

                    {config.packageType === 'SubscriptionPackage' && config.subscriptionMonthlyBase !== null && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Monthly Base Price
                        </label>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(config.subscriptionMonthlyBase)}</div>
                      </div>
                    )}

                    {config.packageType === 'APIPackage' && config.apiPricePerCall !== null && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Price per API Call
                        </label>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(config.apiPricePerCall)}</div>
                      </div>
                    )}
                  </div>

                  {/* Commission Split */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-3">YOUR REVENUE SPLIT</div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs text-gray-600 mb-1">
                          Provider Commission
                        </label>
                        <div className="font-bold text-2xl text-green-600">{config.providerCommissionPercent}%</div>
                        <div className="text-xs text-gray-500 mt-1">You earn from every sale</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="block text-xs text-gray-600 mb-1">
                          Platform Fee
                        </label>
                        <div className="font-bold text-lg text-gray-600">{config.adminCommissionPercent}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cách tính Revenue của bạn
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <span>📦</span> DataPackage
                </div>
                <div className="text-xs text-gray-600">
                  Revenue chia theo tỷ lệ số record bạn đóng góp trong province
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <span>📅</span> SubscriptionPackage
                </div>
                <div className="text-xs text-gray-600">
                  Revenue chia đều cho tất cả providers trong province
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <span>🔌</span> APIPackage
                </div>
                <div className="text-xs text-gray-600">
                  Revenue chia đều cho tất cả providers (toàn quốc)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lưu ý quan trọng
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Revenue được tính tự động sau mỗi giao dịch thành công</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Payout được tạo định kỳ hàng tháng bởi Admin</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Upload nhiều dataset chất lượng để tăng thu nhập</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Giá và commission có thể thay đổi theo chính sách platform</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProviderLayout>
  )
}

