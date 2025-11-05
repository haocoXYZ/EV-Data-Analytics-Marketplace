import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { purchasesApi, paymentsApi } from '../api'

// Hardcoded provinces and districts per TESTING_GUIDE
const PROVINCES = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'TP. Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
]

const DISTRICTS: Record<number, { id: number; name: string }[]> = {
  1: [ // Hanoi - 30 districts (showing first 10)
    { id: 1, name: 'Ba Đình' },
    { id: 2, name: 'Hoàn Kiếm' },
    { id: 3, name: 'Tây Hồ' },
    { id: 4, name: 'Long Biên' },
    { id: 5, name: 'Cầu Giấy' },
    { id: 6, name: 'Đống Đa' },
    { id: 7, name: 'Hai Bà Trưng' },
    { id: 8, name: 'Hoàng Mai' },
    { id: 9, name: 'Thanh Xuân' },
    { id: 10, name: 'Sóc Sơn' },
  ],
  2: [ // HCMC - 24 districts (showing first 10)
    { id: 31, name: 'Quận 1' },
    { id: 32, name: 'Quận 2' },
    { id: 33, name: 'Quận 3' },
    { id: 34, name: 'Quận 4' },
    { id: 35, name: 'Quận 5' },
    { id: 36, name: 'Quận 6' },
    { id: 37, name: 'Quận 7' },
    { id: 38, name: 'Quận 8' },
    { id: 39, name: 'Quận 9' },
    { id: 40, name: 'Quận 10' },
  ],
  3: [ // Danang - 8 districts
    { id: 55, name: 'Hải Châu' },
    { id: 56, name: 'Thanh Khê' },
    { id: 57, name: 'Sơn Trà' },
    { id: 58, name: 'Ngũ Hành Sơn' },
    { id: 59, name: 'Liên Chiểu' },
    { id: 60, name: 'Cẩm Lệ' },
    { id: 61, name: 'Hòa Vang' },
    { id: 62, name: 'Hoàng Sa' },
  ],
}

type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly'

// Base monthly price (example - will be fetched from pricing API in production)
const MONTHLY_PRICE = 500000 // 500,000 VND

const BILLING_CYCLES = [
  {
    value: 'Monthly' as BillingCycle,
    label: 'Monthly',
    duration: '1 tháng',
    discount: 0,
    description: 'Thanh toán hàng tháng'
  },
  {
    value: 'Quarterly' as BillingCycle,
    label: 'Quarterly',
    duration: '3 tháng',
    discount: 5,
    description: 'Giảm 5% - Thanh toán theo quý'
  },
  {
    value: 'Yearly' as BillingCycle,
    label: 'Yearly',
    duration: '12 tháng',
    discount: 15,
    description: 'Giảm 15% - Thanh toán hàng năm'
  },
]

export default function SubscriptionPurchase() {
  const navigate = useNavigate()
  const [provinceId, setProvinceId] = useState<number>(1)
  const [districtId, setDistrictId] = useState<number | undefined>()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly')
  
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const calculatePrice = () => {
    const cycle = BILLING_CYCLES.find(c => c.value === billingCycle)
    if (!cycle) return { monthly: MONTHLY_PRICE, total: MONTHLY_PRICE }

    let total = MONTHLY_PRICE
    let months = 1

    if (billingCycle === 'Quarterly') {
      months = 3
      total = MONTHLY_PRICE * 3 * 0.95 // 5% discount
    } else if (billingCycle === 'Yearly') {
      months = 12
      total = MONTHLY_PRICE * 12 * 0.85 // 15% discount
    }

    return {
      monthly: MONTHLY_PRICE,
      total: Math.round(total),
      months,
      discount: cycle.discount
    }
  }

  const handlePurchase = async () => {
    setPurchasing(true)
    setError(null)

    try {
      // Step 1: Create subscription
      const subscriptionResult = await purchasesApi.createSubscription({
        provinceId,
        districtId,
        billingCycle,
      })

      // Step 2: Create payment
      const paymentResult = await paymentsApi.create({
        paymentType: 'SubscriptionPackage',
        referenceId: subscriptionResult.subscriptionId,
      })

      // Step 3: Redirect to PayOS checkout
      if (paymentResult.checkoutUrl) {
        window.location.href = paymentResult.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.response?.data?.message || 'Failed to create subscription')
      setPurchasing(false)
    }
  }

  const selectedProvince = PROVINCES.find(p => p.id === provinceId)
  const availableDistricts = DISTRICTS[provinceId] || []
  const pricing = calculatePrice()

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-3">🔄 Đăng ký Subscription</h1>
            <p className="text-purple-100 text-lg">Truy cập dashboard theo thời gian thực với dữ liệu EV charging</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Subscription Dashboard Access</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Truy cập dashboard theo thời gian thực</li>
                  <li>✅ Xem biểu đồ và thống kê chi tiết</li>
                  <li>✅ Dữ liệu cập nhật liên tục</li>
                  <li>✅ Hủy bất cứ lúc nào</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Selection Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn vị trí và chu kỳ thanh toán</h2>
            
            {/* Location Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Chọn địa điểm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={provinceId}
                    onChange={(e) => {
                      setProvinceId(Number(e.target.value))
                      setDistrictId(undefined)
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {PROVINCES.map(province => (
                      <option key={province.id} value={province.id}>{province.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện (Tùy chọn)
                  </label>
                  <select
                    value={districtId || ''}
                    onChange={(e) => {
                      setDistrictId(e.target.value ? Number(e.target.value) : undefined)
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Tất cả quận/huyện</option>
                    {availableDistricts.map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Billing Cycle Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Chọn chu kỳ thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BILLING_CYCLES.map((cycle) => (
                  <button
                    key={cycle.value}
                    onClick={() => setBillingCycle(cycle.value)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      billingCycle === cycle.value
                        ? 'border-purple-600 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    {cycle.discount > 0 && (
                      <span className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Giảm {cycle.discount}%
                      </span>
                    )}
                    <div className="text-center">
                      <div className={`text-lg font-bold mb-1 ${
                        billingCycle === cycle.value ? 'text-purple-700' : 'text-gray-900'
                      }`}>
                        {cycle.label}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{cycle.duration}</div>
                      <div className="text-xs text-gray-500">{cycle.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">💰 Chi tiết giá</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Giá hàng tháng:</span>
                  <span className="font-semibold text-gray-900">{pricing.monthly.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Số tháng:</span>
                  <span className="font-semibold text-gray-900">{pricing.months}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Giảm giá ({pricing.discount}%):</span>
                    <span className="font-semibold text-green-600">
                      -{((pricing.monthly * pricing.months) - pricing.total).toLocaleString()} đ
                    </span>
                  </div>
                )}
                <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold text-purple-700">{pricing.total.toLocaleString()} đ</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all"
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                `Đăng ký với ${pricing.total.toLocaleString()} đ`
              )}
            </button>
          </div>

          {/* Features Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">✨ Tính năng Dashboard</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">Thống kê thời gian thực</h4>
                  <p className="text-sm text-gray-600">Xem dữ liệu cập nhật liên tục</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">Biểu đồ trực quan</h4>
                  <p className="text-sm text-gray-600">Phân tích xu hướng dễ dàng</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">Dữ liệu theo vị trí</h4>
                  <p className="text-sm text-gray-600">Lọc theo tỉnh và quận</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">Tự động gia hạn</h4>
                  <p className="text-sm text-gray-600">Không lo gián đoạn dịch vụ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}


