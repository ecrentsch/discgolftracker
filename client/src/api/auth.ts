import client from './client';
import type { AuthResponse, UserMe } from '../../../shared/src/types';

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    client.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<AuthResponse>('/auth/login', data).then(r => r.data),

  logout: () =>
    client.post('/auth/logout').then(r => r.data),

  refresh: () =>
    client.post<AuthResponse>('/auth/refresh').then(r => r.data),

  me: () =>
    client.get<{ user: UserMe }>('/auth/me').then(r => r.data.user),
};
