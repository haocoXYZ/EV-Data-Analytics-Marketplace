import client from './client'
import { Province, District } from '../types'

export const locationsApi = {
  /**
   * GET /api/locations/provinces
   * Get all provinces
   */
  getProvinces: async (): Promise<Province[]> => {
    const response = await client.get<Province[]>('/locations/provinces')
    return response.data
  },

  /**
   * GET /api/locations/provinces/{id}
   * Get province by ID
   */
  getProvinceById: async (id: number): Promise<Province> => {
    const response = await client.get<Province>(`/locations/provinces/${id}`)
    return response.data
  },

  /**
   * GET /api/locations/districts
   * Get all districts (optionally filter by provinceId)
   */
  getDistricts: async (provinceId?: number): Promise<District[]> => {
    const params = provinceId ? { provinceId } : undefined
    const response = await client.get<District[]>('/locations/districts', { params })
    return response.data
  },

  /**
   * GET /api/locations/districts/{id}
   * Get district by ID
   */
  getDistrictById: async (id: number): Promise<District> => {
    const response = await client.get<District>(`/locations/districts/${id}`)
    return response.data
  },
}
