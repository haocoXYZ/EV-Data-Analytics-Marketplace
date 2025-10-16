import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

export default function ProviderNew() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    provider: '',
    category: '',
    description: '',
    regions: [] as string[],
    
    // Data Details
    totalRecords: '',
    dateRange: '',
    updateFrequency: 'monthly',
    dataFormat: 'csv',
    
    // Schema Fields
    schemaFields: [
      { name: '', type: 'string', description: '' }
    ],
    
    // Sample Data
    sampleData: '',
    
    // Pricing & Packages
    file: false,
    api: false,
    subscription: false,
    filePrice: '50',
    apiPricePerRequest: '0.10',
    subscriptionPrice: '100',
    
    // Quality Indicators
    accuracy: '95',
    completeness: '98',
    updateLatency: '24h',
    documentation: false,
    support: 'email'
  })

  const categories = ['charging_stations', 'battery_data', 'routing', 'infrastructure', 'grid_impact', 'user_behavior', 'maintenance', 'network_planning']
  const regionOptions = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Bình Thuận', 'Toàn quốc']
  const dataTypes = ['string', 'number', 'datetime', 'boolean', 'json', 'geolocation']
  const updateFrequencies = ['realtime', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    const datasetSubmission = {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
      submissionId: 'SUB-' + Date.now()
    }

    // Save to localStorage
    const submissions = JSON.parse(localStorage.getItem('datasetSubmissions') || '[]')
    submissions.push(datasetSubmission)
    localStorage.setItem('datasetSubmissions', JSON.stringify(submissions))

    setIsSubmitting(false)
    alert('Dataset submitted for review! ID: ' + datasetSubmission.submissionId)
    navigate('/provider/dashboard')
  }

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }))
  }

  const addSchemaField = () => {
    setFormData(prev => ({
      ...prev,
      schemaFields: [...prev.schemaFields, { name: '', type: 'string', description: '' }]
    }))
  }

  const updateSchemaField = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schemaFields: prev.schemaFields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }))
  }

  const removeSchemaField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schemaFields: prev.schemaFields.filter((_, i) => i !== index)
    }))
  }

  const stepTitles = ['Thông tin cơ bản', 'Chi tiết dữ liệu', 'Schema & Giá', 'Xem lại & Gửi']

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-2">Đăng ký bán dữ liệu</h1>
        <p className="text-gray-600 mb-8">
          Trở thành nhà cung cấp dữ liệu trạm sạc và nhận 70% doanh thu
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold mb-2 ${
                  i + 1 <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {i + 1}
                </div>
                <div className={`text-xs font-medium ${
                  i + 1 <= currentStep ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {title}
                </div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-600 transition-all`}
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Thông tin cơ bản</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên dataset *</label>
                <input type="text" required value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="VD: Ho Chi Minh City Charging Station Network" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Công ty / Tổ chức *</label>
                <input type="text" required value={formData.provider} 
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Tên công ty" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
                <select required value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (<option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết *</label>
                <textarea required value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  rows={4}
                  placeholder="Mô tả dữ liệu: nguồn gốc, phương pháp thu thập, độ chính xác, trường hợp sử dụng..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực hỗ trợ *</label>
                <div className="grid grid-cols-2 gap-2">
                  {regionOptions.map(region => (
                    <label key={region} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
                      <input type="checkbox" checked={formData.regions.includes(region)} 
                        onChange={() => toggleRegion(region)} className="rounded text-blue-600" />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Data Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Chi tiết dữ liệu</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tổng số records *</label>
                  <input type="number" required value={formData.totalRecords} 
                    onChange={(e) => setFormData({...formData, totalRecords: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="1000000" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian dữ liệu *</label>
                  <input type="text" required value={formData.dateRange} 
                    onChange={(e) => setFormData({...formData, dateRange: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="2023-2025" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tần suất cập nhật *</label>
                  <select required value={formData.updateFrequency} 
                    onChange={(e) => setFormData({...formData, updateFrequency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {updateFrequencies.map(freq => (
                      <option key={freq} value={freq}>{freq.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng dữ liệu *</label>
                  <select required value={formData.dataFormat} 
                    onChange={(e) => setFormData({...formData, dataFormat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="parquet">Parquet</option>
                    <option value="database">Database</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload file CSV mẫu (100-1000 records) *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                  <input type="file" accept=".csv" className="hidden" required />
                  <div>
                    <p className="text-sm text-gray-600">Kéo thả file hoặc nhấp để chọn</p>
                    <p className="text-xs text-gray-500 mt-1">CSV, không quá 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schema & Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Schema & Giá cả</h2>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Các trường dữ liệu (Schema)</label>
                  <button type="button" onClick={addSchemaField} className="text-sm text-blue-600 hover:text-blue-700">
                    + Thêm trường
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.schemaFields.map((field, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={field.name} 
                        onChange={(e) => updateSchemaField(i, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                        placeholder="Tên trường" />
                      <select value={field.type} 
                        onChange={(e) => updateSchemaField(i, 'type', e.target.value)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        {dataTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button type="button" onClick={() => removeSchemaField(i)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded">
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Gói dịch vụ & Giá</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={formData.file} 
                      onChange={(e) => setFormData({...formData, file: e.target.checked})} 
                      className="rounded text-blue-600 w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">Gói File</div>
                      <div className="text-xs text-gray-600">Tải xuống CSV</div>
                    </div>
                    <input type="number" step="0.01" value={formData.filePrice} 
                      onChange={(e) => setFormData({...formData, filePrice: e.target.value})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" 
                      placeholder="50" disabled={!formData.file} />
                    <span className="text-sm">USD</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={formData.api} 
                      onChange={(e) => setFormData({...formData, api: e.target.checked})} 
                      className="rounded text-blue-600 w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">Gói API</div>
                      <div className="text-xs text-gray-600">Theo lượt request</div>
                    </div>
                    <input type="number" step="0.01" value={formData.apiPricePerRequest} 
                      onChange={(e) => setFormData({...formData, apiPricePerRequest: e.target.value})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" 
                      placeholder="0.10" disabled={!formData.api} />
                    <span className="text-sm">USD/req</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={formData.subscription} 
                      onChange={(e) => setFormData({...formData, subscription: e.target.checked})} 
                      className="rounded text-blue-600 w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">Gói Theo dõi</div>
                      <div className="text-xs text-gray-600">Truy cập không giới hạn/khu vực</div>
                    </div>
                    <input type="number" step="0.01" value={formData.subscriptionPrice} 
                      onChange={(e) => setFormData({...formData, subscriptionPrice: e.target.value})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm" 
                      placeholder="100" disabled={!formData.subscription} />
                    <span className="text-sm">USD/tháng</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Chỉ số chất lượng</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Độ chính xác (%)</label>
                    <input type="number" value={formData.accuracy} 
                      onChange={(e) => setFormData({...formData, accuracy: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                      min="0" max="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tính hoàn chỉnh (%)</label>
                    <input type="number" value={formData.completeness} 
                      onChange={(e) => setFormData({...formData, completeness: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                      min="0" max="100" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ trễ cập nhật tối đa</label>
                  <input type="text" value={formData.updateLatency} 
                    onChange={(e) => setFormData({...formData, updateLatency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                    placeholder="24h" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Xem lại thông tin</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Tên:</span> {formData.name}</div>
                    <div><span className="text-gray-600">Công ty:</span> {formData.provider}</div>
                    <div><span className="text-gray-600">Danh mục:</span> {formData.category}</div>
                    <div><span className="text-gray-600">Khu vực:</span> {formData.regions.join(', ') || 'Chưa chọn'}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Chi tiết dữ liệu</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Records:</span> {formData.totalRecords || '?'}</div>
                    <div><span className="text-gray-600">Thời gian:</span> {formData.dateRange}</div>
                    <div><span className="text-gray-600">Cập nhật:</span> {formData.updateFrequency}</div>
                    <div><span className="text-gray-600">Định dạng:</span> {formData.dataFormat}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Gói dịch vụ</h3>
                  <div className="space-y-1 text-sm">
                    {formData.file && <div>File: ${formData.filePrice}</div>}
                    {formData.api && <div>API: ${formData.apiPricePerRequest}/request</div>}
                    {formData.subscription && <div>Theo dõi: ${formData.subscriptionPrice}/tháng</div>}
                    {!formData.file && !formData.api && !formData.subscription && (
                      <div className="text-red-600">Chưa chọn gói dịch vụ</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Chất lượng</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Chính xác:</span> {formData.accuracy}%</div>
                    <div><span className="text-gray-600">Hoàn chỉnh:</span> {formData.completeness}%</div>
                    <div><span className="text-gray-600">Độ trễ:</span> {formData.updateLatency}</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  Bằng cách gửi, bạn xác nhận rằng dữ liệu tuân thủ các quy định pháp luật và không vi phạm bất kỳ quyền nào.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Quay lại
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang gửi...
                </span>
              ) : currentStep === 4 ? (
                'Gửi để kiểm duyệt'
              ) : (
                'Tiếp tục'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Bạn sẽ nhận 70% doanh thu từ mỗi giao dịch. Thanh toán hàng tháng vào ngày 1.</p>
          <p>Dataset của bạn sẽ được kiểm duyệt trong 24-48 giờ. Liên hệ support@evdata.vn nếu có thắc mắc.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
