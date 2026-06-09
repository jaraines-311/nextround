import { apiClient } from './client';

export const profileApi = {
  get: () => apiClient.get('/candidate-profile').then((r) => r.data),
  update: (data: any) => apiClient.put('/candidate-profile', data).then((r) => r.data),
};

export const resumeApi = {
  list: () => apiClient.get('/resumes').then((r) => r.data),
  get: (id: string) => apiClient.get(`/resumes/${id}`).then((r) => r.data),
  create: (data: any) => apiClient.post('/resumes', data).then((r) => r.data),
  upload: (file: File, name?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    return apiClient.post('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  update: (id: string, data: any) => apiClient.put(`/resumes/${id}`, data).then((r) => r.data),
  setActive: (id: string) => apiClient.patch(`/resumes/${id}/activate`).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/resumes/${id}`).then((r) => r.data),
};

export const jobsApi = {
  list: () => apiClient.get('/jobs').then((r) => r.data),
  get: (id: string) => apiClient.get(`/jobs/${id}`).then((r) => r.data),
  create: (data: any) => apiClient.post('/jobs', data).then((r) => r.data),
  fetchUrl: (url: string) => apiClient.post('/jobs/fetch-url', { url }).then((r) => r.data),
  update: (id: string, data: any) => apiClient.put(`/jobs/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/jobs/${id}`).then((r) => r.data),
  upcomingInterviews: () => apiClient.get('/jobs/upcoming-interviews').then((r) => r.data),
  addInterview: (jobId: string, data: any) => apiClient.post(`/jobs/${jobId}/interviews`, data).then((r) => r.data),
  updateInterview: (interviewId: string, data: any) => apiClient.patch(`/jobs/interviews/${interviewId}`, data).then((r) => r.data),
  deleteInterview: (interviewId: string) => apiClient.delete(`/jobs/interviews/${interviewId}`).then((r) => r.data),
};

export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard').then((r) => r.data),
};
