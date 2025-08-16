import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Environment-based URL configuration
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api'; // Local development
    }
  }
  // Production or SSR environment
  return 'https://lostandfound-1-p1l9.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with safe token handling
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, message } = error;
    
    // Network or timeout errors
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        toast({
          title: "Request Timeout",
          description: "The server is taking too long to respond. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to connect to server. Please check your internet connection.",
          variant: "destructive",
        });
      }
      return Promise.reject(error);
    }

    // Handle different HTTP status codes
    const status = response.status;
    const data = response.data;

    switch (status) {
      case 401:
        // Unauthorized - clear auth data and redirect
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (e) {
          console.warn('Failed to clear localStorage:', e);
        }
        
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        
        // Prevent infinite redirects
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast({
          title: "Access Denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
        break;

      case 404:
        toast({
          title: "Not Found",
          description: data?.message || "The requested resource was not found.",
          variant: "destructive",
        });
        break;

      case 422:
        // Validation errors
        toast({
          title: "Validation Error",
          description: data?.message || "Please check your input and try again.",
          variant: "destructive",
        });
        break;

      case 500:
        toast({
          title: "Server Error",
          description: "Something went wrong on our end. Please try again later.",
          variant: "destructive",
        });
        break;

      default:
        // Generic error handling
        toast({
          title: "Error",
          description: data?.message || message || "An unexpected error occurred.",
          variant: "destructive",
        });
    }

    return Promise.reject(error);
  }
);

export default api;