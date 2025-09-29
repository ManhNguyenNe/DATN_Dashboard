"use client";

import React from 'react';
import { Card, Row, Col, Placeholder } from 'react-bootstrap';

// Base Skeleton Component
interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    animation?: 'glow' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    borderRadius = '0.375rem',
    className = '',
    animation = 'glow'
}) => {
    return (
        <Placeholder
            as="div"
            animation={animation}
            className={className}
            style={{
                width,
                height,
                borderRadius,
                backgroundColor: '#e9ecef'
            }}
        />
    );
};

// Table Skeleton
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
    rows = 5,
    columns = 4
}) => {
    return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, index) => (
                            <th key={index}>
                                <Skeleton height="1.5rem" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex}>
                                    <Skeleton height="1.25rem" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Card Skeleton  
interface CardSkeletonProps {
    showImage?: boolean;
    imageHeight?: string;
    lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
    showImage = false,
    imageHeight = '200px',
    lines = 3
}) => {
    return (
        <Card>
            {showImage && (
                <Skeleton height={imageHeight} borderRadius="0.375rem 0.375rem 0 0" />
            )}
            <Card.Body>
                {Array.from({ length: lines }).map((_, index) => (
                    <div key={index} className="mb-2">
                        <Skeleton
                            height="1rem"
                            width={index === lines - 1 ? '70%' : '100%'}
                        />
                    </div>
                ))}
            </Card.Body>
        </Card>
    );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                        <Skeleton width="48px" height="48px" borderRadius="50%" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                        <Skeleton height="1rem" width="60%" className="mb-2" />
                        <Skeleton height="1.5rem" width="40%" />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => {
    return (
        <Row className="g-3 mb-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Col xl={3} lg={6} md={6} sm={12} key={index}>
                    <StatsCardSkeleton />
                </Col>
            ))}
        </Row>
    );
};

// Appointment List Skeleton
export const AppointmentListSkeleton: React.FC = () => {
    return (
        <Card>
            <Card.Header>
                <Skeleton height="1.5rem" width="40%" />
            </Card.Header>
            <Card.Body className="p-0">
                <TableSkeleton rows={6} columns={6} />
            </Card.Body>
        </Card>
    );
};

// Patient Card Skeleton
export const PatientCardSkeleton: React.FC = () => {
    return (
        <Card>
            <Card.Body>
                <div className="d-flex align-items-start">
                    <div className="flex-shrink-0">
                        <Skeleton width="64px" height="64px" borderRadius="50%" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                        <Skeleton height="1.25rem" width="70%" className="mb-2" />
                        <Skeleton height="1rem" width="50%" className="mb-2" />
                        <Skeleton height="1rem" width="60%" className="mb-2" />
                        <div className="d-flex gap-2 mt-3">
                            <Skeleton height="2rem" width="80px" />
                            <Skeleton height="2rem" width="80px" />
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

// Form Skeleton
interface FormSkeletonProps {
    fields?: number;
    showButtons?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
    fields = 4,
    showButtons = true
}) => {
    return (
        <div>
            {Array.from({ length: fields }).map((_, index) => (
                <div key={index} className="mb-3">
                    <Skeleton height="1rem" width="25%" className="mb-2" />
                    <Skeleton height="2.5rem" />
                </div>
            ))}

            {showButtons && (
                <div className="d-flex gap-2 mt-4">
                    <Skeleton height="2.5rem" width="100px" />
                    <Skeleton height="2.5rem" width="100px" />
                </div>
            )}
        </div>
    );
};

// Chart Skeleton
export const ChartSkeleton: React.FC = () => {
    return (
        <Card>
            <Card.Header>
                <Skeleton height="1.5rem" width="40%" />
            </Card.Header>
            <Card.Body>
                <div className="position-relative" style={{ height: '300px' }}>
                    <Skeleton height="100%" />
                    <div className="position-absolute top-50 start-50 translate-middle">
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải biểu đồ...</span>
                            </div>
                            <div className="mt-2 text-muted small">Đang tải dữ liệu biểu đồ</div>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};