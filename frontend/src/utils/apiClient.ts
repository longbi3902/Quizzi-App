/**
 * API Client với tự động refresh token
 */

import { API_ENDPOINTS } from '../constants/api';
import { isTokenExpired } from './tokenUtils';

let refreshPromise: Promise<string | null> | null = null;

/**
 * Lấy access token từ localStorage
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Lấy refresh token từ localStorage
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  // Nếu đang refresh rồi, đợi promise hiện tại
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }

      const response = await fetch(API_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Refresh token thất bại');
      }

      const newAccessToken = data.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Nếu refresh thất bại, xóa tokens và redirect về login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Fetch với tự động refresh token
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = getAccessToken();

  // Kiểm tra token có hết hạn không
  if (!accessToken || isTokenExpired(accessToken)) {
    // Refresh token
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      throw new Error('Không thể refresh token');
    }
  }

  // Thêm Authorization header
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  // Gửi request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Nếu nhận được 401, thử refresh token 1 lần nữa
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      // Thử lại request với token mới
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
};

/**
 * API Client object với các methods tiện lợi
 */
const apiClient = {
  /**
   * GET request
   */
  get: async (url: string, options: RequestInit = {}): Promise<Response> => {
    return apiFetch(url, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  post: async (url: string, body?: any, options: RequestInit = {}): Promise<Response> => {
    return apiFetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: async (url: string, body?: any, options: RequestInit = {}): Promise<Response> => {
    return apiFetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: async (url: string, options: RequestInit = {}): Promise<Response> => {
    return apiFetch(url, {
      ...options,
      method: 'DELETE',
    });
  },
};

export default apiClient;

