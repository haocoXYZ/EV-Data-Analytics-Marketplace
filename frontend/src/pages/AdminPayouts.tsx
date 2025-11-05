import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { payoutsApi } from '../api'
import { RevenueSummary, Payout } from '../types'

export default function AdminPayouts() {
  const [revenueSummary, setRevenueSummary] = useState<any>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [generatingPayouts, setGeneratingPayouts] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      const [summary, allPayouts] = await Promise.all([
        payoutsApi.getRevenueSummary(selectedMonth),
        payoutsApi.getAll()
      ])
      setRevenueSummary(summary)
      setPayouts(allPayouts)
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
    return payouts
      .filter((p: any) => p.payoutStatus === 'Pending')
      .reduce((sum: number, p: any) => sum + (p.totalDue || 0), 0)
  }

  const getTotalPaid = () => {
    return payouts
      .filter((p: any) => p.payoutStatus === 'Completed')
      .reduce((sum: number, p: any) => sum + (p.totalDue || 0), 0)
  }

  const getAdminTotal = () => {
    return revenueSummary?.totalAdminRevenue || 0
  }

  const groupedProviders = revenueSummary?.providers || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            B7: Quản lý Payouts
          </h1>
          <p className="text-gray-600 mt-1">Trả tiền cho Data Providers hàng tháng</p>
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
                          {/* Show completed payouts from payouts list */}
                          {payouts
                            .filter((p: any) => p.providerId === provider.providerId && p.payoutStatus === 'Completed')
                            .reduce((sum: number, p: any) => sum + p.totalDue, 0)
                            .toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-gray-900">
                          {(provider.totalDue + 
                            payouts
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
            {payouts.length > 0 ? (
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
                  {payouts.map((payout: any) => (
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
      </div>
    </AdminLayout>
  )
}
