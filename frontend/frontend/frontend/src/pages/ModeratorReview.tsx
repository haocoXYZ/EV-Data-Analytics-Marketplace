import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import datasetsData from '../data/datasets.json'

export default function ModeratorReview() {
  const [datasets, setDatasets] = useState(datasetsData.datasets)

  const pendingDatasets = datasets.filter(d => d.status === 'pending')

  const handleApprove = (id: string) => {
    setDatasets(prev => prev.map(d => d.id === id ? {...d, status: 'approved'} : d))
    alert(`Dataset ${id} đã được phê duyệt và xuất hiện trong Catalog!`)
  }

  const handleReject = (id: string) => {
    if (confirm('Bạn có chắc muốn từ chối dataset này?')) {
      setDatasets(prev => prev.filter(d => d.id !== id))
      alert(`Dataset ${id} đã bị từ chối.`)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Kiểm duyệt Dataset</h1>

        {pendingDatasets.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Không có dataset cần kiểm duyệt</h2>
            <p className="text-gray-600">Tất cả submissions đã được xử lý</p>
          </div>
        )}

        <div className="space-y-6">
          {pendingDatasets.map(dataset => (
            <div key={dataset.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{dataset.name}</h2>
                  <p className="text-gray-600">Nhà cung cấp: <span className="font-semibold">{dataset.provider}</span></p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  Chờ duyệt
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Danh mục:</span>
                      <span className="font-medium">{dataset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khu vực:</span>
                      <span className="font-medium">{dataset.regions.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng records:</span>
                      <span className="font-medium">{dataset.sampleData.totalRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cập nhật:</span>
                      <span className="font-medium">{dataset.sampleData.updateFrequency}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Gói hỗ trợ</h3>
                  <div className="flex flex-wrap gap-2">
                    {dataset.packages.file && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        📁 File
                      </span>
                    )}
                    {dataset.packages.api && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        🔌 API
                      </span>
                    )}
                    {dataset.packages.subscription && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        🌍 Subscription
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Mô tả</h3>
                <p className="text-gray-700">{dataset.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {dataset.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">✅ Checklist kiểm duyệt</h3>
                <div className="space-y-1 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Dữ liệu mẫu đầy đủ, chất lượng tốt</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Mô tả rõ ràng, không vi phạm chính sách</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Nhà cung cấp uy tín, đã verify</label>
                  <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Không trùng lặp với dataset hiện có</label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(dataset.id)}
                  className="btn-primary flex-1"
                >
                  ✅ Phê duyệt
                </button>
                <button
                  onClick={() => handleReject(dataset.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex-1"
                >
                  ❌ Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
