"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Col, Row, Form, Button, Alert, Spinner, Badge, Image } from 'react-bootstrap';
import { ArrowLeft, Save, FileEarmarkText, Clock, CheckCircle, XCircle, CloudUpload, Trash, Eye } from 'react-bootstrap-icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import labOrderService, { LabOrderDetail } from '../../../../../services/labOrderService';
import labResultService from '../../../../../services/labResultService';
import { LabResultFormData } from '../../../../../types/LabResultTypes';

const LabTestExecutionPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [labOrder, setLabOrder] = useState<LabOrderDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

    const [formData, setFormData] = useState<LabResultFormData>({
        resultDetails: '',
        note: '',
        summary: '',
        explanation: ''
    });

    // State cho ảnh kết quả
    const [resultImages, setResultImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    const labOrderId = params.id as string;

    useEffect(() => {
        if (labOrderId) {
            initializeLabTest();
        }
    }, [labOrderId]);

    const initializeLabTest = async () => {
        try {
            setLoading(true);

            // Bước 1: Lấy thông tin chi tiết chỉ định
            const response = await labOrderService.getLabOrderDetail(parseInt(labOrderId));
            const labOrderData = response.data;

            // Bước 2: Nếu trạng thái là CHO_THUC_HIEN, cập nhật thành DANG_THUC_HIEN
            if (labOrderData.status === 'CHO_THUC_HIEN') {
                await labResultService.updateLabOrderStatus({
                    id: parseInt(labOrderId),
                    status: 'DANG_THUC_HIEN'
                });

                // Cập nhật trạng thái trong state
                labOrderData.status = 'DANG_THUC_HIEN';

                setAlert({
                    type: 'info',
                    message: 'Đã bắt đầu thực hiện xét nghiệm. Vui lòng điền kết quả bên dưới.'
                });
            }

            setLabOrder(labOrderData);
        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin chỉ định'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof LabResultFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Xử lý upload ảnh
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setAlert({
                type: 'danger',
                message: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF)'
            });
            return;
        }

        // Validate file size (max 5MB per file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = newFiles.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            setAlert({
                type: 'danger',
                message: 'Kích thước file không được vượt quá 5MB'
            });
            return;
        }

        // Add new files to existing ones
        const updatedFiles = [...resultImages, ...newFiles];

        // Limit total files (max 10)
        if (updatedFiles.length > 10) {
            setAlert({
                type: 'danger',
                message: 'Tối đa 10 ảnh cho mỗi kết quả xét nghiệm'
            });
            return;
        }

        setResultImages(updatedFiles);

        // Create preview URLs
        const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);

        // Clear input
        event.target.value = '';
    };

    // Xóa ảnh
    const handleRemoveImage = (index: number) => {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(imagePreviewUrls[index]);

        setResultImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Cleanup URLs when component unmounts
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const validateForm = (): boolean => {
        if (!formData.resultDetails.trim()) {
            setAlert({
                type: 'danger',
                message: 'Vui lòng nhập chi tiết kết quả'
            });
            return false;
        }
        if (!formData.summary.trim()) {
            setAlert({
                type: 'danger',
                message: 'Vui lòng nhập tóm tắt kết quả'
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setAlert(null);

            // Chỉ thêm kết quả xét nghiệm (trạng thái đã được cập nhật khi vào trang)
            await labResultService.createLabResult({
                labOrderId: parseInt(labOrderId),
                ...formData
            });

            setAlert({
                type: 'success',
                message: 'Lưu kết quả xét nghiệm thành công!'
            });

            // Redirect về trang danh sách sau 2 giây
            setTimeout(() => {
                router.push('/bac-si/chi-dinh-xet-nghiem');
            }, 2000);

        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi lưu kết quả xét nghiệm'
            });
        } finally {
            setSubmitting(false);
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
                        <XCircle className="me-2" />
                        Không tìm thấy thông tin chỉ định xét nghiệm
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
                        <div>
                            <h4 className="mb-1">Thực hiện xét nghiệm</h4>
                            <p className="text-muted mb-0">
                                Điền kết quả xét nghiệm cho dịch vụ: <strong>{labOrder.healthPlanName}</strong>
                            </p>
                        </div>
                        <FileEarmarkText size={32} className="text-primary" />
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
                <Col lg={4} className="mb-4">
                    <Card className="h-100">
                        <Card.Header>
                            <h6 className="mb-0">Thông tin chỉ định</h6>
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
                                <div className="mt-1">{labOrder.doctorOrdered || 'Chưa xác định'}</div>
                            </div>

                            <div className="mb-3">
                                <strong>Bác sĩ thực hiện:</strong>
                                <div className="mt-1">{labOrder.doctorPerformed || user?.doctor?.fullName || 'Chưa xác định'}</div>
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
                                    <Clock className="me-1" size={14} />
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
                                    {labOrder.price.toLocaleString('vi-VN')} VNĐ
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Form điền kết quả */}
                <Col lg={8}>
                    <Card>
                        <Card.Header>
                            <h6 className="mb-0">Điền kết quả xét nghiệm</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Chi tiết kết quả <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                placeholder="Nhập chi tiết kết quả xét nghiệm..."
                                                value={formData.resultDetails}
                                                onChange={(e) => handleInputChange('resultDetails', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Tóm tắt <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Nhập tóm tắt kết quả..."
                                                value={formData.summary}
                                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Ghi chú</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Nhập ghi chú thêm (nếu có)..."
                                                value={formData.note}
                                                onChange={(e) => handleInputChange('note', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={12} className="mb-4">
                                        <Form.Group>
                                            <Form.Label>Giải thích</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Nhập giải thích về kết quả (nếu có)..."
                                                value={formData.explanation}
                                                onChange={(e) => handleInputChange('explanation', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* Upload ảnh kết quả */}
                                    <Col md={12} className="mb-4">
                                        <Form.Group>
                                            <Form.Label>Ảnh kết quả xét nghiệm</Form.Label>
                                            <div className="mb-3">
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="d-none"
                                                    id="imageUpload"
                                                />
                                                <div
                                                    className="border border-dashed border-2 p-4 text-center"
                                                    style={{ borderColor: '#dee2e6', borderRadius: '8px' }}
                                                >
                                                    <CloudUpload size={32} className="text-muted mb-2" />
                                                    <div>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => document.getElementById('imageUpload')?.click()}
                                                        >
                                                            <CloudUpload className="me-1" size={16} />
                                                            Chọn ảnh
                                                        </Button>
                                                    </div>
                                                    <small className="text-muted d-block mt-2">
                                                        Chọn tối đa 10 ảnh (JPG, PNG, GIF - tối đa 5MB/ảnh)
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Hiển thị preview ảnh */}
                                            {resultImages.length > 0 && (
                                                <div>
                                                    <h6 className="mb-3">Ảnh đã chọn ({resultImages.length}/10):</h6>
                                                    <Row className="g-3">
                                                        {resultImages.map((file, index) => (
                                                            <Col key={index} xs={6} md={4} lg={3}>
                                                                <div className="position-relative">
                                                                    <div
                                                                        className="border rounded"
                                                                        style={{
                                                                            aspectRatio: '1',
                                                                            overflow: 'hidden'
                                                                        }}
                                                                    >
                                                                        <Image
                                                                            src={imagePreviewUrls[index]}
                                                                            alt={`Ảnh kết quả ${index + 1}`}
                                                                            fluid
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'cover'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="position-absolute top-0 end-0 p-1">
                                                                        <Button
                                                                            variant="danger"
                                                                            size="sm"
                                                                            className="rounded-circle p-1"
                                                                            style={{ width: '30px', height: '30px' }}
                                                                            onClick={() => handleRemoveImage(index)}
                                                                            title="Xóa ảnh"
                                                                        >
                                                                            <Trash size={12} />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1">
                                                                        <small className="d-block text-truncate">
                                                                            {file.name}
                                                                        </small>
                                                                        <small className="text-muted">
                                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col md={12}>
                                        <div className="d-flex gap-2">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            className="me-2"
                                                        />
                                                        Đang lưu...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="me-1" size={16} />
                                                        Lưu kết quả
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline-secondary"
                                                onClick={() => router.back()}
                                                disabled={submitting}
                                            >
                                                Hủy
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default LabTestExecutionPage;