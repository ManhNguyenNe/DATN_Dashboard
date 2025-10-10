"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Alert, Form, Badge, Table } from "react-bootstrap";
import { IconArrowLeft, IconStethoscope, IconCash, IconCreditCard, IconUser, IconCalendar, IconClipboard, IconHistory } from "@tabler/icons-react";
import "bootstrap-icons/font/bootstrap-icons.css";

//import components
import MedicalRecordHistory from "./MedicalRecordHistory";

// CSS tùy chỉnh - Tương đồng với PatientManagement (Bootstrap standard)
const customStyles = `
    /* Tree connector cho xét nghiệm con */
    .invoice-details-table .ps-5 {
        position: relative;
    }
    
    .invoice-details-table .ps-5::before {
        content: '';
        position: absolute;
        left: 2rem;
        top: 0;
        bottom: 50%;
        width: 1px;
        background: #dee2e6;
    }
`;

// Import services and types
import {
    medicalRecordService,
    paymentService,
    labOrderService,
    type MedicalRecordDetail as MedicalRecordDetailType,
    type LabOrderResponse,
    type PaymentLinkRequest,
    type PaymentLinkResponse,
    type CashPaymentRequest,
    type DeleteLabOrdersRequest,
    type InvoiceDetailsResponse,
    type SingleLabResponse,
    type MultipleLabResponse
} from "../../services";

// Import components
import QRPaymentModal from "../payment/QRPaymentModal";

interface MedicalRecordDetailProps {
    medicalRecordId: string;
    onBack: () => void;
    onViewDetail?: (medicalRecordId: string) => void; // Thêm prop cho navigation từ lịch sử
}

interface SelectedService {
    id: number;
    serviceName: string;
    doctorName: string;
    price: number;
    room: string;
}

interface PaymentData {
    invoiceId: number;
    qrCode: string;
    orderCode: number;
}

