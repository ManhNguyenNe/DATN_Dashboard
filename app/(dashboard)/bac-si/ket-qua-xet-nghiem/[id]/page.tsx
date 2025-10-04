"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Col, Row, Alert, Spinner, Badge, Image, Button } from 'react-bootstrap';
import { FileEarmarkText, Clock, CheckCircle, Calendar, Person, Building, Cash, ArrowLeft } from 'react-bootstrap-icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import labOrderService, { LabOrderDetail } from '../../../../../services/labOrderService';

const LabResultDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [labOrder, setLabOrder] = useState<LabOrderDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

    const labOrderId = params.id as string;

    useEffect(() => {
        if (labOrderId) {
            fetchLabOrderDetail();
        }
    }, [labOrderId]);

    const fetchLabOrderDetail = async () => {
        try {
            setLoading(true);
            const response = await labOrderService.getLabOrderDetail(parseInt(labOrderId));
            setLabOrder(response.data);
        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin kết quả'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'CHO_THUC_HIEN':
                return 'warning';
            case 'DANG_THUC_HIEN':
                return 'info';
            case 'HOAN_THANH':
                return 'success';
            case 'HUY_BO':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CHO_THUC_HIEN':
                return 'Chờ thực hiện';
            case 'DANG_THUC_HIEN':
                return 'Đang thực hiện';
            case 'HOAN_THANH':
                return 'Hoàn thành';
            case 'HUY_BO':
                return 'Hủy bỏ';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </Spinner>
            </div>
        );
    }

    if (!labOrder) {
        return (
            <Row>
                <Col>
                    <Alert variant="danger">
                        <CheckCircle className="me-2" />
                        Không tìm thấy thông tin kết quả xét nghiệm
                    </Alert>
                </Col>
            </Row>
        );
    }

    return (
        <>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Button
                                variant="outline-secondary"
                                className="me-3"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="me-1" size={16} />
                                Quay lại
                            </Button>
                            <div>
                                <h4 className="mb-1">Kết quả xét nghiệm</h4>
                                <p className="text-muted mb-0">
                                    Kết quả cho dịch vụ: <strong>{labOrder.healthPlanName}</strong>
                                    {labOrder.code && (
                                        <> - Mã: <strong>{labOrder.code}</strong></>
                                    )}
                                </p>
                            </div>
                        </div>
                        <FileEarmarkText size={32} className="text-success" />
                    </div>
                </Col>
            </Row>

            {/* Alert */}
            {alert && (
                <Row className="mb-4">
                    <Col>
                        <Alert
                            variant={alert.type}
                            dismissible
                            onClose={() => setAlert(null)}
                        >
                            {alert.message}
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Thông tin chỉ định */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">
                                <Building className="me-2" />
                                Thông tin chỉ định
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Dịch vụ:</strong>
                                <div className="mt-1">{labOrder.healthPlanName}</div>
                            </div>

                            <div className="mb-3">
                                <strong>Phòng thực hiện:</strong>
                                <div className="mt-1">{labOrder.room || 'Chưa xác định'}</div>
                            </div>

                            <div className="mb-3">
                                <strong>Bác sĩ chỉ định:</strong>
                                <div className="mt-1">
                                    <Person className="me-1" size={14} />
                                    {labOrder.doctorOrdered || 'Chưa xác định'}
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Bác sĩ thực hiện:</strong>
                                <div className="mt-1">
                                    <Person className="me-1" size={14} />
                                    {labOrder.doctorPerformed || 'Chưa xác định'}
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Trạng thái:</strong>
                                <div className="mt-1">
                                    <Badge bg={getStatusBadgeVariant(labOrder.status)}>
                                        {getStatusText(labOrder.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mb-3">
                                <strong>Ngày chỉ định:</strong>
                                <div className="mt-1">
                                    <Calendar className="me-1" size={14} />
                                    {new Date(labOrder.orderDate).toLocaleString('vi-VN')}
                                </div>
                            </div>

                            {labOrder.diagnosis && (
                                <div className="mb-3">
                                    <strong>Chẩn đoán:</strong>
                                    <div className="mt-1">{labOrder.diagnosis}</div>
                                </div>
                            )}

                            <div>
                                <strong>Giá:</strong>
                                <div className="mt-1 text-success fw-bold">
                                    <Cash className="me-1" size={14} />
                                    {labOrder.price.toLocaleString('vi-VN')} VNĐ
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Kết quả xét nghiệm */}
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="bg-success text-white">
                            <h6 className="mb-0">
                                <CheckCircle className="me-2" />
                                Kết quả xét nghiệm
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {labOrder.labResultResponse ? (
                                <>
                                    <div className="mb-3">
                                        <strong>Ngày thực hiện:</strong>
                                        <div className="mt-1">
                                            <Clock className="me-1" size={14} />
                                            {new Date(labOrder.labResultResponse.date).toLocaleString('vi-VN')}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Chi tiết kết quả:</strong>
                                        <div className="mt-1 p-3 bg-light rounded">
                                            {labOrder.labResultResponse.resultDetails}
                                        </div>
                                    </div>

                                    {labOrder.labResultResponse.note && (
                                        <div className="mb-3">
                                            <strong>Ghi chú:</strong>
                                            <div className="mt-1 p-3 bg-light rounded">
                                                {labOrder.labResultResponse.note}
                                            </div>
                                        </div>
                                    )}

                                    {labOrder.labResultResponse.explanation && (
                                        <div className="mb-3">
                                            <strong>Giải thích:</strong>
                                            <div className="mt-1 p-3 bg-light rounded">
                                                {labOrder.labResultResponse.explanation}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <FileEarmarkText size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">Chưa có kết quả</h6>
                                    <p className="text-muted mb-0">
                                        Kết quả xét nghiệm chưa được cập nhật
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default LabResultDetailPage;