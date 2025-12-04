import axios from 'axios';
 
import { HOST_API } from 'src/config-global';
 
// ----------------------------------------------------------------------
 
const axiosInstance = axios.create({ baseURL: HOST_API });
const API_URL = import.meta.env.VITE_MAP;

// Helper function to check if user is on public pages that don't require auth
const isPublicPage = () => {
  const publicPaths = [
    '/auth/jwt/login',
    '/auth/jwt/register', 
    '/createPwd',
    '/resetPwd',
    '/forgot-password',
    '/verify-email'
  ];
  return publicPaths.some(path => window.location.pathname.includes(path));
};

// Helper function to redirect to login
const redirectToLogin = () => {
  // Clean up any existing tokens
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  
  // Store current location for redirect after login (optional)
  if (!isPublicPage()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
  }
  
  // Redirect to login
  window.location.href = '/auth/jwt/login';
};

// Helper function to check if user has valid tokens
const hasValidTokens = () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');
  return !!(accessToken || refreshToken);
};
 
// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupération dynamique du token depuis sessionStorage
    const token = sessionStorage.getItem('accessToken');
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicPage()) {
      // If no token and not on a public page, check if we have a refresh token
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.warn('No authentication tokens found - redirecting to login');
        redirectToLogin();
        return Promise.reject(new Error('No authentication token available'));
      }
    }
 
    return config;
  },
  (error) => Promise.reject(error)
);
 
// Intercepteur de réponse avec gestion du refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de rafraîchir, et qu'on n'est PAS sur une page publique
    if (error.response?.status === 401 && !originalRequest._retry && !isPublicPage()) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.warn('No refresh token available - redirecting to login');
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, null, {
          params: { token: refreshToken }
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens
        sessionStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          sessionStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update axios defaults and retry original request
        axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // Handle other auth-related errors
    if (error.response?.status === 403 && !isPublicPage()) {
      console.warn('Access forbidden - redirecting to login');
      redirectToLogin();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Additional function to check authentication status
export const checkAuthStatus = () => {
  if (!isPublicPage() && !hasValidTokens()) {
    redirectToLogin();
    return false;
  }
  return true;
};

// Function to handle logout
export const logout = () => {
  redirectToLogin();
};

export default axiosInstance;
 
// ----------------------------------------------------------------------
 
// Fonction fetcher pour les appels GET avec vérification d'auth
export const fetcher = async (args) => {
  // Check auth before making request
  if (!checkAuthStatus()) {
    throw new Error('Authentication required');
  }

  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(url, { ...config });
  return res.data;
};
 
// ----------------------------------------------------------------------
 
// Endpoints pour l'API
export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};