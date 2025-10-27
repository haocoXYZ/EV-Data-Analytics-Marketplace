import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { datasetsApi, purchasesApi } from '../api'
import { Dataset } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function DatasetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [dataset, setDataset] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<'onetime' | 'api' | 'subscription'>('onetime')
  const [purchasing, setPurchasing] = useState(false)

  // Package details
  const [oneTimeForm, setOneTimeForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    licenseType: 'Research'
  })

  const [apiForm, setApiForm] = useState({
    apiCallsCount: 1000
  })

  const [subscriptionForm, setSubscriptionForm] = useState({
    provinceId: 1,
    renewalCycle: 'Monthly',
    durationMonths: 1
  })

  useEffect(() => {
    if (id) {
      loadDataset(parseInt(id))
    }
  }, [id])

  const loadDataset = async (datasetId: number) => {
    try {
      setLoading(true)
      const data = await datasetsApi.getById(Number(datasetId))
      setDataset(data)
    } catch (error) {
      console.error('Failed to load dataset:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!dataset) return 0

    switch (selectedPackage) {
      case 'onetime':
        // Fixed 10,000 VND for testing
        return 10000
        // return (dataset.basePricePerMb || 0) * (dataset.dataSizeMb || 0)
      
      case 'api':
        return (dataset.apiPricePerCall || 0) * apiForm.apiCallsCount
      
      case 'subscription':
        return (dataset.subscriptionPricePerRegion || 0) * subscriptionForm.durationMonths
      
      default:
        return 0
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role !== 'DataConsumer' && user.role !== 'consumer') {
      alert('Chỉ Data Consumer mới có thể mua datasets!')
      return
    }

    setPurchasing(true)
    try {
      let purchaseResponse: any

      // Create purchase based on selected package
      switch (selectedPackage) {
        case 'onetime':
          purchaseResponse = await purchasesApi.createOneTime({
            datasetId: parseInt(id!),
            startDate: oneTimeForm.startDate,
            endDate: oneTimeForm.endDate,
            licenseType: oneTimeForm.licenseType
          })
          break

        case 'api':
          purchaseResponse = await purchasesApi.createAPIPackage({
            datasetId: parseInt(id!),
            apiCallsCount: apiForm.apiCallsCount
          })
          break

        case 'subscription':
          purchaseResponse = await purchasesApi.createSubscription({
            datasetId: parseInt(id!),
            provinceId: subscriptionForm.provinceId,
            renewalCycle: subscriptionForm.renewalCycle,
            durationMonths: subscriptionForm.durationMonths
          })
          break
      }

      // Navigate to checkout with purchase info
      navigate('/checkout', {
        state: {
          purchaseType: selectedPackage,
          referenceId: purchaseResponse.otpId || purchaseResponse.apiId || purchaseResponse.subId,
          datasetName: dataset.name,
          price: calculatePrice()
        }
      })
    } catch (error: any) {
      alert('Lỗi: ' + error.message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <ConsumerLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Đang tải dataset...</p>
        </div>
      </ConsumerLayout>
    )
  }

  if (!dataset) {
    return (
      <ConsumerLayout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset không tìm thấy</h2>
          <button onClick={() => navigate('/catalog')} className="text-blue-600 hover:text-blue-700">
            ← Quay lại Catalog
          </button>
        </div>
      </ConsumerLayout>
    )
  }

  return (
    <ConsumerLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
              <span>/</span>
              <Link to="/catalog" className="hover:text-blue-600">Datasets</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{dataset.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dataset Info */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-3">
                      {dataset.category}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{dataset.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {dataset.providerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(dataset.uploadDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Mô tả</h2>
                  <p className="text-gray-700 leading-relaxed">{dataset.description}</p>
                </div>

                {/* Metadata */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Kích thước</div>
                    <div className="text-2xl font-bold text-gray-900">{dataset.dataSizeMb?.toFixed(2)} MB</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Định dạng</div>
                    <div className="text-2xl font-bold text-gray-900">{dataset.dataFormat}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Pricing Tier</div>
                    <div className="text-2xl font-bold text-gray-900">{dataset.tierName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - B5: Purchase Options */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-4">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold mb-1">B5: Chọn gói mua</h2>
                  <p className="text-sm text-gray-600">Tiền trao cháo múc</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Package Selection */}
                  <div className="space-y-3">
                    {/* One-time Purchase */}
                    {dataset.basePricePerMb && (
                      <label
                        className={`block cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          selectedPackage === 'onetime'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="package"
                          value="onetime"
                          checked={selectedPackage === 'onetime'}
                          onChange={() => setSelectedPackage('onetime')}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">📁</div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">Gói File</div>
                            <div className="text-sm text-gray-600 mb-2">Tải xuống CSV một lần</div>
                            <div className="font-bold text-blue-600">10,000 đ</div>
                            <div className="text-xs text-gray-500 mt-1">Giá test cố định</div>
                          </div>
                        </div>

                        {selectedPackage === 'onetime' && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
                              <input
                                type="date"
                                value={oneTimeForm.startDate}
                                onChange={(e) => setOneTimeForm({ ...oneTimeForm, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
                              <input
                                type="date"
                                value={oneTimeForm.endDate}
                                onChange={(e) => setOneTimeForm({ ...oneTimeForm, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Loại license</label>
                              <select
                                value={oneTimeForm.licenseType}
                                onChange={(e) => setOneTimeForm({ ...oneTimeForm, licenseType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="Research">Research</option>
                                <option value="Commercial">Commercial</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </label>
                    )}

                    {/* API Package */}
                    {dataset.apiPricePerCall && (
                      <label
                        className={`block cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          selectedPackage === 'api'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="package"
                          value="api"
                          checked={selectedPackage === 'api'}
                          onChange={() => setSelectedPackage('api')}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">⚡</div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">Gói API</div>
                            <div className="text-sm text-gray-600 mb-2">Truy cập qua API</div>
                            <div className="font-bold text-blue-600">
                              {(dataset.apiPricePerCall || 0).toLocaleString('vi-VN')} đ/call
                            </div>
                          </div>
                        </div>

                        {selectedPackage === 'api' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Số lượng API calls</label>
                            <input
                              type="number"
                              min="100"
                              step="100"
                              value={apiForm.apiCallsCount || 1000}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1000
                                setApiForm({ ...apiForm, apiCallsCount: value })
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Tổng: {((dataset.apiPricePerCall || 0) * apiForm.apiCallsCount).toLocaleString('vi-VN')} đ
                            </div>
                          </div>
                        )}
                      </label>
                    )}

                    {/* Subscription */}
                    {dataset.subscriptionPricePerRegion && (
                      <label
                        className={`block cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          selectedPackage === 'subscription'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="package"
                          value="subscription"
                          checked={selectedPackage === 'subscription'}
                          onChange={() => setSelectedPackage('subscription')}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🔄</div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 mb-1">Gói Thuê bao</div>
                            <div className="text-sm text-gray-600 mb-2">Theo dõi khu vực</div>
                            <div className="font-bold text-blue-600">
                              {(dataset.subscriptionPricePerRegion || 0).toLocaleString('vi-VN')} đ/tháng
                            </div>
                          </div>
                        </div>

                        {selectedPackage === 'subscription' && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Khu vực</label>
                              <select
                                value={subscriptionForm.provinceId}
                                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, provinceId: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="1">Hà Nội</option>
                                <option value="2">Hồ Chí Minh</option>
                                <option value="3">Đà Nẵng</option>
                                <option value="4">Hải Phòng</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Chu kỳ</label>
                              <select
                                value={subscriptionForm.renewalCycle}
                                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, renewalCycle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="Monthly">Hàng tháng</option>
                                <option value="Quarterly">Hàng quý (3 tháng)</option>
                                <option value="Yearly">Hàng năm</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Thời gian (tháng)</label>
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={subscriptionForm.durationMonths || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                setSubscriptionForm({ ...subscriptionForm, durationMonths: value })
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            </div>
                          </div>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">Tổng thanh toán</span>
                      <span className="text-3xl font-bold text-blue-600">
                        {calculatePrice().toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Provider nhận 70%, Nền tảng giữ 30%
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      'Mua ngay →'
                    )}
                  </button>

                  <div className="text-xs text-center text-gray-500 mt-2">
                    🔒 Thanh toán an toàn qua PayOS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  )
}
