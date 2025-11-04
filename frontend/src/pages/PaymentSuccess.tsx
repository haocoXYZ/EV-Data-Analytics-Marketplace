import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { paymentsApi } from '../api'
import { Payment } from '../types'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const paymentId = searchParams.get('paymentId')
  const orderCode = searchParams.get('orderCode')

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!paymentId) {
        setError('Payment ID not found')
        setLoading(false)
        return
      }

      try {
        const paymentData = await paymentsApi.getStatus(parseInt(paymentId))
        setPayment(paymentData)
        
        if (paymentData.status !== 'Completed') {
          setError('Payment is not completed yet')
        }
      } catch (err: any) {
        console.error('Error fetching payment status:', err)
        setError(err.response?.data?.message || 'Failed to fetch payment status')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStatus()
  }, [paymentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Verification Failed</h2>
          <p className="mt-2 text-gray-600">{error || 'Unable to verify payment status'}</p>
          <div className="mt-6 space-y-3">
            <Link
              to="/my-purchases"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              View My Purchases
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-gray-600">Your payment has been processed successfully.</p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Payment ID:</dt>
              <dd className="font-medium text-gray-900">#{payment.paymentId}</dd>
            </div>
            {orderCode && (
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Order Code:</dt>
                <dd className="font-medium text-gray-900">{orderCode}</dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Amount:</dt>
              <dd className="font-medium text-gray-900">{payment.amount?.toLocaleString('vi-VN')} VNĐ</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Type:</dt>
              <dd className="font-medium text-gray-900">{payment.paymentType}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Status:</dt>
              <dd>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {payment.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            to="/my-purchases"
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
          >
            View My Purchases
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
