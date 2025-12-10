import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
}

export const authApi = {
  register: async (email: string, password: string, confirmPassword: string) => {
    return apiClient.post('/api/auth/register', {
      email,
      password,
      confirmPassword,
    }) as Promise<AuthResponse>;
  },

  login: async (email: string, password: string) => {
    return apiClient.post('/api/auth/login', {
      email,
      password,
    }) as Promise<AuthResponse>;
  },

  getMe: async () => {
    return apiClient.get('/api/auth/me') as Promise<{ user: User }>;
  },

  logout: async () => {
    return apiClient.post('/api/auth/logout', {});
  },
};
