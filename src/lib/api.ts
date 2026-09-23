import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create a professional Axios instance with interceptors
const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to inject Supabase JWT token
apiInstance.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor for unified error handling with auto-retry for Network Errors
apiInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;
    
    // Automatically retry on Network Errors (handles Windows WinError 10035 bursts)
    if (error.message === 'Network Error' && !config._retry) {
      config._retry = true;
      console.warn("API Network Error caught, retrying request in 1s...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return apiInstance(config);
    }
    
    // We can handle global authentication errors (401), or server errors here
    console.error("API Error:", error.response?.data?.detail || error.message);
    return Promise.reject(error);
  }
);

// Export a wrapper to fix TypeScript AxiosResponse issues globally
export const api = {
  get: (url: string, config?: any) => apiInstance.get(url, config) as Promise<any>,
  post: (url: string, data?: any, config?: any) => apiInstance.post(url, data, config) as Promise<any>,
  put: (url: string, data?: any, config?: any) => apiInstance.put(url, data, config) as Promise<any>,
  delete: (url: string, config?: any) => apiInstance.delete(url, config) as Promise<any>,
  patch: (url: string, data?: any, config?: any) => apiInstance.patch(url, data, config) as Promise<any>,
};

export default api;
