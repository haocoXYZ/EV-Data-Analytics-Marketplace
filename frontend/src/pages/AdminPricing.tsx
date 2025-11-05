import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { pricingApi } from '../api'
import { SystemPricing } from '../types'

export default function AdminPricing() {
  const [pricingConfigs, setPricingConfigs] = useState<SystemPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState<number | null>(null)

  const [formData, setFormData] = useState<Record<number, {
    pricePerRow?: number
    subscriptionMonthlyBase?: number
    apiPricePerCall?: number
    providerCommissionPercent: number
    adminCommissionPercent: number
  }>>({})

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      setLoading(true)
      const data = await pricingApi.getAll()
      setPricingConfigs(data)
      
      const initialFormData: typeof formData = {}
      data.forEach(config => {
        initialFormData[config.pricingId] = {
          pricePerRow: config.pricePerRow,
          subscriptionMonthlyBase: config.subscriptionMonthlyBase,
          apiPricePerCall: config.apiPricePerCall,
          providerCommissionPercent: config.providerCommissionPercent,
          adminCommissionPercent: config.adminCommissionPercent
        }
      })
      setFormData(initialFormData)
    } catch (error) {
      console.error('Failed to load pricing:', error)
      alert('Lỗi tải pricing configurations')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: number) => {
    setEditingId(id)
  }

  const handleCancel = (id: number) => {
    const config = pricingConfigs.find(p => p.pricingId === id)
    if (config) {
      setFormData({
        ...formData,
        [id]: {
          pricePerRow: config.pricePerRow,
          subscriptionMonthlyBase: config.subscriptionMonthlyBase,
          apiPricePerCall: config.apiPricePerCall,
          providerCommissionPercent: config.providerCommissionPercent,
          adminCommissionPercent: config.adminCommissionPercent
        }
      })
    }
    setEditingId(null)
  }

  const handleSave = async (id: number) => {
    const data = formData[id]
    if (!data) return

    const total = data.providerCommissionPercent + data.adminCommissionPercent
    if (Math.abs(total - 100) > 0.01) {
      alert(`❌ Tổng commission phải bằng 100%!\nHiện tại: Provider ${data.providerCommissionPercent}% + Admin ${data.adminCommissionPercent}% = ${total}%`)
      return
    }

    try {
      setSaving(id)
      await pricingApi.update(id, data)
      alert('✅ Cập nhật pricing thành công!')
      await loadPricing()
      setEditingId(null)
    } catch (error: any) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(null)
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await pricingApi.toggleActive(id)
      await loadPricing()
    } catch (error: any) {
      alert('❌ Lỗi toggle active: ' + (error.response?.data?.message || error.message))
    }
  }

  const updateFormField = (id: number, field: string, value: number) => {
    setFormData({
      ...formData,
      [id]: {
        ...formData[id],
        [field]: value
      }
    })
  }

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case 'DataPackage':
        return '📦'
      case 'SubscriptionPackage':
        return '📅'
      case 'APIPackage':
        return '🔌'
      default:
        return '📊'
    }
  }

  const getPackageTitle = (packageType: string) => {
    switch (packageType) {
      case 'DataPackage':
        return 'Data Package'
      case 'SubscriptionPackage':
        return 'Subscription Package'
      case 'APIPackage':
        return 'API Package'
      default:
        return packageType
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-'
    return `${amount.toLocaleString('vi-VN')} đ`
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Quản lý SystemPricing
          </h1>
          <p className="text-gray-600">
            Cấu hình giá và revenue split cho 3 package types
          </p>
        </div>

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
            {pricingConfigs.map((config) => {
              const data = formData[config.pricingId]
              const isEditing = editingId === config.pricingId
              const isSaving = saving === config.pricingId

              return (
                <div
                  key={config.pricingId}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                    config.isActive ? 'border-blue-200' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{getPackageIcon(config.packageType)}</span>
                        <h3 className="text-xl font-bold">{getPackageTitle(config.packageType)}</h3>
                      </div>
                      <button
                        onClick={() => handleToggleActive(config.pricingId)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          config.isActive 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                      >
                        {config.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {/* Price Fields */}
                      {config.packageType === 'DataPackage' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Price per Row (đ)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={data?.pricePerRow || ''}
                              onChange={(e) => updateFormField(config.pricingId, 'pricePerRow', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="font-semibold text-gray-900">{formatCurrency(config.pricePerRow)}</div>
                          )}
                        </div>
                      )}

                      {config.packageType === 'SubscriptionPackage' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Monthly Base Price (đ)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={data?.subscriptionMonthlyBase || ''}
                              onChange={(e) => updateFormField(config.pricingId, 'subscriptionMonthlyBase', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="font-semibold text-gray-900">{formatCurrency(config.subscriptionMonthlyBase)}</div>
                          )}
                        </div>
                      )}

                      {config.packageType === 'APIPackage' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Price per API Call (đ)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={data?.apiPricePerCall || ''}
                              onChange={(e) => updateFormField(config.pricingId, 'apiPricePerCall', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="font-semibold text-gray-900">{formatCurrency(config.apiPricePerCall)}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Commission Split */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                      <div className="text-xs font-semibold text-gray-500 mb-3">REVENUE SPLIT</div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Provider Commission (%)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={data?.providerCommissionPercent || ''}
                              onChange={(e) => updateFormField(config.pricingId, 'providerCommissionPercent', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="font-bold text-green-600">{config.providerCommissionPercent}%</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Admin Commission (%)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={data?.adminCommissionPercent || ''}
                              onChange={(e) => updateFormField(config.pricingId, 'adminCommissionPercent', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="font-bold text-blue-600">{config.adminCommissionPercent}%</div>
                          )}
                        </div>
                        {isEditing && data && (
                          <div className={`text-xs p-2 rounded ${
                            Math.abs((data.providerCommissionPercent + data.adminCommissionPercent) - 100) < 0.01
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Total: {(data.providerCommissionPercent + data.adminCommissionPercent).toFixed(2)}%
                            {Math.abs((data.providerCommissionPercent + data.adminCommissionPercent) - 100) < 0.01 ? ' ✓' : ' (Must = 100%)'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancel(config.pricingId)}
                          disabled={isSaving}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(config.pricingId)}
                          disabled={isSaving}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(config.pricingId)}
                        className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              SystemPricing Overview
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>3 package types: DataPackage, SubscriptionPackage, APIPackage</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Each package has different pricing model</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Revenue split percentages must total 100%</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Toggle active/inactive to control availability</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Revenue Distribution
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold mb-1">DataPackage</div>
                <div className="text-xs text-gray-500">Providers split by row count contribution</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold mb-1">SubscriptionPackage</div>
                <div className="text-xs text-gray-500">Equal split among all providers in province</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold mb-1">APIPackage</div>
                <div className="text-xs text-gray-500">Equal split among all providers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
