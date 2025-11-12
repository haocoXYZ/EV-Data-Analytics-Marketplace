import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { purchasesApi, paymentsApi, locationsApi } from '../api'
import { DataPackagePreview, Province, District } from '../types'

export default function DataPackagePurchase() {
  const navigate = useNavigate()

  // Data from backend
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])

  // Selection state
  const [provinceId, setProvinceId] = useState<number | null>(null)
  const [districtId, setDistrictId] = useState<number | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Preview state
  const [preview, setPreview] = useState<DataPackagePreview | null>(null)
  const [provinceData, setProvinceData] = useState<Record<number, { totalRecords: number; loading: boolean }>>({})
  const [loading, setLoading] = useState(false)
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchProvinces()
  }, [])

  useEffect(() => {
    if (provinceId) {
      fetchDistricts(provinceId)
      fetchProvinceData(provinceId)
    } else {
      setDistricts([])
      setPreview(null)
    }
  }, [provinceId])

  useEffect(() => {
    if (provinceId) {
      handlePreview()
    } else {
      setPreview(null)
    }
  }, [provinceId, districtId, startDate, endDate])

  const fetchProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const data = await locationsApi.getProvinces()
      setProvinces(data)
    } catch (err) {
      console.error('Failed to fetch provinces:', err)
      setError('Failed to load provinces')
    } finally {
      setLoadingProvinces(false)
    }
  }

  const fetchDistricts = async (provId: number) => {
    try {
      const data = await locationsApi.getDistricts(provId)
      setDistricts(data)
    } catch (err) {
      console.error('Failed to fetch districts:', err)
    }
  }

  const fetchProvinceData = async (id: number) => {
    setProvinceData(prev => ({
      ...prev,
      [id]: { totalRecords: 0, loading: true }
    }))

    try {
      const previewData = await purchasesApi.previewDataPackage({
        provinceId: id,
      })
      setProvinceData(prev => ({
        ...prev,
        [id]: { totalRecords: previewData.totalRecords, loading: false }
      }))
    } catch (err) {
      setProvinceData(prev => ({
        ...prev,
        [id]: { totalRecords: 0, loading: false }
      }))
    }
  }

  const handlePreview = async () => {
    if (!provinceId) return

    setLoading(true)
    setError(null)

    try {
      const previewData = await purchasesApi.previewDataPackage({
        provinceId,
        districtId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setPreview(previewData)
    } catch (err: any) {
      console.error('Preview error:', err)
      setError(err.response?.data?.message || 'Failed to preview data')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!preview || !provinceId) return

    setPurchasing(true)
    setError(null)

    try {
      const purchaseResult = await purchasesApi.createDataPackage({
        provinceId,
        districtId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      const paymentResult = await paymentsApi.create({
        paymentType: 'DataPackage',
        referenceId: purchaseResult.purchaseId,
      })

      if (paymentResult.checkoutUrl) {
        window.location.href = paymentResult.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.response?.data?.message || 'Failed to create purchase')
      setPurchasing(false)
    }
  }

  const selectedProvince = provinces.find(p => p.provinceId === provinceId)
  const selectedProvinceData = provinceId ? provinceData[provinceId] : null

  if (loadingProvinces) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">Purchase Data Package</h1>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Selection Form */}
          <div className="space-y-6">
            {/* Province Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Province <span className="text-red-500">*</span>
              </label>
              <select
                value={provinceId || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setProvinceId(value ? Number(value) : null)
                  setDistrictId(undefined)
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Choose a province --</option>
                {provinces.map(province => (
                  <option key={province.provinceId} value={province.provinceId}>
                    {province.name}
                  </option>
                ))}
              </select>

              {/* Province Info */}
              {selectedProvince && selectedProvinceData && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Available Data</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedProvinceData.loading ? (
                          'Loading...'
                        ) : (
                          `${selectedProvinceData.totalRecords.toLocaleString()} records`
                        )}
                      </div>
                    </div>
                    {!selectedProvinceData.loading && selectedProvinceData.totalRecords > 0 && (
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* District Selection */}
            {districts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District (Optional)
                </label>
                <select
                  value={districtId || ''}
                  onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All districts in {selectedProvince?.name}</option>
                  {districts.map(district => (
                    <option key={district.districtId} value={district.districtId}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {(districtId || startDate || endDate) && (
                <button
                  onClick={() => {
                    setDistrictId(undefined)
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && provinceId && (
            <div className="mt-6 py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading preview...</p>
            </div>
          )}

          {/* Preview Data */}
          {!loading && preview && provinceId && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 font-medium mb-1">Total Records</div>
                    <div className="text-3xl font-bold text-blue-900">
                      {preview.totalRecords.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 font-medium mb-1">Price per Row</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {preview.pricePerRow} ₫
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="text-sm text-green-600 font-medium mb-1">Total Price</div>
                    <div className="text-3xl font-bold text-green-900">
                      {preview.totalPrice.toLocaleString()} ₫
                    </div>
                  </div>
                </div>

                {/* Sample Data */}
                {preview.sampleRecords && preview.sampleRecords.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sample Data (First 3 Records)</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {preview.sampleRecords.slice(0, 3).map((record, idx) => (
                        <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                          <div className="font-medium text-gray-900 mb-1">{record.stationName}</div>
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{record.energyKwh?.toFixed(2)} kWh</span>
                            {record.chargingTimestamp && (
                              <span className="ml-3">
                                • {new Date(record.chargingTimestamp).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || preview.totalRecords === 0}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    `Purchase for ${preview.totalPrice.toLocaleString()} ₫`
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!provinceId && (
            <div className="mt-6 py-12 text-center">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Province to Get Started</h3>
              <p className="text-gray-600">
                Choose a province from the dropdown above to view available data and pricing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