const MedicalRecordDetail: React.FC<MedicalRecordDetailProps> = ({
    medicalRecordId,
    onBack,
    onViewDetail
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

    // Medical Record History state
    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

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

    // Load medical record detail with specific ID
    const loadMedicalRecordDetailById = async (recordId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await medicalRecordService.getMedicalRecordDetail(recordId);

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
            id: order.id !== null ? order.id : 0, // Chỉ set 0 nếu thực sự null
            serviceName: order.healthPlanName,
            doctorName: order.doctorPerformed || order.doctorOrdered || 'Chưa xác định',
            price: order.price,
            room: order.room || 'Chưa xác định'
        }));
    };

    // Lấy dịch vụ chưa thanh toán từ invoiceDetailsResponse (sử dụng API mới)
    const getUnpaidInvoiceDetails = (): InvoiceDetailsResponse[] => {
        const unpaid = medicalRecord?.invoiceDetailsResponse?.filter(item => item.status === 'CHUA_THANH_TOAN') || [];
        return unpaid;
    };

    // Lấy dịch vụ thanh toán một phần từ invoiceDetailsResponse
    const getPartiallyPaidInvoiceDetails = (): InvoiceDetailsResponse[] => {
        const partiallyPaid = medicalRecord?.invoiceDetailsResponse?.filter(item => item.status === 'THANH_TOAN_MOT_PHAN') || [];
        return partiallyPaid;
    };

    // Lấy dịch vụ cần thanh toán (bao gồm cả chưa thanh toán và thanh toán một phần)
    const getPendingPaymentInvoiceDetails = (): InvoiceDetailsResponse[] => {
        const pending = medicalRecord?.invoiceDetailsResponse?.filter(item =>
            item.status === 'CHUA_THANH_TOAN' || item.status === 'THANH_TOAN_MOT_PHAN'
        ) || [];
        return pending;
    };

    // Lấy dịch vụ đã thanh toán từ invoiceDetailsResponse (sử dụng API mới)
    const getPaidInvoiceDetails = (): InvoiceDetailsResponse[] => {
        return medicalRecord?.invoiceDetailsResponse?.filter(item => item.status === 'DA_THANH_TOAN') || [];
    };

    // Backward compatibility - lấy dịch vụ chưa thanh toán từ labOrdersResponses (để tương thích với logic cũ)
    const getUnpaidServices = (): LabOrderResponse[] => {
        if (medicalRecord?.labOrdersResponses) {
            const unpaid = medicalRecord.labOrdersResponses.filter(service =>
                service.statusPayment === 'CHUA_THANH_TOAN' || service.statusPayment === 'THANH_TOAN_MOT_PHAN'
            ) || [];
            return unpaid;
        }
        return [];
    };

    const getPaidServices = (): LabOrderResponse[] => {
        if (medicalRecord?.labOrdersResponses) {
            return medicalRecord.labOrdersResponses.filter(service => service.statusPayment === 'DA_THANH_TOAN') || [];
        }
        return [];
    };

    // Lấy tất cả dịch vụ đã thanh toán (bao gồm cả phí khám có id = null)
    const getPaidServicesWithExamFee = (): LabOrderResponse[] => {
        if (medicalRecord?.labOrdersResponses) {
            return medicalRecord.labOrdersResponses.filter(service => service.statusPayment === 'DA_THANH_TOAN') || [];
        }
        return [];
    }; const handleSelectAllUnpaid = () => {
        const unpaidServices = getUnpaidServices();
        // Chỉ chọn những dịch vụ có trạng thái CHO_THUC_HIEN (có thể xóa)
        const deletableServices = unpaidServices.filter(service => service.status === 'CHO_THUC_HIEN');

        if (selectedServices.length === deletableServices.length && deletableServices.length > 0) {
            // Deselect all
            setSelectedServices([]);
        } else {
            // Select all deletable services
            setSelectedServices(deletableServices.map(service => ({
                id: service.id !== null ? service.id : 0, // Chỉ set 0 nếu thực sự null
                serviceName: service.healthPlanName,
                doctorName: service.doctorPerformed || service.doctorOrdered || 'Chưa xác định',
                price: service.price,
                room: service.room || 'Chưa xác định'
            })));
        }
    };

    const handleServiceSelection = (service: LabOrderResponse) => {
        const isSelected = selectedServices.some(s => s.id === service.id);

        if (isSelected) {
            // Remove from selection
            setSelectedServices(prev => prev.filter(s => s.id !== service.id));
        } else {
            // Add to selection
            const newService = {
                id: service.id !== null ? service.id : 0, // Chỉ set 0 nếu thực sự null
                serviceName: service.healthPlanName,
                doctorName: service.doctorPerformed || service.doctorOrdered || 'Chưa xác định',
                price: service.price,
                room: service.room || 'Chưa xác định'
            };
            setSelectedServices(prev => [...prev, newService]);
        }
    };

    const getTotalSelectedAmount = (): number => {
        return selectedServices.reduce((total, service) => total + service.price, 0);
    };

    const handlePayment = async () => {
        // Thanh toán TẤT CẢ dịch vụ cần thanh toán (bao gồm chưa thanh toán và thanh toán một phần)
        const unpaidServices = getUnpaidServices();
        const pendingServices = medicalRecord?.invoiceDetailsResponse ? getPendingPaymentInvoiceDetails() : unpaidServices;

        if (pendingServices.length === 0) {
            setError('Không có dịch vụ nào cần thanh toán');
            return;
        }

        if (paymentMethod === 'cash') {
            // Handle cash payment
            await handleCashPayment();
        } else {
            // Handle QR payment
            await handleCreateQRPayment();
        }
    };

    const handleCashPayment = async () => {
        try {
            setPaymentLoading(true);
            setError(null);

            // Lấy TẤT CẢ dịch vụ cần thanh toán (bao gồm chưa thanh toán và thanh toán một phần)
            const pendingServices = getPendingPaymentInvoiceDetails();

            // Lấy danh sách healthPlanId của TẤT CẢ dịch vụ cần thanh toán
            const healthPlanIds = pendingServices
                .map(service => service.healthPlanId)
                .filter((id): id is number => id !== null && id !== undefined);

            // Kiểm tra xem có ID hợp lệ không
            if (healthPlanIds.length === 0) {
                throw new Error('Không có dịch vụ hợp lệ để thanh toán');
            }

            // Tính tổng số tiền cần thanh toán (giá dịch vụ - số tiền đã trả)
            const totalAmount = pendingServices.reduce((total, service) =>
                total + (service.healthPlanPrice - service.paid), 0
            );

            const cashPaymentRequest: CashPaymentRequest = {
                medicalRecordId: parseInt(medicalRecordId),
                healthPlanIds: healthPlanIds,
                totalAmount: totalAmount
            };

            await paymentService.payCash(cashPaymentRequest);

            setSuccess('Thanh toán tiền mặt thành công!');
            // Reload medical record to get updated payment status
            await loadMedicalRecordDetail();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Lỗi khi xử lý thanh toán tiền mặt');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleCreateQRPayment = async () => {
        try {
            setPaymentLoading(true);
            setError(null);

            // Lấy TẤT CẢ dịch vụ cần thanh toán (bao gồm chưa thanh toán và thanh toán một phần)
            const pendingServices = getPendingPaymentInvoiceDetails();

            // Lấy danh sách healthPlanId của TẤT CẢ dịch vụ cần thanh toán
            const healthPlanIds = pendingServices
                .map(service => service.healthPlanId)
                .filter((id): id is number => id !== null && id !== undefined);

            // Kiểm tra xem có ID hợp lệ không
            if (healthPlanIds.length === 0) {
                throw new Error('Không có dịch vụ hợp lệ để thanh toán');
            }

            // Tính tổng số tiền cần thanh toán của TẤT CẢ dịch vụ (giá dịch vụ - số tiền đã trả)
            const totalAmount = pendingServices.reduce((total, service) =>
                total + (service.healthPlanPrice - service.paid), 0
            );

            const paymentRequest: PaymentLinkRequest = {
                medicalRecordId: parseInt(medicalRecordId),
                labOrderIds: null,
                healthPlanIds: healthPlanIds,
                doctorId: null,
                totalAmount: totalAmount
            };

            const response = await paymentService.createPaymentLink(paymentRequest);

            if (response && response.data) {
                setPaymentData({
                    invoiceId: response.data.invoiceId,
                    qrCode: response.data.qrCode,
                    orderCode: response.data.orderCode
                });
                setShowPaymentModal(true);
            } else {
                throw new Error('Không thể tạo mã QR thanh toán');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Lỗi khi tạo mã QR thanh toán');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setSuccess('Thanh toán thành công!');

        // Đóng modal NGAY LẬP TỨC để tránh re-render gây polling lại
        setShowPaymentModal(false);
        setPaymentData(null);

        // Reload medical record to get updated payment status
        await loadMedicalRecordDetail();

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

    /**
     * Xóa các dịch vụ đã chọn
     */
    const handleDeleteServices = async () => {
        if (selectedServices.length === 0) {
            setError('Vui lòng chọn ít nhất một dịch vụ để xóa');
            return;
        }

        // Xác nhận xóa
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa ${selectedServices.length} dịch vụ đã chọn không?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setPaymentLoading(true);
            setError(null);

            // Lấy danh sách ID của các dịch vụ đã chọn
            const selectedLabOrderIds = selectedServices
                .map(service => service.id)
                .filter(id => id !== null && id !== undefined && id !== 0); // Lọc bỏ null, undefined và 0

            if (selectedLabOrderIds.length === 0) {
                throw new Error('Không có dịch vụ hợp lệ để xóa');
            }

            const deleteRequest: DeleteLabOrdersRequest = {
                ids: selectedLabOrderIds,
                medicalRecordId: parseInt(medicalRecordId)
            };

            const response = await labOrderService.deleteLabOrders(deleteRequest);

            setSuccess(`Đã xóa thành công ${selectedLabOrderIds.length} dịch vụ`);
            // Clear selected services
            setSelectedServices([]);
            // Reload medical record to get updated data
            await loadMedicalRecordDetail();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Lỗi khi xóa dịch vụ');
        } finally {
            setPaymentLoading(false);
        }
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

    const getPaymentStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'DA_THANH_TOAN':
                return 'success';
            case 'CHUA_THANH_TOAN':
                return 'warning';
            case 'THANH_TOAN_MOT_PHAN':
                return 'info';
            default:
                return 'secondary';
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'DA_THANH_TOAN':
                return 'Đã đóng';
            case 'CHUA_THANH_TOAN':
                return 'Còn lại';
            case 'THANH_TOAN_MOT_PHAN':
                return 'Một phần';
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

    // Component hiển thị tất cả Invoice Details trong một table duy nhất
    const renderAllInvoiceDetailsTable = (items: InvoiceDetailsResponse[]) => {
        if (items.length === 0) {
            return (
                <Alert variant="info" className="text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    Chưa có dịch vụ nào
                </Alert>
            );
        }

        const tableRows: React.ReactElement[] = [];

        items.forEach((item, itemIndex) => {
            if (item.typeService === 'SINGLE' && item.singleLab) {
                // Dịch vụ đơn - hiển thị trực tiếp
                tableRows.push(
                    <tr key={`single-${item.id}`} className="border-bottom">
                        <td className="ps-3">
                            <code className="text-primary fw-medium">{item.singleLab.code}</code>
                        </td>
                        <td>
                            <div className="fw-medium">{item.name || item.healthPlanName}</div>
                            <small className="text-muted">{item.description}</small>
                        </td>
                        <td>
                            <Badge bg={getLabOrderStatusBadgeVariant(item.singleLab.status)} className="fw-normal">
                                {getLabOrderStatusText(item.singleLab.status)}
                            </Badge>
                        </td>
                        <td>
                            <Badge bg={getPaymentStatusBadgeVariant(item.status)} className="fw-normal">
                                {getPaymentStatusText(item.status)}
                            </Badge>
                        </td>
                        <td className="text-end fw-medium">
                            {item.healthPlanPrice.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="text-end fw-medium text-success">
                            {item.paid.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="text-end fw-medium text-warning">
                            {(item.healthPlanPrice - item.paid).toLocaleString('vi-VN')}đ
                        </td>
                    </tr>
                );
            } else if (item.typeService === 'MULTIPLE' && item.multipleLab) {
                // Dịch vụ gói - hiển thị header của gói
                tableRows.push(
                    <tr key={`multiple-header-${item.id}`} className=" border-bottom">
                        <td className="ps-2 fw-bold">
                            <i className="bi bi-collection me-2 text-primary"></i>
                            <span className="text-uppercase">gói khám </span>
                        </td>
                        <td>
                            <div className="fw-bold text-dark">{item.name || item.healthPlanName}</div>
                            <small className="text-muted fst-italic">{item.description}</small>
                        </td>
                        <td>
                            <Badge bg="info" className="fw-normal">Gói dịch vụ</Badge>
                        </td>
                        <td>
                            <Badge bg={getPaymentStatusBadgeVariant(item.status)} className="fw-normal">
                                {getPaymentStatusText(item.status)}
                            </Badge>
                        </td>
                        <td className="text-end fw-bold text-primary">
                            {item.healthPlanPrice.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="text-end fw-bold text-success">
                            {item.paid.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="text-end fw-bold text-warning">
                            {(item.healthPlanPrice - item.paid).toLocaleString('vi-VN')}đ
                        </td>
                    </tr>
                );

                // Hiển thị các xét nghiệm con với indent và tree structure
                item.multipleLab.forEach((lab, labIndex) => {
                    const isLast = labIndex === item.multipleLab!.length - 1;
                    tableRows.push(
                        <tr key={`multiple-lab-${item.id}-${lab.id}`} className="border-bottom">
                            <td className="ps-5">
                                <div className="d-flex align-items-center position-relative">
                                    <span className="text-muted me-2" style={{ fontSize: '14px' }}>
                                        {isLast ? '└─' : '├─'}
                                    </span>
                                    <code className="text-primary fw-medium">{lab.code}</code>
                                </div>
                            </td>
                            <td>
                                <div className="fw-medium">{lab.name || `Xét nghiệm ${labIndex + 1}`}</div>
                                <small className="text-muted">
                                    {lab.doctorPerforming ? `BS: ${lab.doctorPerforming}` : 'Chưa phân công BS'}
                                </small>
                            </td>
                            <td>
                                <Badge bg={getLabOrderStatusBadgeVariant(lab.status)} className="fw-normal">
                                    {getLabOrderStatusText(lab.status)}
                                </Badge>
                            </td>
                            <td>
                                <Badge bg={getPaymentStatusBadgeVariant(item.status)} className="fw-normal">
                                    {getPaymentStatusText(item.status)}
                                </Badge>
                            </td>
                            <td className="text-end">
                                <small className="text-muted fst-italic">Đã bao gồm trong gói</small>
                            </td>
                            <td className="text-end">
                                <small className="text-muted">-</small>
                            </td>
                            <td className="text-end">
                                <small className="text-muted">-</small>
                            </td>
                        </tr>
                    );
                });
            }
        });

        // Tính tổng số liệu
        const totalPrice = items.reduce((total, item) => total + item.healthPlanPrice, 0);
        const totalPaid = items.reduce((total, item) => total + item.paid, 0);
        const unpaidItems = items.filter(item => item.status === 'CHUA_THANH_TOAN');
        const paidItems = items.filter(item => item.status === 'DA_THANH_TOAN');
        const partiallyPaidItems = items.filter(item => item.status === 'THANH_TOAN_MOT_PHAN');
        const pendingPaymentItems = items.filter(item =>
            item.status === 'CHUA_THANH_TOAN' || item.status === 'THANH_TOAN_MOT_PHAN'
        );

        return (
            <div className="invoice-details-table">
                <Table responsive hover className="mb-3">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: '140px' }}>Mã chỉ định XN</th>
                            <th style={{ width: '280px' }}>Tên chỉ định</th>
                            <th style={{ width: '110px' }}>Trạng thái</th>
                            <th style={{ width: '100px' }}>Thanh toán</th>
                            <th style={{ width: '110px' }} className="text-end">Giá dịch vụ</th>
                            <th style={{ width: '110px' }} className="text-end">Đã trả</th>
                            <th style={{ width: '110px' }} className="text-end">Còn lại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                    <tfoot className="table-light">
                        <tr>
                            <td colSpan={4} className="text-end fw-bold">
                                Tổng cộng:
                            </td>
                            <td className="text-end fw-bold text-primary">
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-end fw-bold text-success">
                                {totalPaid.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-end fw-bold text-warning">
                                {(totalPrice - totalPaid).toLocaleString('vi-VN')}đ
                            </td>
                        </tr>

                        {(unpaidItems.length > 0 || partiallyPaidItems.length > 0) && (
                            <>

                                <tr className="table-light">
                                    <td colSpan={12} className="px-3 py-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-info-circle text-info me-2"></i>
                                            <div>
                                                <strong>Tổng cộng {pendingPaymentItems.length} dịch vụ cần thanh toán</strong>
                                                <br />
                                                <small className="text-muted">Chọn phương thức thanh toán để tiếp tục</small>
                                            </div>
                                        </div>
                                    </td>

                                </tr>
                                <tr className="table-light">
                                    <td colSpan={7} className="px-3 pb-3">
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <div className="d-flex gap-3">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="paymentMethod"
                                                            id="cash"
                                                            value="cash"
                                                            checked={paymentMethod === 'cash'}
                                                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank_transfer')}
                                                        />
                                                        <label className="form-check-label fw-medium" htmlFor="cash">
                                                            <i className="bi bi-cash me-1"></i> Tiền mặt
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="paymentMethod"
                                                            id="bank_transfer"
                                                            value="bank_transfer"
                                                            checked={paymentMethod === 'bank_transfer'}
                                                            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'bank_transfer')}
                                                        />
                                                        <label className="form-check-label fw-medium" htmlFor="bank_transfer">
                                                            <i className="bi bi-qr-code me-1"></i> Chuyển khoản
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 text-end">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    {paymentMethod === 'bank_transfer' ? (
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={handlePayment}
                                                            disabled={paymentLoading}
                                                        >
                                                            {paymentLoading ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Đang tạo...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-qr-code me-2"></i>
                                                                    Tạo mã QR
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-warning"
                                                            onClick={handlePayment}
                                                            disabled={paymentLoading}
                                                        >
                                                            <i className="bi bi-cash me-2"></i>
                                                            Xác nhận thanh toán
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => window.print()}
                                                    >
                                                        <i className="bi bi-printer me-2"></i>
                                                        In hóa đơn
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </>
                        )}
                    </tfoot>
                </Table>
            </div>
        );
    };

    // Lấy dữ liệu cho hiển thị (ưu tiên invoiceDetailsResponse, fallback về labOrdersResponses)
    const allInvoiceDetails = medicalRecord?.invoiceDetailsResponse || [];
    const unpaidInvoiceDetails = getUnpaidInvoiceDetails();
    const partiallyPaidInvoiceDetails = getPartiallyPaidInvoiceDetails();
    const pendingPaymentInvoiceDetails = getPendingPaymentInvoiceDetails();
    const paidInvoiceDetails = getPaidInvoiceDetails();
    const unpaidServices = getUnpaidServices(); // Backward compatibility
    const paidServices = getPaidServices(); // Backward compatibility
    const paidServicesWithExamFee = getPaidServicesWithExamFee(); // Backward compatibility

    return (
        <>
            <style>{customStyles}</style>
            <div className="medical-record-detail">
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <IconStethoscope size={20} className="me-2" />
                            <h5 className="mb-0">Chi tiết phiếu khám</h5>
                        </div>
                        <div className="d-flex gap-2">
                            {medicalRecord?.patientId && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setShowHistoryModal(true)}
                                >
                                    <IconHistory size={16} className="me-2" />
                                    Lịch sử khám bệnh
                                </Button>
                            )}
                            <Button variant="outline-primary" size="sm" onClick={onBack}>
                                <IconArrowLeft size={16} className="me-2" />
                                Quay lại danh sách
                            </Button>
                        </div>
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
                                <Card>
                                    <Card.Body>
                                        <h6>
                                            <IconUser size={16} className="me-2" />
                                            Thông tin bệnh nhân
                                        </h6>
                                        <div className="info-item">
                                            <span className="info-label">Mã phiếu khám:</span>
                                            <span className="info-value">{medicalRecord.code}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Bệnh nhân:</span>
                                            <span className="info-value">{medicalRecord.patientName}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Số điện thoại:</span>
                                            <span className="info-value">{medicalRecord.patientPhone || 'Không có'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Giới tính:</span>
                                            <span className="info-value">{medicalRecord.patientGender === 'NAM' ? 'Nam' : medicalRecord.patientGender === 'NU' ? 'Nữ' : 'Không xác định'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Địa chỉ:</span>
                                            <span className="info-value">{medicalRecord.patientAddress || 'Không có'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Ngày khám:</span>
                                            <span className="info-value">{new Date(medicalRecord.date).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Trạng thái:</span>
                                            <Badge bg={getStatusBadgeVariant(medicalRecord.status)}>
                                                {getStatusText(medicalRecord.status)}
                                            </Badge>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card>
                                    <Card.Body>
                                        <h6>
                                            <IconClipboard size={16} className="me-2" />
                                            Thông tin khám bệnh
                                        </h6>
                                        <div className="info-item">
                                            <span className="info-label">Triệu chứng:</span>
                                            <span className="info-value">{medicalRecord.symptoms || 'Chưa có thông tin'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Khám lâm sàng:</span>
                                            <span className="info-value">{medicalRecord.clinicalExamination || 'Chưa có thông tin'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Chẩn đoán:</span>
                                            <span className="info-value">{medicalRecord.diagnosis || 'Chưa có thông tin'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Kế hoạch điều trị:</span>
                                            <span className="info-value">{medicalRecord.treatmentPlan || 'Chưa có thông tin'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Ghi chú:</span>
                                            <span className="info-value">{medicalRecord.note || 'Không có'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Tổng chi phí:</span>
                                            <span className="badge bg-primary fs-6">
                                                {medicalRecord.total.toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Services Section - Single Table */}
                        <Card>
                            <Card.Header>
                                <h6 className="mb-0">
                                    <i className="bi bi-list-ul me-2"></i>
                                    Danh sách dịch vụ
                                    {medicalRecord.invoiceDetailsResponse && (
                                        <span className="ms-2">
                                            <Badge bg="secondary" className="me-1">
                                                {allInvoiceDetails.length} dịch vụ
                                            </Badge>
                                            {paidInvoiceDetails.length > 0 && (
                                                <Badge bg="success" className="me-1">
                                                    {paidInvoiceDetails.length} đã thanh toán
                                                </Badge>
                                            )}
                                            {pendingPaymentInvoiceDetails.length > 0 && (
                                                <Badge bg="warning">
                                                    {pendingPaymentInvoiceDetails.length} cần thanh toán
                                                </Badge>
                                            )}
                                        </span>
                                    )}
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                {/* Hiển thị theo cấu trúc mới nếu có invoiceDetailsResponse */}
                                {medicalRecord.invoiceDetailsResponse ? (
                                    renderAllInvoiceDetailsTable(allInvoiceDetails)
                                ) : (
                                    /* Fallback để tương thích với cấu trúc cũ */
                                    paidServicesWithExamFee.length > 0 ? (
                                        <Table responsive striped hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Dịch vụ</th>
                                                    <th>Gói dịch vụ</th>
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
                                                                {service.serviceParent ? (
                                                                    <span className="text-muted">
                                                                        <i className="bi bi-box me-1"></i>
                                                                        {service.serviceParent}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted">Dịch vụ lẻ</span>
                                                                )}
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
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td colSpan={6} className="text-end fw-bold">Tổng tiền đã thanh toán:</td>
                                                    <td className="text-end fw-bold text-success">
                                                        {paidServicesWithExamFee.reduce((total, service) => total + service.price, 0).toLocaleString('vi-VN')}đ
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    ) : (
                                        <Alert variant="info" className="text-center">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Chưa có dịch vụ nào
                                        </Alert>
                                    )
                                )}
                            </Card.Body>
                        </Card>
                    </Card.Body>
                </Card>
            </div>

            {/* QR Payment Modal */}
            {paymentData && (
                <QRPaymentModal
                    show={showPaymentModal}
                    onHide={handlePaymentModalClose}
                    qrCodeData={paymentData.qrCode}
                    invoiceId={paymentData.invoiceId}
                    orderCode={paymentData.orderCode}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            )}

            {/* Medical Record History Modal */}
            {medicalRecord?.patientId && (
                <MedicalRecordHistory
                    show={showHistoryModal}
                    onHide={() => setShowHistoryModal(false)}
                    patientId={medicalRecord.patientId}
                    patientName={medicalRecord.patientName}
                    onViewDetail={(recordId) => {
                        // Nếu có callback từ parent (như MedicalRecordManagement), sử dụng nó
                        if (onViewDetail) {
                            onViewDetail(recordId);
                        } else {
                            // Logic cho bác sĩ (navigation trong cùng component)
                            if (recordId !== medicalRecordId) {
                                // Load chi tiết phiếu khám mới
                                setMedicalRecord(null);
                                setLoading(true);
                                setError(null);
                                setSuccess(null);

                                // Update URL và load dữ liệu mới
                                const newUrl = window.location.pathname.replace(/\/[^\/]+$/, `/${recordId}`);
                                window.history.pushState({}, '', newUrl);

                                // Gọi API để load phiếu khám mới
                                loadMedicalRecordDetailById(recordId);
                            }
                        }
                        setShowHistoryModal(false);
                    }}
                />
            )}
        </>
    );
};

export default MedicalRecordDetail;