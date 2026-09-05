// ═══════════════════════════════════════════════════════════
// Claritas Unified Production API Client
// Standardizes headers, dynamic base URLs, and token refresh
// ═══════════════════════════════════════════════════════════

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('claritas_token') || sessionStorage.getItem('claritas_token') || '';
}

export function getRefreshToken() {
  const localUser = localStorage.getItem('claritas_user');
  const sessionUser = sessionStorage.getItem('claritas_user');
  try {
    const parsed = JSON.parse(localUser || sessionUser || '{}');
    return parsed.refreshToken || localStorage.getItem('claritas_refresh_token') || sessionStorage.getItem('claritas_refresh_token') || '';
  } catch {
    return '';
  }
}

export function setTokens({ token, refreshToken, rememberMe = false }) {
  if (rememberMe) {
    if (token) localStorage.setItem('claritas_token', token);
    if (refreshToken) localStorage.setItem('claritas_refresh_token', refreshToken);
  } else {
    if (token) sessionStorage.setItem('claritas_token', token);
    if (refreshToken) sessionStorage.setItem('claritas_refresh_token', refreshToken);
  }
}

export function clearAuthStorage() {
  localStorage.removeItem('claritas_user');
  sessionStorage.removeItem('claritas_user');
  localStorage.removeItem('claritas_token');
  sessionStorage.removeItem('claritas_token');
  localStorage.removeItem('claritas_refresh_token');
  sessionStorage.removeItem('claritas_refresh_token');
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session expired');

  const rememberMe = Boolean(localStorage.getItem('claritas_token'));
  setTokens({ token: data.token, rememberMe });
  return data.token;
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If body is FormData or file, remove Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response = await fetch(url, { ...options, headers });

  // Handle Token Expiry & Automatic Refresh Replay
  if (response.status === 401 && token) {
    const clone = response.clone();
    try {
      const errData = await clone.json();
      if (errData.code === 'TOKEN_EXPIRED') {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            onRefreshed(newToken);
          } catch (refreshErr) {
            isRefreshing = false;
            clearAuthStorage();
            window.location.href = '/login';
            throw refreshErr;
          }
        }

        const retryOriginalRequest = new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            headers.Authorization = `Bearer ${newToken}`;
            resolve(fetch(url, { ...options, headers }));
          });
        });

        response = await retryOriginalRequest;
      }
    } catch {
      // Not JSON or refresh failed
    }
  }

  const responseText = await response.text();
  let data;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { raw: responseText };
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (url, headers = {}) => request(url, { method: 'GET', headers }),
  post: (url, body, headers = {}) => request(url, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (url, body, headers = {}) => request(url, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (url, body, headers = {}) => request(url, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (url, headers = {}) => request(url, { method: 'DELETE', headers }),
};

export default apiClient;
