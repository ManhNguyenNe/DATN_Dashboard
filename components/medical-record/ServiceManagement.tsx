"use client";
import { useState, useEffect } from "react";
import { Table, Badge, Alert, Button, Modal, Form } from "react-bootstrap";
import { Plus, X, Activity, FileText } from "react-bootstrap-icons";
import { AppointmentService, NewPrescription, MedicalService, ServiceStatus, PrescriptionStatus } from "../../types/MedicalServiceType";

interface ServiceManagementProps {
    appointmentId: string;
    onAlert: (alert: { type: 'success' | 'danger'; message: string }) => void;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ appointmentId, onAlert }) => {
    const [paidServices, setPaidServices] = useState<AppointmentService[]>([]);
    const [newPrescriptions, setNewPrescriptions] = useState<NewPrescription[]>([]);
    const [availableServices, setAvailableServices] = useState<MedicalService[]>([]);
    const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [prescriptionReason, setPrescriptionReason] = useState('');
    const [prescriptionNotes, setPrescriptionNotes] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaidServices();
        fetchNewPrescriptions();
        fetchAvailableServices();
    }, [appointmentId]);

    const fetchPaidServices = async () => {
        try {
            // Tạm thời dùng dữ liệu mẫu - sau này sẽ gọi API thật
            const samplePaidServices: AppointmentService[] = [
                {
                    id: 1,
                    serviceId: 1,
                    serviceName: 'Khám nội tổng quát',
                    price: 200000,
                    status: ServiceStatus.DA_THANH_TOAN,
                    paymentDate: '2024-01-15',
                    result: 'Bình thường'
                },
                {
                    id: 2,
                    serviceId: 2,
                    serviceName: 'Xét nghiệm máu tổng quát',
                    price: 150000,
                    status: ServiceStatus.DA_THANH_TOAN,
                    paymentDate: '2024-01-15'
                }
            ];
            setPaidServices(samplePaidServices);
        } catch (error) {
            console.error('Lỗi khi tải dịch vụ đã thanh toán:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNewPrescriptions = async () => {
        try {
            // Tạm thời dùng dữ liệu mẫu
            const samplePrescriptions: NewPrescription[] = [];
            setNewPrescriptions(samplePrescriptions);
        } catch (error) {
            console.error('Lỗi khi tải chỉ định mới:', error);
        }
    };

    const fetchAvailableServices = async () => {
        try {
            // Tạm thời dùng dữ liệu mẫu
            const sampleServices: MedicalService[] = [
                { id: 3, name: 'Chụp X-quang ngực', price: 300000, category: 'Chẩn đoán hình ảnh' },
                { id: 4, name: 'Siêu âm bụng tổng quát', price: 250000, category: 'Chẩn đoán hình ảnh' },
                { id: 5, name: 'Xét nghiệm nước tiểu', price: 80000, category: 'Xét nghiệm' },
                { id: 6, name: 'Điện tim', price: 100000, category: 'Thăm dò chức năng' }
            ];
            setAvailableServices(sampleServices);
        } catch (error) {
            console.error('Lỗi khi tải danh sách dịch vụ:', error);
        }
    };

    const handleAddPrescription = async () => {
        if (!selectedService || !prescriptionReason.trim()) {
            onAlert({ type: 'danger', message: 'Vui lòng chọn dịch vụ và nhập lý do chỉ định' });
            return;
        }

        try {
            const service = availableServices.find(s => s.id === selectedService);
            if (!service) return;

            const newPrescription: NewPrescription = {
                id: Date.now(),
                serviceId: selectedService,
                serviceName: service.name,
                reason: prescriptionReason,
                notes: prescriptionNotes,
                createdAt: new Date().toISOString(),
                status: PrescriptionStatus.CHO_XAC_NHAN
            };

            setNewPrescriptions([...newPrescriptions, newPrescription]);
            setShowAddPrescriptionModal(false);
            setSelectedService(null);
            setPrescriptionReason('');
            setPrescriptionNotes('');
            onAlert({ type: 'success', message: 'Đã thêm chỉ định mới thành công' });

        } catch (error) {
            console.error('Lỗi khi thêm chỉ định:', error);
            onAlert({ type: 'danger', message: 'Có lỗi xảy ra khi thêm chỉ định' });
        }
    };

    const handleDeletePrescription = (prescriptionId: number) => {
        setNewPrescriptions(newPrescriptions.filter(p => p.id !== prescriptionId));
        onAlert({ type: 'success', message: 'Đã xóa chỉ định' });
    };

    return (
        <>
            {/* Tab dịch vụ khám */}
            <div id="services-tab">
                <div className="mb-3">
                    <h6>
                        <Activity className="me-2" />
                        Danh sách dịch vụ đã thanh toán
                    </h6>
                    {paidServices.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Tên dịch vụ</th>
                                    <th>Giá</th>
                                    <th>Ngày thanh toán</th>
                                    <th>Trạng thái</th>
                                    <th>Kết quả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paidServices.map(service => (
                                    <tr key={service.id}>
                                        <td>{service.serviceName}</td>
                                        <td>{service.price.toLocaleString()} đ</td>
                                        <td>{service.paymentDate}</td>
                                        <td>
                                            <Badge bg="success">Đã thanh toán</Badge>
                                        </td>
                                        <td>
                                            {service.result ||
                                                <span className="text-muted">Chưa có kết quả</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info">
                            Không có dịch vụ nào đã thanh toán cho lần khám này.
                        </Alert>
                    )}
                </div>
            </div>

            {/* Tab chỉ định mới */}
            <div id="prescriptions-tab">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>
                        <FileText className="me-2" />
                        Danh sách chỉ định mới
                    </h6>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowAddPrescriptionModal(true)}
                    >
                        <Plus className="me-1" />
                        Thêm chỉ định mới
                    </Button>
                </div>

                {newPrescriptions.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Tên dịch vụ</th>
                                <th>Lý do chỉ định</th>
                                <th>Ghi chú</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newPrescriptions.map(prescription => (
                                <tr key={prescription.id}>
                                    <td>{prescription.serviceName}</td>
                                    <td>{prescription.reason}</td>
                                    <td>{prescription.notes || '-'}</td>
                                    <td>
                                        <Badge bg="warning">Chờ xác nhận</Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeletePrescription(prescription.id)}
                                        >
                                            <X className="me-1" />
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <Alert variant="info">
                        Chưa có chỉ định nào được thêm.
                    </Alert>
                )}
            </div>

            {/* Modal thêm chỉ định mới */}
            <Modal show={showAddPrescriptionModal} onHide={() => setShowAddPrescriptionModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Thêm chỉ định mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Chọn dịch vụ <span className="text-danger">*</span></Form.Label>
                            <Form.Select
                                value={selectedService || ''}
                                onChange={(e) => setSelectedService(Number(e.target.value) || null)}
                            >
                                <option value="">-- Chọn dịch vụ --</option>
                                {availableServices.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - {service.price.toLocaleString()} đ ({service.category})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Lý do chỉ định <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Nhập lý do chỉ định dịch vụ này..."
                                value={prescriptionReason}
                                onChange={(e) => setPrescriptionReason(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ghi chú thêm (nếu có)..."
                                value={prescriptionNotes}
                                onChange={(e) => setPrescriptionNotes(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddPrescriptionModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleAddPrescription}>
                        <Plus className="me-1" />
                        Thêm chỉ định
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ServiceManagement;