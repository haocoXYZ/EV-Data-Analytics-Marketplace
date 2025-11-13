import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { subscriptionsApi } from '../api'
import { SubscriptionDashboardData, ChartDataPoint } from '../types'
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

export default function SubscriptionDashboard() {
    const { subscriptionId } = useParams<{ subscriptionId: string }>()
    const [dashboardData, setDashboardData] = useState<SubscriptionDashboardData | null>(null)
    const [energyOverTime, setEnergyOverTime] = useState<ChartDataPoint[]>([])
    const [stationDistribution, setStationDistribution] = useState<ChartDataPoint[]>([])
    const [peakHours, setPeakHours] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeFilter, setTimeFilter] = useState<number | undefined>(undefined) // undefined = All data

    // Chart colors
    const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

    useEffect(() => {
        if (subscriptionId) {
            loadDashboard(parseInt(subscriptionId))
        }
    }, [subscriptionId, timeFilter])

    const loadDashboard = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            const [dashboard, energy, stations, hours] = await Promise.all([
                subscriptionsApi.getDashboard(id),
                subscriptionsApi.getEnergyOverTime(id, timeFilter),
                subscriptionsApi.getStationDistribution(id, timeFilter),
                subscriptionsApi.getPeakHours(id, timeFilter),
            ])

            console.log('📊 Dashboard Data:', dashboard)
            console.log('📈 Energy Over Time:', energy)
            console.log('🏢 Station Distribution:', stations)
            console.log('⏰ Peak Hours:', hours)

            setDashboardData(dashboard)
            setEnergyOverTime(energy)
            setStationDistribution(stations)
            setPeakHours(hours)
        } catch (err: any) {
            console.error('❌ Dashboard Error:', err)
            setError(err.response?.data?.message || err.message || 'Failed to load dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                        <p className="text-gray-600 mt-4 text-lg">Đang tải bảng điều khiển...</p>
                    </div>
                </div>
            </ConsumerLayout>
        )
    }

    if (error) {
        const isInvalidSubscription = error.includes('Invalid subscription') || error.includes('access denied') || error.includes('not found')
        const isNotActive = error.includes('status is') || error.includes('Pending') || error.includes('Cancelled')
        const isExpired = error.includes('expired')

        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="text-center max-w-2xl">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h3>
                        <p className="text-red-600 mb-4 text-lg">{error}</p>
                        
                        {/* Helpful explanation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                            <h4 className="font-bold text-blue-900 mb-2">💡 Possible reasons:</h4>
                            <ul className="text-sm text-blue-800 space-y-2">
                                {isNotActive && (
                                    <>
                                        <li>• Your subscription is pending payment. Please complete the payment first.</li>
                                        <li>• Go to "My Purchases" → Find your subscription → Click "Pay Now"</li>
                                    </>
                                )}
                                {isExpired && (
                                    <li>• Your subscription has expired. Please renew it to access the dashboard.</li>
                                )}
                                {isInvalidSubscription && (
                                    <>
                                        <li>• This subscription doesn't exist or doesn't belong to you.</li>
                                        <li>• Check "My Purchases" to see your available subscriptions.</li>
                                    </>
                                )}
                                {!isNotActive && !isExpired && !isInvalidSubscription && (
                                    <li>• There was a technical issue loading the dashboard. Please try again.</li>
                                )}
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Link
                                to="/my-purchases"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                View My Purchases
                            </Link>
                            <Link
                                to="/explore"
                                className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Explore Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </ConsumerLayout>
        )
    }

    if (!dashboardData) {
        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-600">Không có dữ liệu bảng điều khiển</p>
                </div>
            </ConsumerLayout>
        )
    }

    return (
        <ConsumerLayout>
            <div className="bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-3">📊 Bảng Điều Khiển Gói Đăng Ký</h1>
                                <p className="text-purple-100 text-lg">
                                    {dashboardData.provinceName}
                                    {dashboardData.districtName && ` - ${dashboardData.districtName}`}
                                </p>
                                <p className="text-purple-200 text-sm mt-2">
                                    Thời gian đăng ký: {new Date(dashboardData.dateRange.startDate).toLocaleDateString('vi-VN')} đến {new Date(dashboardData.dateRange.endDate).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                            <Link
                                to="/my-purchases"
                                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                            >
                                ← Quay Lại Gói Đã Mua
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Time Filter */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span className="font-semibold text-gray-900">Bộ lọc thời gian:</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setTimeFilter(7)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        timeFilter === 7
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    7 ngày
                                </button>
                                <button
                                    onClick={() => setTimeFilter(30)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        timeFilter === 30
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    30 ngày
                                </button>
                                <button
                                    onClick={() => setTimeFilter(90)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        timeFilter === 90
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    90 ngày
                                </button>
                                <button
                                    onClick={() => setTimeFilter(undefined)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        timeFilter === undefined
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tất cả dữ liệu
                                </button>
                            </div>
                        </div>
                        {timeFilter && (
                            <div className="mt-3 text-sm text-gray-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Hiển thị dữ liệu của {timeFilter} ngày gần nhất
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {(dashboardData.totalStations || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Tổng Trạm Sạc</div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {(dashboardData.totalEnergyKwh || 0).toLocaleString()} kWh
                            </div>
                            <div className="text-sm text-gray-600">Tổng Năng Lượng Tiêu Thụ</div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {(dashboardData.averageChargingDuration || 0).toFixed(1)} phút
                            </div>
                            <div className="text-sm text-gray-600">Thời Gian Sạc Trung Bình</div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {(dashboardData.totalChargingSessions || 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Tổng Phiên Sạc</div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Energy Over Time - Area Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                Tiêu Thụ Năng Lượng Theo Thời Gian
                            </h3>
                            {energyOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={energyOverTime}>
                                        <defs>
                                            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis 
                                            dataKey="label" 
                                            tick={{ fontSize: 12 }}
                                            stroke="#6B7280"
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12 }}
                                            stroke="#6B7280"
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke="#3B82F6" 
                                            strokeWidth={2}
                                            fill="url(#colorEnergy)" 
                                            name="Energy (kWh)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>

                        {/* Station Distribution - Bar Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Phân Bố Trạm Sạc Theo Quận/Huyện
                            </h3>
                            {stationDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stationDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11 }}
                                            stroke="#6B7280"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            stroke="#6B7280"
                                            label={{ value: 'Năng lượng (kWh)', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            formatter={(value: any, name: any, props: any) => {
                                                const entry = props.payload
                                                return [
                                                    <div key="tooltip">
                                                        <div><strong>Năng lượng:</strong> {value.toLocaleString()} kWh</div>
                                                        {entry.stationCount && <div><strong>Số trạm:</strong> {entry.stationCount}</div>}
                                                    </div>,
                                                    entry.label || 'Quận/Huyện'
                                                ]
                                            }}
                                            cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#10B981"
                                            radius={[8, 8, 0, 0]}
                                            name="Năng lượng (kWh)"
                                        >
                                            {stationDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Peak Hours Chart - Full Width Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Giờ Cao Điểm Sạc Điện (24h)
                        </h3>
                        {peakHours.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis 
                                        dataKey="label" 
                                        tick={{ fontSize: 12 }}
                                        stroke="#6B7280"
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12 }}
                                        stroke="#6B7280"
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        fill="#8B5CF6" 
                                        radius={[8, 8, 0, 0]}
                                        name="Charging Sessions"
                                    >
                                        {peakHours.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={`rgba(139, 92, 246, ${0.4 + (entry.value / Math.max(...peakHours.map(p => p.value || 0))) * 0.6})`}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-gray-500">
                                Không có dữ liệu
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                            📈 Tính Năng Bảng Điều Khiển
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                            <div className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">📊</span>
                                <span><strong>Biểu đồ vùng:</strong> Xu hướng tiêu thụ năng lượng theo thời gian</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">📊</span>
                                <span><strong>Biểu đồ cột:</strong> Phân bố trạm sạc theo quận/huyện</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">📊</span>
                                <span><strong>Biểu đồ cột:</strong> Phân tích giờ cao điểm sạc (24h)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-orange-600 font-bold">⚡</span>
                                <span><strong>Dữ liệu thực:</strong> Tổng hợp từ nhà cung cấp</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ConsumerLayout>
    )
}
