import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/catalog', label: 'Danh mục dữ liệu' },
    { path: '/provider/new', label: 'Nhà cung cấp' },
    { path: '/moderator/review', label: 'Kiểm duyệt' },
    { path: '/admin/pricing', label: 'Bảng giá' },
    { path: '/admin/payouts', label: 'Thanh toán' },
  ]
  
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-blue-600">EV Data Marketplace</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2025 EV Data Analytics Marketplace. Dữ liệu xe điện Việt Nam.
        </div>
      </footer>
    </div>
  )
}
