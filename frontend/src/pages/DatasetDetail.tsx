import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { datasetsApi } from '../api'

export default function DatasetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [dataset, setDataset] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadDataset(parseInt(id))
    }
  }, [id])

  const loadDataset = async (datasetId: number) => {
    try {
      setLoading(true)
      const data = await datasetsApi.getById(Number(datasetId))
      setDataset(data)
    } catch (error) {
      console.error('Failed to load dataset:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProvinceName = (provinceId: number) => {
    const provinces: any = { 1: 'Hà Nội', 2: 'Hồ Chí Minh', 3: 'Đà Nẵng' }
    return provinces[provinceId] || 'Unknown'
  }

  if (loading) {
    return (
      <ConsumerLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Đang tải dataset...</p>
        </div>
      </ConsumerLayout>
    )
  }

  if (!dataset) {
    return (
      <ConsumerLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset không tìm thấy</h2>
          <button onClick={() => navigate('/catalog')} className="text-blue-600 hover:text-blue-700">
            ← Quay lại Catalog
          </button>
        </div>
      </ConsumerLayout>
    )
  }

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
              <span>/</span>
              <Link to="/catalog" className="hover:text-blue-600">Catalog</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{dataset.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dataset Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-3">
                      {dataset.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {dataset.providerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(dataset.uploadDate).toLocaleDateString('vi-VN')}
                      </div>
                      {dataset.lastUpdated && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Cập nhật {new Date(dataset.lastUpdated).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Mô tả</h2>
                  <p className="text-gray-700 leading-relaxed">{dataset.description || 'Không có mô tả chi tiết'}</p>
                </div>

                {/* Metadata */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Số bản ghi</div>
                    <div className="text-2xl font-bold text-gray-900">{dataset.rowCount?.toLocaleString() || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Định dạng</div>
                    <div className="text-2xl font-bold text-gray-900">CSV</div>
                  </div>
                  {dataset.provinceId && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Khu vực</div>
                      <div className="text-lg font-bold text-gray-900">{getProvinceName(dataset.provinceId)}</div>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                    <div className="text-lg font-bold text-green-600">Đã duyệt</div>
                  </div>
                </div>

                {/* Provider Info */}
                {dataset.providerContactEmail && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Thông tin nhà cung cấp</h3>
                    <div className="text-sm text-blue-800">
                      <div className="font-medium">{dataset.providerName}</div>
                      <div className="text-blue-600">{dataset.providerContactEmail}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Purchase Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-4">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold mb-1">Mua dữ liệu này</h2>
                  <p className="text-sm text-gray-600">Theo địa điểm</p>
                </div>

                <div className="p-6">
                  <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-900">
                        Dataset này là một phần của bộ sưu tập dữ liệu {dataset.provinceId ? getProvinceName(dataset.provinceId) : 'EV'} của chúng tôi. 
                        Mua dữ liệu theo địa điểm để truy cập.
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/buy-data"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all inline-block text-center"
                  >
                    Mua dữ liệu theo địa điểm →
                  </Link>

                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-gray-900">Ba cách mua:</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">📁</span>
                        <div>
                          <span className="font-medium text-gray-900">Data Package:</span> Tải CSV một lần theo tỉnh/quận
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">📊</span>
                        <div>
                          <span className="font-medium text-gray-900">Subscription:</span> Dashboard theo dõi theo tháng
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">⚡</span>
                        <div>
                          <span className="font-medium text-gray-900">API Package:</span> Truy cập lập trình qua API
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link 
                      to="/catalog" 
                      className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Quay lại Catalog
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
