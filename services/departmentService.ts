import apiClient, { ApiResponse } from './api';

// Interfaces cho Department data  
export interface Department {
  id: number;
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  headDoctorId?: number;
  headDoctorName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service để quản lý các API liên quan đến departments (khoa bác sĩ)
 */
const departmentService = {
  /**
   * Lấy danh sách tất cả các khoa bác sĩ
   * @returns Promise với response từ API
   */
  getAllDepartments: async (): Promise<ApiResponse<Department[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Department[]>>('/api/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin khoa bác sĩ theo ID
   * @param departmentId - ID của khoa
   * @returns Promise với response từ API
   */
  getDepartmentById: async (departmentId: number): Promise<ApiResponse<Department>> => {
    try {
      if (!departmentId) {
        throw new Error('Department ID không được để trống');
      }

      const response = await apiClient.get<ApiResponse<Department>>(`/api/departments/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department by ID:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách bác sĩ theo khoa
   * @param departmentId - ID của khoa
   * @returns Promise với response từ API
   */
  getDoctorsByDepartment: async (departmentId: number): Promise<ApiResponse<any[]>> => {
    try {
      if (!departmentId) {
        throw new Error('Department ID không được để trống');
      }

      const response = await apiClient.get<ApiResponse<any[]>>(`/api/departments/${departmentId}/doctors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors by department:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm khoa bác sĩ theo tên (client-side filtering)
   * @param searchTerm - Từ khóa tìm kiếm
   * @returns Promise với danh sách khoa được filter
   */
  searchDepartments: async (searchTerm: string): Promise<Department[]> => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Từ khóa tìm kiếm không được để trống');
      }

      // Sử dụng getAllDepartments và filter phía client
      const response = await departmentService.getAllDepartments();
      return response.data.filter((dept: Department) => 
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching departments:', error);
      throw error;
    }
  }
};

export default departmentService;