import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProviderLayout from '../components/ProviderLayout'
import { datasetsApi, payoutsApi } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Dataset } from '../types'

export default function ProviderDashboard() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalSize: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await datasetsApi.getMy()
      setDatasets(data)
      
      // Calculate stats
      setStats({
        total: data.length,
        approved: data.filter((d: any) => d.moderationStatus === 'Approved').length,
        pending: data.filter((d: any) => d.moderationStatus === 'Pending').length,
        rejected: data.filter((d: any) => d.moderationStatus === 'Rejected').length,
        totalSize: data.reduce((sum: number, d: any) => sum + (d.dataSizeMb || 0), 0)
      })
    } catch (error) {
      console.error('Failed to load datasets:', error)
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

  return (
    <ProviderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              B2: Provider Dashboard
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
            <div className="text-4xl font-bold mb-1">{stats.total}</div>
            <div className="text-blue-100 text-sm">{stats.totalSize.toFixed(2)} MB tổng</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Đã duyệt</span>
              <span className="text-3xl">✅</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.approved}</div>
            <div className="text-green-100 text-sm">Đang bán trên nền tảng</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">Chờ duyệt</span>
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.pending}</div>
            <div className="text-yellow-100 text-sm">Đang kiểm duyệt</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100 text-sm font-medium">Từ chối</span>
              <span className="text-3xl">❌</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.rejected}</div>
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
          ) : datasets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Dataset</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Size</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Tier</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Trạng thái</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Kiểm duyệt</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset) => (
                    <tr key={dataset.datasetId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{dataset.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{dataset.description}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {dataset.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {dataset.dataSizeMb?.toFixed(2) || '0'} MB
                      </td>
                      <td className="py-4 px-6 text-center text-sm">
                        <div className="font-medium text-gray-900">{dataset.tierName || 'N/A'}</div>
                        {dataset.basePricePerMb && (
                          <div className="text-xs text-gray-500">{dataset.basePricePerMb.toLocaleString('vi-VN')} đ/MB</div>
                        )}
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
                      <td className="py-4 px-6 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          title="Xem chi tiết"
                        >
                          Chi tiết
                        </button>
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
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-green-600 font-bold text-2xl mb-1">70%</div>
                  <div className="text-gray-700">Bạn nhận từ mỗi giao dịch</div>
                  <div className="text-xs text-gray-500 mt-2">Thanh toán hàng tháng vào ngày 1</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-blue-600 font-bold text-2xl mb-1">30%</div>
                  <div className="text-gray-700">Nền tảng giữ lại</div>
                  <div className="text-xs text-gray-500 mt-2">Hosting, marketing, payment gateway</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  )
}
