import axios from 'axios';
import type { User, Idea } from '../types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bizgenius_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bizgenius_token');
      localStorage.removeItem('bizgenius_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('bizgenius_token', response.data.access_token);
      localStorage.setItem('bizgenius_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (email: string, password: string, fullName?: string) => {
    const response = await api.post('/auth/register', { email, password, full_name: fullName });
    if (response.data.access_token) {
      localStorage.setItem('bizgenius_token', response.data.access_token);
      localStorage.setItem('bizgenius_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const ideaService = {
  getAll: async (): Promise<Idea[]> => {
    const response = await api.get('/ideas');
    return response.data;
  },

  getOne: async (id: number): Promise<Idea> => {
    const response = await api.get(`/ideas/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description: string; industry?: string; target_market?: string }): Promise<Idea> => {
    const response = await api.post('/ideas', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ideas/${id}`);
  },

  generate: async (
    id: number,
    options: {
      include_business_plan?: boolean;
      include_financial_model?: boolean;
      include_market_research?: boolean;
      include_competitor_analysis?: boolean;
      include_pitch_deck?: boolean;
    } = {}
  ): Promise<Idea> => {
    const response = await api.post(`/ideas/${id}/generate`, options);
    return response.data;
  },

  export: async (id: number, format: string = 'json'): Promise<Record<string, unknown>> => {
    const response = await api.get(`/documents/export/${id}`, { params: { format } });
    return response.data;
  },
};

export const subscriptionService = {
  createCheckout: async (planType: 'pro' | 'coach'): Promise<{ checkout_url: string }> => {
    const response = await api.post('/subscriptions/create-checkout-session', { plan_type: planType });
    return response.data;
  },

  createPortal: async (): Promise<{ portal_url: string }> => {
    const response = await api.post('/subscriptions/create-portal-session');
    return response.data;
  },

  getStatus: async (): Promise<{ tier: string; status: string; customer_id?: string }> => {
    const response = await api.get('/subscriptions/status');
    return response.data;
  },

  cancel: async (): Promise<void> => {
    await api.post('/subscriptions/cancel');
  },
};

export default api;
