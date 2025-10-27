import client from './client'
import { Dataset, DatasetModeration } from '../types'

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
   * POST /api/moderation/review
   * Review dataset (approve or reject) - Admin/Moderator only
   */
  review: async (datasetId: number, moderationStatus: 'Approved' | 'Rejected', comments?: string): Promise<void> => {
    await client.post('/moderation/review', {
      datasetId,
      moderationStatus,
      comments
    })
  },

  /**
   * Approve dataset (Admin/Moderator only)
   */
  approve: async (datasetId: number, comments?: string): Promise<void> => {
    return moderationApi.review(datasetId, 'Approved', comments)
  },

  /**
   * Reject dataset (Admin/Moderator only)
   */
  reject: async (datasetId: number, comments: string): Promise<void> => {
    return moderationApi.review(datasetId, 'Rejected', comments)
  },

  /**
   * GET /api/moderation/{id}/preview
   * Preview dataset data for quality check (Moderator only)
   */
  preview: async (datasetId: number, sampleSize: number = 10): Promise<any> => {
    const response = await client.get(`/moderation/${datasetId}/preview`, {
      params: { sampleSize }
    })
    return response.data
  },

  /**
   * GET /api/moderation/{id}/download
   * Download dataset file for review (Moderator only)
   */
  downloadForReview: async (datasetId: number): Promise<Blob> => {
    const response = await client.get(`/moderation/${datasetId}/download`, {
      responseType: 'blob'
    })
    return response.data
  },
}

