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

// Interface for linked patients from new API structure
export interface LinkedPatient {
  id: number;
  code: string;
  bloodType: string;
  weight: number;
  height: number;
  registrationDate: string;
  fullName: string;
  address: string;
  cccd: string;
  birth: string;
  gender: 'NAM' | 'NU';
  profileImage: string;
  relationship: 'CHU TAI KHOAN' | 'ME' | 'CON' | 'VO' | string;
}

export interface LinkedPatientsResponse {
  data: {
    patients: LinkedPatient[];
    ownerId: number;
  };
  message: string;
}

// Interface for patient detail response (from /api/patients/:id)
export interface PatientDetail {
  id: number;
  code: string;
  bloodType: string | null;
  weight: number | null;
  height: number | null;
  registrationDate: string;
  fullName: string;
  phone: string;
  address: string;
  cccd: string | number;
  birth: string;
  gender: 'NAM' | 'NU';
}

export interface PatientDetailResponse {
  data: PatientDetail;
  message: string;
}

// Interface for patient search results  
export interface PatientSearchResult {
  id: number;
  code: string;
  bloodType: string;
  weight: number;
  height: number;
  registrationDate: string;
  phone: string;
  fullName: string;
  address: string;
  cccd: string;
  birth: string;
  gender: 'NAM' | 'NU';
  profileImage: string;
  relationship: string | null;
}

export interface PatientSearchResponse {
  data: PatientSearchResult[];
  message: string;
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

// New interface for creating patient with new API structure
export interface NewPatientCreateData {
  phone: string | null;
  email: string | null;
  fullName: string;
  address: string;
  cccd: string;
  birth: string;
  gender: 'NAM' | 'NU';
  bloodType: string;
  weight: number;
  height: number;
  profileImage: string | null;
  phoneLink: string | null;
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
  },

  /**
   * Tạo bệnh nhân mới với cấu trúc API mới
   * @param patientData - Dữ liệu bệnh nhân theo cấu trúc mới
   * @returns Promise với response từ API
   */
  createNewPatient: async (patientData: NewPatientCreateData): Promise<ApiResponse<PatientDetail>> => {
    try {
      const response = await apiClient.post<ApiResponse<PatientDetail>>('/api/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating new patient:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách bệnh nhân liên kết theo số điện thoại
   * @param phone - Số điện thoại cần tìm kiếm
   * @returns Promise với response từ API với cấu trúc mới
   */
  getLinkedPatientsByPhone: async (phone: string): Promise<LinkedPatientsResponse> => {
    try {
      if (!phone || phone.trim() === '') {
        throw new Error('Số điện thoại không được để trống');
      }

      const response = await apiClient.get<LinkedPatientsResponse>('/api/patients', {
        params: {
          phone: phone.trim()
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching linked patients by phone:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết bệnh nhân theo ID
   * @param patientId - ID của bệnh nhân
   * @returns Promise với response từ API
   */
  getPatientById: async (patientId: number): Promise<PatientDetailResponse> => {
    try {
      if (!patientId || patientId <= 0) {
        throw new Error('ID bệnh nhân không hợp lệ');
      }

      const response = await apiClient.get<PatientDetailResponse>(`/api/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm bệnh nhân theo từ khóa (CCCD, tên, số điện thoại...)
   * @param keyword - Từ khóa cần tìm kiếm
   * @returns Promise với response từ API
   */
  searchPatients: async (keyword: string): Promise<PatientSearchResponse> => {
    try {
      if (!keyword || keyword.trim() === '') {
        return {
          data: [],
          message: 'Từ khóa tìm kiếm không được để trống'
        };
      }

      const response = await apiClient.get<PatientSearchResponse>('/api/patients', {
        params: {
          keyword: keyword.trim()
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }
};

export default patientService;