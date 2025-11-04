import client from './client'
import { Dataset } from '../types'

export const datasetsApi = {
  /**
   * GET /api/datasets/template
   * Download CSV template for dataset upload
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await client.get('/datasets/template', {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * GET /api/datasets
   * Get all approved datasets (public)
   */
  getAll: async (params?: { 
    status?: string
    moderationStatus?: string
    providerId?: number
    category?: string
  }): Promise<Dataset[]> => {
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
   * GET /api/datasets/my-datasets
   * Get datasets uploaded by current provider (Provider only)
   */
  getMy: async (): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/datasets/my-datasets')
    return response.data
  },

  /**
   * POST /api/datasets
   * Upload new dataset with CSV file (Provider only)
   * FormData fields: Name, Description, Category, CsvFile
   */
  upload: async (formData: FormData): Promise<Dataset> => {
    const response = await client.post<Dataset>('/datasets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
