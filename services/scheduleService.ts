import apiClient, { ApiResponse } from './api';
import type { LeaveRequest, LeaveRequestData, LeaveFilterParams } from '../types/ScheduleTypes';

// Enum cho ca làm việc
export enum Shift {
    SANG = 'SANG',
    CHIEU = 'CHIEU',
    TOI = 'TOI'
}

// Enum cho ngày trong tuần
export enum DateName {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY'
}

// Interface cho thông tin bác sĩ trong lịch làm việc
export interface ScheduleDoctorInfo {
    id: number;
    fullName: string;
    position: string;
    available: boolean;
    shift: Shift;
}

// Interface cho dữ liệu lịch làm việc theo ngày
export interface DaySchedule {
    date: string; // Format: "YYYY-MM-DD"
    dateName: DateName;
    totalSlot: number;
    doctors: ScheduleDoctorInfo[];
}

// Interface cho request parameters
export interface ScheduleFilterParams {
    startDate?: string; // Format: "YYYY-MM-DD"
    endDate?: string; // Format: "YYYY-MM-DD"
    shift?: Shift;
    departmentId?: number;
    doctorId?: number;
}

/**
 * Service để quản lý các API liên quan đến lịch làm việc
 */
const scheduleService = {
    /**
     * Lấy danh sách lịch làm việc có sẵn với bộ lọc
     * @param params - Các tham số lọc
     * @returns Promise với response từ API
     */
    getAvailableSchedules: async (params: ScheduleFilterParams = {}): Promise<ApiResponse<DaySchedule[]>> => {
        try {
            const response = await apiClient.get<ApiResponse<DaySchedule[]>>('/api/schedules/available', {
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching available schedules:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch làm việc của bác sĩ hiện tại trong tuần
     * @param doctorId - ID của bác sĩ
     * @param startDate - Ngày bắt đầu tuần (format: "YYYY-MM-DD")
     * @param endDate - Ngày kết thúc tuần (format: "YYYY-MM-DD")
     * @returns Promise với response từ API
     */
    getDoctorWeeklySchedule: async (
        doctorId: number,
        startDate: string,
        endDate: string
    ): Promise<ApiResponse<DaySchedule[]>> => {
        return scheduleService.getAvailableSchedules({
            doctorId,
            startDate,
            endDate
        });
    },

    /**
     * Lấy lịch làm việc của bác sĩ theo ca
     * @param doctorId - ID của bác sĩ
     * @param shift - Ca làm việc
     * @param startDate - Ngày bắt đầu
     * @param endDate - Ngày kết thúc
     * @returns Promise với response từ API
     */
    getDoctorScheduleByShift: async (
        doctorId: number,
        shift: Shift,
        startDate: string,
        endDate: string
    ): Promise<ApiResponse<DaySchedule[]>> => {
        return scheduleService.getAvailableSchedules({
            doctorId,
            shift,
            startDate,
            endDate
        });
    },

    /**
     * Utility function: Lấy ngày đầu tuần (thứ 2)
     * @param date - Ngày bất kỳ trong tuần
     * @returns Ngày thứ 2 của tuần đó
     */
    getWeekStart: (date: Date = new Date()): Date => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh nếu là chủ nhật
        return new Date(date.setDate(diff));
    },

    /**
     * Utility function: Lấy ngày cuối tuần (chủ nhật)
     * @param date - Ngày bất kỳ trong tuần
     * @returns Ngày chủ nhật của tuần đó
     */
    getWeekEnd: (date: Date = new Date()): Date => {
        const weekStart = scheduleService.getWeekStart(new Date(date));
        return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    },

    /**
     * Utility function: Format date thành string YYYY-MM-DD
     * @param date - Date object
     * @returns String format YYYY-MM-DD
     */
    formatDate: (date: Date): string => {
        return date.toISOString().split('T')[0];
    },

    /**
     * Utility function: Lấy tên ngày bằng tiếng Việt
     * @param dateName - DateName enum
     * @returns Tên ngày bằng tiếng Việt
     */
    getVietnameseDayName: (dateName: DateName): string => {
        const dayNames = {
            [DateName.MONDAY]: 'Thứ 2',
            [DateName.TUESDAY]: 'Thứ 3',
            [DateName.WEDNESDAY]: 'Thứ 4',
            [DateName.THURSDAY]: 'Thứ 5',
            [DateName.FRIDAY]: 'Thứ 6',
            [DateName.SATURDAY]: 'Thứ 7',
            [DateName.SUNDAY]: 'Chủ nhật'
        };
        return dayNames[dateName];
    },

    /**
     * Utility function: Lấy tên ca làm việc bằng tiếng Việt
     * @param shift - Shift enum
     * @returns Tên ca bằng tiếng Việt
     */
    getVietnameseShiftName: (shift: Shift): string => {
        const shiftNames = {
            [Shift.SANG]: 'Sáng',
            [Shift.CHIEU]: 'Chiều',
            [Shift.TOI]: 'Tối'
        };
        return shiftNames[shift];
    },

    /**
     * Lấy danh sách lịch nghỉ của bác sĩ hiện tại
     * @param params - Các tham số lọc (date, status)
     * @returns Promise với response từ API
     */
    getMyLeaves: async (params: LeaveFilterParams = {}): Promise<ApiResponse<LeaveRequest[]>> => {
        try {
            const response = await apiClient.get<ApiResponse<LeaveRequest[]>>('/api/schedules/leave/me', {
                params
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Thêm lịch nghỉ mới
     * @param data - Dữ liệu lịch nghỉ
     * @returns Promise với response từ API
     */
    createLeave: async (data: LeaveRequestData): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const response = await apiClient.post<ApiResponse<LeaveRequest>>('/api/schedules/leave', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật lịch nghỉ
     * @param data - Dữ liệu lịch nghỉ cần cập nhật (bao gồm id)
     * @returns Promise với response từ API
     */
    updateLeave: async (data: LeaveRequestData): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const response = await apiClient.put<ApiResponse<LeaveRequest>>('/api/schedules/leave', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa lịch nghỉ
     * @param id - ID của lịch nghỉ cần xóa
     * @returns Promise với response từ API
     */
    deleteLeave: async (id: number): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient.delete<ApiResponse<void>>('/api/schedules/leave', {
                data: { id }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default scheduleService;