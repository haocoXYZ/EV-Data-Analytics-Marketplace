import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { datasetsApi, moderationApi, payoutsApi, providersApi, adminApi } from '../api'
import { Dataset } from '../types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDatasets: 0,
    pendingReview: 0,
    approvedDatasets: 0,
    totalProviders: 0,
    totalConsumers: 0,
    totalRevenue: 0,
    adminRevenue: 0,
    pendingPayouts: 0
  })
  const [packageSales, setPackageSales] = useState<any>(null)
  const [recentDatasets, setRecentDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Use new comprehensive admin API
      const [dashboardStats, allDatasets, salesStats] = await Promise.all([
        adminApi.getDashboardStats().catch(() => null),
        datasetsApi.getAll().catch(() => []),
        payoutsApi.getPackageSales().catch(() => null)
      ])

      console.log('📊 Admin Dashboard Stats:', dashboardStats)

      if (dashboardStats) {
        setStats({
          totalDatasets: dashboardStats.datasets.total,
          pendingReview: dashboardStats.datasets.pending,
          approvedDatasets: dashboardStats.datasets.approved,
          totalProviders: dashboardStats.providers.total,
          totalConsumers: dashboardStats.consumers.total,
          totalRevenue: dashboardStats.packages.total.revenue,
          adminRevenue: dashboardStats.revenue.adminRevenue,
          pendingPayouts: dashboardStats.payouts.pending
        })

        setPackageSales(salesStats || {
          dataPackages: dashboardStats.packages.dataPackages,
          subscriptionPackages: dashboardStats.packages.subscriptions,
          apiPackages: dashboardStats.packages.apiPackages,
          summary: dashboardStats.packages.total
        })
      }

      setRecentDatasets(allDatasets.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Tổng quan nền tảng EV Data Marketplace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/moderation/review" className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">Chờ kiểm duyệt</span>
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.pendingReview}</div>
            <div className="text-yellow-100 text-sm">B3: Cần review</div>
          </Link>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Datasets Active</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.approvedDatasets}</div>
            <div className="text-green-100 text-sm">Đang bán</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Providers</span>
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalProviders}</div>
            <div className="text-blue-100 text-sm">Nhà cung cấp</div>
          </div>

          <Link to="/admin/payouts" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Pending Payouts</span>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.pendingPayouts.toLocaleString('vi-VN')}</div>
            <div className="text-purple-100 text-sm">B7: Cần thanh toán</div>
          </Link>
        </div>

        {/* Revenue Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tổng doanh thu
            </h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats.totalRevenue.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-sm text-gray-600">Từ tất cả giao dịch</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Doanh thu nền tảng (30%)
            </h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.adminRevenue.toLocaleString('vi-VN')} đ
            </div>
            <div className="text-sm text-blue-700">Platform fee</div>
          </div>
        </div>

        {/* Package Sales Breakdown */}
        {packageSales && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Chi tiết gói đã bán
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
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/pricing"
              className="group p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <div className="text-4xl mb-3">💵</div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">B1: Pricing Tiers</div>
              <div className="text-xs text-gray-600 mt-1">Quản lý bảng giá</div>
            </Link>

            <Link
              to="/moderation/review"
              className="group p-6 border-2 border-yellow-200 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all text-center relative"
            >
              {stats.pendingReview > 0 && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {stats.pendingReview}
                </div>
              )}
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-semibold text-gray-900 group-hover:text-yellow-600">B3: Kiểm duyệt</div>
              <div className="text-xs text-gray-600 mt-1">{stats.pendingReview} chờ review</div>
            </Link>

            <Link
              to="/admin/payouts"
              className="group p-6 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center"
            >
              <div className="text-4xl mb-3">💰</div>
              <div className="font-semibold text-gray-900 group-hover:text-green-600">B7: Payouts</div>
              <div className="text-xs text-gray-600 mt-1">Trả cho providers</div>
            </Link>

            <Link
              to="/"
              className="group p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
            >
              <div className="text-4xl mb-3">📊</div>
              <div className="font-semibold text-gray-900 group-hover:text-purple-600">Datasets</div>
              <div className="text-xs text-gray-600 mt-1">{stats.totalDatasets} total</div>
            </Link>
          </div>
        </div>

        {/* Recent Datasets */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold">Datasets gần đây</h2>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Xem tất cả →
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recentDatasets.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentDatasets.map((dataset) => (
                <div key={dataset.datasetId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{dataset.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {dataset.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          dataset.moderationStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                          dataset.moderationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {dataset.moderationStatus}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{dataset.providerName}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(dataset.uploadDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              Chưa có datasets
            </div>
          )}
        </div>

        {/* Core Flow Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Core Flow Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                B1
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Admin cung cấp bảng giá</div>
                <div className="text-sm text-gray-600">Pricing tiers cho providers</div>
              </div>
              <Link to="/admin/pricing" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Quản lý →
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                B2
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Provider upload datasets</div>
                <div className="text-sm text-gray-600">{stats.totalDatasets} datasets đã upload</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                B3
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Moderator kiểm duyệt</div>
                <div className="text-sm text-gray-600">{stats.pendingReview} đang chờ</div>
              </div>
              <Link to="/moderation/review" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Review →
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                B4-6
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Consumer mua & thanh toán</div>
                <div className="text-sm text-gray-600">Tìm kiếm, chọn gói, PayOS</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4">
              <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                B7
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Admin trả providers</div>
                <div className="text-sm text-gray-600">{stats.pendingPayouts.toLocaleString('vi-VN')} đ pending</div>
              </div>
              <Link to="/admin/payouts" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Payouts →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
