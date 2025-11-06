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
   * Get a specific province by ID
   */
  getProvince: async (id: number): Promise<Province> => {
    const response = await client.get<Province>(`/locations/provinces/${id}`)
    return response.data
  },

  /**
   * GET /api/locations/provinces/{provinceId}/districts
   * Get all districts for a specific province
   */
  getDistrictsByProvince: async (provinceId: number): Promise<District[]> => {
    const response = await client.get<District[]>(`/locations/provinces/${provinceId}/districts`)
    return response.data
  },

  /**
   * GET /api/locations/districts
   * Get all districts (optionally filtered by province)
   */
  getAllDistricts: async (provinceId?: number): Promise<District[]> => {
    const params = provinceId ? { provinceId } : undefined
    const response = await client.get<District[]>('/locations/districts', { params })
    return response.data
  },

  /**
   * GET /api/locations/districts/{id}
   * Get a specific district by ID
   */
  getDistrict: async (id: number): Promise<District & { provinceName: string }> => {
    const response = await client.get<District & { provinceName: string }>(`/locations/districts/${id}`)
    return response.data
  },

  /**
   * GET /api/locations/stats
   * Get location statistics
   */
  getStats: async (): Promise<{
    totalProvinces: number
    totalDistricts: number
    provincesWithDistricts: number
    topProvinces: Array<{
      provinceId: number
      provinceName: string
      districtCount: number
    }>
  }> => {
    const response = await client.get('/locations/stats')
    return response.data
  }
}
