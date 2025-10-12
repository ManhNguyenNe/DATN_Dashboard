"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { message, ConfigProvider } from 'antd';
import type { MessageArgsProps } from 'antd';

interface MessageContextType {
    success: (content: string, duration?: number) => void;
    error: (content: string, duration?: number) => void;
    info: (content: string, duration?: number) => void;
    warning: (content: string, duration?: number) => void;
    loading: (content: string, duration?: number) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};

interface MessageProviderProps {
    children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    const showMessage = (type: 'success' | 'error' | 'info' | 'warning' | 'loading', content: string, duration: number = 3) => {
        messageApi.open({
            type,
            content,
            duration,
            style: {
                marginTop: '80px', // Điều chỉnh để không bị che bởi header
            },
        });
    };

    const contextValue: MessageContextType = {
        success: (content: string, duration?: number) => showMessage('success', content, duration),
        error: (content: string, duration?: number) => showMessage('error', content, duration),
        info: (content: string, duration?: number) => showMessage('info', content, duration),
        warning: (content: string, duration?: number) => showMessage('warning', content, duration),
        loading: (content: string, duration?: number) => showMessage('loading', content, duration),
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    zIndexPopupBase: 1050, // Đảm bảo message hiển thị trên các component khác
                },
            }}
        >
            <MessageContext.Provider value={contextValue}>
                {contextHolder}
                {children}
            </MessageContext.Provider>
        </ConfigProvider>
    );
};