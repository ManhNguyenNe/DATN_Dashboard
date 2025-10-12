import api from './api';
import {
    PrescriptionResponse,
    MedicineResponse,
    CreatePrescriptionRequest,
    UpdatePrescriptionRequest,
    CreatePrescriptionDetailRequest,
    UpdatePrescriptionDetailRequest,
    ApiResponse,
    PrescriptionDetailResponse
} from '../types/PrescriptionTypes';

class PrescriptionService {
    // Lấy đơn thuốc theo Medical Record ID (API trả về một đơn thuốc duy nhất)
    async getPrescriptionsByMedicalRecordId(medicalRecordId: string | number): Promise<ApiResponse<PrescriptionResponse>> {
        const response = await api.get(`/api/prescriptions/medical-record/${medicalRecordId}`);
        return response.data;
    }

    // Tạo đơn thuốc mới
    async createPrescription(data: CreatePrescriptionRequest): Promise<ApiResponse<PrescriptionResponse>> {
        const response = await api.post('/api/prescriptions', data);
        return response.data;
    }

    // Cập nhật đơn thuốc
    async updatePrescription(data: UpdatePrescriptionRequest): Promise<ApiResponse<PrescriptionResponse>> {
        const response = await api.put('/api/prescriptions', data);
        return response.data;
    }

    // Thêm chi tiết thuốc vào đơn
    async createPrescriptionDetail(data: CreatePrescriptionDetailRequest): Promise<ApiResponse<PrescriptionDetailResponse>> {
        const response = await api.post('/api/prescriptions/details', data);
        return response.data;
    }

    // Cập nhật chi tiết thuốc
    async updatePrescriptionDetail(data: UpdatePrescriptionDetailRequest): Promise<ApiResponse<PrescriptionDetailResponse>> {
        const response = await api.put('/api/prescriptions/details', data);
        return response.data;
    }

    // Xóa chi tiết thuốc
    async deletePrescriptionDetail(detailId: number): Promise<void> {
        await api.delete(`/api/prescriptions/details/${detailId}`);
    }
}

class MedicineService {
    // Lấy danh sách thuốc
    async getMedicines(keyword?: string): Promise<ApiResponse<MedicineResponse[]>> {
        const params = keyword ? { keyword } : {};
        const response = await api.get('/api/medicines', { params });
        return response.data;
    }
}

export const prescriptionService = new PrescriptionService();
export const medicineService = new MedicineService();
export default prescriptionService;
