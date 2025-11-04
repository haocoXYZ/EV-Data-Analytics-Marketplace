import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentFailed() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const message = searchParams.get('message') || 'Payment was cancelled or failed'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Failed</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          {code && (
            <p className="mt-1 text-sm text-gray-500">Error code: {code}</p>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <Link
            to="/my-purchases"
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="block w-full bg-gray-200 text-gray-700 text-center py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact our support team with the order details.
          </p>
        </div>
      </div>
    </div>
  )
}
