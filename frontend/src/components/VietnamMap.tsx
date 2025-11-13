import { useState, useEffect } from 'react'

interface Province {
  id: number
  name: string
  coordinates: { x: number; y: number }
  districts: number
}

interface MapProps {
  selectedProvinceId?: number
  onProvinceSelect: (provinceId: number) => void
  provinceData?: Record<number, { totalRecords: number; loading: boolean }>
}

const PROVINCES: Province[] = [
  { id: 1, name: 'Hà Nội', coordinates: { x: 200, y: 80 }, districts: 30 },
  { id: 2, name: 'TP. HCM', coordinates: { x: 150, y: 320 }, districts: 24 },
  { id: 3, name: 'Đà Nẵng', coordinates: { x: 280, y: 220 }, districts: 8 },
]

export default function VietnamMap({ selectedProvinceId, onProvinceSelect, provinceData }: MapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<number | null>(null)

  const getProvinceColor = (provinceId: number) => {
    if (selectedProvinceId === provinceId) return '#3b82f6' // blue-600
    if (hoveredProvince === provinceId) return '#60a5fa' // blue-400

    const data = provinceData?.[provinceId]
    if (data?.loading) return '#d1d5db' // gray-300
    if (data && data.totalRecords > 0) {
      // Color intensity based on record count
      const intensity = Math.min(data.totalRecords / 500, 1)
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})` // green with varying opacity
    }
    return '#e5e7eb' // gray-200
  }

  return (
    <div className="relative">
      {/* Map SVG */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto border-2 border-gray-300 rounded-lg bg-blue-50"
      >
        {/* Simplified Vietnam outline */}
        <path
          d="M 200 20 L 220 40 L 230 80 L 240 120 L 250 160 L 260 200 L 250 240 L 230 280 L 200 320 L 170 340 L 150 320 L 140 280 L 130 240 L 120 200 L 130 160 L 150 120 L 170 80 L 180 40 Z"
          fill="#e0f2fe"
          stroke="#0ea5e9"
          strokeWidth="2"
        />

        {/* Province markers */}
        {PROVINCES.map((province) => {
          const data = provinceData?.[province.id]
          const radius = selectedProvinceId === province.id ? 30 : 25

          return (
            <g key={province.id}>
              {/* Marker circle */}
              <circle
                cx={province.coordinates.x}
                cy={province.coordinates.y}
                r={radius}
                fill={getProvinceColor(province.id)}
                stroke={selectedProvinceId === province.id ? '#1e40af' : '#6b7280'}
                strokeWidth={selectedProvinceId === province.id ? 3 : 2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredProvince(province.id)}
                onMouseLeave={() => setHoveredProvince(null)}
                onClick={() => onProvinceSelect(province.id)}
              />

              {/* Province name */}
              <text
                x={province.coordinates.x}
                y={province.coordinates.y + 50}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-700 pointer-events-none"
              >
                {province.name}
              </text>

              {/* Record count (if available) */}
              {data && !data.loading && (
                <text
                  x={province.coordinates.x}
                  y={province.coordinates.y + 5}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none"
                >
                  {data.totalRecords > 0 ? data.totalRecords.toLocaleString() : '0'}
                </text>
              )}

              {/* Loading indicator */}
              {data?.loading && (
                <text
                  x={province.coordinates.x}
                  y={province.coordinates.y + 5}
                  textAnchor="middle"
                  className="text-xs font-bold fill-gray-600 pointer-events-none"
                >
                  ...
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>High data availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Low data availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span>Selected province</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>No data</span>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredProvince && provinceData?.[hoveredProvince] && (
        <div className="absolute top-2 right-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-3 pointer-events-none">
          <div className="text-sm font-semibold text-gray-900">
            {PROVINCES.find(p => p.id === hoveredProvince)?.name}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {provinceData[hoveredProvince].loading ? (
              'Loading...'
            ) : (
              <>
                <div>Records: {provinceData[hoveredProvince].totalRecords.toLocaleString()}</div>
                <div>Districts: {PROVINCES.find(p => p.id === hoveredProvince)?.districts}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
