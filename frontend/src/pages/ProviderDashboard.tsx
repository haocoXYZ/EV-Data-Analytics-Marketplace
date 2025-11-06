import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProviderLayout from '../components/ProviderLayout'
import ProviderPayouts from '../components/ProviderPayouts'
import { datasetsApi } from '../api'
import { Dataset } from '../types'

export default function ProviderDashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [providerId, setProviderId] = useState<number | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalRecords: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await datasetsApi.getMy()
      setDatasets(data)
      
      // Extract providerId from first dataset
      if (data.length > 0 && data[0].providerId) {
        setProviderId(data[0].providerId)
      }
      
      setStats({
        total: data.length,
        approved: data.filter((d) => d.moderationStatus === 'Approved').length,
        pending: data.filter((d) => d.moderationStatus === 'Pending').length,
        rejected: data.filter((d) => d.moderationStatus === 'Rejected').length,
        totalRecords: data.reduce((sum, d) => sum + (d.rowCount || 0), 0)
      })
    } catch (error: any) {
      console.error('Failed to load datasets:', error)
      setError(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return '✅'
      case 'Pending':
        return '⏳'
      case 'Rejected':
        return '❌'
      default:
        return '📄'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Quản lý datasets và theo dõi thu nhập</p>
          </div>
          <Link
            to="/provider/new"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Dataset Mới
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Tổng Datasets</span>
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.total || 0}</div>
            <div className="text-blue-100 text-sm">{(stats.totalRecords || 0).toLocaleString()} records</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Đã duyệt</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.approved || 0}</div>
            <div className="text-green-100 text-sm">Đang bán trên nền tảng</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">Chờ duyệt</span>
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.pending || 0}</div>
            <div className="text-yellow-100 text-sm">Đang kiểm duyệt</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100 text-sm font-medium">Từ chối</span>
              <span className="text-3xl">❌</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.rejected || 0}</div>
            <div className="text-red-100 text-sm">Cần chỉnh sửa</div>
          </div>
        </div>

        {/* Datasets Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold">Datasets của tôi</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải datasets...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : datasets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Records</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Upload Date</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset) => (
                    <tr key={dataset.datasetId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-600">
                        #{dataset.datasetId}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{dataset.name}</div>
                        {dataset.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{dataset.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {dataset.category || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600 font-medium">
                        {(dataset.rowCount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {formatDate(dataset.uploadDate)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          dataset.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {dataset.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(dataset.moderationStatus)}`}>
                          <span>{getStatusIcon(dataset.moderationStatus)}</span>
                          <span>{dataset.moderationStatus}</span>
                        </span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có dataset nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu bằng cách upload dataset đầu tiên của bạn</p>
              <Link
                to="/provider/new"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Dataset Đầu Tiên
              </Link>
            </div>
          )}
        </div>

        {/* Revenue Info */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Cơ chế chia sẻ doanh thu</h3>
              <p className="text-sm text-gray-700 mb-3">
                Doanh thu được chia tự động theo SystemPricing configuration cho từng package type:
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">DataPackage</div>
                  <div className="text-green-600 font-bold">70% provider</div>
                  <div className="text-xs text-gray-500">Chia theo row count</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">Subscription</div>
                  <div className="text-green-600 font-bold">60% provider</div>
                  <div className="text-xs text-gray-500">Chia đều providers</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-500 mb-1">API Package</div>
                  <div className="text-green-600 font-bold">65% provider</div>
                  <div className="text-xs text-gray-500">Chia đều providers</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3">
                📅 Thanh toán hàng tháng vào ngày 1 qua chuyển khoản ngân hàng
              </div>
            </div>
          </div>
        </div>

        {/* Provider Payouts Section */}
        {providerId && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                💰 Thu Nhập & Thanh Toán
              </h2>
              <p className="text-gray-600 mt-1">Chi tiết các khoản thanh toán bạn nhận được từ nền tảng</p>
            </div>
            <ProviderPayouts providerId={providerId} />
          </div>
        )}
      </div>
    </ProviderLayout>
  )
}
