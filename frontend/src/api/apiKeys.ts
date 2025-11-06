import client from './client'
import { APIKey, APIKeyGenerateRequest } from '../types'

export const apiKeysApi = {
  /**
   * POST /api/api-packages/{purchaseId}/generate-key
   * Generate new API key for package
   */
  generate: async (purchaseId: number, data?: APIKeyGenerateRequest): Promise<APIKey> => {
    const response = await client.post<{
      keyId: number
      keyValue: string
      keyName: string
      createdAt: string
      message: string
      warning: string
    }>(
      `/api-packages/${purchaseId}/generate-key`,
      data || {}
    )

    // Transform backend response (keyValue) to frontend format (apiKey)
    return {
      keyId: response.data.keyId,
      apiKey: response.data.keyValue,
      keyName: response.data.keyName,
      createdAt: response.data.createdAt,
      isActive: true,
      lastUsedAt: undefined
    }
  },

  /**
   * GET /api/api-packages/{purchaseId}/keys
   * Get all API keys for package
   */
  getAll: async (purchaseId: number): Promise<APIKey[]> => {
    const response = await client.get<Array<{
      keyId: number
      keyValue: string
      keyName?: string
      isActive: boolean
      createdAt: string
      lastUsedAt?: string
      requestsToday?: number
      revokedAt?: string
      revokedReason?: string
    }>>(`/api-packages/${purchaseId}/keys`)

    // Transform backend response (keyValue) to frontend format (apiKey)
    return response.data.map(key => ({
      keyId: key.keyId,
      apiKey: key.keyValue,
      keyName: key.keyName,
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt
    }))
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
    page?: number
    pageSize?: number
  }): Promise<{
    totalRecords: number
    currentPage: number
    pageSize: number
    totalPages: number
    remainingCalls: number
    records: any[]
  }> => {
    const response = await client.get('/data', {
      headers: {
        'X-API-Key': apiKey
      },
      params: {
        ...params,
        page: params.page || 1,
        pageSize: params.pageSize || 100
      }
    })
    return response.data
  },
}
