import { useOptimizedAPI, useDebouncedAPI } from '../hooks/useOptimizedAPI';
import { appointmentService, type AppointmentFilter, type Appointment } from '../services';

// Custom hooks cho appointments với caching
export const useAppointments = (filters: AppointmentFilter = {}) => {
    return useOptimizedAPI(
        'appointments',
        () => appointmentService.getAppointments(filters),
        filters,
        {
            cacheTime: 5 * 60 * 1000, // Cache 5 phút
            staleTime: 1 * 60 * 1000, // Fresh trong 1 phút
            refetchOnWindowFocus: true
        }
    );
};

// Hook cho appointments với debounced search
export const useDebouncedAppointments = (filters: AppointmentFilter, delay = 500) => {
    return useDebouncedAPI(
        'appointments_search',
        () => appointmentService.getAppointments(filters),
        filters,
        delay,
        {
            cacheTime: 2 * 60 * 1000, // Cache ngắn hơn cho search
            staleTime: 30 * 1000 // Fresh trong 30s
        }
    );
};

// Hook cho appointments hôm nay (cache lâu hơn)
export const useTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];

    return useOptimizedAPI(
        'today_appointments',
        () => appointmentService.getAppointments({ date: today }),
        { date: today },
        {
            cacheTime: 10 * 60 * 1000, // Cache 10 phút
            staleTime: 2 * 60 * 1000, // Fresh trong 2 phút
            refetchOnWindowFocus: true
        }
    );
};

// Hook cho appointments của một patient theo phone
export const usePatientAppointments = (phone: string, enabled = true) => {
    return useOptimizedAPI(
        'patient_appointments',
        () => appointmentService.getAppointments({ phone }),
        { phone },
        {
            enabled: enabled && !!phone,
            cacheTime: 10 * 60 * 1000, // Cache 10 phút
            staleTime: 2 * 60 * 1000, // Fresh trong 2 phút
        }
    );
};

// Hook cho doctor appointments
export const useDoctorAppointments = (doctorId: number, date?: string) => {
    const filters = { doctorId, date };

    return useOptimizedAPI(
        'doctor_appointments',
        () => appointmentService.getAppointments(filters),
        filters,
        {
            cacheTime: 5 * 60 * 1000,
            staleTime: 1 * 60 * 1000,
            refetchOnWindowFocus: true,
            enabled: !!doctorId
        }
    );
};