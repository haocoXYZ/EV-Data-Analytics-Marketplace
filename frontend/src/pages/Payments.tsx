import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api'
import ConsumerLayout from '../components/ConsumerLayout'

export default function Payments() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subscriptionId = searchParams.get('subscriptionId')
  const dataPackageId = searchParams.get('dataPackageId')
  const apiPackageId = searchParams.get('apiPackageId')

  useEffect(() => {
    // Auto-create payment if we have a reference ID
    if (subscriptionId || dataPackageId || apiPackageId) {
      handleCreatePayment()
    }
  }, [subscriptionId, dataPackageId, apiPackageId])

  const handleCreatePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      let paymentType = ''
      let referenceId = 0

      if (subscriptionId) {
        paymentType = 'SubscriptionPackage'
        referenceId = parseInt(subscriptionId)
      } else if (dataPackageId) {
        paymentType = 'DataPackage'
        referenceId = parseInt(dataPackageId)
      } else if (apiPackageId) {
        paymentType = 'APIPackage'
        referenceId = parseInt(apiPackageId)
      } else {
        setError('No package ID provided')
        setLoading(false)
        return
      }

      const response = await paymentsApi.create({
        paymentType,
        referenceId,
      })

      // Redirect to PayOS checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      } else {
        setError('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Payment creation error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to create payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConsumerLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Processing Payment</h2>
              <p className="mt-2 text-gray-600">Please wait while we redirect you to payment...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Payment Error</h2>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCreatePayment}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/my-purchases')}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Back to My Purchases
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Ready to Pay</h2>
              <p className="mt-2 text-gray-600">Click below to proceed with payment</p>
              <button
                onClick={handleCreatePayment}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </ConsumerLayout>
  )
}

