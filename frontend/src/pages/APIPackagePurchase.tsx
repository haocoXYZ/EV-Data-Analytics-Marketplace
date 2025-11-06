import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { purchasesApi, paymentsApi, pricingApi } from '../api'

const PACKAGE_OPTIONS = [
  {
    calls: 1000,
    label: '1,000 API Calls',
    popular: false,
    description: 'Phù hợp cho dự án nhỏ'
  },
  {
    calls: 10000,
    label: '10,000 API Calls',
    popular: true,
    description: 'Phù hợp cho dự án vừa'
  },
  {
    calls: 100000,
    label: '100,000 API Calls',
    popular: false,
    description: 'Phù hợp cho dự án lớn'
  },
  {
    calls: 1000000,
    label: '1,000,000 API Calls',
    popular: false,
    description: 'Phù hợp cho enterprise'
  },
]

export default function APIPackagePurchase() {
  const navigate = useNavigate()
  const [numberOfCalls, setNumberOfCalls] = useState<number>(10000)
  const [customCalls, setCustomCalls] = useState<string>('')
  const [useCustom, setUseCustom] = useState(false)

  const [pricePerCall, setPricePerCall] = useState<number>(100) // Default 100 VND per call
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      setLoading(true)
      const pricingConfigs = await pricingApi.getAll()
      // Find APIPackage pricing (packageType = "APIPackage")
      const apiPricing = pricingConfigs.find((p: any) => p.packageType === 'APIPackage')
      if (apiPricing && apiPricing.apiPricePerCall) {
        setPricePerCall(apiPricing.apiPricePerCall)
      }
    } catch (err) {
      console.error('Failed to load pricing:', err)
      // Keep default price if API fails
    } finally {
      setLoading(false)
    }
  }

  const getCallCount = () => {
    if (useCustom && customCalls) {
      const parsed = parseInt(customCalls, 10)
      return isNaN(parsed) || parsed < 100 ? 100 : parsed
    }
    return numberOfCalls
  }

  const calculatePrice = () => {
    const calls = getCallCount()
    return Math.round(calls * pricePerCall)
  }

  const handlePurchase = async () => {
    const calls = getCallCount()
    if (calls < 100) {
      setError('Số lượng API calls tối thiểu là 100')
      return
    }

    setPurchasing(true)
    setError(null)

    try {
      // Step 1: Create API package purchase
      const purchaseResult = await purchasesApi.createAPIPackage({
        apiCallsPurchased: calls,
      })

      // Step 2: Create payment
      const paymentResult = await paymentsApi.create({
        paymentType: 'APIPackage',
        referenceId: purchaseResult.apiPurchaseId,
      })

      // Step 3: Redirect to PayOS checkout
      if (paymentResult.checkoutUrl) {
        window.location.href = paymentResult.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.response?.data?.message || 'Failed to create purchase')
      setPurchasing(false)
    }
  }

  const totalPrice = calculatePrice()

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-3">🔌 Mua gói API</h1>
            <p className="text-indigo-100 text-lg">Truy cập dữ liệu EV qua API cho ứng dụng của bạn</p>
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
                <h3 className="font-semibold text-blue-900 mb-1">API Access</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Tích hợp vào ứng dụng của bạn</li>
                  <li>✅ Truy vấn dữ liệu theo lập trình</li>
                  <li>✅ Nhận API key sau khi thanh toán</li>
                  <li>✅ Không giới hạn thời gian sử dụng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-600 mt-4">Đang tải giá...</p>
              </div>
            ) : (
              <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn số lượng API calls</h2>

                {/* Predefined Packages */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Gói có sẵn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PACKAGE_OPTIONS.map((pkg) => (
                      <button
                        key={pkg.calls}
                        onClick={() => {
                          setNumberOfCalls(pkg.calls)
                          setUseCustom(false)
                        }}
                        className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                          !useCustom && numberOfCalls === pkg.calls
                            ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Phổ biến
                          </span>
                        )}
                        <div>
                          <div className={`text-xl font-bold mb-1 ${
                            !useCustom && numberOfCalls === pkg.calls ? 'text-indigo-700' : 'text-gray-900'
                          }`}>
                            {pkg.label}
                          </div>
                          <div className="text-sm text-gray-600 mb-3">{pkg.description}</div>
                          <div className="text-lg font-semibold text-indigo-600">
                            {(pkg.calls * pricePerCall).toLocaleString()} đ
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Package */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Tùy chỉnh số lượng</h3>
                  <div className={`border-2 rounded-xl p-6 transition-all ${
                    useCustom ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={useCustom}
                        onChange={(e) => setUseCustom(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <label className="font-medium text-gray-900">Nhập số lượng tùy chỉnh</label>
                    </div>
                    <input
                      type="number"
                      value={customCalls}
                      onChange={(e) => {
                        setCustomCalls(e.target.value)
                        setUseCustom(true)
                      }}
                      onFocus={() => setUseCustom(true)}
                      placeholder="Ví dụ: 5000"
                      min="100"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={!useCustom}
                    />
                    <p className="text-sm text-gray-500 mt-2">Tối thiểu 100 API calls</p>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">💰 Chi tiết giá</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Số lượng API calls:</span>
                      <span className="font-semibold text-gray-900">{getCallCount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Giá mỗi call:</span>
                      <span className="font-semibold text-gray-900">{pricePerCall.toLocaleString()} đ</span>
                    </div>
                    <div className="border-t border-indigo-200 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Tổng thanh toán:</span>
                      <span className="text-2xl font-bold text-indigo-700">{totalPrice.toLocaleString()} đ</span>
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
                  disabled={purchasing || getCallCount() < 100}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all"
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
                    `Mua với ${totalPrice.toLocaleString()} đ`
                  )}
                </button>
              </>
            )}
          </div>

          {/* API Features Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">✨ Tính năng API</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">API Key</h4>
                  <p className="text-sm text-gray-600">Nhận API key ngay sau thanh toán</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">Tốc độ cao</h4>
                  <p className="text-sm text-gray-600">Truy vấn nhanh chóng</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">An toàn</h4>
                  <p className="text-sm text-gray-600">Bảo mật với API key</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">Tài liệu đầy đủ</h4>
                  <p className="text-sm text-gray-600">API documentation chi tiết</p>
                </div>
              </div>
            </div>

            {/* API Example */}
            <div className="mt-6 bg-gray-900 rounded-xl p-4 text-white font-mono text-sm overflow-x-auto">
              <div className="text-green-400 mb-2"># Example API Request</div>
              <div>curl -X GET "https://api.evdata.vn/data?provinceId=1&startDate=2025-01-01" \</div>
              <div className="ml-4">-H "X-API-Key: evdata_xxxxx"</div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
