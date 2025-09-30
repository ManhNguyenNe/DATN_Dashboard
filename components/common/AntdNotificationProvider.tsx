"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { notification, ConfigProvider } from 'antd';
import type { NotificationArgsProps } from 'antd';

interface AntdNotificationContextType {
    showSuccess: (message: string, description?: string) => void;
    showError: (message: string, description?: string) => void;
    showInfo: (message: string, description?: string) => void;
    showWarning: (message: string, description?: string) => void;
}

const AntdNotificationContext = createContext<AntdNotificationContextType | undefined>(undefined);

export const useAntdNotification = () => {
    const context = useContext(AntdNotificationContext);
    if (!context) {
        throw new Error('useAntdNotification must be used within an AntdNotificationProvider');
    }
    return context;
};

interface AntdNotificationProviderProps {
    children: ReactNode;
}

export const AntdNotificationProvider: React.FC<AntdNotificationProviderProps> = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();

    const showSuccess = (message: string, description?: string) => {
        api.success({
            message,
            description,
            placement: 'topRight',
            duration: 4.5,
        });
    };

    const showError = (message: string, description?: string) => {
        api.error({
            message,
            description,
            placement: 'topRight',
            duration: 4.5,
        });
    };

    const showInfo = (message: string, description?: string) => {
        api.info({
            message,
            description,
            placement: 'topRight',
            duration: 4.5,
        });
    };

    const showWarning = (message: string, description?: string) => {
        api.warning({
            message,
            description,
            placement: 'topRight',
            duration: 4.5,
        });
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    // Customize Ant Design theme to match your app
                    colorPrimary: '#5D4FB3', // Purple color matching your theme
                    borderRadius: 8,
                },
            }}
        >
            <AntdNotificationContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
                {contextHolder}
                {children}
            </AntdNotificationContext.Provider>
        </ConfigProvider>
    );
};