import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { purchasesApi, paymentsApi, locationsApi } from '../api'
import { DataPackagePreview, Province, District } from '../types'

export default function DataPackagePurchase() {
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [provinceId, setProvinceId] = useState<number | null>(null)
  const [districtId, setDistrictId] = useState<number | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [preview, setPreview] = useState<DataPackagePreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load districts when province changes
  useEffect(() => {
    if (provinceId) {
      loadDistricts(provinceId)
    } else {
      setDistricts([])
      setDistrictId(undefined)
    }
  }, [provinceId])

  const loadProvinces = async () => {
    try {
      setLoadingLocations(true)
      const data = await locationsApi.getProvinces()
      setProvinces(data)
      // Set first province as default
      if (data.length > 0) {
        setProvinceId(data[0].provinceId)
      }
    } catch (err: any) {
      console.error('Failed to load provinces:', err)
      setError('Failed to load provinces. Please refresh the page.')
    } finally {
      setLoadingLocations(false)
    }
  }

  const loadDistricts = async (provId: number) => {
    try {
      const data = await locationsApi.getDistrictsByProvince(provId)
      setDistricts(data)
    } catch (err: any) {
      console.error('Failed to load districts:', err)
      setDistricts([])
    }
  }

  const handlePreview = async () => {
    if (!provinceId) {
      toast.error('Please select a province')
      setError('Please select a province')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const previewData = await purchasesApi.previewDataPackage({
        provinceId: provinceId!,
        districtId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setPreview(previewData)
      toast.success(`Found ${previewData.totalRecords} records!`)
    } catch (err: any) {
      console.error('Preview error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to preview data'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!preview) return

    setPurchasing(true)
    setError(null)

    const toastId = toast.loading('Creating purchase...')

    try {
      // Step 1: Create purchase
      const purchaseResult = await purchasesApi.createDataPackage({
        provinceId: provinceId!,
        districtId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      toast.loading('Creating payment...', { id: toastId })

      // Step 2: Create payment
      const paymentResult = await paymentsApi.create({
        paymentType: 'DataPackage',
        referenceId: purchaseResult.purchaseId,
      })

      toast.success('Redirecting to payment...', { id: toastId })

      // Step 3: Redirect to PayOS checkout
      if (paymentResult.checkoutUrl) {
        setTimeout(() => {
          window.location.href = paymentResult.checkoutUrl
        }, 500)
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Purchase error:', err)
      const errorMsg = err.response?.data?.message || 'Failed to create purchase'
      setError(errorMsg)
      toast.error(errorMsg, { id: toastId })
      setPurchasing(false)
    }
  }

  if (loadingLocations) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Data Package</h1>
        <p className="text-gray-600 mb-8">Purchase EV charging data by location</p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                value={provinceId || ''}
                onChange={(e) => {
                  setProvinceId(Number(e.target.value))
                  setDistrictId(undefined)
                  setPreview(null)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={provinces.length === 0}
              >
                <option value="">Select province...</option>
                {provinces.map(province => (
                  <option key={province.provinceId} value={province.provinceId}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District (Optional)
              </label>
              <select
                value={districtId || ''}
                onChange={(e) => {
                  setDistrictId(e.target.value ? Number(e.target.value) : undefined)
                  setPreview(null)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={!provinceId || districts.length === 0}
              >
                <option value="">All districts</option>
                {districts.map(district => (
                  <option key={district.districtId} value={district.districtId}>
                    {district.name}
                  </option>
                ))}
              </select>
              {provinceId && districts.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">No districts available for this province</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPreview(null)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPreview(null)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={handlePreview}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Preview Data'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {preview && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{(preview.totalRecords || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Price per Row</p>
                <p className="text-2xl font-bold text-gray-900">{preview.pricePerRow || 0} VNĐ</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md col-span-2">
                <p className="text-sm text-green-600">Total Price</p>
                <p className="text-2xl font-bold text-green-700">{(preview.totalPrice || 0).toLocaleString()} VNĐ</p>
              </div>
            </div>

            {preview.sampleRecords && preview.sampleRecords.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Sample Data (first 5 records)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Station</th>
                        <th className="px-3 py-2 text-left">Location</th>
                        <th className="px-3 py-2 text-left">Timestamp</th>
                        <th className="px-3 py-2 text-right">Energy (kWh)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sampleRecords.slice(0, 5).map((record, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{record.stationName || 'N/A'}</td>
                          <td className="px-3 py-2">{record.districtName || 'N/A'}</td>
                          <td className="px-3 py-2">{record.chargingTimestamp ? new Date(record.chargingTimestamp).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-3 py-2 text-right">{record.energyKwh ? record.energyKwh.toFixed(2) : '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {purchasing ? 'Processing...' : `Purchase for ${(preview.totalPrice || 0).toLocaleString()} VNĐ`}
            </button>
          </div>
        )}

        {!preview && !loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            Select a location and click "Preview Data" to see available data and pricing.
          </div>
        )}
      </div>
    </div>
  )
}
