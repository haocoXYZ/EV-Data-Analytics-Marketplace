import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

export default function ProviderDashboard() {
  const stats = [
    { label: 'Datasets của tôi', value: '3', change: 'Active', icon: '📊' },
    { label: 'Tổng lượt tải', value: '2,683', change: '+342 tháng này', icon: '📥' },
    { label: 'Thu nhập tháng này', value: '$1,847', change: '+$342', icon: '💵' },
    { label: 'Pending Payout', value: '$1,294', change: 'Trả ngày 1', icon: '⏳' },
  ]

  const myDatasets = [
    { name: 'EV Charging Station Usage Data', downloads: 1247, revenue: '$873', status: 'active' },
    { name: 'Battery Health Telemetry Dataset', downloads: 892, revenue: '$624', status: 'active' },
    { name: 'Fleet Route Optimization Data', downloads: 534, revenue: '$374', status: 'active' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600 mt-1">Quản lý datasets và theo dõi thu nhập</p>
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
            <Link to="/provider/new" className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center">
              <div className="text-3xl mb-2">➕</div>
              <div className="font-medium text-sm">Add New Dataset</div>
            </Link>
            <Link to="/provider/datasets" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">📁</div>
              <div className="font-medium text-sm">My Datasets</div>
            </Link>
            <Link to="/provider/earnings" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">💵</div>
              <div className="font-medium text-sm">View Earnings</div>
            </Link>
            <Link to="/admin/pricing" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-medium text-sm">Pricing Info</div>
            </Link>
          </div>
        </div>

        {/* My Datasets */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Datasets của tôi</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Dataset Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Downloads</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue (70%)</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {myDatasets.map((dataset, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{dataset.name}</td>
                    <td className="py-3 px-4 text-right">{dataset.downloads.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">{dataset.revenue}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {dataset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
