import client from './client'
import { SubscriptionDashboardData, ChartDataPoint } from '../types'

export const subscriptionsApi = {
  /**
   * GET /api/subscription-packages/{id}/dashboard
   * Get dashboard data for subscription
   */
  getDashboard: async (subscriptionId: number): Promise<SubscriptionDashboardData> => {
    const response = await client.get<SubscriptionDashboardData>(
      `/subscription-packages/${subscriptionId}/dashboard`
    )
    return response.data
  },

  /**
   * GET /api/subscription-packages/{id}/charts/energy-over-time
   * Get energy consumption over time chart data
   */
  getEnergyOverTime: async (subscriptionId: number, days: number = 30): Promise<ChartDataPoint[]> => {
    const response = await client.get<ChartDataPoint[]>(
      `/subscription-packages/${subscriptionId}/charts/energy-over-time`,
      { params: { days } }
    )
    return response.data
  },

  /**
   * GET /api/subscription-packages/{id}/charts/station-distribution
   * Get station distribution chart data
   */
  getStationDistribution: async (subscriptionId: number): Promise<ChartDataPoint[]> => {
    const response = await client.get<ChartDataPoint[]>(
      `/subscription-packages/${subscriptionId}/charts/station-distribution`
    )
    return response.data
  },

  /**
   * GET /api/subscription-packages/{id}/charts/peak-hours
   * Get peak charging hours chart data
   */
  getPeakHours: async (subscriptionId: number): Promise<ChartDataPoint[]> => {
    const response = await client.get<ChartDataPoint[]>(
      `/subscription-packages/${subscriptionId}/charts/peak-hours`
    )
    return response.data
  },
}
