import React, { useEffect, useState } from 'react'
import ModeratorLayout from '../components/ModeratorLayout'
import { moderationApi } from '../api'
import { Dataset } from '../types'

export default function ModeratorReview() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPendingDatasets()
  }, [])

  const loadPendingDatasets = async () => {
    try {
      setLoading(true)
      const data = await moderationApi.getPending()
      setDatasets(data)
    } catch (error) {
      console.error('Failed to load pending datasets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (dataset: any, actionType: 'approve' | 'reject') => {
    setSelectedDataset(dataset)
    setAction(actionType)
    setReviewModal(true)
    setComments('')
  }

  const handleSubmitReview = async () => {
    if (!selectedDataset) return

    setSubmitting(true)
    try {
      if (action === 'approve') {
        await moderationApi.approve(selectedDataset.datasetId, comments)
      } else {
        if (!comments.trim()) {
          alert('Vui lòng nhập lý do từ chối!')
          return
        }
        await moderationApi.reject(selectedDataset.datasetId, comments)
      }
      
      await loadPendingDatasets()
      setReviewModal(false)
      setSelectedDataset(null)
      setComments('')
    } catch (error: any) {
      alert('Lỗi: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModeratorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            B3: Kiểm Duyệt Datasets
          </h1>
          <p className="text-gray-600 mt-1">Phê duyệt datasets từ Data Providers để đăng tải lên nền tảng</p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-100 mb-1">Datasets chờ kiểm duyệt</div>
              <div className="text-4xl font-bold">{datasets.length}</div>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Datasets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Đang tải datasets...</p>
          </div>
        ) : datasets.length > 0 ? (
          <div className="space-y-4">
            {datasets.map((dataset) => (
              <div key={dataset.datasetId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{dataset.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {dataset.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{dataset.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{dataset.providerName || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>{dataset.dataSizeMb?.toFixed(2) || '0'} MB</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{new Date(dataset.uploadDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{dataset.tierName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleReview(dataset, 'approve')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReview(dataset, 'reject')}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tất cả đã kiểm duyệt!</h3>
            <p className="text-gray-600">Không có dataset nào đang chờ kiểm duyệt</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && selectedDataset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {action === 'approve' ? '✅ Phê duyệt Dataset' : '❌ Từ chối Dataset'}
                </h2>
                <button
                  onClick={() => setReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Dataset: {selectedDataset.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Provider:</span>
                    <span className="ml-2 font-medium">{selectedDataset.providerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{selectedDataset.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2 font-medium">{selectedDataset.dataSizeMb?.toFixed(2)} MB</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tier:</span>
                    <span className="ml-2 font-medium">{selectedDataset.tierName}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {action === 'approve' ? 'Ghi chú (tùy chọn)' : 'Lý do từ chối *'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required={action === 'reject'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder={action === 'approve' 
                    ? 'Thêm ghi chú về dataset (tùy chọn)...' 
                    : 'Nhập lý do từ chối để provider có thể chỉnh sửa...'}
                />
              </div>

              {action === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  <p className="font-semibold mb-1">✅ Phê duyệt dataset này?</p>
                  <p>Dataset sẽ được đăng tải lên nền tảng và consumers có thể mua ngay.</p>
                </div>
              )}

              {action === 'reject' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                  <p className="font-semibold mb-1">❌ Từ chối dataset này?</p>
                  <p>Provider sẽ nhận được thông báo và có thể chỉnh sửa dataset.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                    action === 'approve'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  }`}
                >
                  {submitting ? 'Đang xử lý...' : action === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModeratorLayout>
  )
}
