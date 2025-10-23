import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/pricing', label: 'Pricing', icon: '💰' },
    { path: '/admin/payouts', label: 'Payouts', icon: '💸' },
    { path: '/moderator/review', label: 'Review', icon: '✅' },
  ]

  const providerMenuItems = [
    { path: '/provider/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/provider/new', label: 'New Dataset', icon: '➕' },
    { path: '/provider/datasets', label: 'My Datasets', icon: '📁' },
    { path: '/provider/earnings', label: 'Earnings', icon: '💵' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : providerMenuItems

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen ? (
              <>
                <Link to="/" className="flex items-center space-x-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-bold text-gray-800">EV Data</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                  ‹
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 mx-auto">
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
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                  location.pathname === item.path ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            {sidebarOpen ? (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button onClick={logout} className="w-full py-2 text-xl hover:bg-gray-100 rounded-md">
                🚪
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {user?.role} Portal
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
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
