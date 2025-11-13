import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { payoutsApi } from '../api'
import { RevenueSummary, Payout } from '../types'

export default function AdminPayouts() {
  const [revenueSummary, setRevenueSummary] = useState<any>(null)
  const [payouts, setPayouts] = useState<any[]>([]) // Payouts for selected month
  const [allPayoutsHistory, setAllPayoutsHistory] = useState<any[]>([]) // All payouts for history table
  const [packageSales, setPackageSales] = useState<any>(null) // Package sales details
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [generatingPayouts, setGeneratingPayouts] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null) // For detail modal
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      const [summary, monthPayouts, allHistory, sales] = await Promise.all([
        payoutsApi.getRevenueSummary(selectedMonth),
        payoutsApi.getAll({ monthYear: selectedMonth }),
        payoutsApi.getAll(), // All payouts for history table
        payoutsApi.getPackageSales(selectedMonth) // Package sales details
      ])

      // Debug logging
      console.log('=== ADMIN PAYOUTS DEBUG ===')
      console.log('Selected Month:', selectedMonth)
      console.log('Revenue Summary:', summary)
      console.log('Month Payouts:', monthPayouts)
      console.log('All History:', allHistory)
      console.log('Package Sales:', sales)
      console.log('Total Provider Payout:', summary?.totalProviderPayout)
      console.log('Total Admin Revenue:', summary?.totalAdminRevenue)
      console.log('Providers Count:', summary?.providers?.length)
      console.log('===========================')

      setRevenueSummary(summary)
      setPayouts(monthPayouts)
      setAllPayoutsHistory(allHistory)
      setPackageSales(sales)
    } catch (error) {
      console.error('Failed to load payout data:', error)
      alert('Lỗi tải dữ liệu payouts: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePayouts = async () => {
    if (!confirm(`Xác nhận tạo payouts cho tháng ${selectedMonth}?`)) return

    try {
      setGeneratingPayouts(true)
      const result = await payoutsApi.generatePayouts(selectedMonth)
      alert(`✅ ${result.message}\nTổng tiền: ${result.totalAmount.toLocaleString('vi-VN')} đ`)
      await loadData()
    } catch (error: any) {
      alert('Lỗi tạo payouts: ' + error.message)
    } finally {
      setGeneratingPayouts(false)
    }
  }

  const handleCompletePayout = async (payoutId: number) => {
    const transactionRef = prompt('Nhập mã giao dịch chuyển khoản:')
    if (!transactionRef) return

    const bankAccount = prompt('Nhập số tài khoản đã chuyển:') || undefined

    try {
      await payoutsApi.completePayout(payoutId, {
        transactionRef,
        bankAccount,
        notes: `Paid on ${new Date().toLocaleDateString('vi-VN')}`
      })
      alert('✅ Đã đánh dấu payout hoàn thành!')
      await loadData()
    } catch (error: any) {
      alert('Lỗi: ' + error.message)
    }
  }

  const getTotalPending = () => {
    // Pending revenue from summary (already filtered by selectedMonth)
    return revenueSummary?.totalProviderPayout || 0
  }

  const getTotalPaid = () => {
    // Completed payouts for selected month
    return payouts
      .filter((p: any) => p.payoutStatus === 'Completed')
      .reduce((sum: number, p: any) => sum + (p.totalDue || 0), 0)
  }

  const getAdminTotal = () => {
    // Admin revenue from summary (already filtered by selectedMonth)
    return revenueSummary?.totalAdminRevenue || 0
  }

  const groupedProviders = revenueSummary?.providers || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              B7: Quản lý Payouts
            </h1>
            <p className="text-gray-600 mt-1">Trả tiền cho Data Providers hàng tháng</p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Chọn tháng:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">Chờ thanh toán</span>
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-3xl font-bold mb-1">{getTotalPending().toLocaleString('vi-VN')} đ</div>
            <div className="text-yellow-100 text-sm">Cho providers</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Đã thanh toán</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-3xl font-bold mb-1">{getTotalPaid().toLocaleString('vi-VN')} đ</div>
            <div className="text-green-100 text-sm">Tháng này</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Doanh thu Admin</span>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-3xl font-bold mb-1">{getAdminTotal().toLocaleString('vi-VN')} đ</div>
            <div className="text-blue-100 text-sm">30% platform fee</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Providers</span>
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-3xl font-bold mb-1">{groupedProviders.length}</div>
            <div className="text-purple-100 text-sm">Tổng providers</div>
          </div>
        </div>

        {/* Package Sales Breakdown */}
        {packageSales && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Chi tiết gói đã bán ({selectedMonth})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Data Packages */}
              <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-blue-900">📦 Data Packages</h3>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {packageSales.dataPackages?.count || 0}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(packageSales.dataPackages?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                </div>
                <div className="text-xs text-blue-700">Mua data theo địa điểm</div>
              </div>

              {/* Subscription Packages */}
              <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-purple-900">🔄 Subscriptions</h3>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {packageSales.subscriptionPackages?.count || 0}
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(packageSales.subscriptionPackages?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                </div>
                <div className="text-xs text-purple-700">Dashboard theo tháng</div>
              </div>

              {/* API Packages */}
              <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-orange-900">🔌 API Packages</h3>
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {packageSales.apiPackages?.count || 0}
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {(packageSales.apiPackages?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                </div>
                <div className="text-xs text-orange-700">API call credits</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-indigo-700 font-medium mb-1">Tổng packages đã bán</div>
                  <div className="text-3xl font-bold text-indigo-900">
                    {packageSales.summary?.totalPackages || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-indigo-700 font-medium mb-1">Tổng doanh thu</div>
                  <div className="text-3xl font-bold text-indigo-900">
                    {(packageSales.summary?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown by Provider */}
            {packageSales.providerSales && packageSales.providerSales.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Chi tiết theo nhà cung cấp</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">📦 Data</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">🔄 Subscription</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">🔌 API</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Doanh thu</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packageSales.providerSales.map((provider: any) => (
                        <tr key={provider.providerId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{provider.providerName}</div>
                            <div className="text-xs text-gray-500">{provider.email}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                              {provider.packages.dataPackages}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                              {provider.packages.subscriptions}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                              {provider.packages.apiPackages}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-bold text-green-600">
                              {(provider.totalRevenue || 0).toLocaleString('vi-VN')} đ
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedProvider(provider)
                                setShowDetailModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Provider Payouts */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Danh sách Provider Payouts</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải...</p>
            </div>
          ) : groupedProviders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Provider</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Chờ thanh toán</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Đã thanh toán</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Tổng</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedProviders.map((provider: any) => (
                    <tr key={provider.providerId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{provider.providerName}</div>
                        <div className="text-sm text-gray-500">{provider.email}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-yellow-600">
                          {provider.totalDue.toLocaleString('vi-VN')} đ
                        </span>
                        <div className="text-xs text-gray-500">{provider.transactionCount} giao dịch</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-semibold text-green-600">
                          {/* Show completed payouts from all history */}
                          {allPayoutsHistory
                            .filter((p: any) => p.providerId === provider.providerId && p.payoutStatus === 'Completed')
                            .reduce((sum: number, p: any) => sum + p.totalDue, 0)
                            .toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-gray-900">
                          {(provider.totalDue +
                            allPayoutsHistory
                              .filter((p: any) => p.providerId === provider.providerId && p.payoutStatus === 'Completed')
                              .reduce((sum: number, p: any) => sum + p.totalDue, 0)
                          ).toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {provider.totalDue > 0 && (
                          <button
                            onClick={handleGeneratePayouts}
                            disabled={generatingPayouts}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm disabled:opacity-50"
                          >
                            {generatingPayouts ? 'Đang tạo...' : 'Tạo Payout'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có payouts</h3>
              <p className="text-gray-600">Payouts sẽ được tạo khi có doanh thu từ các giao dịch</p>
            </div>
          )}
        </div>

        {/* Admin Revenue Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Doanh thu Nền tảng (30%)
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Tổng doanh thu</div>
              <div className="text-2xl font-bold text-blue-600">
                {getAdminTotal().toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Số providers</div>
              <div className="text-2xl font-bold text-gray-900">
                {groupedProviders.length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">Trung bình/provider</div>
              <div className="text-2xl font-bold text-gray-900">
                {groupedProviders.length > 0 
                  ? (getAdminTotal() / groupedProviders.length).toLocaleString('vi-VN')
                  : '0'} đ
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Sử dụng cho:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Hosting và infrastructure (server, database, CDN)</li>
              <li>Payment gateway fees (PayOS 1-2%)</li>
              <li>Marketing và customer acquisition</li>
              <li>Customer support và moderation team</li>
              <li>Platform development và maintenance</li>
            </ul>
          </div>
        </div>

        {/* Payouts History */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Lịch sử Payouts
            </h2>
          </div>

          <div className="overflow-x-auto">
            {allPayoutsHistory.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Provider</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Tháng</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-700">Số tiền</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Ngày thanh toán</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayoutsHistory.map((payout: any) => (
                    <tr key={payout.payoutId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{payout.providerName}</div>
                        <div className="text-xs text-gray-500">{payout.providerEmail}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">{payout.monthYear}</td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900">
                        {payout.totalDue.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-4 px-6">
                        {payout.payoutStatus === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                            ⏳ Chờ thanh toán
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {payout.payoutDate 
                          ? new Date(payout.payoutDate).toLocaleDateString('vi-VN')
                          : '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {payout.payoutStatus === 'Pending' && (
                          <button
                            onClick={() => handleCompletePayout(payout.payoutId)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                          >
                            Đánh dấu đã thanh toán
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-500">
                Chưa có payouts nào được tạo.
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
          <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quy trình thanh toán (B7)
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
            <li>Revenue shares được tự động tạo khi consumer thanh toán thành công</li>
            <li>Vào đầu tháng, admin xem revenue summary và click "Tạo Payout"</li>
            <li>Sau khi chuyển khoản thực tế, click "Đánh dấu đã thanh toán"</li>
            <li>Nhập mã giao dịch và số tài khoản để tracking</li>
            <li>Provider có thể xem lịch sử payouts trong dashboard</li>
          </ol>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedProvider && (
          <ProviderDetailModal
            provider={selectedProvider}
            monthYear={selectedMonth}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedProvider(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

// Provider Detail Modal Component
function ProviderDetailModal({ provider, monthYear, onClose }: { provider: any, monthYear: string, onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    loadDetails()
  }, [provider.providerId, monthYear])

  const loadDetails = async () => {
    try {
      setLoading(true)
      const data = await payoutsApi.getProviderPackageDetails(provider.providerId, monthYear)
      setDetails(data)
    } catch (error) {
      console.error('Failed to load provider details:', error)
      alert('Lỗi tải chi tiết: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{provider.providerName}</h2>
              <p className="text-blue-100 text-sm mt-1">{provider.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : details ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-blue-700 mb-1">Tổng packages</div>
                  <div className="text-3xl font-bold text-blue-900">{details.totalPackages}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="text-sm text-green-700 mb-1">Tổng doanh thu</div>
                  <div className="text-3xl font-bold text-green-900">
                    {(details.totalRevenue || 0).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Package List */}
              <h3 className="text-lg font-bold mb-4 text-gray-900">Danh sách gói đã bán</h3>
              {details.packages && details.packages.length > 0 ? (
                <div className="space-y-3">
                  {details.packages.map((pkg: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            pkg.packageType === 'Data Package' ? 'bg-blue-100 text-blue-700' :
                            pkg.packageType === 'Subscription' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {pkg.packageType}
                          </span>
                          <span className={`ml-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                            pkg.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {pkg.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Chia sẻ của provider</div>
                          <div className="text-xl font-bold text-green-600">
                            {(pkg.providerShare || 0).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <div className="text-gray-600">Khách hàng</div>
                          <div className="font-semibold text-gray-900">{pkg.consumerName}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Địa điểm</div>
                          <div className="font-semibold text-gray-900">{pkg.location}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Thời gian / Số lượng</div>
                          <div className="font-semibold text-gray-900">{pkg.dateRange}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Ngày mua</div>
                          <div className="font-semibold text-gray-900">
                            {new Date(pkg.purchaseDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Tổng giá trị gói: <span className="font-bold text-gray-900">{(pkg.totalPrice || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {pkg.packageId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có package nào trong tháng này
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
