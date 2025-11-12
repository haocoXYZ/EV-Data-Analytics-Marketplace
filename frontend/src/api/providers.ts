import client from './client'

// Types
export interface ProviderProfile {
  providerId: number
  userId: number
  fullName: string
  email: string
  companyName: string
  companyWebsite?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  provinceId?: number
  provinceName?: string
  createdAt: string
  status: string
}

export interface CreateProviderDto {
  fullName: string
  email: string
  password: string
  companyName: string
  companyWebsite?: string
  contactPhone?: string
  address?: string
  provinceId?: number
}

export interface UpdateProviderDto {
  companyName?: string
  companyWebsite?: string
  contactPhone?: string
  address?: string
  provinceId?: number
}

export interface ProviderEarnings {
  summary: {
    totalEarned: number
    pendingPayout: number
    paidOut: number
    totalRevenueShares: number
    totalPayouts: number
  }
  revenueShares: Array<{
    shareId: number
    paymentId: number
    totalAmount: number
    providerShare: number
    adminShare: number
    calculatedDate: string
    payoutStatus: string
    paymentType: string
  }>
  payouts: Array<{
    payoutId: number
    monthYear: string
    totalDue: number
    payoutDate?: string
    payoutStatus: string
    paymentMethod: string
    transactionRef?: string
  }>
}

export interface MonthlyEarnings {
  year: number
  totalYearlyEarnings: number
  monthlyBreakdown: Array<{
    year: number
    month: number
    monthYear: string
    totalEarned: number
    transactionCount: number
    pendingAmount: number
    paidAmount: number
  }>
}

export interface EarningsByPackageType {
  earningsByPackageType: Array<{
    packageType: string
    totalEarned: number
    transactionCount: number
    pendingAmount: number
    paidAmount: number
  }>
  totalEarnings: number
}

export const providersApi = {
  // Admin: Create provider
  createProvider: async (data: CreateProviderDto) => {
    const response = await client.post('/providers', data)
    return response.data
  },

  // Admin: List all providers
  getAllProviders: async (status?: string) => {
    const params = status ? { status } : {}
    const response = await client.get<{ totalProviders: number; providers: ProviderProfile[] }>('/providers', { params })
    return response.data
  },

  // Admin or Provider: Get provider by ID
  getProviderById: async (id: number) => {
    const response = await client.get<ProviderProfile>(`/providers/${id}`)
    return response.data
  },

  // Provider: Get own profile
  getMyProfile: async () => {
    const response = await client.get<ProviderProfile>('/providers/me')
    return response.data
  },

  // Admin or Provider: Update provider
  updateProvider: async (id: number, data: UpdateProviderDto) => {
    const response = await client.put(`/providers/${id}`, data)
    return response.data
  },

  // Admin: Activate provider
  activateProvider: async (id: number) => {
    const response = await client.post(`/providers/${id}/activate`)
    return response.data
  },

  // Admin: Deactivate provider
  deactivateProvider: async (id: number) => {
    const response = await client.post(`/providers/${id}/deactivate`)
    return response.data
  },

  // Provider: Get earnings summary
  getMyEarnings: async () => {
    const response = await client.get<ProviderEarnings>('/providers/me/earnings')
    return response.data
  },

  // Provider: Get monthly earnings
  getMyMonthlyEarnings: async (year?: number) => {
    const params = year ? { year } : {}
    const response = await client.get<MonthlyEarnings>('/providers/me/earnings/monthly', { params })
    return response.data
  },

  // Provider: Get earnings by package type
  getMyEarningsByPackageType: async () => {
    const response = await client.get<EarningsByPackageType>('/providers/me/earnings/by-package-type')
    return response.data
  },
}
