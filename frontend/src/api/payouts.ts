import client from './client'
import { RevenueSummary, Payout, CompletePayoutRequest } from '../types'

export const payoutsApi = {
  /**
   * GET /api/payouts/revenue-summary
   * Get revenue summary for a specific month (Admin only)
   */
  getRevenueSummary: async (monthYear?: string): Promise<RevenueSummary> => {
    const params = monthYear ? { monthYear } : undefined
    const response = await client.get<RevenueSummary>('/payouts/revenue-summary', { params })
    return response.data
  },

  /**
   * POST /api/payouts/generate
   * Generate payouts for a specific month (Admin only)
   */
  generatePayouts: async (monthYear: string): Promise<any> => {
    const response = await client.post(`/payouts/generate`, null, {
      params: { monthYear },
    })
    return response.data
  },

  /**
   * GET /api/payouts
   * Get all payouts with optional filters (Admin only)
   */
  getAll: async (params?: { status?: string; monthYear?: string }): Promise<Payout[]> => {
    const response = await client.get<Payout[]>('/payouts', { params })
    return response.data
  },

  /**
   * PUT /api/payouts/{id}/complete
   * Mark payout as completed (Admin only)
   */
  completePayout: async (id: number, data: CompletePayoutRequest): Promise<void> => {
    await client.put(`/payouts/${id}/complete`, data)
  },

  /**
   * GET /api/payouts/provider/{providerId}
   * Get payouts for a specific provider (Provider/Admin only)
   */
  getProviderPayouts: async (providerId: number): Promise<Payout[]> => {
    const response = await client.get<Payout[]>(`/payouts/provider/${providerId}`)
    return response.data
  },
}























