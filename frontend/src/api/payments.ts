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
   * GET /api/payments/{id}/status
   * Check payment status (Consumer only)
   */
  getStatus: async (id: number): Promise<Payment> => {
    const response = await client.get<Payment>(`/payments/${id}/status`)
    return response.data
  },
}






