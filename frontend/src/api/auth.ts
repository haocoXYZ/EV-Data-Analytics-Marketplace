import client from './client'
import { LoginRequest, RegisterRequest, AuthResponse } from '../types'

export interface UserProfile {
  user: {
    userId: number
    fullName: string
    email: string
    role: string
    status: string
    createdAt: string
  }
  provider?: {
    providerId: number
    companyName: string
    companyWebsite?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    provinceId?: number
    provinceName?: string
  }
  consumer?: {
    consumerId: number
    organizationName?: string
    contactPerson?: string
    contactNumber?: string
    billingEmail?: string
  }
}

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

  /**
   * GET /api/auth/profile
   * Get current authenticated user's profile with provider/consumer details
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await client.get<UserProfile>('/auth/profile')
    return response.data
  },
}



















