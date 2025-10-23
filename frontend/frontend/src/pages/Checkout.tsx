import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'

export default function Checkout() {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [purpose, setPurpose] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'processing' | 'verifying'>('idle')

  useEffect(() => {
    const pending = localStorage.getItem('pendingOrder')
    if (pending) {
      setOrderData(JSON.parse(pending))
    } else {
      navigate('/catalog')
    }
  }, [navigate])

  // Simulate webhook callback from payment gateway
  const simulatePaymentWebhook = async (orderId: string, amount: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful payment webhook
        const webhookPayload = {
          event: 'payment.success',
          orderId,
          amount,
          timestamp: new Date().toISOString(),
          transactionId: 'TXN-' + Math.random().toString(36).substring(7),
          status: 'completed',
          method: 'credit_card'
        }
        
        console.log('Webhook received:', webhookPayload)
        resolve(webhookPayload)
      }, 800)
    })
  }

  // Simulate webhook verification
  const verifyWebhookSignature = async (orderId: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate signature verification
        const isValid = Math.random() > 0.05 // 95% success rate for demo
        console.log('Webhook signature verified:', isValid)
        resolve(isValid)
      }, 500)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setWebhookStatus('processing')

    try {
      // Step 1: Process payment
      await new Promise(resolve => setTimeout(resolve, 1200))

      const orderId = 'ORD-' + Date.now()

      // Step 2: Simulate webhook callback from payment gateway
      setWebhookStatus('verifying')
      await simulatePaymentWebhook(orderId, orderData.price)
      
      // Step 3: Verify webhook signature
      const isValid = await verifyWebhookSignature(orderId)
      
      if (!isValid) {
        throw new Error('Webhook verification failed')
      }

      // Step 4: Create confirmed order
      const order = {
        ...orderData,
        email,
        company,
        purpose,
        orderId,
        status: 'paid',
        timestamp: new Date().toISOString(),
        webhookVerified: true,
        transactionId: 'TXN-' + Math.random().toString(36).substring(7)
      }

      localStorage.setItem('completedOrder', JSON.stringify(order))
      localStorage.removeItem('pendingOrder')
      
      setIsProcessing(false)
      setWebhookStatus('idle')
      navigate('/success')
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
      setWebhookStatus('idle')
      alert('Payment processing failed. Please try again.')
    }
  }

  if (!orderData) {
    return <ConsumerLayout><div className="max-w-7xl mx-auto px-4 py-12">Loading...</div></ConsumerLayout>
  }

  return (
    <ConsumerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <div className="text-sm text-gray-600">Dữ liệu</div>
                <div className="font-semibold">{orderData.datasetName}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Gói dịch vụ</div>
                <div className="font-semibold capitalize">{orderData.package}</div>
              </div>

              {orderData.package === 'file' && (
                <div>
                  <div className="text-sm text-gray-600">Số ngày</div>
                  <div className="font-semibold">{orderData.params.days} ngày</div>
                </div>
              )}

              {orderData.package === 'api' && (
                <div>
                  <div className="text-sm text-gray-600">Số lượt request</div>
                  <div className="font-semibold">{orderData.params.requests.toLocaleString()} requests</div>
                </div>
              )}

              {orderData.package === 'subscription' && (
                <div>
                  <div className="text-sm text-gray-600">Khu vực</div>
                  <div className="font-semibold">{orderData.params.regions.join(', ')}</div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${orderData.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Thông tin thanh toán</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Công ty / Tổ chức *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tên công ty"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mục đích sử dụng *
                </label>
                <textarea
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phân tích, nghiên cứu, phát triển sản phẩm..."
                  rows={3}
                  disabled={isProcessing}
                />
              </div>

              {isProcessing && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <div className="font-semibold mb-2">Trạng thái xử lý:</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Xử lý thanh toán...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          webhookStatus === 'verifying' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          {webhookStatus === 'verifying' && (
                            <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          )}
                        </div>
                        <span>Xác minh webhook...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <span className="font-semibold">Demo Mode:</span> Thanh toán được giả lập. Hệ thống sẽ nhận webhook callback từ payment gateway (demo).
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  'Xác nhận thanh toán'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
