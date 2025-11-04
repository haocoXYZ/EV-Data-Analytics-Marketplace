import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { purchasesApi, paymentsApi, locationsApi } from '../api'
import { Province, District } from '../types'

const PRICE_PER_CALL = 100 // 100 VND per API call

const PRESET_PACKAGES = [
  { calls: 1000, popular: false },
  { calls: 5000, popular: true },
  { calls: 10000, popular: false },
  { calls: 50000, popular: false },
]

export default function APIPackagePurchase() {
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [apiCalls, setApiCalls] = useState(5000)
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null)
  const [scopeType, setScopeType] = useState<'nationwide' | 'province' | 'district'>('nationwide')

  useEffect(() => {
    loadProvinces()
  }, [])

  useEffect(() => {
    if (selectedProvince && scopeType === 'district') {
      loadDistricts(selectedProvince)
    } else {
      setDistricts([])
      setSelectedDistrict(null)
    }
  }, [selectedProvince, scopeType])

  useEffect(() => {
    // Clear province/district when scope changes
    if (scopeType === 'nationwide') {
      setSelectedProvince(null)
      setSelectedDistrict(null)
    } else if (scopeType === 'province') {
      setSelectedDistrict(null)
    }
  }, [scopeType])

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
    return apiCalls * PRICE_PER_CALL
  }

  const handlePurchase = async () => {
    if (scopeType === 'province' && !selectedProvince) {
      setError('Please select a province')
      return
    }
    if (scopeType === 'district' && (!selectedProvince || !selectedDistrict)) {
      setError('Please select both province and district')
      return
    }
    if (apiCalls < 100) {
      setError('Minimum 100 API calls required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create API package purchase
      const purchaseResponse = await purchasesApi.createAPIPackage({
        apiCallsPurchased: apiCalls,
        provinceId: scopeType !== 'nationwide' ? selectedProvince || undefined : undefined,
        districtId: scopeType === 'district' ? selectedDistrict || undefined : undefined
      })

      // Create payment
      const paymentResponse = await paymentsApi.create({
        paymentType: 'APIPackage',
        referenceId: purchaseResponse.purchaseId
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const selectedProvinceName = provinces.find(p => p.provinceId === selectedProvince)?.name
  const selectedDistrictName = districts.find(d => d.districtId === selectedDistrict)?.name

  return (
    <ConsumerLayout>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔌 Purchase API Access</h1>
          <p className="text-gray-600">Programmatic access to EV charging data via RESTful API</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Package Size */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 Step 1: Select Package Size</h2>

              {/* Preset Packages */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {PRESET_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.calls}
                    onClick={() => setApiCalls(pkg.calls)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      apiCalls === pkg.calls
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        Popular
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(pkg.calls)}</div>
                      <div className="text-xs text-gray-600 mt-1">API calls</div>
                      <div className="text-sm font-semibold text-blue-600 mt-2">
                        {formatCurrency(pkg.calls * PRICE_PER_CALL)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Or enter custom amount:
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={apiCalls}
                    onChange={(e) => setApiCalls(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-600 font-medium">API calls</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Minimum: 100 calls | Price: {formatCurrency(PRICE_PER_CALL)} per call
                </p>
              </div>
            </div>

            {/* Step 2: Select Scope */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🌍 Step 2: Select Data Scope</h2>

              <div className="space-y-4">
                {/* Scope Type Selector */}
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setScopeType('nationwide')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      scopeType === 'nationwide'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🇻🇳</div>
                    <div className="font-bold text-gray-900">Nationwide</div>
                    <div className="text-xs text-gray-600 mt-1">All regions</div>
                  </button>

                  <button
                    onClick={() => setScopeType('province')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      scopeType === 'province'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏙️</div>
                    <div className="font-bold text-gray-900">Province</div>
                    <div className="text-xs text-gray-600 mt-1">Single province</div>
                  </button>

                  <button
                    onClick={() => setScopeType('district')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      scopeType === 'district'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">📍</div>
                    <div className="font-bold text-gray-900">District</div>
                    <div className="text-xs text-gray-600 mt-1">Specific district</div>
                  </button>
                </div>

                {/* Province Selector (for province and district scope) */}
                {(scopeType === 'province' || scopeType === 'district') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Province *
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
                )}

                {/* District Selector (for district scope only) */}
                {scopeType === 'district' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select District *
                    </label>
                    <select
                      value={selectedDistrict || ''}
                      onChange={(e) => setSelectedDistrict(Number(e.target.value) || null)}
                      disabled={!selectedProvince || districts.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select District --</option>
                      {districts.map((district) => (
                        <option key={district.districtId} value={district.districtId}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* API Features */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 API Features:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">RESTful API endpoint</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">JSON response format</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Pagination support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Date range filtering</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Real-time data access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">API key authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Usage tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span className="text-sm text-gray-700">No expiration date</span>
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
                  <div className="text-sm text-gray-600 mb-1">API Calls</div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(apiCalls)}</div>
                </div>

                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Data Scope</div>
                  <div className="font-semibold text-gray-900">
                    {scopeType === 'nationwide' && '🇻🇳 Nationwide'}
                    {scopeType === 'province' && selectedProvinceName && `🏙️ ${selectedProvinceName}`}
                    {scopeType === 'province' && !selectedProvinceName && '🏙️ Province (not selected)'}
                    {scopeType === 'district' && selectedDistrictName && `📍 ${selectedProvinceName} - ${selectedDistrictName}`}
                    {scopeType === 'district' && !selectedDistrictName && '📍 District (not selected)'}
                  </div>
                </div>

                <div className="pb-3 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Price per Call</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(PRICE_PER_CALL)}</div>
                </div>

                <div className="pt-3">
                  <div className="text-sm text-gray-600 mb-2">Total Amount</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(calculatePrice())}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={loading || apiCalls < 100}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </span>
                ) : (
                  '🔒 Proceed to Checkout'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment • API keys generated instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
