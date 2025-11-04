import React, { useEffect, useState } from 'react'
import ProviderLayout from '../components/ProviderLayout'
import { payoutsApi, authApi } from '../api'
import { Payout } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function ProviderEarnings() {
  const { user } = useAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [providerId, setProviderId] = useState<number | null>(null)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    completedAmount: 0,
    totalPayouts: 0
  })

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (providerId !== null) {
      loadEarnings()
    }
  }, [providerId])

  const loadProfile = async () => {
    try {
      const profile = await authApi.getProfile()
      if (profile.provider?.providerId) {
        setProviderId(profile.provider.providerId)
      } else {
        setError('Provider information not found. Please contact support.')
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error)
      setError('Failed to load profile. Please try again.')
      setLoading(false)
    }
  }

  const loadEarnings = async () => {
    if (!providerId) return

    try {
      setLoading(true)
      setError(null)
      const data = await payoutsApi.getProviderPayouts(providerId)
      setPayouts(data)

      // Calculate stats
      const pending = data.filter(p => p.payoutStatus === 'Pending').reduce((sum, p) => sum + p.totalDue, 0)
      const completed = data.filter(p => p.payoutStatus === 'Completed').reduce((sum, p) => sum + p.totalDue, 0)

      setStats({
        totalEarnings: pending + completed,
        pendingAmount: pending,
        completedAmount: completed,
        totalPayouts: data.length
      })
    } catch (error: any) {
      console.error('Failed to load earnings:', error)
      setError(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">✓ Paid</span>
      case 'Pending':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">⏳ Pending</span>
      case 'Processing':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">⚙ Processing</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <ProviderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 My Earnings</h1>
          <p className="text-gray-600">Track your revenue shares and payout history</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-blue-100 text-sm mb-1">Total Earnings</div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalEarnings)}</div>
            <div className="text-blue-100 text-xs">All time</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-yellow-100 text-sm mb-1">Pending Payout</div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.pendingAmount)}</div>
            <div className="text-yellow-100 text-xs">Awaiting payment</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-green-100 text-sm mb-1">Completed Payouts</div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.completedAmount)}</div>
            <div className="text-green-100 text-xs">Successfully paid</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-purple-100 text-sm mb-1">Total Payouts</div>
            <div className="text-3xl font-bold mb-1">{stats.totalPayouts}</div>
            <div className="text-purple-100 text-xs">Payment records</div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">📊 Payout History</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading earnings data...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">💸</div>
              <p className="text-lg font-medium">No payout records yet</p>
              <p className="text-sm">Upload datasets and start earning revenue!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Month/Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Transaction Ref
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout.payoutId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{payout.monthYear}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(payout.totalDue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payout.payoutStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(payout.payoutDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payout.paymentMethod || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          {payout.transactionRef || 'N/A'}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ About Payouts</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Payouts are processed monthly by the admin team</li>
            <li>• Revenue is calculated based on data package sales, subscriptions, and API usage</li>
            <li>• Commission rates vary by package type (check pricing page for details)</li>
            <li>• Pending payouts will be processed at the end of each month</li>
            <li>• Payment is typically made via bank transfer within 5-7 business days</li>
          </ul>
        </div>
      </div>
    </ProviderLayout>
  )
}
