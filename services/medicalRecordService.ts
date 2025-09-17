import apiClient, { ApiResponse } from './api';

// Enums cho Medical Record
export enum MedicalRecordStatus {
  DANG_KHAM = 'DANG_KHAM',
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
  }
};

export default medicalRecordService;