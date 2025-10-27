import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { paymentsApi } from '../api'

export default function Success() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus()
    } else {
      setCheckingStatus(false)
    }
  }, [paymentId])

  const checkPaymentStatus = async () => {
    try {
      const result = await paymentsApi.checkStatus(parseInt(paymentId!))
      setPaymentStatus(result)
    } catch (error) {
      console.error('Failed to check payment status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  return (
    <ConsumerLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {checkingStatus ? (
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xác nhận thanh toán...</h2>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-12 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-3">Thanh toán thành công!</h1>
                <p className="text-green-100 text-lg">Cảm ơn bạn đã mua dataset</p>
              </div>

              {/* Order Info */}
              <div className="p-8 space-y-6">
                {orderId && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Mã đơn hàng</div>
                    <div className="font-mono text-lg font-bold text-gray-900">{orderId}</div>
                  </div>
                )}

                {paymentStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Payment ID</span>
                      <span className="font-mono font-semibold">#{paymentStatus.paymentId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Trạng thái</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {paymentStatus.currentStatus || 'Completed'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3">🎉 Bước tiếp theo</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Dataset đã được thêm vào tài khoản của bạn</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Vào "Datasets của tôi" để xem và download</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Bạn có thể download tối đa 5 lần</span>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4">
                  <Link
                    to="/my-purchases"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-center hover:shadow-lg transition-all"
                  >
                    Xem Datasets của tôi →
                  </Link>
                  <Link
                    to="/catalog"
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsumerLayout>
  )
}
