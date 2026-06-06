import { apiClient } from './client';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  targetIndustry: string;
  accessCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  login: (data: LoginData) =>
    apiClient.post('/auth/login', data).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),
};
