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

// Interface cho payment request
export interface PaymentLinkRequest {
  medicalRecordId: number | null;
  labOrderIds?: number[] | null;
  healthPlanIds?: number[] | null;
  doctorId: number | null;
  totalAmount?: number;
}

// Interface cho cash payment request
export interface CashPaymentRequest {
  medicalRecordId: number;
  healthPlanIds: number[];
  totalAmount: number;
}

// Interface cho payment response
export interface PaymentLinkResponse {
  invoiceId: number;
  qrCode: string;
  orderCode: number;
}

// Interface cho payment status response
export interface PaymentStatusResponse {
  data: boolean;
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
    // Thêm token vào header cho mọi request
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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

      // Xử lý lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
      if (error.response.status === 401) {
        // Xóa token và chuyển hướng đến trang đăng nhập
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          // Chuyển hướng đến trang đăng nhập
          window.location.href = '/sign-in';
        }
      }
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

// Payment service functions
export const paymentService = {
  // Tạo payment link với QR code
  createPaymentLink: async (request: PaymentLinkRequest): Promise<ApiResponse<PaymentLinkResponse>> => {
    try {
      const response = await apiClient.post<ApiResponse<PaymentLinkResponse>>('/api/payments/create-link', request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  },

  // Thanh toán tiền mặt
  payCash: async (request: CashPaymentRequest): Promise<SimpleApiResponse> => {
    try {
      console.log('Sending cash payment request:', request);
      const response = await apiClient.post<SimpleApiResponse>('/api/invoices/pay-cash', request);
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      return response.data;
    } catch (error: any) {
      console.error('Error processing cash payment:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (orderCode: number): Promise<PaymentStatusResponse> => {
    try {
      const response = await apiClient.get<PaymentStatusResponse>(`/api/payments/status/${orderCode}`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
};

export default apiClient;