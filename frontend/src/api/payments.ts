import client from './client'
import { PaymentCreateRequest, PaymentResponse, Payment } from '../types'

export const paymentsApi = {
  /**
   * POST /api/payments/create
   * Create payment and get PayOS checkout URL (Consumer only)
   */
  create: async (data: PaymentCreateRequest): Promise<PaymentResponse> => {
    const response = await client.post<PaymentResponse>('/payments/create', data)
    return response.data
  },

  /**
   * GET /api/payments/{id}/check-status
   * Check payment status from PayOS (Consumer only)
   */
  checkStatus: async (id: number): Promise<Payment> => {
    const response = await client.get<Payment>(`/payments/${id}/check-status`)
    return response.data
  },

  /**
   * GET /api/payments/my
   * Get payments by current consumer (Consumer only)
   */
  getMy: async (): Promise<Payment[]> => {
    const response = await client.get<Payment[]>('/payments/my')
    return response.data
  },
}

