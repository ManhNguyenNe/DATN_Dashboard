"use client";

import dynamic from 'next/dynamic';
import Loading from './Loading';

// Dynamic imports cho các components nặng
export const DynamicApexChart = dynamic(
    () => import('react-apexcharts'),
    {
        ssr: false,
        loading: () => <Loading size="sm" text="Đang tải biểu đồ..." />
    }
);

export const DynamicSwiper = dynamic(
    () => import('swiper/react').then(mod => ({ default: mod.Swiper })),
    {
        ssr: false,
        loading: () => <Loading size="sm" text="Đang tải slider..." />
    }
);

export const DynamicSwiperSlide = dynamic(
    () => import('swiper/react').then(mod => ({ default: mod.SwiperSlide })),
    {
        ssr: false,
        loading: () => <div className="placeholder-slide" style={{ height: '200px', background: '#f8f9fa' }} />
    }
);

// HOC cho lazy loading components
export const withLazyLoading = <P extends object>(
    Component: React.ComponentType<P>,
    loadingText = "Đang tải..."
) => {
    return dynamic(
        () => Promise.resolve({ default: Component }),
        {
            ssr: false,
            loading: () => <Loading size="md" text={loadingText} />
        }
    );
};