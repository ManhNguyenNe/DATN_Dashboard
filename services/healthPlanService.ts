import apiClient, { ApiResponse } from './api';

// Enums cho Health Plan
export enum HealthPlanType {
  DICH_VU = 'DICH_VU',
  XET_NGHIEM = 'XET_NGHIEM',
  KHAM_TONG_QUAT = 'KHAM_TONG_QUAT',
  CHUYEN_KHOA = 'CHUYEN_KHOA'
}

// Interfaces cho Health Plan data
export interface HealthPlan {
  id: number;
  name: string;
  description?: string;
  type: HealthPlanType;
  price: number;
  duration?: number; // in minutes
  departmentId?: number;
  departmentName?: string;
  roomNumber?: string;
  roomName?: string;
  isActive?: boolean;
  requirements?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service để quản lý các API liên quan đến health plans (dịch vụ khám)
 */
const healthPlanService = {
  /**
   * Lấy danh sách tất cả các dịch vụ khám
   * @returns Promise với response từ API
   */
  getAllHealthPlans: async (): Promise<ApiResponse<HealthPlan[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<HealthPlan[]>>('/api/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching health plans:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách dịch vụ theo loại (client-side filtering)
   * @param type - Loại dịch vụ (DICH_VU, XET_NGHIEM, etc.)
   * @returns Promise với danh sách dịch vụ được filter
   */
  getHealthPlansByType: async (type: HealthPlanType): Promise<HealthPlan[]> => {
    try {
      if (!type || type.trim() === '') {
        throw new Error('Loại dịch vụ không được để trống');
      }

      // Lấy tất cả và filter phía client vì backend chưa có API filter
      const response = await healthPlanService.getAllHealthPlans();
      return response.data.filter((plan: HealthPlan) =>
        plan.type && plan.type.toUpperCase() === type.toUpperCase()
      );
    } catch (error) {
      console.error('Error fetching health plans by type:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin dịch vụ theo ID
   * @param id - ID của dịch vụ
   * @returns Promise với response từ API
   */
  getHealthPlanById: async (id: number): Promise<ApiResponse<HealthPlan>> => {
    try {
      if (!id) {
        throw new Error('ID dịch vụ không được để trống');
      }

      const response = await apiClient.get<ApiResponse<HealthPlan>>(`/api/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health plan by ID:', error);
      throw error;
    }
  }
};

export default healthPlanService;