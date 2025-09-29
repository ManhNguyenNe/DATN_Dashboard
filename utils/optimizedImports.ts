/**
 * Tree shaking optimization utilities
 * Giúp giảm bundle size bằng cách import chỉ những gì cần thiết
 */

// ========================
// 1. BOOTSTRAP OPTIMIZATION
// ========================

// Thay vì import toàn bộ Bootstrap
// import 'bootstrap/dist/css/bootstrap.min.css'; // ~200kB

// Sử dụng selective imports trong SCSS:
/*
// styles/bootstrap-optimized.scss
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/containers";
@import "bootstrap/scss/tables";
@import "bootstrap/scss/forms";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/nav";
@import "bootstrap/scss/navbar";
@import "bootstrap/scss/card";
@import "bootstrap/scss/modal";
@import "bootstrap/scss/utilities";

// Bỏ qua những components không dùng:
// @import "bootstrap/scss/accordion";
// @import "bootstrap/scss/alert";
// @import "bootstrap/scss/badge";
// @import "bootstrap/scss/breadcrumb";
// @import "bootstrap/scss/carousel";
// @import "bootstrap/scss/collapse";
// @import "bootstrap/scss/dropdown";
// @import "bootstrap/scss/offcanvas";
// @import "bootstrap/scss/pagination";
// @import "bootstrap/scss/popover";
// @import "bootstrap/scss/progress";
// @import "bootstrap/scss/spinners";
// @import "bootstrap/scss/toast";
// @import "bootstrap/scss/tooltip";
*/

// ========================
// 2. ICONS OPTIMIZATION
// ========================

// Thay vì import toàn bộ icon pack
// import * as TablerIcons from '@tabler/icons-react'; // ~500kB

// Tree-shakable icon imports
export {
    IconHome,
    IconUser,
    IconSettings,
    IconSearch,
    IconPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconDownload,
    IconUpload,
    IconCalendar,
    IconClock,
    IconBell,
    IconMail,
    IconPhone,
    IconMapPin,
    IconCreditCard,
    IconChevronDown,
    IconChevronUp,
    IconChevronLeft,
    IconChevronRight,
    IconX,
    IconCheck,
    IconExclamationCircle,
    IconInfoCircle
} from '@tabler/icons-react';

// ========================
// 3. REACT-BOOTSTRAP OPTIMIZATION  
// ========================

// Specific component imports - corrected syntax
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';

// Re-export for tree shaking
export {
    Button,
    Modal,
    Form,
    Table,
    Card,
    Container,
    Row,
    Col,
    Nav,
    Navbar,
    Dropdown,
    InputGroup
};

// ========================
// 4. UTILITY FUNCTIONS
// ========================

/**
 * Dynamically import components only when needed
 */
export const importWhenNeeded = async (moduleImporter: () => Promise<any>) => {
    try {
        const module = await moduleImporter();
        return module.default || module;
    } catch (error) {
        console.error('Failed to import module:', error);
        return null;
    }
};

/**
 * Preload critical components for better performance
 */
export const preloadCriticalComponents = () => {
    // Preload components that are likely to be used soon
    const preloaders = [
        () => import('react-apexcharts'),
        // Add other heavy components here when needed
    ];

    preloaders.forEach(preloader => {
        // Use requestIdleCallback if available
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => preloader());
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(preloader, 100);
        }
    });
};

/**
 * Bundle size analyzer helper
 */
export const logBundleInfo = () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Bundle optimization tips:');
        console.log('1. Use lazy loading for heavy components');
        console.log('2. Import only needed Bootstrap components');
        console.log('3. Use tree-shakable icon imports');
        console.log('4. Consider CDN for large libraries');
    }
};

// ========================
// 5. PERFORMANCE MONITORING
// ========================

/**
 * Track bundle loading performance
 */
export const trackBundlePerformance = (componentName: string) => {
    if (process.env.NODE_ENV === 'development' && 'performance' in window) {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const loadTime = endTime - startTime;

            if (loadTime > 100) { // Log if loading takes more than 100ms
                console.warn(`${componentName} took ${loadTime.toFixed(2)}ms to load`);
            }
        };
    }

    return () => { }; // No-op for production
};

/**
 * Usage examples:
 * 
 * // 1. Lazy loading with performance tracking
 * const LazyChart = lazy(() => {
 *   const stopTracking = trackBundlePerformance('ApexChart');
 *   return import('react-apexcharts').then(module => {
 *     stopTracking();
 *     return { default: module.default };
 *   });
 * });
 * 
 * // 2. Tree-shakable imports
 * import { IconHome, IconUser } from '@/utils/optimizedImports';
 * import { Button, Modal } from '@/utils/optimizedImports';
 * 
 * // 3. Preloading
 * useEffect(() => {
 *   preloadCriticalComponents();
 * }, []);
 */