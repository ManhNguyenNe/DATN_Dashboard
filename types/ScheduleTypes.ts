// Re-export từ scheduleService để dễ sử dụng
export {
    Shift,
    DateName,
    type ScheduleDoctorInfo,
    type DaySchedule,
    type ScheduleFilterParams
} from '../services/scheduleService';

// Import để sử dụng trong file này
import {
    Shift,
    DateName,
    DaySchedule,
    ScheduleDoctorInfo
} from '../services/scheduleService';

// Interface bổ sung cho UI components
export interface WeekSchedule {
    weekStart: Date;
    weekEnd: Date;
    days: DaySchedule[];
}

// Interface cho trạng thái làm việc của bác sĩ
export interface DoctorWorkStatus {
    doctorId: number;
    doctorName: string;
    position: string;
    shifts: {
        [key: string]: { // key là date string "YYYY-MM-DD"
            sang?: boolean;
            chieu?: boolean;
            toi?: boolean;
        };
    };
}

// Enum cho trạng thái nghỉ phép
export enum LeaveStatus {
    CHO_DUYET = 'CHO_DUYET',
    DA_DUYET = 'DA_DUYET',
    TU_CHOI = 'TU_CHOI'
}

// Interface cho việc quản lý nghỉ phép - Response từ API
export interface LeaveRequest {
    id?: number;
    doctorName?: string;
    startTime?: string; // Format: "HH:mm:ss"
    endTime?: string; // Format: "HH:mm:ss"
    date?: string; // Ngày nghỉ - Format: "YYYY-MM-DD"
    submitDate?: string | null; // Ngày nộp đơn - Format: "YYYY-MM-DD"
    reason: string;
    userApprover?: string | null;
    leaveStatus?: LeaveStatus;
}

// Interface cho việc tạo/cập nhật nghỉ phép - Request to API
export interface LeaveRequestData {
    id?: number;
    doctorId?: number | null;
    day: string; // Format: "YYYY-MM-DD"
    shifts: Shift[]; // Mảng ca làm việc: ['SANG', 'CHIEU', 'TOI']
    reason: string;
    leaveStatus?: LeaveStatus;
}

// Interface cho filter nghỉ phép
export interface LeaveFilterParams {
    date?: string; // Format: "YYYY-MM-DD"
    status?: LeaveStatus;
}

// Interface cho cập nhật lịch làm việc
export interface ScheduleUpdate {
    doctorId: number;
    date: string;
    shift: Shift;
    available: boolean;
    reason?: string;
}

// Interface cho tổng quan lịch làm việc
export interface ScheduleOverview {
    totalWorkDays: number;
    totalLeaveDays: number;
    upcomingShifts: ScheduleDoctorInfo[];
    pendingLeaveRequests: LeaveRequest[];
}

// Interface cho filter UI
export interface ScheduleFilter {
    week: Date;
    shift?: Shift | 'ALL';
    showUnavailable: boolean;
}

// Constant cho các ca làm việc
export const SHIFTS = [
    { value: Shift.SANG, label: 'Sáng', time: '7:00 - 11:00' },
    { value: Shift.CHIEU, label: 'Chiều', time: '13:00 - 17:00' },
    { value: Shift.TOI, label: 'Tối', time: '18:00 - 21:00' }
] as const;

// Constant cho các ngày trong tuần
export const WEEKDAYS = [
    { value: DateName.MONDAY, label: 'Thứ 2', shortLabel: 'T2' },
    { value: DateName.TUESDAY, label: 'Thứ 3', shortLabel: 'T3' },
    { value: DateName.WEDNESDAY, label: 'Thứ 4', shortLabel: 'T4' },
    { value: DateName.THURSDAY, label: 'Thứ 5', shortLabel: 'T5' },
    { value: DateName.FRIDAY, label: 'Thứ 6', shortLabel: 'T6' },
    { value: DateName.SATURDAY, label: 'Thứ 7', shortLabel: 'T7' },
    { value: DateName.SUNDAY, label: 'Chủ nhật', shortLabel: 'CN' }
] as const;