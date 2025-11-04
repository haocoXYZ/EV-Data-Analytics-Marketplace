import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProviderLayoutProps {
  children: React.ReactNode
}

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/provider/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/provider/datasets', label: 'My Datasets', icon: '📁' },
    { path: '/provider/new', label: 'Upload Dataset', icon: '➕' },
    { path: '/provider/earnings', label: 'Earnings', icon: '💰' },
    { path: '/catalog', label: 'Browse Catalog', icon: '🔍' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-green-700 to-emerald-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-green-600">
            {sidebarOpen ? (
              <>
                <Link to="/provider/dashboard" className="flex items-center space-x-2">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <div className="font-bold">Provider Panel</div>
                    <div className="text-xs text-green-300">EV Data</div>
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-green-300 hover:text-white text-xl">
                  ‹
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="text-green-300 hover:text-white mx-auto text-xl">
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
                    : 'text-green-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Revenue Info */}
          {sidebarOpen && (
            <div className="mx-4 mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-xs text-green-200 mb-2">Your Commission</div>
              <div className="text-3xl font-bold text-yellow-400">70%</div>
              <div className="text-xs text-green-200 mt-1">of every sale</div>
            </div>
          )}

          {/* User Section */}
          <div className="border-t border-green-600 p-4">
            {sidebarOpen ? (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user?.fullName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{user?.fullName}</div>
                    <div className="text-xs text-green-300">Data Provider</div>
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
            <span className="text-2xl">🏢</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Provider Portal</h1>
              <div className="text-xs text-gray-500">Quản lý datasets của bạn</div>
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

