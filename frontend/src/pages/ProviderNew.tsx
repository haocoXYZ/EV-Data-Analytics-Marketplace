import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProviderLayout from '../components/ProviderLayout'
import { datasetsApi } from '../api'

export default function ProviderNew() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  })

  const categories = [
    'Charging Station Data',
    'Vehicle Data',
    'Infrastructure',
    'Other'
  ]

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true)
      const blob = await datasetsApi.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dataset_template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast.error('Lỗi download template: ' + error.message)
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        toast.error('Vui lòng chọn file CSV!')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Vui lòng chọn file CSV!')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên dataset!')
      return
    }

    if (!formData.category) {
      toast.error('Vui lòng chọn danh mục!')
      return
    }

    setUploading(true)
    
    try {
      const uploadData = new FormData()
      uploadData.append('Name', formData.name)
      uploadData.append('Description', formData.description)
      uploadData.append('Category', formData.category)
      uploadData.append('CsvFile', file)

      const result = await datasetsApi.upload(uploadData)
      
      toast.success(`Dataset "${result.name}" đã được upload thành công! (${result.rowCount} records). Đang chờ moderator review.`, {
        duration: 5000
      })
      
      setTimeout(() => {
        navigate('/provider/dashboard')
      }, 2000)
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message
      toast.error('Lỗi upload: ' + errorMsg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProviderLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Upload Dataset
          </h1>
          <p className="text-gray-600">
            Cung cấp dữ liệu lên nền tảng và nhận phần trăm doanh thu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Download Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Download CSV Template
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                📥 Download template, fill in your EV charging data, then upload the completed CSV file.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center justify-center"
              >
                {downloadingTemplate ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Downloading...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download CSV Template
                  </>
                )}
              </button>
              <div className="bg-white/60 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">ℹ️ Template includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All required fields: StationId, StationName, ProvinceId, DistrictId, etc.</li>
                  <li>Sample data showing the correct format</li>
                  <li>Data validation guidelines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
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
                  Mô tả
                </label>
                <textarea
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
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
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
                    accept=".csv"
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
                        <p className="text-sm text-gray-500">CSV file only, tối đa 100MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">ℹ️ Yêu cầu file CSV:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>File must match the template structure</li>
                  <li>All required fields must be present</li>
                  <li>ProvinceId and DistrictId must exist in database</li>
                  <li>Dates in format: yyyy-MM-dd HH:mm:ss</li>
                  <li>Numeric fields must be valid numbers</li>
                  <li>Maximum file size: 100MB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Card */}
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
                  <li>Dữ liệu phải chính xác và không chứa thông tin sai lệch</li>
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
          <p className="text-blue-100 text-sm mb-4">
            Doanh thu được chia tự động dựa trên SystemPricing configuration cho từng package type.
            Bạn sẽ nhận phần trăm theo cấu hình của Admin.
          </p>
          <div className="text-sm text-blue-100">
            📅 Thanh toán hàng tháng vào ngày 1 qua chuyển khoản ngân hàng
          </div>
        </div>
      </div>
    </ProviderLayout>
  )
}
