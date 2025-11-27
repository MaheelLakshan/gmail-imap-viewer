import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IAuthResponse, IUserResponse, IEmailsResponse, ISearchResponse, ISyncResponse, IStatsResponse, IPreferencesResponse, IEmail, IFolder, IUserPreference } from '../types';

import { DUMMY_USER, DUMMY_EMAILS, DUMMY_STATS, DUMMY_PREFERENCES, DUMMY_FOLDERS, generatePaginatedEmails, searchDummyEmails, simulateApiDelay } from '../data/dummyData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================

export const authAPI = {
  getGoogleAuthUrl: async (): Promise<AxiosResponse<IAuthResponse>> => {
    return api.get<IAuthResponse>('/auth/google');
  },

  getCurrentUser: async (): Promise<AxiosResponse<IUserResponse>> => {
    return api.get<IUserResponse>('/auth/me');
  },

  logout: async (): Promise<AxiosResponse<{ message: string }>> => {
    return api.post('/auth/logout');
  },

  refreshToken: async (): Promise<AxiosResponse<{ message: string }>> => {
    return api.post('/auth/refresh');
  },
};

// ============================================
// Email API
// ============================================

export const emailAPI = {
  getEmails: async (
    params: {
      page?: number;
      limit?: number;
      folder?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<AxiosResponse<IEmailsResponse>> => {
    return api.get<IEmailsResponse>('/emails', { params });
  },

  getEmail: async (id: number): Promise<AxiosResponse<{ email: IEmail }>> => {
    return api.get<{ email: IEmail }>(`/emails/${id}`);
  },

  getFreshEmail: async (id: number): Promise<AxiosResponse<{ email: IEmail }>> => {
    return api.get<{ email: IEmail }>(`/emails/${id}/fresh`);
  },

  searchEmails: async (query: string, params: { page?: number; limit?: number } = {}): Promise<AxiosResponse<ISearchResponse>> => {
    return api.get<ISearchResponse>('/emails/search', { params: { q: query, ...params } });
  },

  syncEmails: async (
    options: {
      folder?: string;
      limit?: number;
    } = {}
  ): Promise<AxiosResponse<ISyncResponse>> => {
    return api.post<ISyncResponse>('/emails/sync', options);
  },

  getFolders: async (): Promise<AxiosResponse<{ folders: IFolder[] }>> => {
    return api.get<{ folders: IFolder[] }>('/emails/folders');
  },

  getStats: async (): Promise<AxiosResponse<{ stats: Array<{ folder: string; total: number; unread: number }> }>> => {
    return api.get('/emails/stats');
  },

  markAsRead: async (id: number): Promise<AxiosResponse<{ message: string }>> => {
    return api.patch(`/emails/${id}/read`);
  },

  toggleStar: async (id: number): Promise<AxiosResponse<{ message: string; is_starred: boolean }>> => {
    return api.patch(`/emails/${id}/star`);
  },
};

// ============================================
// User API
// ============================================

export const userAPI = {
  getProfile: async (): Promise<AxiosResponse<IUserResponse>> => {
    return api.get<IUserResponse>('/users/profile');
  },

  getStats: async (): Promise<AxiosResponse<IStatsResponse>> => {
    return api.get<IStatsResponse>('/users/stats');
  },

  getPreferences: async (): Promise<AxiosResponse<IPreferencesResponse>> => {
    return api.get<IPreferencesResponse>('/users/preferences');
  },

  updatePreferences: async (data: Partial<IUserPreference>): Promise<AxiosResponse<{ message: string; preferences: IUserPreference }>> => {
    return api.put('/users/preferences', data);
  },

  deleteAccount: async (): Promise<AxiosResponse<{ message: string }>> => {
    return api.delete('/users/account');
  },
};

export default api;
