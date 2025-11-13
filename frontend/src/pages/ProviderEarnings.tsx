import { useState, useEffect } from 'react'
import ProviderLayout from '../components/ProviderLayout'
import { providersApi, ProviderEarnings as ProviderEarningsType, MonthlyEarnings, EarningsByPackageType } from '../api'

export default function ProviderEarnings() {
  const [earnings, setEarnings] = useState<ProviderEarningsType | null>(null)
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings | null>(null)
  const [packageTypeEarnings, setPackageTypeEarnings] = useState<EarningsByPackageType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadAllEarnings()
  }, [selectedYear])

  const loadAllEarnings = async () => {
    try {
      setLoading(true)
      setError(null)

      const [earningsData, monthlyData, packageData] = await Promise.all([
        providersApi.getMyEarnings(),
        providersApi.getMyMonthlyEarnings(selectedYear),
        providersApi.getMyEarningsByPackageType(),
      ])

      setEarnings(earningsData)
      setMonthlyEarnings(monthlyData)
      setPackageTypeEarnings(packageData)
    } catch (err: any) {
      console.error('Failed to load earnings:', err)
      setError(err.response?.data?.message || 'Failed to load earnings data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu thu nhập...</p>
          </div>
        </div>
      </ProviderLayout>
    )
  }

  if (error) {
    return (
      <ProviderLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </ProviderLayout>
    )
  }

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Thu nhập</h1>
          <p className="text-gray-600 mt-1">Xem chi tiết thu nhập và lịch sử thanh toán</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Tổng thu nhập</span>
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(earnings?.summary.totalEarned || 0)}</div>
            <div className="text-sm text-blue-100 mt-2">{earnings?.summary.totalRevenueShares || 0} giao dịch</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100">Chờ thanh toán</span>
              <svg className="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(earnings?.summary.pendingPayout || 0)}</div>
            <div className="text-sm text-yellow-100 mt-2">Đang chờ admin xử lý</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Đã thanh toán</span>
              <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(earnings?.summary.paidOut || 0)}</div>
            <div className="text-sm text-green-100 mt-2">{earnings?.summary.totalPayouts || 0} lần thanh toán</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100">Tỷ lệ nhận</span>
              <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold">
              {earnings?.summary.totalEarned ?
                Math.round((earnings.summary.paidOut / earnings.summary.totalEarned) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-100 mt-2">Đã nhận / Tổng thu</div>
          </div>
        </div>

        {/* Earnings by Package Type */}
        {packageTypeEarnings && packageTypeEarnings.earningsByPackageType.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Thu nhập theo loại gói</h2>
            <div className="space-y-4">
              {packageTypeEarnings.earningsByPackageType.map((pkg) => (
                <div key={pkg.packageType} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.packageType}</h3>
                      <p className="text-sm text-gray-500">{pkg.transactionCount} giao dịch</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(pkg.totalEarned)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">Chờ thanh toán</div>
                      <div className="text-sm font-medium text-yellow-600">{formatCurrency(pkg.pendingAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Đã thanh toán</div>
                      <div className="text-sm font-medium text-green-600">{formatCurrency(pkg.paidAmount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly Earnings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📅 Thu nhập theo tháng</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2025, 2024, 2023].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {monthlyEarnings?.monthlyBreakdown && monthlyEarnings.monthlyBreakdown.length > 0 ? (
            <div className="space-y-3">
              {monthlyEarnings.monthlyBreakdown.map((month) => (
                <div key={month.monthYear} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Tháng {month.month}/{month.year}</h3>
                      <p className="text-sm text-gray-500">{month.transactionCount} giao dịch</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(month.totalEarned)}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Pending: {formatCurrency(month.pendingAmount)} | Paid: {formatCurrency(month.paidAmount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Tổng năm {selectedYear}</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyEarnings.totalYearlyEarnings)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Chưa có thu nhập trong năm {selectedYear}</p>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏦 Lịch sử thanh toán</h2>
          {earnings?.payouts && earnings.payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tháng</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Số tiền</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày thanh toán</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phương thức</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã giao dịch</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payouts.map((payout) => (
                    <tr key={payout.payoutId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{payout.monthYear}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(payout.totalDue)}</td>
                      <td className="py-3 px-4">{payout.payoutDate ? formatDate(payout.payoutDate) : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.payoutStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payout.payoutStatus === 'Completed' ? 'Đã thanh toán' : 'Chờ xử lý'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{payout.paymentMethod}</td>
                      <td className="py-3 px-4 font-mono text-sm">{payout.transactionRef || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p>Chưa có lịch sử thanh toán</p>
            </div>
          )}
        </div>
      </div>
    </ProviderLayout>
  )
}
