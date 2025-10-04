import apiClient, { ApiResponse } from './api';

// Interface cho Lab Result Request
export interface LabResultRequest {
    labOrderId: number;
    resultDetails: string;
    note: string;
    summary: string;
    explanation: string;
}

// Interface cho Lab Result Response
export interface LabResult {
    id: number;
    labOrderId: number;
    resultDetails: string;
    note: string;
    summary: string;
    explanation: string;
    createdAt: string;
    updatedAt: string;
}

// Interface cho Lab Order Status Update
export interface LabOrderStatusUpdate {
    id: number;
    status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY_BO';
}

/**
 * Service để quản lý các API liên quan đến Lab Results (Kết quả xét nghiệm)
 */
class LabResultService {
    private readonly BASE_URL = '/api/lab-results';
    private readonly LAB_ORDER_STATUS_URL = '/api/lab-orders/status';

    /**
     * Thêm kết quả xét nghiệm
     * @param labResult - Dữ liệu kết quả xét nghiệm
     * @returns Promise<ApiResponse<LabResult>>
     */
    async createLabResult(labResult: LabResultRequest): Promise<ApiResponse<LabResult>> {
        const response = await apiClient.post<ApiResponse<LabResult>>(this.BASE_URL, labResult);
        return response.data;
    }

    /**
     * Cập nhật trạng thái chỉ định xét nghiệm
     * @param statusUpdate - Dữ liệu cập nhật trạng thái
     * @returns Promise<ApiResponse<any>>
     */
    async updateLabOrderStatus(statusUpdate: LabOrderStatusUpdate): Promise<ApiResponse<any>> {
        const response = await apiClient.put<ApiResponse<any>>(this.LAB_ORDER_STATUS_URL, statusUpdate);
        return response.data;
    }

    /**
     * Thực hiện xét nghiệm - Thay đổi trạng thái thành DANG_THUC_HIEN và thêm kết quả
     * @param labOrderId - ID chỉ định xét nghiệm
     * @param labResult - Dữ liệu kết quả xét nghiệm
     * @returns Promise<{ statusUpdate: ApiResponse<any>, labResult: ApiResponse<LabResult> }>
     */
    async executeLabTest(labOrderId: number, labResult: Omit<LabResultRequest, 'labOrderId'>): Promise<{
        statusUpdate: ApiResponse<any>;
        labResult: ApiResponse<LabResult>;
    }> {
        try {
            // Bước 1: Cập nhật trạng thái thành DANG_THUC_HIEN
            const statusUpdate = await this.updateLabOrderStatus({
                id: labOrderId,
                status: 'DANG_THUC_HIEN'
            });

            // Bước 2: Thêm kết quả xét nghiệm
            const labResultResponse = await this.createLabResult({
                labOrderId,
                ...labResult
            });

            return {
                statusUpdate,
                labResult: labResultResponse
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hoàn thành xét nghiệm - Thay đổi trạng thái thành HOAN_THANH
     * @param labOrderId - ID chỉ định xét nghiệm
     * @returns Promise<ApiResponse<any>>
     */
    async completeLabTest(labOrderId: number): Promise<ApiResponse<any>> {
        return await this.updateLabOrderStatus({
            id: labOrderId,
            status: 'HOAN_THANH'
        });
    }

    /**
     * Hủy xét nghiệm - Thay đổi trạng thái thành HUY_BO
     * @param labOrderId - ID chỉ định xét nghiệm
     * @returns Promise<ApiResponse<any>>
     */
    async cancelLabTest(labOrderId: number): Promise<ApiResponse<any>> {
        return await this.updateLabOrderStatus({
            id: labOrderId,
            status: 'HUY_BO'
        });
    }
}

const labResultService = new LabResultService();
export default labResultService;