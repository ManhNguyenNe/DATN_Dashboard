"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useOptimizedAPI, useDebouncedAPI, clearAPICache, clearCacheByPattern } from '../hooks/useOptimizedAPI';

interface APIContextType {
    clearCache: () => void;
    clearCacheByPattern: (pattern: string) => void;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export const useAPIContext = () => {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error('useAPIContext must be used within APIProvider');
    }
    return context;
};

interface APIProviderProps {
    children: ReactNode;
}

export const APIProvider: React.FC<APIProviderProps> = ({ children }) => {
    const clearCache = () => {
        clearAPICache();
    };

    const clearPatternCache = (pattern: string) => {
        clearCacheByPattern(pattern);
    };

    const value: APIContextType = {
        clearCache,
        clearCacheByPattern: clearPatternCache
    };

    return (
        <APIContext.Provider value={value}>
            {children}
        </APIContext.Provider>
    );
};

// Export hooks để sử dụng
export { useOptimizedAPI, useDebouncedAPI };