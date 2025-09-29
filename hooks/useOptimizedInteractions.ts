import { useState, useEffect, useCallback, useRef } from 'react';

// Hook cho debounce
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Hook cho debounced callback
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update callback ref khi callback thay đổi
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    ) as T;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

// Hook cho throttle
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef<number>(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

// Hook cho throttled callback
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    limit: number
): T {
    const callbackRef = useRef(callback);
    const lastRanRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            if (Date.now() - lastRanRef.current >= limit) {
                callbackRef.current(...args);
                lastRanRef.current = Date.now();
            } else {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    callbackRef.current(...args);
                    lastRanRef.current = Date.now();
                }, limit - (Date.now() - lastRanRef.current));
            }
        },
        [limit]
    ) as T;

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return throttledCallback;
}

// Hook cho optimized search
export function useOptimizedSearch<T>(
    searchFunction: (query: string) => Promise<T>,
    options: {
        debounceDelay?: number;
        minQueryLength?: number;
        cacheResults?: boolean;
    } = {}
) {
    const {
        debounceDelay = 300,
        minQueryLength = 2,
        cacheResults = true
    } = options;

    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<T | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const cache = useRef<Map<string, T>>(new Map());
    const abortControllerRef = useRef<AbortController | null>(null);

    const debouncedQuery = useDebounce(query, debounceDelay);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < minQueryLength) {
            setResults(null);
            return;
        }

        // Check cache
        if (cacheResults && cache.current.has(searchQuery)) {
            setResults(cache.current.get(searchQuery)!);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setIsSearching(true);
            setError(null);

            const searchResults = await searchFunction(searchQuery);

            // Cache results
            if (cacheResults) {
                cache.current.set(searchQuery, searchResults);
            }

            setResults(searchResults);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err);
            }
        } finally {
            setIsSearching(false);
        }
    }, [searchFunction, minQueryLength, cacheResults]);

    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, performSearch]);

    // Clear cache function
    const clearCache = useCallback(() => {
        cache.current.clear();
    }, []);

    // Reset search function
    const resetSearch = useCallback(() => {
        setQuery('');
        setResults(null);
        setError(null);
        setIsSearching(false);
    }, []);

    return {
        query,
        setQuery,
        results,
        isSearching,
        error,
        clearCache,
        resetSearch
    };
}