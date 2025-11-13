import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { providersApi, ProviderProfile, CreateProviderDto } from '../api'

const PROVINCES = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'TP. Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
]

export default function AdminProviders() {
  const [providers, setProviders] = useState<ProviderProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [newProvider, setNewProvider] = useState<CreateProviderDto>({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    companyWebsite: '',
    contactPhone: '',
    address: '',
    provinceId: undefined,
  })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await providersApi.getAllProviders()
      setProviders(data.providers)
    } catch (err: any) {
      console.error('Failed to load providers:', err)
      setError(err.response?.data?.message || 'Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      await providersApi.createProvider(newProvider)
      setShowCreateModal(false)
      setNewProvider({
        fullName: '',
        email: '',
        password: '',
        companyName: '',
        companyWebsite: '',
        contactPhone: '',
        address: '',
        provinceId: undefined,
      })
      loadProviders()
      alert('Provider created successfully!')
    } catch (err: any) {
      console.error('Failed to create provider:', err)
      setError(err.response?.data?.message || 'Failed to create provider')
    } finally {
      setCreating(false)
    }
  }

  const handleActivate = async (id: number) => {
    if (!confirm('Activate this provider?')) return

    try {
      await providersApi.activateProvider(id)
      loadProviders()
      alert('Provider activated!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate provider')
    }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this provider?')) return

    try {
      await providersApi.deactivateProvider(id)
      loadProviders()
      alert('Provider deactivated!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate provider')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Quản lý Providers</h1>
            <p className="text-gray-600 mt-1">Tạo và quản lý các tài khoản Data Provider</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            + Tạo Provider mới
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Providers List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Tên</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Công ty</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Tỉnh</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.providerId} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6">{provider.providerId}</td>
                    <td className="py-4 px-6 font-medium">{provider.fullName}</td>
                    <td className="py-4 px-6">{provider.email}</td>
                    <td className="py-4 px-6">{provider.companyName}</td>
                    <td className="py-4 px-6">{provider.provinceName || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        provider.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {provider.status === 'Active' ? (
                        <button
                          onClick={() => handleDeactivate(provider.providerId)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(provider.providerId)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {providers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có provider nào</p>
              </div>
            )}
          </div>
        )}

        {/* Create Provider Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Tạo Provider mới</h2>
              </div>

              <form onSubmit={handleCreateProvider} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProvider.fullName}
                      onChange={(e) => setNewProvider({ ...newProvider, fullName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newProvider.email}
                      onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newProvider.password}
                      onChange={(e) => setNewProvider({ ...newProvider, password: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên công ty <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProvider.companyName}
                      onChange={(e) => setNewProvider({ ...newProvider, companyName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={newProvider.companyWebsite}
                      onChange={(e) => setNewProvider({ ...newProvider, companyWebsite: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={newProvider.contactPhone}
                      onChange={(e) => setNewProvider({ ...newProvider, contactPhone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={newProvider.address}
                      onChange={(e) => setNewProvider({ ...newProvider, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      value={newProvider.provinceId || ''}
                      onChange={(e) => setNewProvider({ ...newProvider, provinceId: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Chọn tỉnh --</option>
                      {PROVINCES.map((province) => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setError(null)
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {creating ? 'Đang tạo...' : 'Tạo Provider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
