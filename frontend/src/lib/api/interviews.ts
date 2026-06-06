import { apiClient } from './client';

export const interviewsApi = {
  create: (data: { type: string; mode: string; resumeId?: string; jobId?: string; title?: string }) =>
    apiClient.post('/interviews', data).then((r) => r.data),

  list: (page = 1, limit = 10) =>
    apiClient.get('/interviews', { params: { page, limit } }).then((r) => r.data),

  get: (id: string) => apiClient.get(`/interviews/${id}`).then((r) => r.data),

  answer: (id: string, data: { answer: string; durationSeconds?: number; audioUrl?: string }) =>
    apiClient.post(`/interviews/${id}/answer`, data).then((r) => r.data),

  complete: (id: string) => apiClient.patch(`/interviews/${id}/complete`).then((r) => r.data),
};

export const feedbackApi = {
  generate: (sessionId: string) =>
    apiClient.post(`/feedback/sessions/${sessionId}/generate`).then((r) => r.data),

  getBySession: (sessionId: string) =>
    apiClient.get(`/feedback/sessions/${sessionId}`).then((r) => r.data),

  list: (page = 1, limit = 10) =>
    apiClient.get('/feedback', { params: { page, limit } }).then((r) => r.data),
};
