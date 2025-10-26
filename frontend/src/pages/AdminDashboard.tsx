import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

export default function AdminDashboard() {
  const stats = [
    { label: 'Tổng Datasets', value: '10', change: '+2 tháng này', icon: '📊' },
    { label: 'Providers', value: '5', change: '+1 tháng này', icon: '👥' },
    { label: 'Consumers', value: '127', change: '+23 tháng này', icon: '🛒' },
    { label: 'Doanh thu', value: '$12,847', change: '+15% tháng này', icon: '💰' },
  ]

  const recentActivities = [
    { action: 'Dataset mới được thêm', user: 'VinFast Charging Network', time: '2 giờ trước', status: 'pending' },
    { action: 'Provider đăng ký', user: 'GreenFleet Solutions', time: '5 giờ trước', status: 'approved' },
    { action: 'Consumer mua data', user: 'Công ty ABC', time: '1 ngày trước', status: 'completed' },
    { action: 'Payout request', user: 'TechEV Analytics', time: '2 ngày trước', status: 'pending' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống EV Data Marketplace</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-green-600">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/moderator/review" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-medium text-sm">Review Datasets</div>
            </Link>
            <Link to="/admin/pricing" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-medium text-sm">Manage Pricing</div>
            </Link>
            <Link to="/admin/payouts" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">💸</div>
              <div className="font-medium text-sm">Process Payouts</div>
            </Link>
            <Link to="/catalog" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">🔍</div>
              <div className="font-medium text-sm">View Catalog</div>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.user} · {activity.time}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}



