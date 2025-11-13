import client from './client'

export const adminApi = {
  /**
   * GET /api/admin/dashboard-stats
   * Get comprehensive statistics for admin dashboard
   */
  getDashboardStats: async (): Promise<any> => {
    const response = await client.get('/admin/dashboard-stats')
    return response.data
  },

  /**
   * GET /api/admin/revenue-trends
   * Get revenue trends over time (monthly breakdown)
   */
  getRevenueTrends: async (year?: number): Promise<any> => {
    const params = year ? { year } : undefined
    const response = await client.get('/admin/revenue-trends', { params })
    return response.data
  },
}
