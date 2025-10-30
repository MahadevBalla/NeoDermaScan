import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get tokens from storage (both localStorage and sessionStorage)
const getTokens = () => {
  // Check localStorage first
  let tokens = localStorage.getItem('authTokens');
  if (tokens) {
    return JSON.parse(tokens);
  }

  // Then check sessionStorage
  tokens = sessionStorage.getItem('authTokens');
  if (tokens) {
    return JSON.parse(tokens);
  }

  return null;
};

// Store tokens in the appropriate storage
const storeTokens = (tokens, rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    sessionStorage.removeItem('authTokens');
  } else {
    sessionStorage.setItem('authTokens', JSON.stringify(tokens));
    localStorage.removeItem('authTokens');
  }
};

// Add request interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const tokens = getTokens();
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = getTokens();
        if (tokens && tokens.refresh) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: tokens.refresh,
          });

          const newAccess = response.data.access;
          const updatedTokens = { ...tokens, access: newAccess };

          // Determine which storage to use based on where the original tokens were stored
          const rememberMe = localStorage.getItem('authTokens') !== null;
          storeTokens(updatedTokens, rememberMe);

          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, clear tokens and redirect to login
        localStorage.removeItem('authTokens');
        sessionStorage.removeItem('authTokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for API calls
export const get = (url) => api.get(url).then(response => response.data);
export const post = (url, data) => api.post(url, data).then(response => response.data);
export const patch = (url, data) => api.patch(url, data).then(response => response.data);

// Auth API functions
export const authAPI = {
  login: async (email, password, rememberMe = true) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
      email,
      password,
    });

    const tokens = response.data;
    storeTokens(tokens, rememberMe);

    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authTokens');
    sessionStorage.removeItem('authTokens');
  },

  getCurrentUser: () => {
    // For now, we don't store user data separately
    // In a real app, you might want to store user info in the tokens or make a separate API call
    return null;
  },

  isAuthenticated: () => {
    const tokens = getTokens();
    return !!(tokens && tokens.access);
  },

  getAccessToken: () => {
    const tokens = getTokens();
    return tokens ? tokens.access : null;
  },

  getRefreshToken: () => {
    const tokens = getTokens();
    return tokens ? tokens.refresh : null;
  }
};

export default api;