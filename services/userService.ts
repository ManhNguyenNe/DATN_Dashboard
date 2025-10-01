import apiClient, { ApiResponse } from './api';

// Interface cho thông tin bác sĩ (nested trong user response)
export interface DoctorInfo {
    id: number;
    fullName: string;
    phone: string;
    address: string;
    birth: string; // format: "YYYY-MM-DD"
    profileImage: string;
    exp: number; // kinh nghiệm (năm)
    position: string; // chức vụ
    available: boolean;
}

// Interface cho user response từ API /api/users/me
export interface UserMeResponse {
    id: number;
    email: string;
    role: 'BAC_SI' | 'LE_TAN' | 'ADMIN';
    status: boolean;
    createdAt: string;
    doctor?: DoctorInfo; // chỉ có khi role là BAC_SI
}

// Interface cho thông tin người dùng (dùng cho UI)
export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    avatar?: string;
    role: 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN'; // UI sử dụng tên khác với API
    experience?: number;
    position?: string;
    available?: boolean;
    status: boolean;
    createdAt: string;
}

// Interface cho cập nhật thông tin
export interface UserProfileUpdateData {
    fullName?: string;
    phone?: string;
    address?: string;
    birth?: string; // API sử dụng "birth" thay vì "dateOfBirth"
    profileImage?: string;
    exp?: number;
    position?: string;
    available?: boolean;
}

// Interface cho đổi mật khẩu
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Service để quản lý thông tin người dùng
 */
const userService = {
    /**
     * Lấy thông tin của người dùng hiện tại từ API /api/users/me
     */
    getCurrentUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
        try {
            const response = await apiClient.get<ApiResponse<UserMeResponse>>('/api/users/me');

            // Transform API response thành UserProfile format cho UI
            const apiData = response.data.data;
            const transformedData: UserProfile = {
                id: apiData.id,
                email: apiData.email,
                role: apiData.role === 'BAC_SI' ? 'DOCTOR' :
                    apiData.role === 'LE_TAN' ? 'RECEPTIONIST' : 'ADMIN',
                status: apiData.status,
                createdAt: apiData.createdAt,
                // Thông tin từ doctor object (nếu có)
                fullName: apiData.doctor?.fullName || '',
                phone: apiData.doctor?.phone || '',
                address: apiData.doctor?.address || '',
                dateOfBirth: apiData.doctor?.birth || '',
                avatar: apiData.doctor?.profileImage || '',
                experience: apiData.doctor?.exp || 0,
                position: apiData.doctor?.position || '',
                available: apiData.doctor?.available || false,
            };

            return {
                ...response.data,
                data: transformedData
            };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin profile (giả sử có API tương ứng)
     */
    updateProfile: async (data: UserProfileUpdateData): Promise<ApiResponse<UserProfile>> => {
        try {
            // Transform UI data về format API
            const apiData = {
                fullName: data.fullName,
                phone: data.phone,
                address: data.address,
                birth: data.birth, // API sử dụng "birth"
                profileImage: data.profileImage,
                exp: data.exp,
                position: data.position,
                available: data.available
            };

            const response = await apiClient.put<ApiResponse<UserMeResponse>>('/api/users/profile', apiData);

            // Transform response lại thành UserProfile format
            const apiResponseData = response.data.data;
            const transformedData: UserProfile = {
                id: apiResponseData.id,
                email: apiResponseData.email,
                role: apiResponseData.role === 'BAC_SI' ? 'DOCTOR' :
                    apiResponseData.role === 'LE_TAN' ? 'RECEPTIONIST' : 'ADMIN',
                status: apiResponseData.status,
                createdAt: apiResponseData.createdAt,
                fullName: apiResponseData.doctor?.fullName || '',
                phone: apiResponseData.doctor?.phone || '',
                address: apiResponseData.doctor?.address || '',
                dateOfBirth: apiResponseData.doctor?.birth || '',
                avatar: apiResponseData.doctor?.profileImage || '',
                experience: apiResponseData.doctor?.exp || 0,
                position: apiResponseData.doctor?.position || '',
                available: apiResponseData.doctor?.available || false,
            };

            return {
                ...response.data,
                data: transformedData
            };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (data: ChangePasswordData): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient.put<ApiResponse<any>>('/api/users/change-password', data);
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },

    /**
     * Upload avatar
     */
    uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
                '/api/users/upload-avatar',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    },

    /**
     * Lấy thông tin người dùng theo ID (cho admin)
     */
    getUserById: async (id: number): Promise<ApiResponse<UserProfile>> => {
        try {
            const response = await apiClient.get<ApiResponse<UserProfile>>(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            throw error;
        }
    },
};

export default userService;