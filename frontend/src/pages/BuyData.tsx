import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { pricingApi } from '../api'
import { SystemPricing } from '../types'

export default function BuyData() {
  const [pricing, setPricing] = useState<SystemPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      setLoading(true)
      const data = await pricingApi.getAll()
      setPricing(data)
    } catch (err: any) {
      console.error('Failed to load pricing:', err)
      setError('Failed to load pricing information')
    } finally {
      setLoading(false)
    }
  }

  // Get pricing by package type
  const getPackagePricing = (packageType: 'DataPackage' | 'SubscriptionPackage' | 'APIPackage') => {
    return pricing.find(p => p.packageType === packageType)
  }

  const dataPackagePricing = getPackagePricing('DataPackage')
  const subscriptionPricing = getPackagePricing('SubscriptionPackage')
  const apiPackagePricing = getPackagePricing('APIPackage')

  if (loading) {
    return (
      <ConsumerLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing...</p>
          </div>
        </div>
      </ConsumerLayout>
    )
  }

  if (error) {
    return (
      <ConsumerLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        </div>
      </ConsumerLayout>
    )
  }

  return (
    <ConsumerLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Data Package
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the best option for your needs. All packages include access to comprehensive EV charging station data.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Data Package */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-2">Data Package</h3>
              <p className="text-blue-100 text-sm">One-time purchase</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dataPackagePricing?.pricePerRow?.toLocaleString() || '10'} VNĐ
                  <span className="text-lg font-normal text-gray-600">/record</span>
                </div>
                <p className="text-sm text-gray-500">
                  Pay only for what you need
                  {dataPackagePricing && (
                    <span className="block mt-1 text-xs">
                      Provider: {dataPackagePricing.providerCommissionPercent}% |
                      Platform: {dataPackagePricing.adminCommissionPercent}%
                    </span>
                  )}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Download CSV by location</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Filter by province/district</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Custom date range</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Multiple providers merged</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Lifetime access</span>
                </li>
              </ul>

              <Link
                to="/buy-data-package"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Buy Data Package
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                Preview before purchase
              </p>
            </div>
          </div>

          {/* Subscription Package */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl border-2 border-indigo-500">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                POPULAR
              </div>
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-2">Subscription</h3>
              <p className="text-indigo-100 text-sm">Real-time dashboard</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {subscriptionPricing?.subscriptionMonthlyBase
                    ? (subscriptionPricing.subscriptionMonthlyBase / 1000).toFixed(0) + 'K'
                    : '500K'} VNĐ
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-500">
                  Save 20% with yearly plan
                  {subscriptionPricing && (
                    <span className="block mt-1 text-xs">
                      Provider: {subscriptionPricing.providerCommissionPercent}% |
                      Platform: {subscriptionPricing.adminCommissionPercent}%
                    </span>
                  )}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Real-time analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Energy consumption charts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Station distribution insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Peak hours analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Auto-updated daily</span>
                </li>
              </ul>

              <Link
                to="/subscribe"
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-md"
              >
                Subscribe Now
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                Cancel anytime
              </p>
            </div>
          </div>

          {/* API Package */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
              <div className="text-5xl mb-4">🔌</div>
              <h3 className="text-2xl font-bold mb-2">API Package</h3>
              <p className="text-emerald-100 text-sm">Programmatic access</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {apiPackagePricing?.apiPricePerCall?.toLocaleString() || '100'} VNĐ
                  <span className="text-lg font-normal text-gray-600">/call</span>
                </div>
                <p className="text-sm text-gray-500">
                  Bulk discounts available
                  {apiPackagePricing && (
                    <span className="block mt-1 text-xs">
                      Provider: {apiPackagePricing.providerCommissionPercent}% |
                      Platform: {apiPackagePricing.adminCommissionPercent}%
                    </span>
                  )}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">REST API with authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Filter & pagination support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">JSON structured data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">Multiple API keys</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">No expiration</span>
                </li>
              </ul>

              <Link
                to="/buy-api-package"
                className="block w-full bg-emerald-600 text-white text-center py-3 px-4 rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Buy API Credits
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                15% off for 10,000+ calls
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Compare Packages
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 text-gray-700">Feature</th>
                  <th className="text-center py-3 px-4 text-gray-700">Data Package</th>
                  <th className="text-center py-3 px-4 text-gray-700">Subscription</th>
                  <th className="text-center py-3 px-4 text-gray-700">API Package</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4 text-gray-700">Data Access</td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">CSV Download</td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">Dashboard View</td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">REST API</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Update Frequency</td>
                  <td className="py-3 px-4 text-center text-gray-600">One-time</td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">Daily</td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">Real-time</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Best For</td>
                  <td className="py-3 px-4 text-center text-gray-600 text-sm">Research & Analysis</td>
                  <td className="py-3 px-4 text-center text-gray-600 text-sm">Monitoring & Insights</td>
                  <td className="py-3 px-4 text-center text-gray-600 text-sm">Integration & Automation</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Pricing Model</td>
                  <td className="py-3 px-4 text-center text-gray-600 text-sm">Pay per record</td>
                  <td className="py-3 px-4 text-center text-gray-600 text-sm">Monthly/Yearly</td>
                  <td className="py-3 px-4 text-center text-gray-600 text-sm">Pay per call</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need help choosing? <Link to="/contact" className="text-blue-600 hover:underline font-medium">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
    </ConsumerLayout>
  )
}
