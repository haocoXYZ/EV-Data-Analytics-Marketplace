import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { moderationApi } from '../api'
import { Dataset, DataPreviewResponse, DatasetModerationDetail } from '../types'

export default function ModeratorReview() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState<DatasetModerationDetail | null>(null)
  const [detailModal, setDetailModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [previewModal, setPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState<DataPreviewResponse | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [downloading, setDownloading] = useState<number | null>(null)

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

  const handleViewDetail = async (datasetId: number) => {
    try {
      const detail = await moderationApi.getById(datasetId)
      setSelectedDataset(detail)
      setDetailModal(true)
    } catch (error: any) {
      alert('❌ Lỗi load detail: ' + error.message)
    }
  }

  const handleReview = (actionType: 'approve' | 'reject') => {
    if (!selectedDataset) return
    setAction(actionType)
    setReviewModal(true)
    setComments('')
  }

  const handleSubmitReview = async () => {
    if (!selectedDataset) return

    if (action === 'reject' && !comments.trim()) {
      alert('Vui lòng nhập lý do từ chối!')
      return
    }

    setSubmitting(true)
    try {
      if (action === 'approve') {
        await moderationApi.approve(selectedDataset.datasetId, comments || undefined)
        alert('✅ Dataset đã được phê duyệt!')
      } else {
        await moderationApi.reject(selectedDataset.datasetId, comments)
        alert('❌ Dataset đã bị từ chối. Provider sẽ nhận được thông báo.')
      }
      
      await loadPendingDatasets()
      setReviewModal(false)
      setDetailModal(false)
      setSelectedDataset(null)
      setComments('')
    } catch (error: any) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePreview = async (datasetId: number, page: number = 1) => {
    setLoadingPreview(true)
    setCurrentPage(page)
    try {
      const data = await moderationApi.preview(datasetId, page, 50)
      setPreviewData(data)
      setPreviewModal(true)
    } catch (error: any) {
      alert('❌ Lỗi preview: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleDownloadForReview = async (datasetId: number, datasetName: string) => {
    setDownloading(datasetId)
    try {
      const blob = await moderationApi.downloadForReview(datasetId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${datasetName.replace(/\s+/g, '_')}_review.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      alert('❌ Lỗi download: ' + (error.response?.data?.message || error.message))
    } finally {
      setDownloading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Kiểm Duyệt Datasets
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
                          {dataset.category || 'N/A'}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{(dataset.rowCount || 0).toLocaleString()} records</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(dataset.uploadDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetail(dataset.datasetId)}
                        className="flex-1 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition-all inline-flex items-center justify-center border border-indigo-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handlePreview(dataset.datasetId)}
                        disabled={loadingPreview}
                        className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-all inline-flex items-center justify-center border border-blue-200 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadForReview(dataset.datasetId, dataset.name)}
                        disabled={downloading === dataset.datasetId}
                        className="flex-1 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition-all inline-flex items-center justify-center border border-purple-200 disabled:opacity-50"
                      >
                        {downloading === dataset.datasetId ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Downloading...
                          </span>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </>
                        )}
                      </button>
                    </div>
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

      {/* Detail Modal */}
      {detailModal && selectedDataset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Chi tiết Dataset</h2>
                <button
                  onClick={() => setDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-lg mb-3">{selectedDataset.name}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Dataset ID:</span>
                    <span className="ml-2 font-medium">#{selectedDataset.datasetId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{selectedDataset.category || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Records:</span>
                    <span className="ml-2 font-medium">{(selectedDataset.rowCount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Upload Date:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedDataset.uploadDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{selectedDataset.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Moderation:</span>
                    <span className="ml-2 font-medium">{selectedDataset.moderationStatus}</span>
                  </div>
                </div>
                {selectedDataset.description && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-gray-600 text-sm">Description:</div>
                    <div className="text-gray-900 mt-1">{selectedDataset.description}</div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Provider Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <span className="ml-2 font-medium">{selectedDataset.provider.companyName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedDataset.provider.contactEmail}</span>
                  </div>
                  {selectedDataset.provider.contactPhone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{selectedDataset.provider.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDataset.moderationHistory && selectedDataset.moderationHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">Moderation History</h4>
                  <div className="space-y-2">
                    {selectedDataset.moderationHistory.map((history) => (
                      <div key={history.moderationId} className="bg-white p-3 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{history.status}</span>
                          <span className="text-gray-500 text-xs">{formatDate(history.reviewDate)}</span>
                        </div>
                        {history.moderatorName && (
                          <div className="text-gray-600 text-xs">By: {history.moderatorName}</div>
                        )}
                        {history.comments && (
                          <div className="text-gray-700 mt-1">{history.comments}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleReview('approve')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Phê duyệt
                </button>
                <button
                  onClick={() => handleReview('reject')}
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
        </div>
      )}

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
                    <span className="ml-2 font-medium">{selectedDataset.provider.companyName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Records:</span>
                    <span className="ml-2 font-medium">{(selectedDataset.rowCount || 0).toLocaleString()}</span>
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

      {/* Preview Modal */}
      {previewModal && previewData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    👁️ Preview Dataset
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{previewData.datasetName}</p>
                </div>
                <button
                  onClick={() => setPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-blue-600 font-semibold">Total Records</div>
                  <div className="text-2xl font-bold text-blue-900">{(previewData.totalRecords || 0).toLocaleString()}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-green-600 font-semibold">Current Page</div>
                  <div className="text-2xl font-bold text-green-900">{previewData.currentPage || 1}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-purple-600 font-semibold">Page Size</div>
                  <div className="text-2xl font-bold text-purple-900">{previewData.pageSize || 50}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-orange-600 font-semibold">Total Pages</div>
                  <div className="text-2xl font-bold text-orange-900">{previewData.totalPages || 1}</div>
                </div>
              </div>

              {previewData.records && previewData.records.length > 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Station ID</th>
                        <th className="px-3 py-2 text-left">Station Name</th>
                        <th className="px-3 py-2 text-left">Province</th>
                        <th className="px-3 py-2 text-left">District</th>
                        <th className="px-3 py-2 text-right">Energy (kWh)</th>
                        <th className="px-3 py-2 text-right">Voltage (V)</th>
                        <th className="px-3 py-2 text-right">Power (kW)</th>
                        <th className="px-3 py-2 text-left">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.records.map((record, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="px-3 py-2 font-mono text-xs">{record.stationId || 'N/A'}</td>
                          <td className="px-3 py-2">{record.stationName || 'N/A'}</td>
                          <td className="px-3 py-2">{record.provinceName || 'N/A'}</td>
                          <td className="px-3 py-2">{record.districtName || 'N/A'}</td>
                          <td className="px-3 py-2 text-right">{(record.energyKwh || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">{(record.voltage || 0).toFixed(1)}</td>
                          <td className="px-3 py-2 text-right">{(record.powerKw || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 font-mono text-xs">{record.chargingTimestamp ? new Date(record.chargingTimestamp).toLocaleString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No records found
                </div>
              )}

              {/* Pagination */}
              {previewData.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => handlePreview(previewData.datasetId, currentPage - 1)}
                    disabled={currentPage === 1 || loadingPreview}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg">
                    Page {currentPage} of {previewData.totalPages}
                  </span>
                  <button
                    onClick={() => handlePreview(previewData.datasetId, currentPage + 1)}
                    disabled={currentPage === previewData.totalPages || loadingPreview}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setPreviewModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
