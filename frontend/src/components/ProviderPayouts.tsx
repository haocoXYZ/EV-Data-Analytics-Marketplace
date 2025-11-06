import React, { useEffect, useState } from 'react'
import { payoutsApi } from '../api'
import { Payout } from '../types'

interface ProviderPayoutsProps {
  providerId: number
}

export default function ProviderPayouts({ providerId }: ProviderPayoutsProps) {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    completedAmount: 0,
    pendingCount: 0,
    completedCount: 0
  })

  useEffect(() => {
    loadPayouts()
  }, [providerId])

  const loadPayouts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await payoutsApi.getProviderPayouts(providerId)
      setPayouts(data)

      // Calculate stats
      const totalEarnings = data.reduce((sum, p) => sum + p.totalDue, 0)
      const pendingPayouts = data.filter(p => p.payoutStatus === 'Pending')
      const completedPayouts = data.filter(p => p.payoutStatus === 'Completed')
      const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.totalDue, 0)
      const completedAmount = completedPayouts.reduce((sum, p) => sum + p.totalDue, 0)

      setStats({
        totalEarnings,
        pendingAmount,
        completedAmount,
        pendingCount: pendingPayouts.length,
        completedCount: completedPayouts.length
      })
    } catch (error: any) {
      console.error('Failed to load payouts:', error)
      setError(error.response?.data?.message || error.message || 'Không thể tải dữ liệu payouts')
    } finally {
      setLoading(false)
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Processing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return '✅'
      case 'Pending':
        return '⏳'
      case 'Processing':
        return '🔄'
      case 'Failed':
        return '❌'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Đang tải dữ liệu payouts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadPayouts}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100 text-sm font-medium">Tổng Thu Nhập</span>
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalEarnings)}</div>
          <div className="text-purple-100 text-sm">Tất cả payouts</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-100 text-sm font-medium">Đang Chờ</span>
            <span className="text-3xl">⏳</span>
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(stats.pendingAmount)}</div>
          <div className="text-yellow-100 text-sm">{stats.pendingCount} payout(s) chờ xử lý</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100 text-sm font-medium">Đã Nhận</span>
            <span className="text-3xl">✅</span>
          </div>
          <div className="text-3xl font-bold mb-1">{formatCurrency(stats.completedAmount)}</div>
          <div className="text-green-100 text-sm">{stats.completedCount} payout(s) hoàn thành</div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Lịch Sử Thanh Toán</h2>
          <p className="text-sm text-gray-600 mt-1">Chi tiết các khoản thanh toán từ nền tảng</p>
        </div>

        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Tháng/Năm</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Số Tiền</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Trạng Thái</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Ngày Thanh Toán</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Phương Thức</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Tài Khoản</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.payoutId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      #{payout.payoutId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{payout.monthYear}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-green-600">{formatCurrency(payout.totalDue)}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(payout.payoutStatus)}`}>
                        <span>{getStatusIcon(payout.payoutStatus)}</span>
                        <span>{payout.payoutStatus}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                      {formatDate(payout.payoutDate)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {payout.paymentMethod || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                      {payout.bankAccount ? (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {payout.bankAccount}
                        </span>
                      ) : (
                        'N/A'
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thanh toán nào</h3>
            <p className="text-gray-600 mb-2">Bạn sẽ nhận được thanh toán sau khi có consumer mua dữ liệu của bạn</p>
            <p className="text-sm text-gray-500">Thanh toán được tự động tạo hàng tháng bởi Admin</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Thông Tin Thanh Toán</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Payouts được tạo tự động vào <strong>ngày 1 hàng tháng</strong> bởi Admin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Thu nhập được tính từ các <strong>DataPackage, Subscription và API Package</strong> đã bán</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Tỷ lệ chia sẻ phụ thuộc vào loại package: <strong>60-70% cho Provider</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Thanh toán qua <strong>chuyển khoản ngân hàng</strong> trong vòng 5-7 ngày làm việc</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Kiểm tra email để nhận thông báo khi có payout mới</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

