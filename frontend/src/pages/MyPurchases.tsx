import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { datasetsApi, paymentsApi } from '../api'
import { Dataset, Payment } from '../types'

export default function MyPurchases() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'datasets' | 'payments'>('datasets')
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [purchasedDatasets, paymentHistory] = await Promise.all([
        datasetsApi.getMyPurchases(),
        paymentsApi.getMy()
      ])
      setPurchases(purchasedDatasets)
      setPayments(paymentHistory)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (datasetId: number, datasetName: string) => {
    setDownloading(datasetId)
    try {
      const blob = await datasetsApi.download(datasetId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${datasetName.replace(/\s+/g, '_')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      // Reload to update download count
      await loadData()
    } catch (error: any) {
      alert('Lỗi download: ' + error.message)
    } finally {
      setDownloading(null)
    }
  }

  const handleCheckPaymentStatus = async (paymentId: number) => {
    try {
      const result = await paymentsApi.checkStatus(paymentId)
      alert(result.message || 'Payment status checked')
      await loadData()
    } catch (error: any) {
      alert('Lỗi: ' + error.message)
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200'
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
            <h1 className="text-4xl font-bold mb-3">B6: Datasets của tôi</h1>
            <p className="text-blue-100 text-lg">Quản lý datasets đã mua và lịch sử thanh toán</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('datasets')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'datasets'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📁 Datasets đã mua ({purchases.length})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'payments'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💳 Lịch sử thanh toán ({payments.length})
              </button>
            </div>

            {/* Datasets Tab */}
            {activeTab === 'datasets' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Đang tải...</p>
                  </div>
                ) : purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((item) => (
                      <div key={item.otpId} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{item.dataset?.name}</h3>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {item.dataset?.category}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.dataset?.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mua: {new Date(item.purchase?.purchaseDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {item.dataset?.dataSizeMb?.toFixed(2)} MB
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Downloads: {item.purchase?.downloadCount || 0}/{item.purchase?.maxDownload || 5}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleDownload(item.datasetId, item.dataset?.name)}
                              disabled={downloading === item.datasetId || item.purchase?.downloadCount >= item.purchase?.maxDownload}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {downloading === item.datasetId ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Downloading...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download CSV
                                </span>
                              )}
                            </button>

                            <Link
                              to={`/dataset/${item.datasetId}`}
                              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center whitespace-nowrap"
                            >
                              Chi tiết
                            </Link>
                          </div>
                        </div>

                        {/* Purchase Details */}
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 mb-1">Giá đã trả</div>
                            <div className="font-bold text-gray-900">{item.purchase?.totalPrice?.toLocaleString('vi-VN')} đ</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">License</div>
                            <div className="font-medium text-gray-900">{item.purchase?.licenseType || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Trạng thái</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(item.purchase?.status)}`}>
                              {item.purchase?.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có datasets nào</h3>
                    <p className="text-gray-600 mb-6">Khám phá và mua datasets ngay</p>
                    <Link
                      to="/catalog"
                      className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Khám phá Datasets →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">Đang tải...</p>
                  </div>
                ) : payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Payment ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Loại</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Số tiền</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Ngày</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Trạng thái</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.paymentId} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">#{payment.paymentId}</td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-gray-700">{payment.paymentType}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">
                              {payment.amount?.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-600">
                              {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {payment.status === 'Pending' && (
                                <button
                                  onClick={() => handleCheckPaymentStatus(payment.paymentId)}
                                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  Kiểm tra
                                </button>
                              )}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có giao dịch nào</h3>
                    <p className="text-gray-600">Lịch sử thanh toán sẽ hiển thị ở đây</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">💡 Hướng dẫn sử dụng</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Datasets đã mua: Click "Download CSV" để tải file về máy</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Download limit: Mỗi dataset có thể tải tối đa 5 lần</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Payment Pending: Click "Kiểm tra" để cập nhật trạng thái sau khi thanh toán</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>License: Research (nghiên cứu) hoặc Commercial (thương mại)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
