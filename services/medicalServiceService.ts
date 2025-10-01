import api from './api';
import { MedicalService, AppointmentService, NewPrescription } from '../types/MedicalServiceType';

// Interface cho bác sĩ được phân công từ API services
export interface AssignedDoctor {
    id: number;
    fullName: string;
    position: string;
    available: boolean;
    shift: 'SANG' | 'CHIEU';
}

// Interface cho response của API services detail
export interface ServiceDetailResponse {
    id: number;
    code: string;
    name: string;
    price: number;
    description: string;
    doctorsAssigned: AssignedDoctor[];
}

export interface MedicalServiceFilter {
    category?: string;
    priceRange?: {
        min?: number;
        max?: number;
    };
    search?: string;
}

class MedicalServiceService {
    // Lấy danh sách tất cả dịch vụ y tế
    async getAllServices(filter?: MedicalServiceFilter): Promise<MedicalService[]> {
        try {
            const params = new URLSearchParams();

            if (filter?.category) {
                params.append('category', filter.category);
            }

            if (filter?.search) {
                params.append('search', filter.search);
            }

            if (filter?.priceRange?.min) {
                params.append('minPrice', filter.priceRange.min.toString());
            }

            if (filter?.priceRange?.max) {
                params.append('maxPrice', filter.priceRange.max.toString());
            }

            const response = await api.get(`/medical-services?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách dịch vụ y tế:', error);
            throw error;
        }
    }

    // Lấy dịch vụ đã thanh toán của một lịch hẹn
    async getPaidServicesByAppointment(appointmentId: string): Promise<AppointmentService[]> {
        try {
            const response = await api.get(`/appointments/${appointmentId}/paid-services`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy dịch vụ đã thanh toán:', error);
            throw error;
        }
    }

    // Lấy chỉ định mới của một lịch hẹn
    async getPrescriptionsByAppointment(appointmentId: string): Promise<NewPrescription[]> {
        try {
            const response = await api.get(`/appointments/${appointmentId}/prescriptions`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chỉ định mới:', error);
            throw error;
        }
    }

    // Thêm chỉ định mới
    async addPrescription(appointmentId: string, prescription: Omit<NewPrescription, 'id' | 'createdAt'>): Promise<NewPrescription> {
        try {
            const response = await api.post(`/appointments/${appointmentId}/prescriptions`, prescription);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi thêm chỉ định mới:', error);
            throw error;
        }
    }

    // Xóa chỉ định
    async deletePrescription(appointmentId: string, prescriptionId: number): Promise<void> {
        try {
            await api.delete(`/appointments/${appointmentId}/prescriptions/${prescriptionId}`);
        } catch (error) {
            console.error('Lỗi khi xóa chỉ định:', error);
            throw error;
        }
    }

    // Cập nhật kết quả dịch vụ
    async updateServiceResult(appointmentId: string, serviceId: number, result: string): Promise<void> {
        try {
            await api.patch(`/appointments/${appointmentId}/services/${serviceId}`, { result });
        } catch (error) {
            console.error('Lỗi khi cập nhật kết quả dịch vụ:', error);
            throw error;
        }
    }

    // Lấy chi tiết một dịch vụ
    async getServiceById(serviceId: number): Promise<MedicalService> {
        try {
            const response = await api.get(`/medical-services/${serviceId}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết dịch vụ:', error);
            throw error;
        }
    }

    // Lấy chi tiết dịch vụ với thông tin bác sĩ được phân công từ API /api/services/{id}
    async getServiceDetail(serviceId: number): Promise<ServiceDetailResponse> {
        try {
            const response = await api.get(`/api/services/${serviceId}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết dịch vụ từ API services:', error);
            // Fallback data nếu API không khả dụng
            return {
                id: serviceId,
                code: `DV${serviceId.toString().padStart(3, '0')}`,
                name: 'Dịch vụ không xác định',
                price: 0,
                description: 'Không thể tải thông tin dịch vụ',
                doctorsAssigned: []
            };
        }
    }

    // Tìm kiếm dịch vụ theo từ khóa (real-time search)
    async searchServices(keyword: string): Promise<ServiceSearchResult[]> {
        try {
            if (!keyword || keyword.trim().length === 0) {
                return [];
            }

            const response = await api.get(`/api/services`, {
                params: { keyword: keyword.trim() }
            });

            return response.data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm dịch vụ:', error);
            return [];
        }
    }
}

// Interface cho kết quả tìm kiếm dịch vụ
export interface ServiceSearchResult {
    id: number;
    code: string;
    name: string;
    price: number;
    description: string;
    roomNumber: string;
    roomName: string;
}

const medicalServiceService = new MedicalServiceService();
export default medicalServiceService;