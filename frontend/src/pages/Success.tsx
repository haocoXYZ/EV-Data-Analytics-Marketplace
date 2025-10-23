import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'

export default function Success() {
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    const completed = localStorage.getItem('completedOrder')
    if (completed) {
      const orderData = JSON.parse(completed)
      setOrder(orderData)
      
      // Save to purchases history
      const purchases = JSON.parse(localStorage.getItem('myPurchases') || '[]')
      purchases.push({
        id: orderData.orderId,
        datasetId: orderData.datasetId,
        datasetName: orderData.datasetName,
        package: orderData.package,
        price: orderData.price,
        purchaseDate: new Date().toISOString(),
        status: 'active'
      })
      localStorage.setItem('myPurchases', JSON.stringify(purchases))
    } else {
      navigate('/catalog')
    }
  }, [navigate])

  if (!order) {
    return <ConsumerLayout><div className="max-w-7xl mx-auto px-4 py-12">Loading...</div></ConsumerLayout>
  }

  return (
    <ConsumerLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
          <p className="text-gray-600">Đơn hàng của bạn đã được xử lý thành công</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đơn hàng</span>
              <span className="font-semibold">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dữ liệu</span>
              <span className="font-semibold">{order.datasetName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gói dịch vụ</span>
              <span className="font-semibold capitalize">{order.package}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold">{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Công ty</span>
              <span className="font-semibold">{order.company}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-green-600">
                ${order.price.toFixed(2)}
              </span>
            </div>
          </div>

          {order.package === 'file' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold mb-3">Tải xuống dữ liệu</div>
              <button className="btn-primary w-full">
                Download CSV Sample (Demo)
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Link tải sẽ được gửi qua email và có trong mục "Dữ liệu đã mua".
              </p>
            </div>
          )}

          {order.package === 'api' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold mb-3">Thông tin API</div>
              <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm mb-2">
                API Key: demo_key_{order.orderId}
              </div>
              <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm">
                Endpoint: https://api.evdata.vn/v1/{order.datasetId}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Bạn có {order.params.requests.toLocaleString()} requests còn lại.
              </p>
            </div>
          )}

          {order.package === 'subscription' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold mb-3">Theo dõi đang hoạt động</div>
              <div className="text-sm">
                <p className="mb-2">Khu vực: <span className="font-semibold">{order.params.regions.join(', ')}</span></p>
                <p className="mb-2">Truy cập không giới hạn qua API</p>
                <p className="text-xs text-gray-600">Gia hạn tự động hàng tháng.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link to="/my-purchases" className="btn-primary flex-1 text-center">
            Xem dữ liệu đã mua
          </Link>
          <Link to="/catalog" className="btn-secondary flex-1 text-center">
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Email xác nhận đã được gửi đến <span className="font-semibold">{order.email}</span>
          </p>
        </div>
      </div>
    </ConsumerLayout>
  )
}
