import { Province } from '../types'

interface VietnamMapSVGProps {
  provinces: Province[]
  selectedProvinceId?: number
  onProvinceClick: (provinceId: number) => void
  provinceData?: Record<number, { totalRecords: number; loading: boolean }>
}

// Mapping of province codes to SVG path regions (simplified Vietnam map)
// This is a simplified representation - in production, use proper GeoJSON data
const PROVINCE_REGIONS: Record<string, string> = {
  // North Vietnam (narrow top)
  'HAN': 'M 200,80 L 220,70 L 230,85 L 220,95 Z', // Hà Nội
  'HCM': 'M 180,380 L 220,370 L 230,390 L 210,400 Z', // TP.HCM (South)
  'DNG': 'M 280,240 L 300,235 L 305,250 L 290,255 Z', // Đà Nẵng (Central Coast)
}

// Province coordinates for markers (approximate positions on Vietnam S-curve)
const PROVINCE_COORDINATES: Record<string, { x: number; y: number }> = {
  // Northern Region
  'HAN': { x: 210, y: 85 },    // Hà Nội
  'HPH': { x: 240, y: 90 },    // Hải Phòng
  'QNI': { x: 190, y: 70 },    // Quảng Ninh

  // North Central Region
  'THA': { x: 180, y: 140 },   // Thanh Hóa
  'NGE': { x: 200, y: 160 },   // Nghệ An
  'HTI': { x: 220, y: 180 },   // Hà Tĩnh

  // Central Region
  'QBI': { x: 250, y: 200 },   // Quảng Bình
  'QTR': { x: 270, y: 215 },   // Quảng Trị
  'TTH': { x: 285, y: 230 },   // Thừa Thiên Huế
  'DNG': { x: 295, y: 245 },   // Đà Nẵng
  'QNA': { x: 280, y: 260 },   // Quảng Nam
  'QNG': { x: 270, y: 280 },   // Quảng Ngãi

  // Central Highlands
  'KHA': { x: 230, y: 250 },   // Khánh Hòa (Nha Trang)
  'PLK': { x: 210, y: 270 },   // Phú Yên
  'GLA': { x: 190, y: 290 },   // Gia Lai
  'DLA': { x: 180, y: 310 },   // Đắk Lắk

  // Southern Region
  'BDI': { x: 170, y: 340 },   // Bình Định
  'DNI': { x: 190, y: 360 },   // Đồng Nai
  'BAR': { x: 160, y: 370 },   // Bà Rịa - Vũng Tàu
  'HCM': { x: 200, y: 385 },   // TP. Hồ Chí Minh
  'BTH': { x: 220, y: 395 },   // Bình Thuận
  'TGI': { x: 150, y: 390 },   // Tiền Giang
  'AGI': { x: 130, y: 400 },   // An Giang
  'CTO': { x: 170, y: 410 },   // Cần Thơ
}

