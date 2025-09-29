import { useState, useEffect, useCallback, useRef } from 'react';

// Generic type cho API response
type ApiFunction<T, P = void> = (params: P) => Promise<T>;

// Options cho useOptimizedAPI hook
interface UseOptimizedAPIOptions<T> {
    cacheTime?: number; // Thời gian cache (ms)
    staleTime?: number; // Thời gian dữ liệu được coi là fresh (ms)
    refetchOnWindowFocus?: boolean;
    enabled?: boolean; // Có tự động fetch không
}

// Cache storage
const apiCache = new Map<string, { data: any; timestamp: number; isStale: boolean }>();

// Hook tối ưu cho API calls
export function useOptimizedAPI<T, P = void>(
    key: string,
    apiFunction: ApiFunction<T, P>,
    params?: P,
    options: UseOptimizedAPIOptions<T> = {}
) {
    const {
        cacheTime = 5 * 60 * 1000, // 5 phút
        staleTime = 1 * 60 * 1000, // 1 phút
        refetchOnWindowFocus = false,
        enabled = true
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [isStale, setIsStale] = useState<boolean>(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const cacheKey = `${key}_${JSON.stringify(params)}`;

    // Function để fetch data
    const fetchData = useCallback(async (forceRefresh = false) => {
        // Kiểm tra cache nếu không force refresh
        if (!forceRefresh) {
            const cached = apiCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < cacheTime) {
                setData(cached.data);
                setIsStale(cached.isStale);
                return cached.data;
            }
        }

        // Cancel previous request nếu có
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Tạo AbortController mới
        abortControllerRef.current = new AbortController();

        try {
            setIsLoading(true);
            setError(null);

            const result = await apiFunction(params as P);

            // Lưu vào cache
            const now = Date.now();
            const isDataStale = false;
            apiCache.set(cacheKey, {
                data: result,
                timestamp: now,
                isStale: isDataStale
            });

            setData(result);
            setIsStale(isDataStale);

            // Đánh dấu data là stale sau staleTime
            setTimeout(() => {
                const cachedItem = apiCache.get(cacheKey);
                if (cachedItem) {
                    cachedItem.isStale = true;
                    setIsStale(true);
                }
            }, staleTime);

            return result;
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err);
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiFunction, params, cacheKey, cacheTime, staleTime]);

    // Auto fetch khi component mount hoặc params thay đổi
    useEffect(() => {
        if (enabled) {
            fetchData();
        }

        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, enabled]);

    // Refetch khi window focus (nếu enabled)
    useEffect(() => {
        if (!refetchOnWindowFocus) return;

        const handleFocus = () => {
            if (isStale && enabled) {
                fetchData();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchData, isStale, refetchOnWindowFocus, enabled]);

    // Mutate function để update cache
    const mutate = useCallback((newData: T) => {
        setData(newData);
        apiCache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
            isStale: false
        });
        setIsStale(false);
    }, [cacheKey]);

    // Invalidate cache
    const invalidate = useCallback(() => {
        apiCache.delete(cacheKey);
        setIsStale(true);
    }, [cacheKey]);

    // Refetch function
    const refetch = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        isStale,
        mutate,
        invalidate,
        refetch
    };
}

// Hook cho debounced API calls
export function useDebouncedAPI<T, P = void>(
    key: string,
    apiFunction: ApiFunction<T, P>,
    params: P,
    delay = 300,
    options: UseOptimizedAPIOptions<T> = {}
) {
    const [debouncedParams, setDebouncedParams] = useState<P>(params);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedParams(params);
        }, delay);

        return () => clearTimeout(timer);
    }, [params, delay]);

    return useOptimizedAPI(key, apiFunction, debouncedParams, options);
}

// Utility để clear toàn bộ cache
export const clearAPICache = () => {
    apiCache.clear();
};

// Utility để clear cache theo pattern
export const clearCacheByPattern = (pattern: string) => {
    for (const key of apiCache.keys()) {
        if (key.includes(pattern)) {
            apiCache.delete(key);
        }
    }
};