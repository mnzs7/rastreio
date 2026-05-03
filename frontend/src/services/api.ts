import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error: AxiosError<{ message: string | string[] }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message;
    const readable = Array.isArray(message) ? message.join(', ') : message;
    return Promise.reject(new Error(readable || 'Erro desconhecido'));
  },
);

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<any, any>('/auth/login', { email, senha }),
  me: () => api.get<any, any>('/auth/me'),
  changePassword: (data: { senha_atual: string; nova_senha: string }) =>
    api.patch<any, any>('/auth/change-password', data),
};

export const packagesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<any, any>('/packages', { params }),
  get: (id: string) => api.get<any, any>(`/packages/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<any, any>('/packages', data),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch<any, any>(`/packages/${id}/status`, data),
  remove: (id: string) => api.delete<any, any>(`/packages/${id}`),
  stats: () => api.get<any, any>('/packages/stats'),
};

export const trackingApi = {
  track: (codigo: string) => api.get<any, any>(`/tracking/${codigo}`),
  addHistory: (packageId: string, data: Record<string, unknown>) =>
    api.post<any, any>(`/tracking/${packageId}/history`, data),
};

export const adminEncomendasApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<any, any>('/admin/encomendas', { params }),
  get: (id: string) => api.get<any, any>(`/admin/encomendas/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<any, any>('/admin/encomendas', data),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch<any, any>(`/admin/encomendas/${id}/status`, data),
  remove: (id: string) => api.delete<any, any>(`/admin/encomendas/${id}`),
};

export const adminEnderecosApi = {
  lookupCep: (cep: string) => api.get<any, any>(`/admin/enderecos/cep/${cep}`),
};

export const adminDashboardApi = {
  stats: () => api.get<any, any>('/admin/dashboard/stats'),
};
