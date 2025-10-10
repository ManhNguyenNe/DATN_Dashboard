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

// Interface cho việc cập nhật phiếu khám theo API docs
export interface MedicalRecordUpdateFields {
  id: number;
  symptoms: string;
  clinicalExamination: string;
  diagnosis: string;
  treatmentPlan: string;
  note: string;
}

// Interface cho việc cập nhật trạng thái phiếu khám
export interface MedicalRecordStatusUpdate {
  id: number;
  status: MedicalRecordStatus | string;
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
  patientId?: number; // Thêm trường patientId
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

// Interface cho Single Lab trong Invoice Details
export interface SingleLabResponse {
  id: number;
  code: string;
  name?: string; // Tên dịch vụ
  doctorPerforming: string | null;
  room?: string; // Phòng thực hiện dịch vụ
  createdAt: string;
  status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
}

// Interface cho Multiple Lab trong Invoice Details
export interface MultipleLabResponse {
  id: number;
  code: string;
  name?: string; // Tên dịch vụ
  doctorPerforming: string | null;
  room?: string; // Phòng thực hiện dịch vụ
  createdAt: string;
  status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
}

// Interface cho Invoice Details Response trong API mới
export interface InvoiceDetailsResponse {
  id: number;
  healthPlanId: number;
  healthPlanName: string;
  name?: string; // Tên chỉ định - field mới
  healthPlanPrice: number;
  paid: number;
  paymentMethod: string | null;
  description: string;
  status: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN';
  multipleLab: MultipleLabResponse[] | null;
  singleLab: SingleLabResponse | null;
  typeService: 'SINGLE' | 'MULTIPLE';
}

// Interface cho Lab Order Response trong Medical Record Detail (để backward compatibility)
export interface LabOrderResponse {
  id: number | null;  // Có thể null cho phí khám
  recordId: number | null;
  healthPlanId: number;
  healthPlanName: string;
  room: string;
  healthPlanResponse: any | null;
  doctorPerformed: string | null;
  doctorPerformedId?: number | null;  // Thêm ID bác sĩ thực hiện
  doctorOrdered: string | null;
  status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
  statusPayment: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN' | null;
  price: number;
  createdAt?: string | null;  // Optional - không phải tất cả response đều có
  orderDate?: string | null;  // Optional - chỉ có trong GET all, không có trong GET detail
  expectedResultDate?: string | null;  // Optional - có thể null hoặc không có
  diagnosis?: string | null;  // Thêm chẩn đoán cho lab order
  serviceParent?: string | null;  // Tên gói dịch vụ mà dịch vụ này thuộc về
}

// Interface cho Medical Record Service (mapping từ LabOrderResponse)
export interface MedicalRecordService {
  serviceName: string;
  doctorName: string;
  price: number;
  room: string;
  status: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN';
  orderDate?: string;
  expectedResultDate?: string;
}

// Interface cho Medical Record Detail với cấu trúc API mới
export interface MedicalRecordDetail {
  id: string;
  code: string;
  symptoms: string;
  clinicalExamination: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  note: string | null;
  total: number;
  paid: number;
  patientId?: number; // Thêm trường patientId
  patientName: string;
  patientPhone: string | null;
  patientAddress: string;
  patientGender: string;
  date: string;
  status: MedicalRecordStatus | string;
  invoiceDetailsResponse: InvoiceDetailsResponse[]; // Thay thế labOrdersResponses bằng invoiceDetailsResponse
  labOrdersResponses?: LabOrderResponse[]; // Giữ lại để backward compatibility
  invoiceId?: number; // Thêm trường invoiceId từ API response
  // Computed field để backward compatibility
  services?: MedicalRecordService[];
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
      const response = await apiClient.post<SimpleApiResponse<MedicalRecord>>('/api/medical-record', medicalRequest);
      return response.data;
    } catch (error: any) {
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
      throw error;
    }
  },

  /**
   * Cập nhật các trường thông tin phiếu khám (lưu tạm)
   * @param updateData - Dữ liệu cập nhật phiếu khám theo API docs
   * @returns Promise với response từ API
   */
  updateMedicalRecordFields: async (updateData: MedicalRecordUpdateFields): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.put<ApiResponse<any>>('/api/medical-record', updateData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Lấy danh sách phiếu khám của bệnh nhân theo ID
   * @param patientId - ID của bệnh nhân
   * @returns Promise với danh sách phiếu khám của bệnh nhân
   */
  getMedicalRecordByPatientId: async (patientId: number): Promise<ApiResponse<MedicalRecordListItem[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<MedicalRecordListItem[]>>(`/api/medical-record/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái phiếu khám
   * @param statusData - Dữ liệu cập nhật trạng thái phiếu khám
   * @returns Promise với response từ API
   */
  updateMedicalRecordStatus: async (statusData: MedicalRecordStatusUpdate): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.put<ApiResponse<any>>('/api/medical-record/status', statusData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}; export default medicalRecordService;