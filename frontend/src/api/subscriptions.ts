import client from './client'
import { SubscriptionDashboardData, ChartDataPoint } from '../types'

export const subscriptionsApi = {
  /**
   * GET /api/subscription-packages/{id}/dashboard
   * Get dashboard data for subscription
   */
  getDashboard: async (subscriptionId: number): Promise<SubscriptionDashboardData> => {
    const response = await client.get<{
      subscription: {
        subscriptionId: number
        provinceName: string
        districtName?: string
        startDate: string
        endDate: string
        daysRemaining: number
      }
      statistics: {
        totalRecords: number
        totalEnergyKwh: number
        averageEnergyKwh: number
        averageChargingDuration: number
        uniqueStations: number
        dataRangeDays: number
      }
    }>(`/subscription-packages/${subscriptionId}/dashboard`)

    // Transform backend response to frontend format
    return {
      subscriptionId: response.data.subscription.subscriptionId,
      provinceName: response.data.subscription.provinceName,
      districtName: response.data.subscription.districtName,
      totalStations: response.data.statistics.uniqueStations,
      totalEnergyKwh: response.data.statistics.totalEnergyKwh,
      averageChargingDuration: response.data.statistics.averageChargingDuration,
      totalChargingSessions: response.data.statistics.totalRecords,
      dateRange: {
        startDate: response.data.subscription.startDate,
        endDate: response.data.subscription.endDate
      }
    }
  },

  /**
   * GET /api/subscription-packages/{id}/charts/energy-over-time
   * Get energy consumption over time chart data
   */
  getEnergyOverTime: async (subscriptionId: number, days: number = 30): Promise<ChartDataPoint[]> => {
    const response = await client.get<{
      chartType: string
      dataPoints: Array<{
        date: string
        totalEnergy: number
        recordCount: number
      }>
    }>(`/subscription-packages/${subscriptionId}/charts/energy-over-time`, { params: { days } })

    // Transform backend response to {label, value} format
    return response.data.dataPoints.map(point => ({
      label: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(point.totalEnergy * 100) / 100,
      date: point.date
    }))
  },

  /**
   * GET /api/subscription-packages/{id}/charts/station-distribution
   * Get station distribution chart data
   */
  getStationDistribution: async (subscriptionId: number): Promise<ChartDataPoint[]> => {
    const response = await client.get<{
      chartType: string
      dataPoints: Array<{
        stationId: string
        stationName: string
        totalEnergy: number
        recordCount: number
      }>
    }>(`/subscription-packages/${subscriptionId}/charts/station-distribution`)

    // Transform backend response to {label, value} format
    return response.data.dataPoints.map(point => ({
      label: point.stationName || point.stationId,
      value: Math.round(point.totalEnergy * 100) / 100
    }))
  },

  /**
   * GET /api/subscription-packages/{id}/charts/peak-hours
   * Get peak charging hours chart data
   */
  getPeakHours: async (subscriptionId: number): Promise<ChartDataPoint[]> => {
    const response = await client.get<{
      chartType: string
      dataPoints: Array<{
        hour: number
        totalEnergy: number
        recordCount: number
        avgEnergy: number
      }>
    }>(`/subscription-packages/${subscriptionId}/charts/peak-hours`)

    // Transform backend response to {label, value} format
    return response.data.dataPoints.map(point => ({
      label: `${point.hour}:00`,
      value: point.recordCount
    }))
  },
}
