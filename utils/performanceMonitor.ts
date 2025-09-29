import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number> = new Map();
    private observers: PerformanceObserver[] = [];

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    // Measure page load time
    measurePageLoad(): void {
        if (typeof window === 'undefined') return;

        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
            const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            const firstPaint = this.getFirstPaint();
            const firstContentfulPaint = this.getFirstContentfulPaint();

            console.group('📊 Page Performance Metrics');
            console.log(`🕐 Page Load Time: ${pageLoadTime.toFixed(2)}ms`);
            console.log(`📄 DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms`);
            if (firstPaint) console.log(`🎨 First Paint: ${firstPaint.toFixed(2)}ms`);
            if (firstContentfulPaint) console.log(`🖼️ First Contentful Paint: ${firstContentfulPaint.toFixed(2)}ms`);
            console.groupEnd();

            // Store metrics
            this.metrics.set('pageLoadTime', pageLoadTime);
            this.metrics.set('domContentLoaded', domContentLoaded);
            if (firstPaint) this.metrics.set('firstPaint', firstPaint);
            if (firstContentfulPaint) this.metrics.set('firstContentfulPaint', firstContentfulPaint);
        }
    }

    // Measure API call performance
    measureAPICall<T>(apiName: string, apiCall: () => Promise<T>): Promise<T> {
        const startTime = performance.now();

        return apiCall()
            .then(result => {
                const endTime = performance.now();
                const duration = endTime - startTime;

                console.log(`🌐 API Call [${apiName}]: ${duration.toFixed(2)}ms`);
                this.metrics.set(`api_${apiName}`, duration);

                // Warning for slow API calls
                if (duration > 2000) {
                    console.warn(`⚠️ Slow API call detected: ${apiName} took ${duration.toFixed(2)}ms`);
                }

                return result;
            })
            .catch(error => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                console.error(`❌ API Call Failed [${apiName}]: ${duration.toFixed(2)}ms`, error);
                throw error;
            });
    }

    // Measure component render time
    measureComponentRender(componentName: string): () => void {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            console.log(`⚛️ Component Render [${componentName}]: ${duration.toFixed(2)}ms`);
            this.metrics.set(`component_${componentName}`, duration);

            // Warning for slow renders
            if (duration > 100) {
                console.warn(`⚠️ Slow component render: ${componentName} took ${duration.toFixed(2)}ms`);
            }
        };
    }

    // Monitor long tasks
    observeLongTasks(): void {
        if (typeof window === 'undefined') return;

        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'longtask') {
                        console.warn(`🐌 Long Task detected: ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });

            observer.observe({ entryTypes: ['longtask'] });
            this.observers.push(observer);
        } catch (e) {
            console.log('Long task monitoring not supported');
        }
    }

    // Monitor layout shifts
    observeLayoutShifts(): void {
        if (typeof window === 'undefined') return;

        try {
            const observer = new PerformanceObserver((list) => {
                let totalShift = 0;
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                        totalShift += (entry as any).value;
                    }
                }

                if (totalShift > 0) {
                    console.log(`📱 Layout Shift Score: ${totalShift.toFixed(4)}`);
                    if (totalShift > 0.1) {
                        console.warn('⚠️ High layout shift detected');
                    }
                }
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(observer);
        } catch (e) {
            console.log('Layout shift monitoring not supported');
        }
    }

    // Get First Paint time
    private getFirstPaint(): number | null {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    // Get First Contentful Paint time
    private getFirstContentfulPaint(): number | null {
        const paintEntries = performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return firstContentfulPaint ? firstContentfulPaint.startTime : null;
    }

    // Bundle size analysis
    analyzeBundleSize(): void {
        if (typeof window === 'undefined') return;

        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalSize = 0;
        const resourceSizes: { [key: string]: number } = {};

        resources.forEach(resource => {
            if (resource.transferSize) {
                totalSize += resource.transferSize;
                const type = this.getResourceType(resource.name);
                resourceSizes[type] = (resourceSizes[type] || 0) + resource.transferSize;
            }
        });

        console.group('📦 Bundle Size Analysis');
        console.log(`📊 Total Size: ${this.formatBytes(totalSize)}`);
        Object.entries(resourceSizes).forEach(([type, size]) => {
            console.log(`${this.getResourceIcon(type)} ${type}: ${this.formatBytes(size)}`);
        });
        console.groupEnd();
    }

    // Memory usage monitoring
    monitorMemoryUsage(): void {
        if (typeof window === 'undefined' || !(performance as any).memory) return;

        const memory = (performance as any).memory;
        console.group('🧠 Memory Usage');
        console.log(`📈 Used: ${this.formatBytes(memory.usedJSHeapSize)}`);
        console.log(`📊 Total: ${this.formatBytes(memory.totalJSHeapSize)}`);
        console.log(`🚫 Limit: ${this.formatBytes(memory.jsHeapSizeLimit)}`);
        console.groupEnd();
    }

    // Get all metrics
    getMetrics(): Map<string, number> {
        return new Map(this.metrics);
    }

    // Performance score calculation
    calculatePerformanceScore(): number {
        const pageLoadTime = this.metrics.get('pageLoadTime') || 0;
        const firstContentfulPaint = this.metrics.get('firstContentfulPaint') || 0;

        let score = 100;

        // Deduct points for slow load times
        if (pageLoadTime > 3000) score -= 20;
        else if (pageLoadTime > 2000) score -= 10;
        else if (pageLoadTime > 1000) score -= 5;

        if (firstContentfulPaint > 2000) score -= 15;
        else if (firstContentfulPaint > 1500) score -= 8;
        else if (firstContentfulPaint > 1000) score -= 3;

        return Math.max(0, score);
    }

    // Generate performance report
    generateReport(): void {
        console.group('📋 Performance Report');
        console.log(`⭐ Performance Score: ${this.calculatePerformanceScore()}/100`);

        console.log('\n📊 Key Metrics:');
        this.metrics.forEach((value, key) => {
            console.log(`  ${key}: ${value.toFixed(2)}ms`);
        });

        this.monitorMemoryUsage();
        this.analyzeBundleSize();
        console.groupEnd();
    }

    // Cleanup observers
    cleanup(): void {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }

    // Helper methods
    private getResourceType(url: string): string {
        if (url.includes('.js')) return 'JavaScript';
        if (url.includes('.css')) return 'CSS';
        if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif')) return 'Images';
        if (url.includes('.woff') || url.includes('.ttf')) return 'Fonts';
        return 'Other';
    }

    private getResourceIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'JavaScript': '📜',
            'CSS': '🎨',
            'Images': '🖼️',
            'Fonts': '🔤',
            'Other': '📄'
        };
        return icons[type] || '📄';
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
    const monitor = PerformanceMonitor.getInstance();

    return {
        measureAPICall: monitor.measureAPICall.bind(monitor),
        measureComponentRender: monitor.measureComponentRender.bind(monitor),
        getMetrics: monitor.getMetrics.bind(monitor),
        generateReport: monitor.generateReport.bind(monitor),
    };
};

// HOC for measuring component performance
export const withPerformanceMonitoring = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName?: string
) => {
    const ComponentWithMonitoring = (props: P) => {
        const monitor = PerformanceMonitor.getInstance();
        const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

        React.useEffect(() => {
            const endMeasure = monitor.measureComponentRender(name);
            return endMeasure;
        }, [monitor, name]);

        return React.createElement(WrappedComponent, props);
    };

    ComponentWithMonitoring.displayName = `withPerformanceMonitoring(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

    return ComponentWithMonitoring;
};