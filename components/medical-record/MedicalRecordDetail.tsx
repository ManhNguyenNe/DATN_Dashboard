"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Alert, Form, Badge, Table } from "react-bootstrap";
import { IconArrowLeft, IconStethoscope, IconCash, IconCreditCard, IconUser, IconCalendar, IconClipboard } from "@tabler/icons-react";
import "bootstrap-icons/font/bootstrap-icons.css";

// Import services and types
import {
    medicalRecordService,
    paymentService,
    type MedicalRecordDetail as MedicalRecordDetailType,
    type LabOrderResponse,
    type PaymentLinkRequest,
    type PaymentLinkResponse
} from "../../services";

// Import components
import QRPaymentModal from "../payment/QRPaymentModal";

interface MedicalRecordDetailProps {
    medicalRecordId: string;
    onBack: () => void;
}

interface SelectedService {
    serviceName: string;
    doctorName: string;
    price: number;
    room: string;
}

interface PaymentData {
    invoiceId: number;
    qrCode: string;
}

const MedicalRecordDetail: React.FC<MedicalRecordDetailProps> = ({
    medicalRecordId,
    onBack
}) => {
    // State
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecordDetailType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Payment related state
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
    const [paymentLoading, setPaymentLoading] = useState<boolean>(false);

    // QR Payment Modal state
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

    // Load medical record detail on mount
    useEffect(() => {
        loadMedicalRecordDetail();
    }, [medicalRecordId]);

    const loadMedicalRecordDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await medicalRecordService.getMedicalRecordDetail(medicalRecordId);

            if (response && response.data) {
                setMedicalRecord(response.data);
            } else {
                throw new Error('Không thể tải thông tin phiếu khám');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi khi tải thông tin phiếu khám');
        } finally {
            setLoading(false);
        }
    };

    // Chuyển đổi labOrdersResponses sang format services để maintain backward compatibility
    const convertToServices = (labOrders: LabOrderResponse[]): SelectedService[] => {
        return labOrders.map(order => ({
            serviceName: order.healthPlanName,
            doctorName: order.doctorPerformed || order.doctorOrdered || 'Chưa xác định',
            price: order.price,
            room: order.room || 'Chưa xác định'
        }));
    };

    const getUnpaidServices = (): LabOrderResponse[] => {
        return medicalRecord?.labOrdersResponses?.filter(service => service.statusPayment === 'CHUA_THANH_TOAN') || [];
    };

    const getPaidServices = (): LabOrderResponse[] => {
        return medicalRecord?.labOrdersResponses?.filter(service => service.statusPayment === 'DA_THANH_TOAN') || [];
    };

    // Lấy tất cả dịch vụ đã thanh toán (bao gồm cả phí khám có id = null)
    const getPaidServicesWithExamFee = (): LabOrderResponse[] => {
        return medicalRecord?.labOrdersResponses?.filter(service => service.statusPayment === 'DA_THANH_TOAN') || [];
    }; const handleSelectAllUnpaid = () => {
        const unpaidServices = getUnpaidServices();
        if (selectedServices.length === unpaidServices.length) {
            // Deselect all
            setSelectedServices([]);
        } else {
            // Select all
            setSelectedServices(unpaidServices.map(service => ({
                serviceName: service.healthPlanName,
                doctorName: service.doctorPerformed || service.doctorOrdered || 'Chưa xác định',
                price: service.price,
                room: service.room || 'Chưa xác định'
            })));
        }
    };

    const handleServiceSelection = (service: LabOrderResponse) => {
        const isSelected = selectedServices.some(s => s.serviceName === service.healthPlanName);

        if (isSelected) {
            // Remove from selection
            setSelectedServices(prev => prev.filter(s => s.serviceName !== service.healthPlanName));
        } else {
            // Add to selection
            setSelectedServices(prev => [...prev, {
                serviceName: service.healthPlanName,
                doctorName: service.doctorPerformed || service.doctorOrdered || 'Chưa xác định',
                price: service.price,
                room: service.room || 'Chưa xác định'
            }]);
        }
    };

    const getTotalSelectedAmount = (): number => {
        return selectedServices.reduce((total, service) => total + service.price, 0);
    };

    const handlePayment = async () => {
        if (selectedServices.length === 0) {
            setError('Vui lòng chọn ít nhất một dịch vụ để thanh toán');
            return;
        }

        if (paymentMethod === 'cash') {
            // Handle cash payment
            alert('Xác nhận thanh toán tiền mặt (Chức năng này sẽ được triển khai sau)');
        } else {
            // Handle QR payment
            await handleCreateQRPayment();
        }
    };

    const handleCreateQRPayment = async () => {
        try {
            setPaymentLoading(true);
            setError(null);

            const paymentRequest: PaymentLinkRequest = {
                medicalRecordId: parseInt(medicalRecordId),
                healthPlanIds: [],
                doctorId: null
            };

            const response = await paymentService.createPaymentLink(paymentRequest);

            if (response && response.data) {
                setPaymentData({
                    invoiceId: response.data.invoiceId,
                    qrCode: response.data.qrCode
                });
                setShowPaymentModal(true);
            } else {
                throw new Error('Không thể tạo mã QR thanh toán');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi khi tạo mã QR thanh toán');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setSuccess('Thanh toán thành công!');
        // Reload medical record to get updated payment status
        loadMedicalRecordDetail();
        // Clear selected services
        setSelectedServices([]);
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(`Lỗi thanh toán: ${errorMessage}`);
    };

    const handlePaymentModalClose = () => {
        setShowPaymentModal(false);
        setPaymentData(null);
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'DANG_KHAM':
                return 'primary';
            case 'CHO_XET_NGHIEM':
                return 'warning';
            case 'HOAN_THANH':
                return 'success';
            case 'HUY':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DANG_KHAM':
                return 'Đang khám';
            case 'CHO_XET_NGHIEM':
                return 'Chờ xét nghiệm';
            case 'HOAN_THANH':
                return 'Hoàn thành';
            case 'HUY':
                return 'Hủy';
            default:
                return status;
        }
    };

    const getLabOrderStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'CHO_THUC_HIEN':
                return 'warning';
            case 'DANG_THUC_HIEN':
                return 'info';
            case 'HOAN_THANH':
                return 'success';
            case 'HUY':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getLabOrderStatusText = (status: string) => {
        switch (status) {
            case 'CHO_THUC_HIEN':
                return 'Chờ thực hiện';
            case 'DANG_THUC_HIEN':
                return 'Đang thực hiện';
            case 'HOAN_THANH':
                return 'Hoàn thành';
            case 'HUY':
                return 'Hủy';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải thông tin phiếu khám...</p>
                </Card.Body>
            </Card>
        );
    }

    if (!medicalRecord) {
        return (
            <Card>
                <Card.Body>
                    <Alert variant="danger">
                        Không tìm thấy thông tin phiếu khám
                    </Alert>
                    <Button variant="outline-secondary" onClick={onBack}>
                        <IconArrowLeft size={16} className="me-2" />
                        Quay lại danh sách
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    const unpaidServices = getUnpaidServices();
    const paidServices = getPaidServices();
    const paidServicesWithExamFee = getPaidServicesWithExamFee();

    return (
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <IconStethoscope size={20} className="me-2" />
                        <h5 className="mb-0">Chi tiết phiếu khám</h5>
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={onBack}>
                        <IconArrowLeft size={16} className="me-2" />
                        Quay lại danh sách
                    </Button>
                </Card.Header>

                <Card.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <strong>Lỗi:</strong> {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                            <strong>Thành công:</strong> {success}
                        </Alert>
                    )}

                    {/* Medical Record Info */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <Card className="border-0 bg-light">
                                <Card.Body>
                                    <h6 className="mb-3">
                                        <IconUser size={16} className="me-2" />
                                        Thông tin phiếu khám
                                    </h6>
                                    <div className="mb-2">
                                        <strong>Mã phiếu khám:</strong> {medicalRecord.code}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Bệnh nhân:</strong> {medicalRecord.patientName}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Ngày khám:</strong> {new Date(medicalRecord.date).toLocaleString('vi-VN')}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Trạng thái:</strong>{' '}
                                        <Badge bg={getStatusBadgeVariant(medicalRecord.status)}>
                                            {getStatusText(medicalRecord.status)}
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 bg-light">
                                <Card.Body>
                                    <h6 className="mb-3">
                                        <IconClipboard size={16} className="me-2" />
                                        Thông tin khám bệnh
                                    </h6>
                                    <div className="mb-2">
                                        <strong>Triệu chứng:</strong> {medicalRecord.symptoms || 'Chưa có thông tin'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Khám lâm sàng:</strong> {medicalRecord.clinicalExamination || 'Chưa có thông tin'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Chẩn đoán:</strong> {medicalRecord.diagnosis || 'Chưa có thông tin'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Tổng chi phí:</strong>{' '}
                                        <span className="fw-bold text-primary">
                                            {medicalRecord.total.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Services Section */}
                    <Row>
                        {/* Paid Services */}
                        {paidServicesWithExamFee.length > 0 && (
                            <Col md={6} className="mb-4">
                                <Card className="h-100">
                                    <Card.Header className="bg-success text-white">
                                        <h6 className="mb-0">
                                            <i className="bi bi-check-circle me-2"></i>
                                            Dịch vụ đã thanh toán ({paidServicesWithExamFee.length})
                                        </h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Table responsive size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Dịch vụ</th>
                                                    <th>Bác sĩ</th>
                                                    <th>Phòng</th>
                                                    <th>Trạng thái</th>
                                                    <th>Ngày chỉ định</th>
                                                    <th className="text-end">Giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paidServicesWithExamFee.map((service, index) => {
                                                    // Kiểm tra xem đây có phải là phí khám không (id = null)
                                                    const isExamFee = service.id === null;
                                                    return (
                                                        <tr key={index} className={isExamFee ? 'table-info' : ''}>
                                                            <td>
                                                                {service.healthPlanName}
                                                                {isExamFee && <Badge bg="info" className="ms-2">Phí khám</Badge>}
                                                            </td>
                                                            <td>
                                                                {service.doctorPerformed || service.doctorOrdered || 'Chưa xác định'}
                                                            </td>
                                                            <td>{service.room || 'Chưa xác định'}</td>
                                                            <td>
                                                                <Badge bg={getLabOrderStatusBadgeVariant(service.status)}>
                                                                    {getLabOrderStatusText(service.status)}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {/* Ưu tiên orderDate, nếu không có thì dùng createdAt, không có nữa thì dùng date của medical record */}
                                                                {service.orderDate
                                                                    ? new Date(service.orderDate).toLocaleDateString('vi-VN')
                                                                    : service.createdAt
                                                                        ? new Date(service.createdAt).toLocaleDateString('vi-VN')
                                                                        : medicalRecord.date
                                                                            ? new Date(medicalRecord.date).toLocaleDateString('vi-VN')
                                                                            : 'N/A'}
                                                                {service.expectedResultDate && (
                                                                    <div className="text-muted small">
                                                                        Dự kiến: {new Date(service.expectedResultDate).toLocaleDateString('vi-VN')}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="text-end fw-bold text-success">
                                                                {service.price.toLocaleString('vi-VN')}đ
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}

                        {/* Unpaid Services */}
                        {unpaidServices.length > 0 && (
                            <Col md={paidServicesWithExamFee.length > 0 ? 6 : 12} className="mb-4">
                                <Card className="h-100">
                                    <Card.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            Dịch vụ chưa thanh toán ({unpaidServices.length})
                                        </h6>
                                        <Form.Check
                                            type="checkbox"
                                            label="Chọn tất cả"
                                            checked={selectedServices.length === unpaidServices.length && unpaidServices.length > 0}
                                            onChange={handleSelectAllUnpaid}
                                        />
                                    </Card.Header>
                                    <Card.Body>
                                        <Table responsive size="sm">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '50px' }}>Chọn</th>
                                                    <th>Dịch vụ</th>
                                                    <th>Bác sĩ</th>
                                                    <th>Phòng</th>
                                                    <th>Trạng thái</th>
                                                    <th>Ngày chỉ định</th>
                                                    <th className="text-end">Giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {unpaidServices.map((service, index) => {
                                                    const isSelected = selectedServices.some(s => s.serviceName === service.healthPlanName);
                                                    return (
                                                        <tr key={index} className={isSelected ? 'table-primary' : ''}>
                                                            <td>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => handleServiceSelection(service)}
                                                                />
                                                            </td>
                                                            <td>{service.healthPlanName}</td>
                                                            <td>{service.doctorPerformed || service.doctorOrdered || 'Chưa xác định'}</td>
                                                            <td>{service.room || 'Chưa xác định'}</td>
                                                            <td>
                                                                <Badge bg={getLabOrderStatusBadgeVariant(service.status)}>
                                                                    {getLabOrderStatusText(service.status)}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {service.orderDate ? new Date(service.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                {service.expectedResultDate && (
                                                                    <div className="text-muted small">
                                                                        Dự kiến: {new Date(service.expectedResultDate).toLocaleDateString('vi-VN')}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="text-end fw-bold text-warning">
                                                                {service.price.toLocaleString('vi-VN')}đ
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>

                    {/* Payment Section */}
                    {unpaidServices.length > 0 && (
                        <Card className="mt-4">
                            <Card.Header>
                                <h6 className="mb-0">
                                    <IconCash size={16} className="me-2" />
                                    Thanh toán dịch vụ
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                {selectedServices.length > 0 && (
                                    <Alert variant="info" className="mb-3">
                                        <strong>Đã chọn {selectedServices.length} dịch vụ</strong><br />
                                        Tổng tiền: <strong>{getTotalSelectedAmount().toLocaleString('vi-VN')}đ</strong>
                                    </Alert>
                                )}

                                {/* Payment Method Selection */}
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Phương thức thanh toán</Form.Label>
                                            <div className="d-flex gap-4 mt-2">
                                                <Form.Check
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="cash"
                                                    label="Tiền mặt"
                                                    value="cash"
                                                    checked={paymentMethod === 'cash'}
                                                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank_transfer')}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    name="paymentMethod"
                                                    id="bank_transfer"
                                                    label="Chuyển khoản"
                                                    value="bank_transfer"
                                                    checked={paymentMethod === 'bank_transfer'}
                                                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank_transfer')}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2">
                                    {paymentMethod === 'bank_transfer' ? (
                                        <Button
                                            variant="success"
                                            onClick={handlePayment}
                                            disabled={paymentLoading || selectedServices.length === 0}
                                            className="d-flex align-items-center"
                                        >
                                            {paymentLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Đang tạo...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-qr-code me-2"></i>
                                                    Tạo mã QR thanh toán
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="warning"
                                            onClick={handlePayment}
                                            disabled={paymentLoading || selectedServices.length === 0}
                                            className="d-flex align-items-center"
                                        >
                                            <IconCash size={16} className="me-2" />
                                            Xác nhận thanh toán tiền mặt
                                        </Button>
                                    )}

                                    <Button
                                        variant="primary"
                                        onClick={() => window.print()}
                                        className="d-flex align-items-center"
                                    >
                                        <i className="bi bi-printer me-2"></i>
                                        In hóa đơn
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Card.Body>
            </Card>

            {/* QR Payment Modal */}
            {paymentData && (
                <QRPaymentModal
                    show={showPaymentModal}
                    onHide={handlePaymentModalClose}
                    qrCodeData={paymentData.qrCode}
                    invoiceId={paymentData.invoiceId}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            )}
        </>
    );
};

export default MedicalRecordDetail;