import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProviderLayout from '../components/ProviderLayout'
import { datasetsApi } from '../api'
import { Dataset } from '../types'

export default function ProviderDatasets() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadDatasets()
  }, [])

  const loadDatasets = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await datasetsApi.getMy()
      setDatasets(data)
    } catch (error: any) {
      console.error('Failed to load datasets:', error)
      setError(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (dataset.description && dataset.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || dataset.moderationStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">✓ Approved</span>
      case 'Pending':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">⏳ Pending Review</span>
      case 'Rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">✕ Rejected</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const stats = {
    total: datasets.length,
    approved: datasets.filter(d => d.moderationStatus === 'Approved').length,
    pending: datasets.filter(d => d.moderationStatus === 'Pending').length,
    rejected: datasets.filter(d => d.moderationStatus === 'Rejected').length,
    totalRecords: datasets.reduce((sum, d) => sum + d.rowCount, 0)
  }

  return (
    <ProviderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 My Datasets</h1>
            <p className="text-gray-600">Manage your uploaded datasets and track moderation status</p>
          </div>
          <Link
            to="/provider/new"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Upload New Dataset
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <div className="text-gray-500 text-sm mb-1">Total Datasets</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-green-200">
            <div className="text-green-600 text-sm mb-1">✓ Approved</div>
            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-yellow-200">
            <div className="text-yellow-600 text-sm mb-1">⏳ Pending</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-red-200">
            <div className="text-red-600 text-sm mb-1">✕ Rejected</div>
            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow text-white">
            <div className="text-blue-100 text-sm mb-1">Total Records</div>
            <div className="text-2xl font-bold">{formatNumber(stats.totalRecords)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search datasets by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({datasets.length})
              </button>
              <button
                onClick={() => setFilterStatus('Approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'Approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'Pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilterStatus('Rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'Rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>
        </div>

        {/* Datasets Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading datasets...</p>
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-medium mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No datasets match your filters' : 'No datasets uploaded yet'}
              </p>
              <p className="text-sm mb-4">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first dataset to start earning revenue!'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link
                  to="/provider/new"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Upload Dataset
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Dataset Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDatasets.map((dataset) => (
                    <tr key={dataset.datasetId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{dataset.name}</div>
                        {dataset.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {dataset.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                          {dataset.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatNumber(dataset.rowCount)}
                        </div>
                        <div className="text-xs text-gray-500">rows</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(dataset.moderationStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(dataset.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/dataset/${dataset.datasetId}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-2">ℹ️ Dataset Moderation Process</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>• <strong>Pending:</strong> Your dataset is in the moderation queue and will be reviewed soon</li>
            <li>• <strong>Approved:</strong> Dataset is live and can generate revenue from consumer purchases</li>
            <li>• <strong>Rejected:</strong> Dataset did not meet quality standards. Check rejection comments and re-upload</li>
            <li>• Only approved datasets are visible to consumers and eligible for revenue sharing</li>
            <li>• Make sure your CSV data follows the template format exactly</li>
          </ul>
        </div>
      </div>
    </ProviderLayout>
  )
}
