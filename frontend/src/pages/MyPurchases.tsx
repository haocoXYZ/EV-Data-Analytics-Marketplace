import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { purchasesApi } from '../api'
import { DataPackagePurchase, SubscriptionPackagePurchase, APIPackagePurchase } from '../types'

export default function MyPurchases() {
  const [dataPackages, setDataPackages] = useState<DataPackagePurchase[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionPackagePurchase[]>([])
  const [apiPackages, setApiPackages] = useState<APIPackagePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dataPackages' | 'subscriptions' | 'apiPackages'>('dataPackages')
  const [downloading, setDownloading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await purchasesApi.getMy()
      setDataPackages(data.dataPackages || [])
      setSubscriptions(data.subscriptions || [])
      setApiPackages(data.apiPackages || [])
    } catch (error: any) {
      console.error('Failed to load data:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (purchaseId: number) => {
    setDownloading(purchaseId)
    try {
      const blob = await purchasesApi.downloadDataPackage(purchaseId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ev_charging_data_${purchaseId}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert('✅ Data package downloaded successfully!')
      // Reload data to update download count
      await loadData()
    } catch (error: any) {
      alert('❌ Download failed: ' + (error.response?.data?.message || error.message))
    } finally {
      setDownloading(null)
    }
  }

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) {
      return
    }

    try {
      await purchasesApi.cancelSubscription(subscriptionId)
      alert('Subscription cancelled successfully')
      await loadData()
    } catch (error: any) {
      alert('Cancel failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Cancelled':
      case 'Expired':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-3">📦 My Purchases</h1>
            <p className="text-blue-100 text-lg">Manage your data packages, subscriptions, and API access</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('dataPackages')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'dataPackages'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📥 Data Packages ({dataPackages.length})
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'subscriptions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔄 Subscriptions ({subscriptions.length})
              </button>
              <button
                onClick={() => setActiveTab('apiPackages')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'apiPackages'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔌 API Packages ({apiPackages.length})
              </button>
            </div>

            {/* Data Packages Tab */}
            {activeTab === 'dataPackages' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading...</p>
                  </div>
                ) : dataPackages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Purchase ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Province</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">District</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date Range</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Records</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Price</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Downloads</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataPackages.map((item) => (
                          <tr key={item.purchaseId} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">#{item.purchaseId}</td>
                            <td className="py-3 px-4 text-gray-700">{item.provinceName}</td>
                            <td className="py-3 px-4 text-gray-700">{item.districtName || 'All'}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{(item.rowCount || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">{(item.totalPrice || 0).toLocaleString()} đ</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm ${item.downloadCount >= item.maxDownload ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                {item.downloadCount}/{item.maxDownload}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDownload(item.purchaseId)}
                                disabled={downloading === item.purchaseId || item.status !== 'Active' || item.downloadCount >= item.maxDownload}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title={item.downloadCount >= item.maxDownload ? 'Download limit reached' : item.status !== 'Active' ? 'Purchase is not active' : 'Download CSV file'}
                              >
                                {downloading === item.purchaseId ? 'Downloading...' : 'Download CSV'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Packages</h3>
                    <p className="text-gray-600 mb-6">Purchase location-based data packages</p>
                    <Link
                      to="/buy-data"
                      className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Buy Data Package →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading...</p>
                  </div>
                ) : subscriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Province</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Billing Cycle</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Price</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Next Billing</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((item) => (
                          <tr key={item.subscriptionId} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">#{item.subscriptionId}</td>
                            <td className="py-3 px-4 text-gray-700">{item.provinceName}</td>
                            <td className="py-3 px-4 text-gray-700">{item.billingCycle || 'N/A'}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">{(item.monthlyPrice || 0).toLocaleString()} đ</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {item.nextBillingDate ? new Date(item.nextBillingDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {item.status === 'Pending' ? (
                                  <Link
                                    to={`/payments?subscriptionId=${item.subscriptionId}`}
                                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                                  >
                                    Complete Payment
                                  </Link>
                                ) : (
                                  <Link
                                    to={`/subscriptions/${item.subscriptionId}/dashboard`}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                  >
                                    View Dashboard
                                  </Link>
                                )}
                                {item.status === 'Active' && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <button
                                      onClick={() => handleCancelSubscription(item.subscriptionId)}
                                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions</h3>
                    <p className="text-gray-600 mb-6">Subscribe for real-time dashboard access</p>
                    <Link
                      to="/buy-subscription"
                      className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Buy Subscription →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* API Packages Tab */}
            {activeTab === 'apiPackages' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Loading...</p>
                  </div>
                ) : apiPackages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">ID</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">API Calls</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Used</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Remaining</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Price</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiPackages.map((item) => (
                          <tr key={item.purchaseId} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">#{item.purchaseId}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">{(item.totalAPICalls || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-orange-600 font-medium">{(item.apiCallsUsed || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-green-600 font-medium">{(item.apiCallsRemaining || 0).toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">{(item.totalPrice || 0).toLocaleString()} đ</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Link
                                to={`/api-packages/${item.purchaseId}/keys`}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                Manage Keys
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No API Packages</h3>
                    <p className="text-gray-600 mb-6">Purchase API access for programmatic data retrieval</p>
                    <Link
                      to="/catalog"
                      className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Browse Catalog →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">💡 Purchase Guide</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Data Packages:</strong> One-time purchase of historical data by location</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Subscriptions:</strong> Real-time dashboard access with auto-renewal</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>API Packages:</strong> Programmatic access with API keys and call limits</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>All prices in Vietnamese Dong (đ)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
