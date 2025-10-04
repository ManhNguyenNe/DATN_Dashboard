export interface MedicalService {
    id: number;
    name: string;
    price: number;
    category: string;
    description?: string;
}

export interface AppointmentService {
    id: number | null; // null cho các dịch vụ như tiền khám
    serviceId: number;
    serviceName: string;
    price: number;
    status: 'CHO_THANH_TOAN' | 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'HUY';
    paymentDate?: string;
    orderDate?: string; // Ngày chỉ định
    room?: string; // Phòng chỉ định
    result?: string;
    notes?: string;
    assignedDoctor?: string; // Bác sĩ được chỉ định thực hiện dịch vụ
    reason?: string; // Lý do chỉ định dịch vụ
    executionStatus?: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY'; // Trạng thái thực hiện
}

export interface NewPrescription {
    id: number;
    serviceId: number;
    serviceName: string;
    reason: string;
    notes?: string;
    createdAt: string;
    status: 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'TU_CHOI';
}

export enum ServiceStatus {
    CHO_THANH_TOAN = 'CHO_THANH_TOAN',
    DA_THANH_TOAN = 'DA_THANH_TOAN',
    CHUA_THANH_TOAN = 'CHUA_THANH_TOAN',
    HUY = 'HUY'
}

export enum PrescriptionStatus {
    CHO_XAC_NHAN = 'CHO_XAC_NHAN',
    DA_XAC_NHAN = 'DA_XAC_NHAN',
    TU_CHOI = 'TU_CHOI'
}
