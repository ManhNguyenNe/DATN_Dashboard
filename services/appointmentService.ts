import apiClient, { ApiResponse } from './api';

// Enums cho Appointment
export enum AppointmentStatus {
  CHO_XAC_NHAN = 'CHO_XAC_NHAN',
  DA_XAC_NHAN = 'DA_XAC_NHAN', 
  KHONG_DEN = 'KHONG_DEN'
}

// Interfaces cho Appointment data - Updated to match backend response
export interface Appointment {
  id: number;
  // Patient info
  fullName: string;
  phone: string;
  gender?: string | null;
  birth: string;
  email?: string;
  address?: string;
  // Appointment details
  date: string; // appointmentDate mapped to date
  time: string; // appointmentTime mapped to time  
  symptoms?: string;
  // Backend nested objects
  healthPlanResponse?: {
    id: number;
    name: string;
    price: number;
  } | null;
  doctorResponse?: {
    id: number;
    position: string; // This is doctor name
    available: boolean;
  } | null;
  departmentResponse?: {
    id: number;
    name: string;
  } | null;
  // Legacy fields for backward compatibility
  status?: AppointmentStatus | string;
  patientId?: number;
  doctorId?: number;
  departmentId?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  departmentName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentCreateData {
  patientId: number;
  doctorId: number;
  departmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  symptoms?: string;
  notes?: string;
}

export interface AppointmentConfirmData {
  id: number;
  status: AppointmentStatus;
}

/**
 * Service để quản lý các API liên quan đến appointments
 */
const appointmentService = {
  /**
   * Lấy danh sách lịch khám theo số điện thoại
   * @param phone - Số điện thoại cần tìm kiếm
   * @returns Promise với response từ API
   */
  getAppointmentsByPhone: async (phone: string): Promise<ApiResponse<Appointment[]>> => {
    try {
      if (!phone || phone.trim() === '') {
        throw new Error('Số điện thoại không được để trống');
      }

      const response = await apiClient.get<ApiResponse<Appointment[]>>(`/api/appointments/phone`, {
        params: {
          phone: phone.trim()
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching appointments by phone:', error);
      throw error;
    }
  },

  /**
   * Tạo lịch khám mới
   * @param appointmentData - Dữ liệu lịch khám
   * @returns Promise với response từ API
   */
  createAppointment: async (appointmentData: AppointmentCreateData): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await apiClient.post<ApiResponse<Appointment>>('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  /**
   * Xác nhận lịch khám (cho receptionist)
   * @param appointmentId - ID lịch khám
   * @param status - Trạng thái mới (enum: CHO_XAC_NHAN, DA_XAC_NHAN, KHONG_DEN)
   * @returns Promise với response từ API
   */
  confirmAppointment: async (appointmentId: number, status: AppointmentStatus): Promise<ApiResponse<Appointment>> => {
    try {
      const confirmData: AppointmentConfirmData = {
        id: appointmentId,
        status: status // Sử dụng enum string như backend mong đợi
      };
      
      const response = await apiClient.put<ApiResponse<Appointment>>('/api/appointments/confirm', confirmData);
      return response.data;
    } catch (error) {
      console.error('Error confirming appointment:', error);
      throw error;
    }
  }
};

export default appointmentService;