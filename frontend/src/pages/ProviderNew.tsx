import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderLayout from '../components/ProviderLayout'
import { pricingApi, datasetsApi } from '../api'
import { PricingTier } from '../types'

export default function ProviderNew() {
  const navigate = useNavigate()
  const [pricingTiers, setPricingTiers] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tierId: '',
    dataFormat: 'CSV'
  })

  const categories = [
    'Charging Stations',
    'Battery Data',
    'Routing',
    'Infrastructure',
    'Grid Impact',
    'User Behavior',
    'Maintenance',
    'Network Planning'
  ]

  useEffect(() => {
    loadPricingTiers()
  }, [])

  const loadPricingTiers = async () => {
    try {
      const tiers = await pricingApi.getAll()
      setPricingTiers(tiers.filter((t: any) => t.isActive))
    } catch (error) {
      console.error('Failed to load pricing tiers:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      alert('Vui lòng chọn file CSV!')
      return
    }

    setUploading(true)
    
    try {
      const uploadData = new FormData()
      uploadData.append('Name', formData.name)
      uploadData.append('Description', formData.description)
      uploadData.append('Category', formData.category)
      if (formData.tierId) uploadData.append('TierId', formData.tierId)
      uploadData.append('DataFormat', formData.dataFormat)
      uploadData.append('file', file)

      await datasetsApi.create(uploadData)
      
      alert('✅ Dataset đã được upload thành công! Đang chờ kiểm duyệt.')
      navigate('/provider/dashboard')
    } catch (error: any) {
      alert('❌ Lỗi: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const selectedTier = pricingTiers.find(t => t.tierId === parseInt(formData.tierId))

  return (
    <ProviderLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            B2: Upload Dataset
          </h1>
          <p className="text-gray-600">
            Cung cấp dữ liệu lên nền tảng và nhận 70% doanh thu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Dataset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Dữ liệu trạm sạc Hà Nội 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Mô tả chi tiết về dataset: nguồn gốc, phương pháp thu thập, độ chính xác..."
                />
              </div>
            </div>
          </div>

          {/* File Upload Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Upload File CSV
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  File dữ liệu <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {file ? (
                      <div className="text-green-600">
                        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 font-medium mb-1">Kéo thả file hoặc nhấp để chọn</p>
                        <p className="text-sm text-gray-500">CSV hoặc Excel, tối đa 100MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">ℹ️ Yêu cầu file:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>File CSV hoặc Excel (.csv, .xlsx)</li>
                  <li>Có header row (tên các cột)</li>
                  <li>Dữ liệu clean, không có lỗi format</li>
                  <li>Kích thước tối đa 100MB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Tier Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Chọn Pricing Tier
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {pricingTiers.map((tier) => (
                <label
                  key={tier.tierId}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    formData.tierId === tier.tierId.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tierId"
                    value={tier.tierId}
                    checked={formData.tierId === tier.tierId.toString()}
                    onChange={(e) => setFormData({ ...formData, tierId: e.target.value })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">{tier.tierName}</h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tier.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      {tier.basePricePerMb && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">File:</span>
                          <span className="font-semibold">{tier.basePricePerMb.toLocaleString('vi-VN')} đ/MB</span>
                        </div>
                      )}
                      {tier.apiPricePerCall && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">API:</span>
                          <span className="font-semibold">{tier.apiPricePerCall.toLocaleString('vi-VN')} đ/call</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                      <span className="text-green-600 font-bold">Bạn nhận: {tier.providerCommissionPercent}%</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedTier && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-green-800">Dự kiến doanh thu của bạn</span>
                </div>
                <p className="text-sm text-green-700">
                  Với tier <strong>{selectedTier.tierName}</strong>, bạn sẽ nhận <strong>{selectedTier.providerCommissionPercent}%</strong> từ mỗi giao dịch. 
                  Nền tảng giữ lại {selectedTier.adminCommissionPercent}% để duy trì hệ thống, marketing và support.
                </p>
              </div>
            )}
          </div>

          {/* Terms & Submit */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
              Xác nhận & Gửi
            </h2>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Lưu ý quan trọng</h3>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Dataset sẽ được Moderator kiểm duyệt trong 24-48h</li>
                  <li>Dataset phải tuân thủ quy định pháp luật về dữ liệu</li>
                  <li>Dữ liệu phải chính xác và được cập nhật định kỳ</li>
                  <li>Bạn có trách nhiệm với chất lượng dữ liệu</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 rounded text-blue-600" />
                <span className="text-sm text-gray-700">
                  Tôi xác nhận rằng dữ liệu tuân thủ các quy định pháp luật, không vi phạm quyền riêng tư và không chứa thông tin sai lệch.
                </span>
              </label>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/provider/dashboard')}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang upload...
                    </span>
                  ) : (
                    'Upload Dataset'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Revenue Info */}
        <div className="mt-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-3">💰 Cơ chế chia sẻ doanh thu</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">70%</div>
              <p className="text-blue-100 text-sm">
                Bạn nhận 70% doanh thu từ mỗi giao dịch bán dữ liệu
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">30%</div>
              <p className="text-blue-100 text-sm">
                Nền tảng giữ lại 30% cho hosting, marketing, payment gateway và support
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400/30 text-sm text-blue-100">
            📅 Thanh toán hàng tháng vào ngày 1 qua chuyển khoản ngân hàng
          </div>
        </div>
      </div>
    </ProviderLayout>
  )
}
