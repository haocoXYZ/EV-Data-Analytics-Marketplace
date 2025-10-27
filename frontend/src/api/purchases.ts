import client from './client'
import {
  OneTimePurchaseRequest,
  SubscriptionRequest,
  APIPackageRequest,
  Purchase,
} from '../types'

export const purchasesApi = {
  /**
   * POST /api/purchases/onetime
   * Create one-time purchase (Consumer only)
   */
  createOneTime: async (data: OneTimePurchaseRequest): Promise<Purchase> => {
    const response = await client.post<Purchase>('/purchases/onetime', data)
    return response.data
  },

  /**
   * POST /api/purchases/subscription
   * Create subscription (Consumer only)
   */
  createSubscription: async (data: SubscriptionRequest): Promise<Purchase> => {
    const response = await client.post<Purchase>('/purchases/subscription', data)
    return response.data
  },

  /**
   * POST /api/purchases/apipackage
   * Create API package purchase (Consumer only)
   */
  createAPIPackage: async (data: APIPackageRequest): Promise<Purchase> => {
    const response = await client.post<Purchase>('/purchases/apipackage', data)
    return response.data
  },

  /**
   * GET /api/purchases/my
   * Get purchases by current consumer (Consumer only)
   */
  getMy: async (): Promise<Purchase[]> => {
    const response = await client.get<Purchase[]>('/purchases/my')
    return response.data
  },
}

