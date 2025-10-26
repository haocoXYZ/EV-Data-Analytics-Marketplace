// API Configuration và Base Functions
const API_BASE_URL = 'http://localhost:5258/api';

// Get token from localStorage
const getToken = (): string | null => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

// Base fetch function with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// API Functions
export const api = {
  // Auth APIs
  auth: {
    login: async (email: string, password: string) => {
      return apiFetch<{
        token: string;
        userId: number;
        fullName: string;
        email: string;
        role: string;
        expiresAt: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    register: async (data: {
      fullName: string;
      email: string;
      password: string;
      role: string;
      companyName?: string;
      companyWebsite?: string;
      organizationName?: string;
    }) => {
      return apiFetch<{
        token: string;
        userId: number;
        fullName: string;
        email: string;
        role: string;
        expiresAt: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Dataset APIs
  datasets: {
    // Public - Get all datasets
    getAll: async (category?: string, search?: string) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      return apiFetch<any[]>(`/datasets?${params.toString()}`);
    },

    // Public - Get dataset by ID
    getById: async (id: number) => {
      return apiFetch<any>(`/datasets/${id}`);
    },

    // Provider - Get my datasets
    getMyDatasets: async () => {
      return apiFetch<any[]>('/datasets/my');
    },

    // Consumer - Get purchased datasets
    getMyPurchases: async () => {
      return apiFetch<any[]>('/datasets/my-purchases');
    },

    // Provider - Upload dataset
    upload: async (data: FormData) => {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/datasets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },

    // Consumer - Download dataset
    download: async (id: number): Promise<Blob> => {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/datasets/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return response.blob();
    },

    // Consumer - Get dataset records
    getRecords: async (id: number, page: number = 1, pageSize: number = 100) => {
      return apiFetch<any>(`/datasets/${id}/records?page=${page}&pageSize=${pageSize}`);
    },
  },

  // Purchase APIs
  purchases: {
    // Create one-time purchase
    createOneTime: async (data: {
      datasetId: number;
      startDate: string;
      endDate: string;
      licenseType: string;
    }) => {
      return apiFetch<any>('/purchases/onetime', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Create subscription
    createSubscription: async (data: {
      datasetId: number;
      provinceId: number;
      renewalCycle: string;
      durationMonths: number;
    }) => {
      return apiFetch<any>('/purchases/subscription', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Create API package
    createAPIPackage: async (data: {
      datasetId: number;
      apiCallsCount: number;
    }) => {
      return apiFetch<any>('/purchases/api-package', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Get my purchases
    getMyOneTime: async () => {
      return apiFetch<any[]>('/purchases/my/onetime');
    },

    getMySubscriptions: async () => {
      return apiFetch<any[]>('/purchases/my/subscriptions');
    },

    getMyAPIPackages: async () => {
      return apiFetch<any[]>('/purchases/my/api');
    },
  },

  // Payment APIs
  payments: {
    // Create payment
    create: async (data: {
      paymentType: string;
      referenceId: number;
    }) => {
      return apiFetch<{
        paymentId: number;
        payosOrderId: string;
        checkoutUrl: string;
        qrCode: string;
        amount: number;
        status: string;
      }>('/payments/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Check payment status
    checkStatus: async (paymentId: number) => {
      return apiFetch<any>(`/payments/${paymentId}/check-status`);
    },

    // Get my payments
    getMy: async () => {
      return apiFetch<any[]>('/payments/my');
    },
  },

  // Moderation APIs (Moderator)
  moderation: {
    getPending: async () => {
      return apiFetch<any[]>('/moderation/pending');
    },

    approve: async (datasetId: number, comments?: string) => {
      return apiFetch<any>(`/moderation/${datasetId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      });
    },

    reject: async (datasetId: number, comments: string) => {
      return apiFetch<any>(`/moderation/${datasetId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ comments }),
      });
    },
  },

  // Pricing Tiers APIs (Admin)
  pricingTiers: {
    getAll: async () => {
      return apiFetch<any[]>('/pricingtiers');
    },

    create: async (data: {
      tierName: string;
      description?: string;
      basePricePerMb?: number;
      apiPricePerCall?: number;
      subscriptionPricePerRegion?: number;
      providerCommissionPercent: number;
      adminCommissionPercent: number;
    }) => {
      return apiFetch<any>('/pricingtiers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: any) => {
      return apiFetch<any>(`/pricingtiers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return apiFetch<any>(`/pricingtiers/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Payout APIs (Admin)
  payouts: {
    getProviders: async () => {
      return apiFetch<any[]>('/payouts/providers');
    },

    getAdmin: async () => {
      return apiFetch<any>('/payouts/admin');
    },

    createPayout: async (data: {
      providerId: number;
      amount: number;
      payoutMethod: string;
    }) => {
      return apiFetch<any>('/payouts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};

export default api;

