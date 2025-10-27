import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { datasetsApi } from '../api'
import { Dataset } from '../types'

export default function Home() {
  const [featuredDatasets, setFeaturedDatasets] = useState<any[]>([])
  const [stats, setStats] = useState({ datasets: 0, downloads: 0, companies: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load featured datasets (latest 3)
      const datasets = await datasetsApi.getAll()
      setFeaturedDatasets(datasets.slice(0, 3))
      
      // Calculate stats
      setStats({
        datasets: datasets.length,
        downloads: datasets.reduce((sum: number, d: any) => sum + (d.downloadCount || 0), 0),
        companies: new Set(datasets.map((d: any) => d.providerId)).size
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Miễn phí'
    return `${price.toLocaleString('vi-VN')} đ/MB`
  }

  return (
    <ConsumerLayout>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-flex items-center bg-blue-500/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Nền tảng dữ liệu EV #1 Việt Nam
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                Dữ liệu trạm sạc <br />
                <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  Xe điện Việt Nam
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Phân tích hoạt động trạm sạc, lượt sử dụng, xu hướng sạc xe điện. 
                Dữ liệu chính xác giúp tối ưu vận hành và đầu tư mạng lưới trạm sạc.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/catalog"
                  className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center"
                >
                  Khám phá dữ liệu
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border-2 border-white/30 backdrop-blur-sm"
                >
                  Trở thành nhà cung cấp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.datasets}+
                </div>
                <div className="text-gray-600 mt-2 font-medium">Bộ dữ liệu</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.downloads}+
                </div>
                <div className="text-gray-600 mt-2 font-medium">Lượt tải xuống</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.companies}+
                </div>
                <div className="text-gray-600 mt-2 font-medium">Nhà cung cấp</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-gray-600 mt-2 font-medium">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Datasets */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Datasets nổi bật</h2>
              <p className="text-gray-600 mt-2">Dữ liệu được tin dùng nhất</p>
            </div>
            <Link
              to="/catalog"
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center"
            >
              Xem tất cả
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredDatasets.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredDatasets.map((dataset) => (
                <Link
                  key={dataset.datasetId}
                  to={`/dataset/${dataset.datasetId}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
                          {dataset.category || 'General'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {dataset.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {dataset.description || 'Không có mô tả'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {dataset.dataSizeMb?.toFixed(2) || '0'} MB
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {formatPrice(dataset.basePricePerMb)}
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-400">
                      Bởi {dataset.providerName || 'Anonymous'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">Chưa có dataset nào</div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Dữ liệu chính xác</h3>
                <p className="text-gray-600">
                  Thu thập từ hệ thống trạm sạc thực tế, được kiểm duyệt kỹ lưỡng bởi đội ngũ chuyên nghiệp
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time API</h3>
                <p className="text-gray-600">
                  Truy cập dữ liệu theo thời gian thực qua REST API hiện đại với documentation đầy đủ
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Linh hoạt thanh toán</h3>
                <p className="text-gray-600">
                  Mua một lần, thuê bao theo khu vực, hoặc trả theo API calls - tùy chỉnh theo nhu cầu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Khám phá dữ liệu EV chất lượng cao ngay hôm nay
            </p>
            <Link
              to="/catalog"
              className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Xem tất cả datasets →
            </Link>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
