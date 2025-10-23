import React from 'react'
import { Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'

export default function Home() {
  return (
    <ConsumerLayout>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-extrabold mb-6">
                Nền tảng dữ liệu trạm sạc <br />xe điện Việt Nam
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Phân tích hoạt động trạm sạc, lượt sử dụng, xu hướng sạc xe điện. 
                Dữ liệu chính xác giúp tối ưu vận hành và đầu tư mạng lưới trạm sạc.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/catalog"
                  className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Khám phá dữ liệu →
                </Link>
                <Link
                  to="/provider/new"
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-400 transition-colors border-2 border-blue-300"
                >
                  Trở thành nhà cung cấp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <h3 className="text-xl font-bold mb-2">Dữ liệu chính xác</h3>
              <p className="text-gray-600">
                Thu thập từ hệ thống trạm sạc thực tế, được kiểm duyệt kỹ lưỡng
              </p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-bold mb-2">Real-time API</h3>
              <p className="text-gray-600">
                Truy cập dữ liệu theo thời gian thực qua API hiện đại
              </p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-bold mb-2">Linh hoạt thanh toán</h3>
              <p className="text-gray-600">
                Tải file, API theo lượt request, hoặc theo dõi khu vực không giới hạn
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600">10+</div>
                <div className="text-gray-600 mt-2">Bộ dữ liệu</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">5K+</div>
                <div className="text-gray-600 mt-2">Lượt tải xuống</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">100+</div>
                <div className="text-gray-600 mt-2">Doanh nghiệp</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600 mt-2">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
