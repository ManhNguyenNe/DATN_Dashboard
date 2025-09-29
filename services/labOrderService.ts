import apiClient, { ApiResponse } from './api';

// Interface cho Lab Order Detail
export interface LabOrderDetail {
    id: number;
    recordId: number | null;
    healthPlanId: number;
    healthPlanName: string;
    room: string | null;
    doctorPerformed: string | null;
    doctorOrdered: string | null;
    status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
    statusPayment: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | null;
    price: number;
    orderDate: string;
    expectedResultDate: string | null;
}

/**
 * Service để quản lý các API liên quan đến Lab Orders (Chỉ định xét nghiệm/dịch vụ)
 */
const labOrderService = {
    /**
     * Lấy chi tiết chỉ định theo ID
     * @param id - ID của chỉ định
     * @returns Promise với response từ API
     */
    getLabOrderDetail: async (id: number): Promise<ApiResponse<LabOrderDetail>> => {
        try {
            const response = await apiClient.get<ApiResponse<LabOrderDetail>>(`/api/lab-orders/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching lab order detail:', error);
            throw error;
        }
    },

    /**
     * Lấy tất cả chỉ định
     * @returns Promise với response từ API
     */
    getAllLabOrders: async (): Promise<ApiResponse<LabOrderDetail[]>> => {
        try {
            const response = await apiClient.get<ApiResponse<LabOrderDetail[]>>('/api/lab-orders');
            return response.data;
        } catch (error) {
            console.error('Error fetching all lab orders:', error);
            throw error;
        }
    }
};

export default labOrderService;