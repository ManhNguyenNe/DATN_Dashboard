import apiClient, { type ApiResponse } from './api';
import { DoctorInfo } from './userService';

// Enums cho User Role
export enum UserRole {
    BAC_SI = 'BAC_SI',
    LE_TAN = 'LE_TAN',
    ADMIN = 'ADMIN'
}

// Enums cho User Status
export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

// Interface cho User Response từ API
export interface User {
    id: number;
    email: string;
    role: UserRole;
    status: boolean;
    createdAt: string;
    doctor?: DoctorInfo; // Chỉ có khi role là BAC_SI
}

// Interface cho Login Request
export interface LoginRequest {
    username: string;
    password: string;
}

// Interface cho Login Response từ API
export interface LoginResponse {
    accessToken: string;
    userResponse: User;
}

// Interface cho Auth State
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Constants cho localStorage keys
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

/**
 * Service để quản lý các API liên quan đến Authentication
 */
const authService = {
    /**
     * Đăng nhập người dùng
     * @param loginData - Thông tin đăng nhập (username, password)
     * @returns Promise với response từ API
     */
    login: async (loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        try {
            const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/dashboard/login', loginData);

            if (response.data && response.data.data) {
                // Lưu token và user info vào localStorage
                authService.setToken(response.data.data.accessToken);
                authService.setUser(response.data.data.userResponse);
            }

            return response.data;
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    },

    /**
     * Đăng xuất người dùng
     */
    logout: (): void => {
        // Xóa token và user info khỏi localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        // Có thể gọi API logout ở đây nếu backend yêu cầu
        // await apiClient.post('/api/auth/logout');
    },

    /**
     * Lấy token từ localStorage
     */
    getToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    /**
     * Lưu token vào localStorage
     */
    setToken: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    /**
     * Lấy user info từ localStorage
     */
    getUser: (): User | null => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(USER_KEY);
            if (userStr) {
                try {
                    return JSON.parse(userStr) as User;
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    return null;
                }
            }
        }
        return null;
    },

    /**
     * Lưu user info vào localStorage
     */
    setUser: (user: User): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    },

    /**
     * Kiểm tra xem user có đăng nhập hay không
     */
    isAuthenticated: (): boolean => {
        const token = authService.getToken();
        const user = authService.getUser();
        return !!(token && user);
    },

    /**
     * Kiểm tra xem token có hết hạn hay không
     * @param token - JWT token để kiểm tra
     */
    isTokenExpired: (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    },

    /**
     * Kiểm tra quyền truy cập theo role
     * @param requiredRoles - Danh sách các role được phép truy cập
     */
    hasRole: (requiredRoles: UserRole[]): boolean => {
        const user = authService.getUser();
        if (!user) return false;
        return requiredRoles.includes(user.role);
    },

    /**
     * Làm mới token (nếu backend hỗ trợ)
     */
    refreshToken: async (): Promise<void> => {
        // Implement nếu backend có API refresh token
        // const response = await apiClient.post('/api/auth/refresh');
        // authService.setToken(response.data.accessToken);
    },

    /**
     * Kiểm tra và xử lý token hết hạn
     */
    checkTokenValidity: (): boolean => {
        const token = authService.getToken();
        if (!token) return false;

        if (authService.isTokenExpired(token)) {
            authService.logout();
            return false;
        }

        return true;
    },

    /**
     * Lấy thông tin user hiện tại (có thể từ API hoặc localStorage)
     */
    getCurrentUser: async (): Promise<User | null> => {
        // Kiểm tra localStorage trước
        const localUser = authService.getUser();
        if (localUser && authService.checkTokenValidity()) {
            return localUser;
        }

        // Nếu không có hoặc token hết hạn, trả về null
        return null;
    }
};

export default authService;