import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import pricingData from '../data/pricing.json'

export default function AdminPricing() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bảng giá cho Data Providers</h1>
          <p className="text-gray-600">
            Các nhà cung cấp dữ liệu sẽ dựa vào bảng giá này để quyết định tham gia nền tảng
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {pricingData.packages.map(pkg => (
            <div key={pkg.id} className="card hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{pkg.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                <p className="text-gray-600 text-sm">{pkg.description}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 text-center">
                {pkg.id === 'file' && (
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      ${pkg.pricing.base}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      + ${pkg.pricing.perDay}/ngày
                    </div>
                  </div>
                )}
                {pkg.id === 'api' && (
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      ${pkg.pricing.perRequest}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      mỗi request
                    </div>
                  </div>
                )}
                {pkg.id === 'subscription' && (
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      ${pkg.pricing.perRegionPerMonth}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      mỗi khu vực/tháng
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-semibold mb-2">Tính năng:</div>
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <h2 className="text-xl font-bold mb-4">💼 Chính sách chia sẻ doanh thu</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Data Provider nhận</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <span className="font-semibold">70%</span> doanh thu từ bán dữ liệu</li>
                <li>• Thanh toán hàng tháng vào ngày 1</li>
                <li>• Báo cáo chi tiết giao dịch</li>
                <li>• Không phí ẩn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Nền tảng giữ lại</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <span className="font-semibold">30%</span> phí dịch vụ nền tảng</li>
                <li>• Bao gồm: hosting, API, payment gateway, support</li>
                <li>• Marketing & promotion</li>
                <li>• Quality assurance</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="btn-primary">
            📋 Sao chép bảng giá cho Provider
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
