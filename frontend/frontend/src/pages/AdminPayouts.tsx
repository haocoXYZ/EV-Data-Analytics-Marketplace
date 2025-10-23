import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'

export default function AdminPayouts() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    // Load completed order from localStorage for demo
    const completed = localStorage.getItem('completedOrder')
    if (completed) {
      setOrders([JSON.parse(completed)])
    }
  }, [])

  // Mock additional orders for demo
  const mockOrders = [
    { orderId: 'ORD-1001', datasetName: 'EV Charging Station Usage Data - Vietnam', package: 'file', price: 109, provider: 'VinFast Charging Network', timestamp: '2025-10-10' },
    { orderId: 'ORD-1002', datasetName: 'Battery Health Telemetry Dataset', package: 'api', price: 20, provider: 'TechEV Analytics', timestamp: '2025-10-12' },
    { orderId: 'ORD-1003', datasetName: 'Smart City EV Integration Data', package: 'subscription', price: 398, provider: 'SmartCity IoT', timestamp: '2025-10-13' },
    ...orders
  ]

  const providerRevenue = mockOrders.reduce((acc, order) => {
    const provider = order.provider || order.datasetName.split('-')[0]
    if (!acc[provider]) {
      acc[provider] = { total: 0, orders: 0 }
    }
    acc[provider].total += order.price
    acc[provider].orders += 1
    return acc
  }, {} as Record<string, { total: number; orders: number }>)

  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.price, 0)
  const platformFee = totalRevenue * 0.3
  const providerTotal = totalRevenue * 0.7

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Quản lý thanh toán Provider</h1>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-sm text-gray-600 mb-1">Tổng doanh thu tháng</div>
            <div className="text-3xl font-bold text-blue-700">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-sm text-gray-600 mb-1">Trả cho Providers (70%)</div>
            <div className="text-3xl font-bold text-green-700">${providerTotal.toFixed(2)}</div>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-sm text-gray-600 mb-1">Phí nền tảng (30%)</div>
            <div className="text-3xl font-bold text-purple-700">${platformFee.toFixed(2)}</div>
          </div>
        </div>

        {/* Provider Payouts Table */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Chi tiết thanh toán theo Provider</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Số đơn hàng</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Doanh thu</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Provider nhận (70%)</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(providerRevenue).map(([provider, data]) => (
                  <tr key={provider} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{provider}</td>
                    <td className="py-3 px-4 text-right">{data.orders}</td>
                    <td className="py-3 px-4 text-right font-semibold">${data.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      ${(data.total * 0.7).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        Chờ thanh toán
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">Tổng cộng</td>
                  <td className="py-3 px-4 text-right">{mockOrders.length}</td>
                  <td className="py-3 px-4 text-right">${totalRevenue.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-green-600">
                    ${providerTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Giao dịch gần đây</h2>
          <div className="space-y-3">
            {mockOrders.slice(0, 5).map((order) => (
              <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{order.orderId}</div>
                  <div className="text-sm text-gray-600">{order.datasetName}</div>
                  <div className="text-xs text-gray-500">{order.timestamp || 'Recent'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">${order.price.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 capitalize">{order.package}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button className="btn-secondary">
            📊 Xuất báo cáo Excel
          </button>
          <button className="btn-primary">
            💸 Thực hiện thanh toán hàng loạt
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