export default function VietnamMapSVG({
  provinces,
  selectedProvinceId,
  onProvinceClick,
  provinceData
}: VietnamMapSVGProps) {

  const getProvinceColor = (provinceId: number) => {
    if (selectedProvinceId === provinceId) return '#3b82f6' // blue-600

    const data = provinceData?.[provinceId]
    if (data?.loading) return '#d1d5db' // gray-300
    if (data && data.totalRecords > 0) {
      // Color intensity based on record count
      const intensity = Math.min(data.totalRecords / 500, 1)
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})` // green with varying opacity
    }
    return '#e5e7eb' // gray-200
  }

  // Add coordinates to provinces based on their code
  const provincesWithCoords = provinces.map(p => ({
    ...p,
    coordinates: PROVINCE_COORDINATES[p.code] || { x: 200, y: 200 }
  }))

  return (
    <svg
      viewBox="0 0 400 450"
      className="w-full h-auto border-2 border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50"
      style={{ maxHeight: '600px' }}
    >
      {/* Vietnam S-shaped outline */}
      <path
        d="
          M 200 20
          L 210 30 L 220 45 L 225 60 L 230 75 L 235 90 L 240 105
          L 243 120 L 245 135 L 248 150 L 252 165 L 258 180
          L 265 195 L 273 210 L 282 225 L 292 240 L 300 255
          L 305 270 L 307 285 L 305 300 L 300 315 L 293 330
          L 283 345 L 270 360 L 255 375 L 238 388 L 220 398
          L 200 405 L 180 408 L 160 405 L 145 398 L 135 388
          L 128 375 L 125 360 L 127 345 L 132 330 L 140 315
          L 150 300 L 160 285 L 168 270 L 173 255 L 175 240
          L 173 225 L 168 210 L 162 195 L 155 180 L 150 165
          L 147 150 L 145 135 L 145 120 L 147 105 L 150 90
          L 155 75 L 162 60 L 172 45 L 185 30 Z
        "
        fill="#e0f2fe"
        stroke="#0ea5e9"
        strokeWidth="2"
        opacity="0.4"
      />

      {/* Sea (East Sea / South China Sea) label */}
      <text
        x="340"
        y="200"
        className="text-xs fill-blue-400 font-medium"
        style={{ fontSize: '10px' }}
      >
        Biển Đông
      </text>

      {/* Province markers */}
      {provincesWithCoords.map((province) => {
        const data = provinceData?.[province.provinceId]
        const isSelected = selectedProvinceId === province.provinceId
        const radius = isSelected ? 12 : 8
        const hasData = data && data.totalRecords > 0

        return (
          <g key={province.provinceId}>
            {/* Marker circle */}
            <circle
              cx={province.coordinates.x}
              cy={province.coordinates.y}
              r={radius}
              fill={getProvinceColor(province.provinceId)}
              stroke={isSelected ? '#1e40af' : hasData ? '#059669' : '#6b7280'}
              strokeWidth={isSelected ? 3 : 1.5}
              className="cursor-pointer transition-all duration-200 hover:stroke-blue-500 hover:stroke-2"
              onClick={() => onProvinceClick(province.provinceId)}
            />

            {/* Record count (if selected or has significant data) */}
            {data && !data.loading && (isSelected || data.totalRecords > 100) && (
              <text
                x={province.coordinates.x}
                y={province.coordinates.y + 3}
                textAnchor="middle"
                className="text-xs font-bold fill-white pointer-events-none"
                style={{ fontSize: isSelected ? '9px' : '7px' }}
              >
                {data.totalRecords > 0 ? (data.totalRecords > 999 ? '999+' : data.totalRecords) : ''}
              </text>
            )}

            {/* Loading indicator */}
            {data?.loading && (
              <text
                x={province.coordinates.x}
                y={province.coordinates.y + 3}
                textAnchor="middle"
                className="text-xs font-bold fill-gray-600 pointer-events-none"
                style={{ fontSize: '8px' }}
              >
                ...
              </text>
            )}

            {/* Province name on hover (for selected) */}
            {isSelected && (
              <text
                x={province.coordinates.x}
                y={province.coordinates.y - 18}
                textAnchor="middle"
                className="text-xs font-semibold fill-blue-900 pointer-events-none"
                style={{ fontSize: '11px' }}
              >
                {province.name}
              </text>
            )}
          </g>
        )
      })}

      {/* Region labels */}
      <text x="200" y="60" textAnchor="middle" className="text-xs fill-gray-500 font-medium" style={{ fontSize: '10px' }}>
        Miền Bắc
      </text>
      <text x="290" y="240" textAnchor="middle" className="text-xs fill-gray-500 font-medium" style={{ fontSize: '10px' }}>
        Miền Trung
      </text>
      <text x="180" y="395" textAnchor="middle" className="text-xs fill-gray-500 font-medium" style={{ fontSize: '10px' }}>
        Miền Nam
      </text>
    </svg>
  )
}
