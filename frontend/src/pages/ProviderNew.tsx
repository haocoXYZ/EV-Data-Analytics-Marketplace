import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

export default function ProviderNew() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: '',
    description: '',
    regions: [] as string[],
    file: false,
    api: false,
    subscription: false,
  })

  const categories = ['charging', 'battery', 'routing', 'infrastructure', 'market', 'smart-city', 'behavior', 'energy', 'supply-chain', 'maintenance']
  const regionOptions = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Bình Thuận', 'Toàn quốc']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Dataset đã được gửi để kiểm duyệt! Chuyển đến trang Moderator Review.')
    navigate('/moderator/review')
  }

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-2">Đăng ký bán dữ liệu</h1>
        <p className="text-gray-600 mb-8">
          Trở thành nhà cung cấp dữ liệu và nhận 70% doanh thu
        </p>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên dataset *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="VD: EV Charging Station Usage Data" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp (Công ty) *</label>
            <input type="text" required value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Tên công ty của bạn" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả dataset *</label>
            <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={4}
              placeholder="Mô tả chi tiết về dữ liệu, nguồn gốc, tần suất cập nhật..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực hỗ trợ *</label>
            <div className="grid grid-cols-2 gap-2">
              {regionOptions.map(region => (
                <label key={region} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-50">
                  <input type="checkbox" checked={formData.regions.includes(region)} onChange={() => toggleRegion(region)} className="rounded text-blue-600" />
                  <span className="text-sm">{region}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload file CSV mẫu *</label>
            <input type="file" accept=".csv" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Tải lên 100-1000 dòng đầu tiên để Moderator kiểm tra chất lượng</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gói dịch vụ hỗ trợ *</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.file} onChange={(e) => setFormData({...formData, file: e.target.checked})} className="rounded text-blue-600" />
                <span className="text-sm">📁 Data File Package (tải CSV)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.api} onChange={(e) => setFormData({...formData, api: e.target.checked})} className="rounded text-blue-600" />
                <span className="text-sm">🔌 API Access Package</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.subscription} onChange={(e) => setFormData({...formData, subscription: e.target.checked})} className="rounded text-blue-600" />
                <span className="text-sm">🌍 Regional Subscription</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">💰 Ước tính doanh thu</h3>
            <p className="text-sm text-gray-700">Bạn sẽ nhận <span className="font-bold text-blue-700">70%</span> doanh thu từ mỗi giao dịch. Thanh toán hàng tháng vào ngày 1.</p>
          </div>

          <button type="submit" className="btn-primary w-full">Gửi để kiểm duyệt →</button>
        </form>
      </div>
    </DashboardLayout>
  )
}
