import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { purchasesApi, paymentsApi } from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { purchaseType, referenceId, datasetName, price } = location.state || {}

  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!referenceId) {
      navigate('/catalog')
    }
  }, [referenceId, navigate])

  const getPackageIcon = () => {
    switch (purchaseType) {
      case 'onetime':
        return '📁'
      case 'api':
        return '⚡'
      case 'subscription':
        return '🔄'
      default:
        return '📦'
    }
  }

  const getPackageName = () => {
    switch (purchaseType) {
      case 'onetime':
        return 'Gói File - Tải xuống một lần'
      case 'api':
        return 'Gói API - Truy cập qua API'
      case 'subscription':
        return 'Gói Thuê bao - Theo dõi khu vực'
      default:
        return 'Gói mua'
    }
  }

  const handlePayment = async () => {
    setCreating(true)
    try {
      const paymentType = purchaseType === 'onetime' ? 'OneTimePurchase' : 
                          purchaseType === 'api' ? 'APIPackage' : 
                          'Subscription'

      const paymentResponse = await paymentsApi.create({
        paymentType,
        referenceId
      })

      // Redirect to PayOS checkout
      if (paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl
      } else {
        alert('Lỗi: Không thể tạo payment link')
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message)
      setCreating(false)
    }
  }

  if (!referenceId) {
    return null
  }

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getPackageIcon()}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">B6: Thanh toán</h1>
            <p className="text-gray-600">Hoàn tất đơn hàng và thanh toán qua PayOS</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h2 className="text-xl font-bold mb-1">Thông tin đơn hàng</h2>
              <p className="text-blue-100 text-sm">Kiểm tra thông tin trước khi thanh toán</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">Dataset</div>
                  <div className="font-bold text-gray-900 text-lg">{datasetName}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Gói mua</div>
                  <div className="font-semibold text-gray-900">{getPackageName()}</div>
                </div>
                <div className="text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {purchaseType?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="text-gray-700">Tổng tiền</div>
                <div className="text-2xl font-bold text-blue-600">
                  {price?.toLocaleString('vi-VN')} đ
                </div>
              </div>

              {/* Revenue Split Info */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-600 mb-3">PHÂN CHIA DOANH THU</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Provider nhận</div>
                    <div className="font-bold text-green-600">70%</div>
                    <div className="text-xs text-gray-500">{((price || 0) * 0.7).toLocaleString('vi-VN')} đ</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Nền tảng</div>
                    <div className="font-bold text-blue-600">30%</div>
                    <div className="text-xs text-gray-500">{((price || 0) * 0.3).toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <button
              onClick={handlePayment}
              disabled={creating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang tạo payment link...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Thanh toán qua PayOS
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              ← Quay lại
            </button>
          </div>

          {/* Payment Info */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Thanh toán an toàn với PayOS
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Hỗ trợ QR Code, chuyển khoản ngân hàng, ví điện tử</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Bảo mật SSL 256-bit, PCI DSS compliant</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Xác nhận tức thì, tự động cập nhật purchase</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
