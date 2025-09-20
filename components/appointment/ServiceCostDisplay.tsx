"use client";

import React from "react";
import { Row, Col } from "react-bootstrap";
import { HealthPlan } from "../../services";

interface ServiceCostDisplayProps {
    service: {
        name: string;
        price: number;
        roomNumber?: string;
        roomName?: string;
    };
    className?: string;
}

const ServiceCostDisplay: React.FC<ServiceCostDisplayProps> = ({ service, className = "" }) => {
    // Function to format currency in VND
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className={`bg-light p-3 rounded ${className}`}>
            <h6 className="text-muted mb-2">Chi phí khám bệnh</h6>

            {/* Service Info */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Dịch vụ:</span>
                <span className="fw-medium">{service.name}</span>
            </div>

            {/* Price Info */}
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Phí khám:</span>
                <strong className="text-primary fs-5">
                    {formatCurrency(service.price)}
                </strong>
            </div>

            {/* Room Info */}
            {(service.roomNumber || service.roomName) && (
                <div className="border-top pt-2 mt-2">
                    <h6 className="text-muted mb-2">Thông tin phòng khám</h6>
                    {service.roomNumber && (
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <span>Số phòng:</span>
                            <span className="fw-medium">{service.roomNumber}</span>
                        </div>
                    )}
                    {service.roomName && (
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Tên phòng:</span>
                            <span className="fw-medium">{service.roomName}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServiceCostDisplay;
