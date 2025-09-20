import apiClient, { ApiResponse } from './api';

// Interfaces cho Doctor data
export interface Doctor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  departmentId?: number;
  departmentName?: string;
  experience?: number;
  qualification?: string;
  schedule?: string;
  position?: string; // From API response
  examinationFee?: number; // From API response 
  available?: boolean; // From API response
  roomNumber?: string; // From API response
  roomName?: string; // From API response
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service để quản lý các API liên quan đến doctors (bác sĩ)
 */
const doctorService = {
  /**
   * Lấy danh sách bác sĩ theo khoa (sử dụng department API)
   * @param departmentId - ID của khoa
   * @returns Promise với response từ API
   */
  getDoctorsByDepartment: async (departmentId: number): Promise<ApiResponse<Doctor[]>> => {
    try {
      if (!departmentId) {
        throw new Error('Department ID không được để trống');
      }

      const response = await apiClient.get<ApiResponse<Doctor[]>>(`/api/departments/${departmentId}/doctors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors by department:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin bác sĩ theo ID
   * @param doctorId - ID của bác sĩ
   * @returns Promise với response từ API
   */
  getDoctorById: async (doctorId: number): Promise<ApiResponse<Doctor>> => {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID không được để trống');
      }

      const response = await apiClient.get<ApiResponse<Doctor>>(`/api/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách bác sĩ theo chuyên khoa
   * @param specialty - Tên chuyên khoa
   * @returns Promise với response từ API
   */
  getDoctorsBySpecialty: async (specialty: string): Promise<ApiResponse<Doctor[]>> => {
    try {
      if (!specialty || specialty.trim() === '') {
        throw new Error('Chuyên khoa không được để trống');
      }

      const response = await apiClient.get<ApiResponse<Doctor[]>>('/api/doctors/specialty', {
        params: {
          specialty: specialty.trim()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors by specialty:', error);
      throw error;
    }
  }
};

export default doctorService;