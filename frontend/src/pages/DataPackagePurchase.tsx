import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { purchasesApi, paymentsApi } from '../api'
import { DataPackagePreview } from '../types'

// Hardcoded provinces and districts per TESTING_GUIDE
const PROVINCES = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'TP. Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
]

const DISTRICTS: Record<number, { id: number; name: string }[]> = {
  1: [ // Hanoi - 30 districts (showing first 10)
    { id: 1, name: 'Ba Đình' },
    { id: 2, name: 'Hoàn Kiếm' },
    { id: 3, name: 'Tây Hồ' },
    { id: 4, name: 'Long Biên' },
    { id: 5, name: 'Cầu Giấy' },
    { id: 6, name: 'Đống Đa' },
    { id: 7, name: 'Hai Bà Trưng' },
    { id: 8, name: 'Hoàng Mai' },
    { id: 9, name: 'Thanh Xuân' },
    { id: 10, name: 'Sóc Sơn' },
  ],
  2: [ // HCMC - 24 districts (showing first 10)
    { id: 31, name: 'Quận 1' },
    { id: 32, name: 'Quận 2' },
    { id: 33, name: 'Quận 3' },
    { id: 34, name: 'Quận 4' },
    { id: 35, name: 'Quận 5' },
    { id: 36, name: 'Quận 6' },
    { id: 37, name: 'Quận 7' },
    { id: 38, name: 'Quận 8' },
    { id: 39, name: 'Quận 9' },
    { id: 40, name: 'Quận 10' },
  ],
  3: [ // Danang - 8 districts
    { id: 55, name: 'Hải Châu' },
    { id: 56, name: 'Thanh Khê' },
    { id: 57, name: 'Sơn Trà' },
    { id: 58, name: 'Ngũ Hành Sơn' },
    { id: 59, name: 'Liên Chiểu' },
    { id: 60, name: 'Cẩm Lệ' },
    { id: 61, name: 'Hòa Vang' },
    { id: 62, name: 'Hoàng Sa' },
  ],
}

export default function DataPackagePurchase() {
  const navigate = useNavigate()
  const [provinceId, setProvinceId] = useState<number>(1)
  const [districtId, setDistrictId] = useState<number | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [preview, setPreview] = useState<DataPackagePreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const handlePreview = async () => {
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
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!preview) return

    setPurchasing(true)
    setError(null)

    try {
      // Step 1: Create purchase
      const purchaseResult = await purchasesApi.createDataPackage({
        provinceId,
        districtId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      // Step 2: Create payment
      const paymentResult = await paymentsApi.create({
        paymentType: 'DataPackage',
        referenceId: purchaseResult.purchaseId,
      })

      // Step 3: Redirect to PayOS checkout
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

  const selectedProvince = PROVINCES.find(p => p.id === provinceId)
  const availableDistricts = DISTRICTS[provinceId] || []

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
                value={provinceId}
                onChange={(e) => {
                  setProvinceId(Number(e.target.value))
                  setDistrictId(undefined)
                  setPreview(null)
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {PROVINCES.map(province => (
                  <option key={province.id} value={province.id}>{province.name}</option>
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
              >
                <option value="">All districts</option>
                {availableDistricts.map(district => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </select>
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
