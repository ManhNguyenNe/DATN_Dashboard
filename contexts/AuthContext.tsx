"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, type User, type LoginRequest, type AuthState, UserRole } from '../services';

// Interface cho AuthContext
interface AuthContextType extends AuthState {
    login: (loginData: LoginRequest) => Promise<void>;
    logout: () => void;
    hasRole: (requiredRoles: UserRole[]) => boolean;
    checkAuth: () => Promise<void>;
}

// Actions cho useReducer
type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'AUTH_FAILURE' }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        default:
            return state;
    }
};

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook để sử dụng AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// AuthProvider props
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Kiểm tra authentication khi component mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Function để kiểm tra authentication
    const checkAuth = async (): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START' });

            const token = authService.getToken();
            const user = authService.getUser();

            if (token && user && authService.checkTokenValidity()) {
                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: { user, token },
                });
            } else {
                // Token không hợp lệ hoặc hết hạn
                authService.logout();
                dispatch({ type: 'AUTH_FAILURE' });
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            authService.logout();
            dispatch({ type: 'AUTH_FAILURE' });
        }
    };

    // Function đăng nhập
    const login = async (loginData: LoginRequest): Promise<void> => {
        try {
            dispatch({ type: 'AUTH_START' });

            const response = await authService.login(loginData);

            if (response && response.data) {
                const { accessToken, userResponse } = response.data;

                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: { user: userResponse, token: accessToken },
                });
            } else {
                throw new Error(response?.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            dispatch({ type: 'AUTH_FAILURE' });
            throw error;
        }
    };

    // Function đăng xuất
    const logout = (): void => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    // Function kiểm tra quyền
    const hasRole = (requiredRoles: UserRole[]): boolean => {
        if (!state.user) return false;
        return requiredRoles.includes(state.user.role);
    };

    // Context value
    const contextValue: AuthContextType = {
        ...state,
        login,
        logout,
        hasRole,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;