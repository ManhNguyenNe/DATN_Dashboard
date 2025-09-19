import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Cấu hình base URL cho API - sử dụng Next.js env variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Interface cho API response format chung
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

// Interface cho response của một số API không có field success
export interface SimpleApiResponse<T = any> {
  data: T;
  message: string;
}

// Tạo axios instance với cấu hình mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Interceptor để xử lý request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Có thể thêm token vào header ở đây nếu cần
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError) => {
    // Xử lý lỗi tổng quát
    if (error.response) {
      // Server trả về lỗi
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network Error:', error.request);
    } else {
      // Lỗi khác
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;