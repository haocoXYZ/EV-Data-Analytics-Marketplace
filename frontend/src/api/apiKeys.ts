import client from './client'
import { APIKey, APIKeyGenerateRequest } from '../types'

export const apiKeysApi = {
  /**
   * POST /api/api-packages/{purchaseId}/generate-key
   * Generate new API key for package
   */
  generate: async (purchaseId: number, data?: APIKeyGenerateRequest): Promise<APIKey> => {
    const response = await client.post<APIKey>(
      `/api-packages/${purchaseId}/generate-key`,
      data || {}
    )
    return response.data
  },

  /**
   * GET /api/api-packages/{purchaseId}/keys
   * Get all API keys for package
   */
  getAll: async (purchaseId: number): Promise<APIKey[]> => {
    const response = await client.get<APIKey[]>(`/api-packages/${purchaseId}/keys`)
    return response.data
  },

  /**
   * POST /api/api-packages/keys/{keyId}/revoke
   * Revoke API key
   */
  revoke: async (keyId: number): Promise<{ message: string }> => {
    const response = await client.post(`/api-packages/keys/${keyId}/revoke`)
    return response.data
  },

  /**
   * GET /api/data
   * Public API endpoint (requires X-API-Key header)
   */
  getData: async (apiKey: string, params: {
    provinceId?: number
    districtId?: number
    startDate?: string
    endDate?: string
  }): Promise<any> => {
    const response = await client.get('/data', {
      headers: {
        'X-API-Key': apiKey
      },
      params
    })
    return response.data
  },
}
