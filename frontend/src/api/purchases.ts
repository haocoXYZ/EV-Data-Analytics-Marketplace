import client from './client'
import {
  DataPackagePurchaseRequest,
  SubscriptionPurchaseRequest,
  APIPackagePurchaseRequest,
  DataPackagePurchase,
  SubscriptionPackagePurchase,
  APIPackagePurchase,
  MyPurchasesResponse,
  DataPackagePreview,
} from '../types'

export const purchasesApi = {
  // ============= DATA PACKAGE =============
  
  /**
   * GET /api/data-packages/preview
   * Preview data before purchase
   */
  previewDataPackage: async (params: {
    provinceId: number
    districtId?: number
    startDate?: string
    endDate?: string
  }): Promise<DataPackagePreview> => {
    const response = await client.get<DataPackagePreview>('/data-packages/preview', { params })
    return response.data
  },

  /**
   * POST /api/data-packages/purchase
   * Create data package purchase (Consumer only)
   */
  createDataPackage: async (data: DataPackagePurchaseRequest): Promise<{
    message: string
    purchaseId: number
    rowCount: number
    totalPrice: number
    status: string
    paymentInfo: {
      paymentType: string
      referenceId: number
      amount: number
    }
  }> => {
    const response = await client.post('/data-packages/purchase', data)
    return response.data
  },

  /**
   * GET /api/data-packages/{purchaseId}/download
   * Download purchased data package as CSV
   */
  downloadDataPackage: async (purchaseId: number): Promise<Blob> => {
    const response = await client.get(`/data-packages/${purchaseId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * GET /api/data-packages/my-purchases
   * Get consumer's data package purchases
   */
  getMyDataPackages: async (): Promise<DataPackagePurchase[]> => {
    const response = await client.get<DataPackagePurchase[]>('/data-packages/my-purchases')
    return response.data
  },

  // ============= SUBSCRIPTION PACKAGE =============

  /**
   * POST /api/subscription-packages/purchase
   * Create subscription package purchase (Consumer only)
   */
  createSubscription: async (data: SubscriptionPurchaseRequest): Promise<{
    message: string
    subscriptionId: number
    monthlyPrice: number
    status: string
    paymentInfo: {
      paymentType: string
      referenceId: number
      amount: number
    }
  }> => {
    const response = await client.post('/subscription-packages/purchase', data)
    return response.data
  },

  /**
   * GET /api/purchases/my-subscriptions
   * Get consumer's subscriptions
   */
  getMySubscriptions: async (): Promise<SubscriptionPackagePurchase[]> => {
    const response = await client.get<SubscriptionPackagePurchase[]>('/purchases/my-subscriptions')
    return response.data
  },

  /**
   * POST /api/subscription-packages/{id}/cancel
   * Cancel subscription
   */
  cancelSubscription: async (subscriptionId: number): Promise<{ message: string }> => {
    const response = await client.post(`/subscription-packages/${subscriptionId}/cancel`)
    return response.data
  },

  // ============= API PACKAGE =============

  /**
   * POST /api/api-packages/purchase
   * Create API package purchase (Consumer only)
   */
  createAPIPackage: async (data: APIPackagePurchaseRequest): Promise<{
    message: string
    apiPurchaseId: number
    apiCallsPurchased: number
    pricePerCall: number
    totalPaid: number
    status: string
    paymentInfo: {
      paymentType: string
      referenceId: number
      amount: number
    }
  }> => {
    const response = await client.post('/api-packages/purchase', data)
    return response.data
  },

  /**
   * GET /api/purchases/my-api-packages
   * Get consumer's API packages
   */
  getMyAPIPackages: async (): Promise<APIPackagePurchase[]> => {
    const response = await client.get<Array<{
      apiPurchaseId: number
      provinceName?: string
      districtName?: string
      apiCallsPurchased: number
      apiCallsUsed: number
      remainingCalls: number
      pricePerCall: number
      totalPaid: number
      purchaseDate: string
      expiryDate?: string
      status: string
      apiKeys?: any[]
    }>>('/purchases/my-api-packages')

    // Transform backend response (apiPurchaseId) to frontend format (purchaseId)
    return response.data.map(pkg => ({
      purchaseId: pkg.apiPurchaseId,  // Rename field
      consumerId: 0, // Not returned by backend but required by type
      totalAPICalls: pkg.apiCallsPurchased,
      apiCallsUsed: pkg.apiCallsUsed,
      apiCallsRemaining: pkg.remainingCalls,
      pricePerCall: pkg.pricePerCall,
      totalPrice: pkg.totalPaid,
      status: pkg.status,
      purchaseDate: pkg.purchaseDate,
      expiryDate: pkg.expiryDate,
      provinceId: undefined,
      districtId: undefined
    }))
  },

  // ============= ALL PURCHASES =============

  /**
   * GET /api/purchases/my-purchases
   * Get all purchases for current consumer (all types)
   */
  getMy: async (): Promise<MyPurchasesResponse> => {
    const response = await client.get<MyPurchasesResponse>('/purchases/my-purchases')
    return response.data
  },
}






