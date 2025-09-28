import apiClient, { ApiResponse, SimpleApiResponse } from './api';

// Enums cho Medical Record
export enum MedicalRecordStatus {
  DANG_KHAM = 'DANG_KHAM',
  CHO_XET_NGHIEM = 'CHO_XET_NGHIEM',
  HOAN_THANH = 'HOAN_THANH',
  HUY = 'HUY'
}

// Interfaces cho Medical Record data
export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  status: MedicalRecordStatus;
  examDate: string;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  doctorName?: string;
}

export interface MedicalRecordCreateData {
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  examDate: string;
  followUpDate?: string;
}

export interface MedicalRecordUpdateData extends MedicalRecordCreateData {
  id: number;
  status?: MedicalRecordStatus;
}

export interface SimpleMedicalRecordCreateData {
  patientId: number;
  doctorId?: number | null;
  healthPlanId?: number | null;
  symptoms: string;
  invoiceId?: number;
}

// Interface cho Medical Record List item từ API
export interface MedicalRecordListItem {
  id: string;
  code: string;
  symptoms: string;
  clinicalExamination: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  note: string | null;
  total: number;
  patientName: string;
  date: string;
  status: MedicalRecordStatus | string;
}

// Interface cho Medical Record Filter
export interface MedicalRecordFilter {
  date?: string;
  keyword?: string;
  status?: MedicalRecordStatus | string;
}

// Interface cho Service trong Medical Record Detail
export interface MedicalRecordService {
  serviceName: string;
  doctorName: string;
  price: number;
  room: string;
  status: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN';
}

// Interface cho Medical Record Detail
export interface MedicalRecordDetail {
  id: string;
  code: string;
  symptoms: string;
  clinicalExamination: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  note: string | null;
  total: number;
  patientName: string;
  date: string;
  status: MedicalRecordStatus | string;
  services: MedicalRecordService[];
}

/**
 * Service để quản lý các API liên quan đến Medical Records (Phiếu khám bệnh)
 */
const medicalRecordService = {
  /**
   * Tạo phiếu khám bệnh mới
   * @param medicalRequest - Dữ liệu phiếu khám bệnh
   * @returns Promise với response từ API
   */
  createMedicalRecord: async (medicalRequest: MedicalRecordCreateData): Promise<ApiResponse<MedicalRecord>> => {
    try {
      const response = await apiClient.post<ApiResponse<MedicalRecord>>('/api/medical-record', medicalRequest);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  /**
   * Cập nhật phiếu khám bệnh
   * @param medicalRequest - Dữ liệu phiếu khám bệnh cần cập nhật
   * @returns Promise với response từ API
   */
  updateMedicalRecord: async (medicalRequest: MedicalRecordUpdateData): Promise<ApiResponse<MedicalRecord>> => {
    try {
      const response = await apiClient.put<ApiResponse<MedicalRecord>>('/api/medical-record', medicalRequest);
      return response.data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin phiếu khám bệnh theo ID
   * @param id - ID phiếu khám bệnh
   * @returns Promise với response từ API
   */
  getMedicalRecordById: async (id: number): Promise<ApiResponse<MedicalRecord>> => {
    try {
      const response = await apiClient.get<ApiResponse<MedicalRecord>>(`/api/medical-record/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error;
    }
  },

  /**
   * Tạo phiếu khám bệnh đơn giản (chỉ với thông tin cơ bản)
   * @param medicalRequest - Dữ liệu phiếu khám bệnh cơ bản
   * @returns Promise với response từ API
   */
  createSimpleMedicalRecord: async (medicalRequest: SimpleMedicalRecordCreateData): Promise<SimpleApiResponse<MedicalRecord>> => {
    try {
      console.log('Creating medical record with data:', medicalRequest);
      const response = await apiClient.post<SimpleApiResponse<MedicalRecord>>('/api/medical-record', medicalRequest);
      console.log('Medical record service response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating simple medical record:', error);

      // Log chi tiết error để debug
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu khám bệnh với filter
   * @param filters - Bộ lọc để tìm kiếm phiếu khám (date, keyword, status)
   * @returns Promise với danh sách phiếu khám
   */
  getMedicalRecords: async (filters?: MedicalRecordFilter): Promise<ApiResponse<MedicalRecordListItem[]>> => {
    try {
      const params = new URLSearchParams();

      if (filters?.date) {
        params.append('date', filters.date);
      }
      if (filters?.keyword) {
        params.append('keyword', filters.keyword);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/medical-record?${queryString}` : '/api/medical-record';

      const response = await apiClient.get<ApiResponse<MedicalRecordListItem[]>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết phiếu khám bệnh theo ID
   * @param id - ID phiếu khám bệnh
   * @returns Promise với chi tiết phiếu khám
   */
  getMedicalRecordDetail: async (id: string): Promise<ApiResponse<MedicalRecordDetail>> => {
    try {
      const response = await apiClient.get<ApiResponse<MedicalRecordDetail>>(`/api/medical-record/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record detail:', error);
      throw error;
    }
  }
};

export default medicalRecordService;