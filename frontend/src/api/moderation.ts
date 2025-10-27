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
}

