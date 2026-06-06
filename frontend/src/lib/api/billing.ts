import { apiClient } from './client';

export const billingApi = {
  getSubscription: () => apiClient.get('/billing/subscription').then((r) => r.data),

  createCheckout: (data: { priceId: string; successUrl: string; cancelUrl: string }) =>
    apiClient.post('/billing/checkout', data).then((r) => r.data),

  purchaseCredits: (data: { priceId: string; creditAmount: number; successUrl: string; cancelUrl: string }) =>
    apiClient.post('/billing/credits/purchase', data).then((r) => r.data),

  createPortalSession: (returnUrl: string) =>
    apiClient.post('/billing/portal', { returnUrl }).then((r) => r.data),

  getBalance: () => apiClient.get('/credits/balance').then((r) => r.data),

  getTransactions: (page = 1, limit = 20) =>
    apiClient.get('/credits/transactions', { params: { page, limit } }).then((r) => r.data),
};
