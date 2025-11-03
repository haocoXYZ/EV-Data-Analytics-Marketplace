import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ConsumerLayout from '../components/ConsumerLayout'
import { subscriptionsApi } from '../api'
import { SubscriptionDashboardData, ChartDataPoint } from '../types'

export default function SubscriptionDashboard() {
    const { subscriptionId } = useParams<{ subscriptionId: string }>()
    const [dashboardData, setDashboardData] = useState<SubscriptionDashboardData | null>(null)
    const [energyOverTime, setEnergyOverTime] = useState<ChartDataPoint[]>([])
    const [stationDistribution, setStationDistribution] = useState<ChartDataPoint[]>([])
    const [peakHours, setPeakHours] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (subscriptionId) {
            loadDashboard(parseInt(subscriptionId))
        }
    }, [subscriptionId])

    const loadDashboard = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            const [dashboard, energy, stations, hours] = await Promise.all([
                subscriptionsApi.getDashboard(id),
                subscriptionsApi.getEnergyOverTime(id, 30),
                subscriptionsApi.getStationDistribution(id),
                subscriptionsApi.getPeakHours(id),
            ])

            setDashboardData(dashboard)
            setEnergyOverTime(energy)
            setStationDistribution(stations)
            setPeakHours(hours)
        } catch (err: any) {
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
                        <p className="text-gray-600 mt-4 text-lg">Loading dashboard...</p>
                    </div>
                </div>
            </ConsumerLayout>
        )
    }

    if (error) {
        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <Link
                            to="/my-purchases"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Back to My Purchases
                        </Link>
                    </div>
                </div>
            </ConsumerLayout>
        )
    }

    if (!dashboardData) {
        return (
            <ConsumerLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-600">No dashboard data available</p>
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
                                <h1 className="text-4xl font-bold mb-3">📊 Subscription Dashboard</h1>
                                <p className="text-purple-100 text-lg">
                                    {dashboardData.provinceName}
                                    {dashboardData.districtName && ` - ${dashboardData.districtName}`}
                                </p>
                                <p className="text-purple-200 text-sm mt-2">
                                    Data from {new Date(dashboardData.dateRange.startDate).toLocaleDateString()} to {new Date(dashboardData.dateRange.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <Link
                                to="/my-purchases"
                                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                            >
                                ← Back to Purchases
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                            <div className="text-sm text-gray-600">Total Charging Stations</div>
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
                            <div className="text-sm text-gray-600">Total Energy Consumed</div>
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
                                {(dashboardData.averageChargingDuration || 0).toFixed(1)} min
                            </div>
                            <div className="text-sm text-gray-600">Avg Charging Duration</div>
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
                            <div className="text-sm text-gray-600">Total Charging Sessions</div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Energy Over Time Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                Energy Over Time (Last 30 Days)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700">Date</th>
                                            <th className="text-right py-2 px-3 font-semibold text-gray-700">Energy (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {energyOverTime.length > 0 ? (
                                            energyOverTime.map((point, idx) => (
                                                <tr key={idx} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 text-gray-600">{point.label || 'N/A'}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-gray-900">
                                                        {(point.value || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="py-4 text-center text-gray-500">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Station Distribution Chart */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Station Distribution by District
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-2 px-3 font-semibold text-gray-700">District</th>
                                            <th className="text-right py-2 px-3 font-semibold text-gray-700">Stations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stationDistribution.length > 0 ? (
                                            stationDistribution.map((point, idx) => (
                                                <tr key={idx} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 text-gray-600">{point.label || 'N/A'}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-gray-900">
                                                        {(point.value || 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="py-4 text-center text-gray-500">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Peak Hours Chart - Full Width */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Peak Charging Hours
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Hour</th>
                                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Sessions</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Visual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {peakHours.length > 0 ? (
                                        peakHours.map((point, idx) => {
                                            const maxValue = Math.max(...peakHours.map(p => p.value || 0))
                                            const barWidth = maxValue > 0 ? ((point.value || 0) / maxValue) * 100 : 0
                                            return (
                                                <tr key={idx} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 text-gray-600">{point.label || 'N/A'}</td>
                                                    <td className="py-2 px-3 text-right font-medium text-gray-900">
                                                        {(point.value || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="bg-gray-100 rounded-full h-6 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full flex items-center justify-end pr-2 text-xs text-white font-semibold"
                                                                style={{ width: `${barWidth}%`, minWidth: barWidth > 0 ? '20px' : '0' }}
                                                            >
                                                                {barWidth > 15 && `${barWidth.toFixed(0)}%`}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-center text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200 mt-6">
                        <h3 className="font-bold text-purple-900 mb-3">📈 Dashboard Features</h3>
                        <ul className="space-y-2 text-sm text-purple-800">
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Real-time analytics dashboard for your subscribed region</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Track energy consumption, station usage, and charging patterns</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Data aggregated from all providers in your region</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Dashboard updates automatically with new data</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </ConsumerLayout>
    )
}
