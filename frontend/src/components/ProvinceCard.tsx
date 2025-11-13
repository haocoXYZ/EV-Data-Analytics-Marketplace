import { Province } from '../types'

interface ProvinceCardProps {
  province: Province
  isSelected: boolean
  recordCount?: number
  loading?: boolean
  onClick: () => void
}

export default function ProvinceCard({
  province,
  isSelected,
  recordCount = 0,
  loading = false,
  onClick
}: ProvinceCardProps) {

  const getCardStyle = () => {
    if (isSelected) {
      return 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105'
    }
    if (loading) {
      return 'border-gray-300 bg-gray-50 animate-pulse'
    }
    if (recordCount > 0) {
      const intensity = Math.min(recordCount / 500, 1)
      if (intensity > 0.7) {
        return 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg hover:scale-102'
      } else if (intensity > 0.3) {
        return 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md hover:scale-102'
      }
      return 'border-green-200 bg-green-50 hover:shadow-md hover:scale-102'
    }
    return 'border-gray-200 bg-white hover:shadow-md hover:scale-102'
  }

  const getRecordBadge = () => {
    if (loading) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
          Loading...
        </span>
      )
    }

    if (recordCount === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          No data
        </span>
      )
    }

    if (recordCount > 300) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
          High availability
        </span>
      )
    } else if (recordCount > 100) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
          Medium
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
          Low
        </span>
      )
    }
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${getCardStyle()}
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Province name */}
      <h3 className={`text-lg font-bold mb-2 pr-8 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
        {province.name}
      </h3>

      {/* Province code */}
      <div className="text-xs text-gray-500 mb-3 font-mono">
        {province.code}
      </div>

      {/* Record count */}
      {!loading && (
        <div className="mb-2">
          <div className={`text-3xl font-bold ${
            isSelected ? 'text-blue-700' : recordCount > 0 ? 'text-green-700' : 'text-gray-400'
          }`}>
            {recordCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">records available</div>
        </div>
      )}

      {/* Status badge */}
      <div className="mt-3">
        {getRecordBadge()}
      </div>

      {/* Progress bar for data availability */}
      {!loading && recordCount > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                isSelected ? 'bg-blue-600' : 'bg-green-600'
              }`}
              style={{ width: `${Math.min((recordCount / 500) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
