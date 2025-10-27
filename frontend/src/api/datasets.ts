import client from './client'
import { Dataset } from '../types'

export const datasetsApi = {
  /**
   * GET /api/datasets
   * Get all approved datasets (public)
   */
  getAll: async (params?: { category?: string; search?: string }): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/datasets', { params })
    return response.data
  },

  /**
   * GET /api/datasets/{id}
   * Get dataset by ID (public)
   */
  getById: async (id: number): Promise<Dataset> => {
    const response = await client.get<Dataset>(`/datasets/${id}`)
    return response.data
  },

  /**
   * GET /api/datasets/my
   * Get datasets uploaded by current provider (Provider only)
   */
  getMy: async (): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/datasets/my')
    return response.data
  },

  /**
   * POST /api/datasets
   * Create new dataset with file upload (Provider only)
   */
  create: async (formData: FormData): Promise<Dataset> => {
    const response = await client.post<Dataset>('/datasets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * GET /api/datasets/{id}/download
   * Download dataset file (Consumer only, requires purchase)
   */
  download: async (id: number): Promise<Blob> => {
    const response = await client.get(`/datasets/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * GET /api/datasets/{id}/records
   * Get dataset records (Consumer only, requires purchase)
   */
  getRecords: async (id: number, page: number = 1, pageSize: number = 50): Promise<any> => {
    const response = await client.get(`/datasets/${id}/records`, {
      params: { page, pageSize },
    })
    return response.data
  },

  /**
   * GET /api/datasets/my-purchases
   * Get datasets purchased by current consumer (Consumer only)
   */
  getMyPurchases: async (): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/datasets/my-purchases')
    return response.data
  },
}

