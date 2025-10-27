import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/pricing', label: 'B1: Pricing Tiers', icon: '💰' },
    { path: '/moderation/review', label: 'B3: Kiểm duyệt', icon: '✅' },
    { path: '/admin/payouts', label: 'B7: Payouts', icon: '💸' },
    { path: '/catalog', label: 'Xem Datasets', icon: '📁' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-indigo-900 to-purple-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-800">
            {sidebarOpen ? (
              <>
                <Link to="/admin/dashboard" className="flex items-center space-x-2">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="font-bold">Admin Panel</div>
                    <div className="text-xs text-indigo-300">EV Data</div>
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-indigo-300 hover:text-white text-xl">
                  ‹
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="text-indigo-300 hover:text-white mx-auto text-xl">
                ›
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/20 border-r-4 border-yellow-400 text-white shadow-lg'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-indigo-800 p-4">
            {sidebarOpen ? (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{user?.fullName}</div>
                    <div className="text-xs text-indigo-300">Administrator</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  🚪 Đăng xuất
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full py-2 text-2xl hover:bg-white/10 rounded-lg">
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
              <div className="text-xs text-gray-500">Quản lý nền tảng EV Data</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="text-gray-500">Logged in as</div>
              <div className="font-semibold text-gray-800">{user?.email}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

