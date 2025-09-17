import apiClient, { ApiResponse } from './api';

// Interfaces cho Patient data
export interface Patient {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientsDto {
  patients: Patient[];
  ownerId: number | null;
}

export interface PatientCreateData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface PatientsResponse extends ApiResponse<Patient[]> {
  ownerId?: number | null;
}

/**
 * Service để quản lý các API liên quan đến patients
 */
const patientService = {
  /**
   * Lấy thông tin bệnh nhân theo số điện thoại
   * @param phone - Số điện thoại cần tìm kiếm
   * @returns Promise với response từ API với cấu trúc mới: {patients: Array, ownerId: Number}
   */
  getPatientsByPhone: async (phone: string): Promise<PatientsResponse> => {
    try {
      if (!phone || phone.trim() === '') {
        throw new Error('Số điện thoại không được để trống');
      }

      const response = await apiClient.get<ApiResponse<PatientsDto>>('/api/patients', {
        params: {
          phone: phone.trim()
        }
      });

      // API mới trả về cấu trúc PatientsDto: {patients: Array, ownerId: Number}
      // Cần xử lý để tương thích với code cũ
      const responseData = response.data;
      
      if (responseData && responseData.data) {
        const { patients = [], ownerId = null } = responseData.data;
        return {
          ...responseData,
          data: patients, // Để tương thích với code cũ expect data là array
          ownerId: ownerId // Thêm ownerId cho các use case mới
        };
      }

      return {
        ...response.data,
        data: [],
        ownerId: null
      } as PatientsResponse;
    } catch (error) {
      console.error('Error fetching patients by phone:', error);
      throw error;
    }
  },

  /**
   * Tạo bệnh nhân mới
   * @param patientData - Dữ liệu bệnh nhân
   * @returns Promise với response từ API
   */
  createPatient: async (patientData: PatientCreateData): Promise<ApiResponse<Patient>> => {
    try {
      const response = await apiClient.post<ApiResponse<Patient>>('/api/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
};

export default patientService;