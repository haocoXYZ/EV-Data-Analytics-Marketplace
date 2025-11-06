import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { purchasesApi, paymentsApi, locationsApi, pricingApi } from '../api'
import { Province, SystemPricing } from '../types'
import ConsumerLayout from '../components/ConsumerLayout'

const BILLING_CYCLES = [
  { value: 'Monthly', label: 'Hàng tháng', months: 1, discount: 0 },
  { value: 'Quarterly', label: 'Hàng quý (3 tháng)', months: 3, discount: 10 },
  { value: 'Yearly', label: 'Hàng năm (12 tháng)', months: 12, discount: 20 },
]

export default function SubscriptionPurchase() {
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [pricing, setPricing] = useState<SystemPricing | null>(null)
  const [provinceId, setProvinceId] = useState<number | undefined>()
  const [billingCycle, setBillingCycle] = useState('Monthly')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      // Load provinces and pricing in parallel
      const [provincesData, pricingData] = await Promise.all([
        locationsApi.getProvinces(),
        pricingApi.getAll()
      ])

      setProvinces(provincesData)
      if (provincesData.length > 0) {
        setProvinceId(provincesData[0].provinceId)
      }

      // Find subscription pricing
      const subscriptionPricing = pricingData.find(p => p.packageType === 'SubscriptionPackage')
      setPricing(subscriptionPricing || null)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }

  const selectedCycle = BILLING_CYCLES.find(c => c.value === billingCycle)!
  const selectedProvince = provinces.find(p => p.provinceId === provinceId)

  // Use pricing from backend or fallback to default
  const monthlyPrice = pricing?.subscriptionMonthlyBase || 500000
  const totalMonths = selectedCycle.months
  const subtotal = monthlyPrice * totalMonths
  const discount = subtotal * (selectedCycle.discount / 100)
  const totalPrice = subtotal - discount

  const handlePurchase = async () => {
    if (!provinceId) {
      setError('Please select a province')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create subscription purchase
      const purchaseResult = await purchasesApi.createSubscription({
        provinceId,
        billingCycle: billingCycle as 'Monthly' | 'Quarterly' | 'Yearly',
      })

      // Step 2: Create payment
      const paymentResult = await paymentsApi.create({
        paymentType: 'SubscriptionPackage',
        referenceId: purchaseResult.subscriptionId,
      })

      // Step 3: Redirect to PayOS
      if (paymentResult.checkoutUrl) {
        window.location.href = paymentResult.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.response?.data?.message || 'Failed to create subscription')
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <ConsumerLayout>
        <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </ConsumerLayout>
    )
  }

  return (
    <ConsumerLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscribe to Dashboard</h1>
          <p className="text-gray-600 mt-2">Get real-time access to EV charging analytics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configure Subscription</h2>

              {/* Province Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={provinceId || ''}
                  onChange={(e) => setProvinceId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a province</option>
                  {provinces.map(province => (
                    <option key={province.provinceId} value={province.provinceId}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Cycle Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {BILLING_CYCLES.map(cycle => (
                    <div
                      key={cycle.value}
                      onClick={() => setBillingCycle(cycle.value)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        billingCycle === cycle.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            checked={billingCycle === cycle.value}
                            onChange={() => setBillingCycle(cycle.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{cycle.label}</div>
                            <div className="text-sm text-gray-500">
                              {monthlyPrice.toLocaleString()} VNĐ/tháng
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {cycle.discount > 0 && (
                            <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mb-1">
                              Giảm {cycle.discount}%
                            </div>
                          )}
                          <div className="font-semibold text-gray-900">
                            {(monthlyPrice * cycle.months * (1 - cycle.discount / 100)).toLocaleString()} VNĐ
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Dashboard Features:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Real-time energy consumption analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Station distribution insights
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Peak hours analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    30-day historical data
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Auto-updated daily
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Province:</span>
                  <span className="font-medium">{selectedProvince?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium">{selectedCycle.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Price:</span>
                  <span>{monthlyPrice.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>{totalMonths} tháng</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{subtotal.toLocaleString()} VNĐ</span>
                </div>
                {selectedCycle.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({selectedCycle.discount}%):</span>
                    <span>-{discount.toLocaleString()} VNĐ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString()} VNĐ</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
              >
                {loading ? 'Processing...' : `Subscribe for ${totalPrice.toLocaleString()} VNĐ`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                You will be redirected to PayOS to complete payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ConsumerLayout>
  )
}
