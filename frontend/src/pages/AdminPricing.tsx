import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { pricingApi } from '../api'
import { PricingTier } from '../types'

export default function AdminPricing() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null)

  const [formData, setFormData] = useState({
    tierName: '',
    description: '',
    basePricePerMb: '',
    apiPricePerCall: '',
    subscriptionPricePerRegion: '',
    providerCommissionPercent: '70',
    adminCommissionPercent: '30'
  })

  useEffect(() => {
    loadTiers()
  }, [])

  const loadTiers = async () => {
    try {
      setLoading(true)
      const data = await pricingApi.getAll()
      setTiers(data)
    } catch (error) {
      console.error('Failed to load pricing tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const data = {
        tierName: formData.tierName,
        description: formData.description || undefined,
        basePricePerMb: formData.basePricePerMb ? parseFloat(formData.basePricePerMb) : undefined,
        apiPricePerCall: formData.apiPricePerCall ? parseFloat(formData.apiPricePerCall) : undefined,
        subscriptionPricePerRegion: formData.subscriptionPricePerRegion ? parseFloat(formData.subscriptionPricePerRegion) : undefined,
        providerCommissionPercent: parseFloat(formData.providerCommissionPercent),
        adminCommissionPercent: parseFloat(formData.adminCommissionPercent)
      }

      if (editingTier) {
        await pricingApi.update(editingTier.tierId, data)
        alert('✅ Cập nhật pricing tier thành công!')
      } else {
        await pricingApi.create(data)
        alert('✅ Tạo pricing tier thành công!')
      }

      await loadTiers()
      setShowCreateModal(false)
      setEditingTier(null)
      resetForm()
    } catch (error: any) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (tier: PricingTier) => {
    setEditingTier(tier)
    setFormData({
      tierName: tier.tierName,
      description: tier.description || '',
      basePricePerMb: tier.basePricePerMb?.toString() || '',
      apiPricePerCall: tier.apiPricePerCall?.toString() || '',
      subscriptionPricePerRegion: tier.subscriptionPricePerRegion?.toString() || '',
      providerCommissionPercent: tier.providerCommissionPercent?.toString() || '70',
      adminCommissionPercent: tier.adminCommissionPercent?.toString() || '30'
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa pricing tier này?')) return
    
    try {
      await pricingApi.delete(id)
      alert('✅ Xóa pricing tier thành công!')
      await loadTiers()
    } catch (error: any) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message))
    }
  }

  const resetForm = () => {
    setFormData({
      tierName: '',
      description: '',
      basePricePerMb: '',
      apiPricePerCall: '',
      subscriptionPricePerRegion: '',
      providerCommissionPercent: '70',
      adminCommissionPercent: '30'
    })
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-'
    return `${amount.toLocaleString('vi-VN')} đ`
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              B1: Quản lý Bảng Giá
            </h1>
            <p className="text-gray-600">
              Cấu hình pricing tiers để Data Providers có thể tham gia nền tảng
            </p>
          </div>
          <button
            onClick={() => { setShowCreateModal(true); setEditingTier(null); resetForm(); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo Pricing Tier
          </button>
        </div>

        {/* Pricing Tiers Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {tiers.map((tier) => (
              <div
                key={tier.tierId}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  tier.isActive ? 'border-blue-200' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{tier.tierName}</h3>
                    {tier.isActive ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm">{tier.description || 'Không có mô tả'}</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* Base Price */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Giá file (per MB)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(tier.basePricePerMb)}</span>
                    </div>

                    {/* API Price */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Giá API (per call)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(tier.apiPricePerCall)}</span>
                    </div>

                    {/* Subscription Price */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Thuê bao (per region)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(tier.subscriptionPricePerRegion)}</span>
                    </div>
                  </div>

                  {/* Commission Split */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-3">CHIA SẺ DOANH THU</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Provider</span>
                        <span className="font-bold text-green-600">{tier.providerCommissionPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Admin</span>
                        <span className="font-bold text-blue-600">{tier.adminCommissionPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tier)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(tier.tierId)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hướng dẫn sử dụng
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span>Tạo các pricing tiers phù hợp với chiến lược kinh doanh</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span>Data Providers sẽ chọn tier khi upload datasets</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span>Giá bán cho Consumers sẽ dựa trên tier được chọn</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>
                <span>Doanh thu tự động chia theo % commission đã cấu hình</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chính sách chia sẻ doanh thu
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="font-medium">Data Provider nhận</span>
                <span className="font-bold text-green-600">70%</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="font-medium">Nền tảng giữ lại</span>
                <span className="font-bold text-blue-600">30%</span>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                ℹ️ Tỷ lệ có thể tùy chỉnh cho từng tier
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingTier ? 'Chỉnh sửa Pricing Tier' : 'Tạo Pricing Tier mới'}
                </h2>
                <button
                  onClick={() => { setShowCreateModal(false); setEditingTier(null); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Tier <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.tierName}
                  onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Standard, Premium, Enterprise"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả về tier này..."
                />
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Giá bán cho Consumer</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Gói File (đ/MB)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.basePricePerMb}
                      onChange={(e) => setFormData({ ...formData, basePricePerMb: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Gói API (đ/call)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.apiPricePerCall}
                      onChange={(e) => setFormData({ ...formData, apiPricePerCall: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Thuê bao (đ/region)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.subscriptionPricePerRegion}
                      onChange={(e) => setFormData({ ...formData, subscriptionPricePerRegion: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>

              {/* Commission */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Chia sẻ doanh thu</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Provider Commission (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.providerCommissionPercent}
                      onChange={(e) => setFormData({ ...formData, providerCommissionPercent: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Admin Commission (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.adminCommissionPercent}
                      onChange={(e) => setFormData({ ...formData, adminCommissionPercent: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  ℹ️ Tổng phải bằng 100%: Provider {formData.providerCommissionPercent}% + Admin {formData.adminCommissionPercent}% = {(parseFloat(formData.providerCommissionPercent || '0') + parseFloat(formData.adminCommissionPercent || '0')).toFixed(2)}%
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditingTier(null); resetForm(); }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {editingTier ? 'Cập nhật' : 'Tạo Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
