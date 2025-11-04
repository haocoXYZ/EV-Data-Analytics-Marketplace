import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { purchasesApi, paymentsApi, locationsApi } from '../api'
import { Province, District } from '../types'

interface PricingInfo {
  monthly: number
  quarterly: number
  yearly: number
  quarterlySavings: number
  yearlySavings: number
}

export default function SubscriptionPurchase() {
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly')

  // Mock pricing - in real app, fetch from API
  const pricing: PricingInfo = {
    monthly: 500000, // 500k VND/month
    quarterly: 500000 * 3 * 0.95, // 5% discount
    yearly: 500000 * 12 * 0.85, // 15% discount
    quarterlySavings: 500000 * 3 * 0.05,
    yearlySavings: 500000 * 12 * 0.15
  }

  useEffect(() => {
    loadProvinces()
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince)
    } else {
      setDistricts([])
      setSelectedDistrict(null)
    }
  }, [selectedProvince])

  const loadProvinces = async () => {
    try {
      const data = await locationsApi.getProvinces()
      setProvinces(data)
    } catch (error) {
      console.error('Failed to load provinces:', error)
      setError('Failed to load provinces. Please try again.')
    }
  }

  const loadDistricts = async (provinceId: number) => {
    try {
      const data = await locationsApi.getDistrictsByProvince(provinceId)
      setDistricts(data)
    } catch (error) {
      console.error('Failed to load districts:', error)
      setError('Failed to load districts. Please try again.')
    }
  }

  const calculatePrice = () => {
    switch (billingCycle) {
      case 'Quarterly':
        return pricing.quarterly
      case 'Yearly':
        return pricing.yearly
      default:
        return pricing.monthly
    }
  }

  const handlePurchase = async () => {
    if (!selectedProvince) {
      setError('Please select a province')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create subscription purchase
      const purchaseResponse = await purchasesApi.createSubscription({
        provinceId: selectedProvince,
        districtId: selectedDistrict || undefined,
        billingCycle
      })

      // Create payment
      const paymentResponse = await paymentsApi.create({
        paymentType: 'SubscriptionPackage',
        referenceId: purchaseResponse.subscriptionId
      })

      // Redirect to PayOS checkout
      if (paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      setError(error.response?.data?.message || error.message)
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const selectedProvinceName = provinces.find(p => p.provinceId === selectedProvince)?.name
  const selectedDistrictName = districts.find(d => d.districtId === selectedDistrict)?.name

  return (
    <ConsumerLayout>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Subscribe to Real-Time Dashboard</h1>
          <p className="text-gray-600">Get unlimited access to live EV charging analytics for your selected region</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Region */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Step 1: Select Region</h2>

              <div className="space-y-4">
                {/* Province Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province/City *
                  </label>
                  <select
                    value={selectedProvince || ''}
                    onChange={(e) => setSelectedProvince(Number(e.target.value) || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Province --</option>
                    {provinces.map((province) => (
                      <option key={province.provinceId} value={province.provinceId}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District (Optional)
                  </label>
                  <select
                    value={selectedDistrict || ''}
                    onChange={(e) => setSelectedDistrict(Number(e.target.value) || null)}
                    disabled={!selectedProvince || districts.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                      <option key={district.districtId} value={district.districtId}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Leave blank to access data for the entire province
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Choose Billing Cycle */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💳 Step 2: Choose Billing Cycle</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Monthly */}
                <button
                  onClick={() => setBillingCycle('Monthly')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    billingCycle === 'Monthly'
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">Monthly</div>
                    <div className="text-2xl font-bold text-blue-600 my-2">{formatCurrency(pricing.monthly)}</div>
                    <div className="text-sm text-gray-600">per month</div>
                    <div className="text-xs text-gray-500 mt-2">Cancel anytime</div>
                  </div>
                </button>

                {/* Quarterly */}
                <button
                  onClick={() => setBillingCycle('Quarterly')}
                  className={`p-4 rounded-lg border-2 transition-all relative ${
                    billingCycle === 'Quarterly'
                      ? 'border-green-600 bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Save 5%
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">Quarterly</div>
                    <div className="text-2xl font-bold text-green-600 my-2">{formatCurrency(pricing.quarterly)}</div>
                    <div className="text-sm text-gray-600">for 3 months</div>
                    <div className="text-xs text-green-600 mt-2 font-semibold">Save {formatCurrency(pricing.quarterlySavings)}</div>
                  </div>
                </button>

                {/* Yearly */}
                <button
                  onClick={() => setBillingCycle('Yearly')}
                  className={`p-4 rounded-lg border-2 transition-all relative ${
                    billingCycle === 'Yearly'
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Save 15%
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">Yearly</div>
                    <div className="text-2xl font-bold text-purple-600 my-2">{formatCurrency(pricing.yearly)}</div>
                    <div className="text-sm text-gray-600">for 12 months</div>
                    <div className="text-xs text-purple-600 mt-2 font-semibold">Save {formatCurrency(pricing.yearlySavings)}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">✨ What's Included:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Real-time Dashboard</strong> with live data updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Energy consumption charts</strong> and trends</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Station performance</strong> analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Peak hours analysis</strong> for optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Unlimited dashboard access</strong> during subscription period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Data from multiple providers</strong> aggregated in one view</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Region</div>
                  <div className="font-semibold text-gray-900">
                    {selectedProvinceName || 'Not selected'}
                    {selectedDistrictName && ` - ${selectedDistrictName}`}
                  </div>
                </div>

                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Billing Cycle</div>
                  <div className="font-semibold text-gray-900">{billingCycle}</div>
                </div>

                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-semibold text-gray-900">
                    {billingCycle === 'Monthly' && '1 month'}
                    {billingCycle === 'Quarterly' && '3 months'}
                    {billingCycle === 'Yearly' && '12 months'}
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-sm text-gray-600 mb-2">Total Amount</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(calculatePrice())}
                  </div>
                  {billingCycle !== 'Monthly' && (
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      💰 You save {formatCurrency(
                        billingCycle === 'Quarterly' ? pricing.quarterlySavings : pricing.yearlySavings
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={!selectedProvince || loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </span>
                ) : (
                  '🔒 Proceed to Secure Checkout'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by PayOS
              </p>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
