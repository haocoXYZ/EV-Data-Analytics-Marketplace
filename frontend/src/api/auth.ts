import client from './client'
import { LoginRequest, RegisterRequest, AuthResponse } from '../types'

export const authApi = {
  /**
   * POST /api/auth/login
   * Login user and get JWT token
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  /**
   * POST /api/auth/register
   * Register new user (DataProvider or DataConsumer)
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/register', data)
    return response.data
  },
}



















