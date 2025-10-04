// Interface cho Lab Result
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

// Interface cho Lab Result Request
export interface LabResultRequest {
    labOrderId: number;
    resultDetails: string;
    note: string;
    summary: string;
    explanation: string;
}

// Interface cho Lab Result Form Data
export interface LabResultFormData {
    resultDetails: string;
    note: string;
    summary: string;
    explanation: string;
}

// Interface cho Lab Order Status Update
export interface LabOrderStatusUpdate {
    id: number;
    status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY_BO';
}

// Interface cho Lab Test Execution Response
export interface LabTestExecutionResponse {
    statusUpdate: {
        data: any;
        message: string;
        success: boolean;
    };
    labResult: {
        data: LabResult;
        message: string;
        success: boolean;
    };
}