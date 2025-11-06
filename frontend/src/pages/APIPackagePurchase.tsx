import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { purchasesApi, paymentsApi } from '../api'
import ConsumerLayout from '../components/ConsumerLayout'

const PRICE_PER_CALL = 100 // 100 VND per API call

// Bulk discount tiers
const DISCOUNT_TIERS = [
  { min: 1, max: 999, discount: 0, label: 'Standard' },
  { min: 1000, max: 4999, discount: 5, label: 'Bronze' },
  { min: 5000, max: 9999, discount: 10, label: 'Silver' },
  { min: 10000, max: Infinity, discount: 15, label: 'Gold' },
]

export default function APIPackagePurchase() {
  const navigate = useNavigate()
  const [numberOfCalls, setNumberOfCalls] = useState(1000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate pricing
  const currentTier = DISCOUNT_TIERS.find(t => numberOfCalls >= t.min && numberOfCalls <= t.max)!
  const subtotal = numberOfCalls * PRICE_PER_CALL
  const discount = subtotal * (currentTier.discount / 100)
  const totalPrice = subtotal - discount
  const pricePerCall = totalPrice / numberOfCalls

  const handlePurchase = async () => {
    if (numberOfCalls < 1) {
      setError('Please enter at least 1 API call')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Create API package purchase
      const purchaseResult = await purchasesApi.createAPIPackage({
        numberOfCalls,
      })

      // Step 2: Create payment
      const paymentResult = await paymentsApi.create({
        paymentType: 'APIPackage',
        referenceId: purchaseResult.purchaseId,
      })

      // Step 3: Redirect to PayOS
      if (paymentResult.checkoutUrl) {
        window.location.href = paymentResult.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.response?.data?.message || 'Failed to create API package')
      setLoading(false)
    }
  }

  return (
    <ConsumerLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Purchase API Credits</h1>
          <p className="text-gray-600 mt-2">Get programmatic access to EV charging data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configure Package</h2>

              {/* API Calls Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of API Calls <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={numberOfCalls}
                  onChange={(e) => setNumberOfCalls(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of API calls"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Base price: {PRICE_PER_CALL} VNĐ per call
                </p>
              </div>

              {/* Quick Select Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 5000, 10000, 50000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setNumberOfCalls(amount)}
                      className={`px-4 py-2 rounded border-2 transition-colors ${
                        numberOfCalls === amount
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Discount Tiers:</h3>
                <div className="space-y-2">
                  {DISCOUNT_TIERS.map(tier => (
                    <div
                      key={tier.label}
                      className={`flex justify-between items-center p-2 rounded ${
                        currentTier.label === tier.label ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="text-sm">
                        <span className="font-medium">{tier.label}:</span>{' '}
                        {tier.min === 1 ? '1' : tier.min.toLocaleString()} -{' '}
                        {tier.max === Infinity ? '∞' : tier.max.toLocaleString()} calls
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {tier.discount > 0 ? `${tier.discount}% OFF` : 'Standard'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">API Features:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    REST API access with API key authentication
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Filter by province, district, date range
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Paginated responses (up to 100 records per call)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Structured JSON data format
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    No expiration (use anytime)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Generate multiple API keys
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
                  <span className="text-gray-600">API Calls:</span>
                  <span className="font-medium">{numberOfCalls.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tier:</span>
                  <span className="font-medium">{currentTier.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price:</span>
                  <span>{PRICE_PER_CALL} VNĐ/call</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{subtotal.toLocaleString()} VNĐ</span>
                </div>
                {currentTier.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({currentTier.discount}%):</span>
                    <span>-{discount.toLocaleString()} VNĐ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-blue-600">{totalPrice.toLocaleString()} VNĐ</span>
                </div>
                <div className="text-xs text-gray-500 text-center pt-1">
                  ≈ {pricePerCall.toFixed(2)} VNĐ per call
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={loading || numberOfCalls < 1}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
              >
                {loading ? 'Processing...' : `Purchase for ${totalPrice.toLocaleString()} VNĐ`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                You will be redirected to PayOS to complete payment
              </p>

              {/* Example Endpoint */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">API Endpoint:</h4>
                <div className="bg-gray-900 text-green-400 text-xs p-2 rounded font-mono overflow-x-auto">
                  GET /api/data
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  After payment, generate API keys to start using the API
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ConsumerLayout>
  )
}
