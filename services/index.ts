// API Client
export { default as apiClient, paymentService } from './api';
export {
  type ApiResponse,
  type SimpleApiResponse,
  type PaymentLinkRequest,
  type PaymentLinkResponse,
  type PaymentStatusResponse,
  type CashPaymentRequest
} from './api';

// Auth Service
export { default as authService } from './authService';
export {
  UserRole,
  UserStatus,
  type User,
  type LoginRequest,
  type LoginResponse,
  type AuthState
} from './authService';

// Patient Service
export { default as patientService } from './patientService';
export type {
  Patient,
  PatientsDto,
  PatientCreateData,
  NewPatientCreateData,
  PatientUpdateData,
  PatientsResponse,
  LinkedPatient,
  LinkedPatientsResponse,
  PatientSearchResult,
  PatientSearchResponse,
  PatientDetail,
  PatientDetailResponse
} from './patientService';

// Appointment Service  
export { default as appointmentService } from './appointmentService';
export {
  AppointmentStatus,
  type Appointment,
  type AppointmentCreateData,
  type AppointmentConfirmData,
  type AppointmentFilter
} from './appointmentService';

// Doctor Service
export { default as doctorService } from './doctorService';
export type { Doctor } from './doctorService';

// Department Service
export { default as departmentService } from './departmentService';
export type { Department } from './departmentService';

// Health Plan Service
export { default as healthPlanService } from './healthPlanService';
export {
  HealthPlanType,
  type HealthPlan
} from './healthPlanService';

// Medical Record Service
export { default as medicalRecordService } from './medicalRecordService';
export {
  MedicalRecordStatus,
  type MedicalRecord,
  type MedicalRecordCreateData,
  type MedicalRecordUpdateData,
  type SimpleMedicalRecordCreateData,
  type MedicalRecordUpdateFields,
  type MedicalRecordStatusUpdate,
  type MedicalRecordListItem,
  type MedicalRecordFilter,
  type MedicalRecordDetail,
  type MedicalRecordService,
  type LabOrderResponse,
  type InvoiceDetailsResponse,
  type SingleLabResponse,
  type MultipleLabResponse
} from './medicalRecordService';

// Medical Service Service
export { default as medicalServiceService } from './medicalServiceService';
export type { MedicalServiceFilter } from './medicalServiceService';

// Lab Order Service
export { default as labOrderService } from './labOrderService';
export type {
  LabOrderDetail,
  DoctorLabOrder,
  DoctorLabOrderFilter,
  CreateLabOrderRequest,
  UpdateLabOrderRequest,
  DeleteLabOrdersRequest
} from './labOrderService';

// Lab Result Service
export { default as labResultService } from './labResultService';
export type {
  LabResult,
  LabResultRequest,
  LabOrderStatusUpdate
} from './labResultService';

// User Service
export { default as userService } from './userService';
export type {
  UserProfile,
  UserProfileUpdateData,
  ChangePasswordData,
  UserMeResponse,
  DoctorInfo
} from './userService';

// Schedule Service
export { default as scheduleService } from './scheduleService';
export {
  Shift,
  DateName,
  type ScheduleDoctorInfo,
  type DaySchedule,
  type ScheduleFilterParams
} from './scheduleService';