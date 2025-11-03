import client from './client'
import { Dataset, DatasetModerationDetail, DataPreviewResponse, ModerationActionDto } from '../types'

export const moderationApi = {
  /**
   * GET /api/moderation/pending
   * Get all pending datasets for moderation (Admin/Moderator only)
   */
  getPending: async (): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/moderation/pending')
    return response.data
  },

  /**
   * GET /api/moderation/all
   * Get all datasets with optional status filter (Admin/Moderator only)
   */
  getAll: async (status?: string): Promise<Dataset[]> => {
    const response = await client.get<Dataset[]>('/moderation/all', {
      params: status ? { status } : undefined
    })
    return response.data
  },

  /**
   * GET /api/moderation/{id}
   * Get dataset details for moderation (Admin/Moderator only)
   */
  getById: async (datasetId: number): Promise<DatasetModerationDetail> => {
    const response = await client.get<DatasetModerationDetail>(`/moderation/${datasetId}`)
    return response.data
  },

  /**
   * GET /api/moderation/{id}/preview-data
   * Preview dataset records with pagination (Moderator only)
   */
  preview: async (datasetId: number, page: number = 1, pageSize: number = 50): Promise<DataPreviewResponse> => {
    const response = await client.get<DataPreviewResponse>(`/moderation/${datasetId}/preview-data`, {
      params: { page, pageSize }
    })
    return response.data
  },

  /**
   * GET /api/moderation/{id}/download
   * Download dataset CSV for review (Moderator only)
   */
  downloadForReview: async (datasetId: number): Promise<Blob> => {
    const response = await client.get(`/moderation/${datasetId}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * PUT /api/moderation/{id}/approve
   * Approve dataset (Admin/Moderator only)
   */
  approve: async (datasetId: number, comments?: string): Promise<{ message: string }> => {
    const response = await client.put(`/moderation/${datasetId}/approve`, {
      comments
    } as ModerationActionDto)
    return response.data
  },

  /**
   * PUT /api/moderation/{id}/reject
   * Reject dataset (Admin/Moderator only)
   */
  reject: async (datasetId: number, comments: string): Promise<{ message: string }> => {
    const response = await client.put(`/moderation/${datasetId}/reject`, {
      comments
    } as ModerationActionDto)
    return response.data
  },
}
