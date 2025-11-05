import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ConsumerLayoutProps {
  children: React.ReactNode
}

export default function ConsumerLayout({ children }: ConsumerLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const navItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/catalog', label: 'Khám phá dữ liệu' },
    { path: '/my-purchases', label: 'Dữ liệu đã mua' },
  ]
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Attractive */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-white text-xl font-bold">⚡</span>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EV Charging Data
                </div>
                <div className="text-xs text-gray-500">Dữ liệu trạm sạc xe điện</div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {user.fullName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Attractive Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <span className="text-xl font-bold">EV Charging Data</span>
              </div>
              <p className="text-blue-200 mb-4">
                Nền tảng dữ liệu trạm sạc xe điện Việt Nam. Cung cấp thông tin phân tích trạm sạc, lượt sử dụng, và xu hướng.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2 text-blue-200">
                <li><Link to="/catalog" className="hover:text-white transition-colors">Khám phá dữ liệu</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Bảng giá</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-blue-200">
                <li>Email: info@evdata.vn</li>
                <li>Điện thoại: +84 123 456 789</li>
                <li>Địa chỉ: TP. Hồ Chí Minh</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 pt-6 text-center text-blue-300">
            <p>© 2025 EV Charging Data Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
