/**
 * Lazy loading wrappers cho các heavy libraries
 * Giúp giảm bundle size và cải thiện performance
 */

import { lazy, Suspense, ComponentType } from 'react';
import { TableSkeleton, CardSkeleton } from './SkeletonLoaders';

// 1. Lazy load ApexCharts (Heavy: ~100kB)
export const LazyApexChart = lazy(() =>
    import('react-apexcharts').then(module => ({
        default: module.default
    }))
);

// 2. Lazy load Complex Forms
export const LazyMedicalRecordForm = lazy(() =>
    import('../appointment/MedicalRecordForm').then(module => ({
        default: module.default
    }))
);

// 3. Lazy load QR Payment Modal
export const LazyQRPaymentModal = lazy(() =>
    import('../payment/QRPaymentModal').then(module => ({
        default: module.default
    }))
);

// HOC để wrap lazy components với Suspense
interface LazyWrapperProps {
    component: ComponentType<any>;
    fallback?: React.ReactNode;
    props?: any;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
    component: Component,
    fallback,
    ...props
}) => (
    <Suspense fallback={fallback || <CardSkeleton />}>
        <Component {...props} />
    </Suspense>
);

// Specific wrappers with appropriate skeletons
export const LazyChart: React.FC<any> = (props) => (
    <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading chart...</span>
            </div>
        </div>
    }>
        <LazyApexChart {...props} />
    </Suspense>
);

export const LazyEditor: React.FC<any> = (props) => (
    <Suspense fallback={
        <div className="border rounded p-3" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
            <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Loading editor...
                </div>
            </div>
        </div>
    }>
        <div>Editor component placeholder</div>
    </Suspense>
);

export const LazyForm: React.FC<any> = (props) => (
    <Suspense fallback={<TableSkeleton rows={8} />}>
        <LazyMedicalRecordForm {...props} />
    </Suspense>
);

export const LazyPayment: React.FC<any> = (props) => (
    <Suspense fallback={
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-body text-center p-4">
                        <div className="spinner-border text-primary mb-3" role="status"></div>
                        <p className="mb-0">Loading payment...</p>
                    </div>
                </div>
            </div>
        </div>
    }>
        <LazyQRPaymentModal {...props} />
    </Suspense>
);

// Conditional loading helper
export const conditionallyLoadComponent = (
    condition: boolean,
    LazyComponent: ComponentType<any>,
    fallback?: React.ReactNode
) => {
    if (!condition) return null;

    return (
        <Suspense fallback={fallback || <CardSkeleton />}>
            <LazyComponent />
        </Suspense>
    );
};

// Preload functions for better UX
export const preloadChart = () => {
    import('react-apexcharts');
};

export const preloadEditor = () => {
    // Placeholder for editor preload
    console.log('Preloading editor...');
};

export const preloadForm = () => {
    import('../appointment/MedicalRecordForm');
};

// Usage example:
/*
// Thay vì
import ApexChart from 'react-apexcharts';

// Sử dụng
import { LazyChart } from '@/components/common/LazyComponents';

// Trong component
const MyDashboard = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      {showChart && <LazyChart options={chartOptions} series={series} />}
    </div>
  );
};
*/