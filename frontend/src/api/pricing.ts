import client from './client'
import { SystemPricing, SystemPricingUpdate } from '../types'

export const pricingApi = {
  /**
   * GET /api/pricing
   * Get all pricing configurations (3 package types)
   */
  getAll: async (): Promise<SystemPricing[]> => {
    const response = await client.get<SystemPricing[]>('/pricing')
    return response.data
  },

  /**
   * GET /api/pricing/{id}
   * Get pricing configuration by ID
   */
  getById: async (id: number): Promise<SystemPricing> => {
    const response = await client.get<SystemPricing>(`/pricing/${id}`)
    return response.data
  },

  /**
   * PUT /api/pricing/{id}
   * Update pricing configuration (Admin only)
   */
  update: async (id: number, data: SystemPricingUpdate): Promise<SystemPricing> => {
    const response = await client.put<SystemPricing>(`/pricing/${id}`, data)
    return response.data
  },

  /**
   * PATCH /api/pricing/{id}/toggle-active
   * Toggle active status (Admin only)
   */
  toggleActive: async (id: number): Promise<SystemPricing> => {
    const response = await client.patch<SystemPricing>(`/pricing/${id}/toggle-active`)
    return response.data
  },
}
