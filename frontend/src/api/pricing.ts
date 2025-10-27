import client from './client'
import { PricingTier, PricingTierCreate } from '../types'

export const pricingApi = {
  /**
   * GET /api/pricingtiers
   * Get all active pricing tiers (public)
   */
  getAll: async (): Promise<PricingTier[]> => {
    const response = await client.get<PricingTier[]>('/pricingtiers')
    return response.data
  },

  /**
   * GET /api/pricingtiers/{id}
   * Get pricing tier by ID (public)
   */
  getById: async (id: number): Promise<PricingTier> => {
    const response = await client.get<PricingTier>(`/pricingtiers/${id}`)
    return response.data
  },

  /**
   * POST /api/pricingtiers
   * Create new pricing tier (Admin only)
   */
  create: async (data: PricingTierCreate): Promise<PricingTier> => {
    const response = await client.post<PricingTier>('/pricingtiers', data)
    return response.data
  },

  /**
   * PUT /api/pricingtiers/{id}
   * Update pricing tier (Admin only)
   */
  update: async (id: number, data: Partial<PricingTierCreate>): Promise<PricingTier> => {
    const response = await client.put<PricingTier>(`/pricingtiers/${id}`, data)
    return response.data
  },

  /**
   * DELETE /api/pricingtiers/{id}
   * Delete pricing tier (Admin only)
   */
  delete: async (id: number): Promise<void> => {
    await client.delete(`/pricingtiers/${id}`)
  },
}

