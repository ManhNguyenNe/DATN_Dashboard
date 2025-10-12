// Types cho Prescription API

export interface MedicineResponse {
    id: number;
    name: string;
    concentration: string;
    dosageForm: string;
    description: string;
    unit: string;
}

export interface PrescriptionDetailResponse {
    id: number;
    medicineResponse: MedicineResponse;
    usageInstructions: string;
    quantity: number;
}

export interface PrescriptionResponse {
    id: number;
    code: string;
    generalInstructions: string;
    doctorCreated: string;
    prescriptionDate: string;
    detailResponses: PrescriptionDetailResponse[];
}

// Request Types
export interface CreatePrescriptionRequest {
    medicalRecordId: number;
    generalInstructions?: string;
}

export interface UpdatePrescriptionRequest {
    id: number;
    medicalRecordId: number;
    generalInstructions?: string;
}

export interface CreatePrescriptionDetailRequest {
    prescriptionId: number;
    medicineId: number;
    usageInstructions?: string;
    quantity: number;
}

export interface UpdatePrescriptionDetailRequest {
    id: number;
    prescriptionId: number;
    medicineId: number;
    usageInstructions?: string;
    quantity: number;
}

// API Response wrapper
export interface ApiResponse<T> {
    data: T;
    message: string;
}

// Response có thể là array hoặc single object tùy vào API endpoint
export type PrescriptionListResponse = ApiResponse<PrescriptionResponse[]>;
export type PrescriptionSingleResponse = ApiResponse<PrescriptionResponse>;
export type PrescriptionFlexibleResponse = ApiResponse<PrescriptionResponse[] | PrescriptionResponse>;

// Form states
export interface PrescriptionFormData {
    generalInstructions: string;
}

export interface PrescriptionDetailFormData {
    id?: number; // ID của prescription detail khi edit
    medicineId: number | null;
    usageInstructions: string;
    quantity: number;
    medicine?: MedicineResponse;
}