import axios from 'axios';
import { API_URL } from '../lib/utils';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends httpOnly refresh cookie
});

// Attach Bearer token to every request
client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401: try to refresh once, then retry
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Never retry the refresh endpoint itself — it would cause an infinite loop
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch {
        setAccessToken(null);
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
