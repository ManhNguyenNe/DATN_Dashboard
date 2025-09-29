"use client";
import { Card, Col, Row, Form, Button, Alert, Tab, Tabs, Table, Badge, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PersonFill, ClipboardData, Prescription2, Save, Plus, Check, X, Activity, FileText, Printer, Receipt, PencilSquare, InfoCircle, Gear } from "react-bootstrap-icons";
import { useAuth } from "../../../../../contexts/AuthContext";
import { Appointment } from "../../../../../services/appointmentService";
import Loading from "../../../../../components/common/Loading";
import { AppointmentService, NewPrescription, MedicalService, ServiceStatus, PrescriptionStatus } from "../../../../../types/MedicalServiceType";
import medicalRecordService, { MedicalRecordDetail, LabOrderResponse } from "../../../../../services/medicalRecordService";
import labOrderService, { LabOrderDetail } from "../../../../../services/labOrderService";
import medicalServiceService, { ServiceDetailResponse, AssignedDoctor } from "../../../../../services/medicalServiceService";

// CSS cho print
const printStyles = `
@media print {
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    body { font-size: 12pt; }
    .container-fluid { max-width: none; margin: 0; padding: 10px; }
    .card { border: 1px solid #000; box-shadow: none; }
    .table { border-collapse: collapse; }
    .table th, .table td { border: 1px solid #000; padding: 5px; }
}
`;

interface ExaminationData {
    chanDoan: string;
    trieuChung: string;
    huongDieuTri: string;
    donThuoc: string;
    ghiChu: string;
}

const ExaminationDetailPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecordDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState('examination');

    // States cho dịch vụ và chỉ định
    const [paidServices, setPaidServices] = useState<AppointmentService[]>([]);
    const [newPrescriptions, setNewPrescriptions] = useState<NewPrescription[]>([]);
    const [availableServices, setAvailableServices] = useState<MedicalService[]>([]);
    const [availableDoctors, setAvailableDoctors] = useState<Array<{ id: number, name: string, specialty: string }>>([]);
    const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [prescriptionReason, setPrescriptionReason] = useState('');
    const [prescriptionNotes, setPrescriptionNotes] = useState('');

    // States cho edit chỉ định
    const [editingPrescription, setEditingPrescription] = useState<NewPrescription | null>(null);
    const [showEditPrescriptionModal, setShowEditPrescriptionModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [labOrderDetail, setLabOrderDetail] = useState<LabOrderDetail | null>(null);
    const [loadingLabOrderDetail, setLoadingLabOrderDetail] = useState(false);
    const [serviceDetail, setServiceDetail] = useState<ServiceDetailResponse | null>(null);
    const [availableDoctorsForAssignment, setAvailableDoctorsForAssignment] = useState<AssignedDoctor[]>([]);

    // States cho edit dịch vụ hiện có 
    const [editingService, setEditingService] = useState<AppointmentService | null>(null);
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);
    const [serviceReason, setServiceReason] = useState('');
    const [serviceNotes, setServiceNotes] = useState('');
    const [serviceDoctor, setServiceDoctor] = useState('');

    const [examinationData, setExaminationData] = useState<ExaminationData>({
        chanDoan: '',
        trieuChung: '',
        huongDieuTri: '',
        donThuoc: '',
        ghiChu: ''
    });

    useEffect(() => {
        if (appointmentId) {
            fetchMedicalRecordDetails();
            fetchAvailableServices();
            fetchAvailableDoctors();
        }
    }, [appointmentId]);

    const fetchMedicalRecordDetails = async () => {
        try {
            setLoading(true);

            // Gọi API lấy chi tiết phiếu khám
            const response = await medicalRecordService.getMedicalRecordDetail(appointmentId);

            if (response && response.data) {
                const record = response.data;
                console.log('📋 Chi tiết phiếu khám từ API:', record);

                setMedicalRecord(record);

                // Tạo appointment object từ dữ liệu phiếu khám
                const appointmentFromRecord: Appointment = {
                    id: parseInt(record.id),
                    fullName: record.patientName,
                    phone: '', // Không có trong API response
                    date: record.date.split('T')[0],
                    time: record.date.split('T')[1]?.substring(0, 5) || '',
                    symptoms: record.symptoms,
                    status: 'DA_XAC_NHAN',
                    birth: '',
                    gender: '',
                    address: ''
                };

                setAppointment(appointmentFromRecord);

                // Thiết lập dữ liệu khám từ API
                setExaminationData({
                    chanDoan: record.diagnosis || '',
                    trieuChung: record.symptoms || '',
                    huongDieuTri: record.treatmentPlan || '',
                    donThuoc: '',
                    ghiChu: record.note || ''
                });

                // Chuyển đổi labOrdersResponses thành AppointmentService format
                const services: AppointmentService[] = record.labOrdersResponses.map((labOrder) => ({
                    id: labOrder.id,
                    serviceId: labOrder.healthPlanId,
                    serviceName: labOrder.healthPlanName,
                    price: labOrder.price,
                    status: labOrder.statusPayment === 'DA_THANH_TOAN' ? ServiceStatus.DA_THANH_TOAN : ServiceStatus.CHUA_THANH_TOAN,
                    paymentDate: labOrder.statusPayment === 'DA_THANH_TOAN' ? record.date : undefined,
                    assignedDoctor: labOrder.doctorPerformed || 'Chưa phân công',
                    reason: `Chỉ định thực hiện tại ${labOrder.room || 'phòng chưa xác định'}`
                }));

                setPaidServices(services);

                // Khởi tạo danh sách chỉ định mới rỗng
                setNewPrescriptions([]);

            } else {
                throw new Error('Không thể tải thông tin phiếu khám');
            }

        } catch (error: any) {
            console.error('Lỗi khi tải chi tiết phiếu khám:', error);
            setAlert({ type: 'danger', message: error.message || 'Không thể tải thông tin phiếu khám' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditPrescription = async (labOrderId: number) => {
        try {
            setLoadingLabOrderDetail(true);

            console.log('🔍 Đang lấy chi tiết chỉ định với ID:', labOrderId);

            // 1. Gọi API lấy chi tiết chỉ định
            const labOrderResponse = await labOrderService.getLabOrderDetail(labOrderId);

            if (labOrderResponse && labOrderResponse.data) {
                const labOrderDetail = labOrderResponse.data;
                console.log('📄 Chi tiết chỉ định từ API:', labOrderDetail);

                setLabOrderDetail(labOrderDetail);

                // 2. Gọi API lấy chi tiết dịch vụ để lấy danh sách bác sĩ được phân công
                console.log('🩺 Đang lấy chi tiết dịch vụ với healthPlanId:', labOrderDetail.healthPlanId);

                try {
                    const serviceDetailResponse = await medicalServiceService.getServiceDetail(labOrderDetail.healthPlanId);
                    console.log('🩺 Chi tiết dịch vụ từ API:', serviceDetailResponse);

                    setServiceDetail(serviceDetailResponse);
                    setAvailableDoctorsForAssignment(serviceDetailResponse.doctorsAssigned || []);
                } catch (serviceError) {
                    console.warn('⚠️ Không thể tải chi tiết dịch vụ:', serviceError);
                    setServiceDetail(null);
                    setAvailableDoctorsForAssignment([]);
                }

                // 3. Tạo prescription object cho modal từ lab order detail
                const prescriptionFromLabOrder: NewPrescription = {
                    id: labOrderDetail.id,
                    serviceId: labOrderDetail.healthPlanId,
                    serviceName: labOrderDetail.healthPlanName,
                    reason: `Chỉ định ${labOrderDetail.healthPlanName}`,
                    notes: labOrderDetail.room ? `Thực hiện tại: ${labOrderDetail.room}` : '',
                    createdAt: labOrderDetail.orderDate,
                    status: PrescriptionStatus.CHO_XAC_NHAN
                };

                setEditingPrescription(prescriptionFromLabOrder);
                setSelectedService(labOrderDetail.healthPlanId);
                setPrescriptionReason(`Chỉ định ${labOrderDetail.healthPlanName}`);
                setPrescriptionNotes(labOrderDetail.room ? `Thực hiện tại: ${labOrderDetail.room}` : '');
                setSelectedDoctor(labOrderDetail.doctorOrdered || labOrderDetail.doctorPerformed || user?.name || '');

                setShowEditPrescriptionModal(true);

            } else {
                throw new Error('Không thể tải chi tiết chỉ định');
            }

        } catch (error: any) {
            console.error('Lỗi khi lấy chi tiết chỉ định:', error);
            setAlert({
                type: 'danger',
                message: error.message || 'Không thể tải chi tiết chỉ định'
            });
        } finally {
            setLoadingLabOrderDetail(false);
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

    const fetchAvailableDoctors = async () => {
        try {
            // Tạm thời dùng dữ liệu mẫu
            const sampleDoctors = [
                { id: 1, name: 'BS. Nguyễn Văn A', specialty: 'Nội khoa' },
                { id: 2, name: 'BS. Trần Thị B', specialty: 'Ngoại khoa' },
                { id: 3, name: 'BS. Lê Văn C', specialty: 'Tim mạch' },
                { id: 4, name: 'BS. Phạm Thị D', specialty: 'Da liễu' }
            ];
            setAvailableDoctors(sampleDoctors);
        } catch (error) {
            console.error('Lỗi khi tải danh sách bác sĩ:', error);
        }
    };

    const handleAddPrescription = async () => {
        if (!selectedService || !prescriptionReason.trim()) {
            setAlert({ type: 'danger', message: 'Vui lòng chọn dịch vụ và nhập lý do chỉ định' });
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
            setSelectedDoctor('');
            setAlert({ type: 'success', message: 'Đã thêm chỉ định mới thành công' });

        } catch (error) {
            console.error('Lỗi khi thêm chỉ định:', error);
            setAlert({ type: 'danger', message: 'Có lỗi xảy ra khi thêm chỉ định' });
        }
    };

    const handleDeletePrescription = (prescriptionId: number) => {
        setNewPrescriptions(newPrescriptions.filter(p => p.id !== prescriptionId));
        setAlert({ type: 'success', message: 'Đã xóa chỉ định' });
    };



    const handleUpdatePrescription = async () => {
        if (!editingPrescription || !selectedService || !prescriptionReason.trim()) {
            setAlert({ type: 'danger', message: 'Vui lòng điền đầy đủ thông tin' });
            return;
        }

        try {
            const service = availableServices.find(s => s.id === selectedService);
            if (!service) return;

            const updatedPrescription: NewPrescription = {
                ...editingPrescription,
                serviceId: selectedService,
                serviceName: service.name,
                reason: prescriptionReason,
                notes: prescriptionNotes
            };

            setNewPrescriptions(newPrescriptions.map(p =>
                p.id === editingPrescription.id ? updatedPrescription : p
            ));

            setShowEditPrescriptionModal(false);
            setEditingPrescription(null);
            setSelectedService(null);
            setPrescriptionReason('');
            setPrescriptionNotes('');
            setSelectedDoctor('');
            setAlert({ type: 'success', message: 'Đã cập nhật chỉ định thành công' });

        } catch (error) {
            console.error('Lỗi khi cập nhật chỉ định:', error);
            setAlert({ type: 'danger', message: 'Có lỗi xảy ra khi cập nhật chỉ định' });
        }
    };

    const handleEditService = (serviceId: number) => {
        const service = paidServices.find(s => s.id === serviceId);
        console.log('handleEditService called with serviceId:', service);
        if (service) {
            setEditingService(service);
            setServiceReason(service.reason || '');
            setServiceNotes(service.notes || '');
            setServiceDoctor(service.assignedDoctor || user?.name || '');
            setShowEditServiceModal(true);
        }
    };

    const handleUpdateService = async () => {
        if (!editingService || !serviceReason.trim()) {
            setAlert({ type: 'danger', message: 'Vui lòng nhập lý do chỉ định' });
            return;
        }

        try {
            const updatedService: AppointmentService = {
                ...editingService,
                reason: serviceReason,
                notes: serviceNotes,
                assignedDoctor: serviceDoctor
            };

            setPaidServices(paidServices.map(s =>
                s.id === editingService.id ? updatedService : s
            ));

            setShowEditServiceModal(false);
            setEditingService(null);
            setServiceReason('');
            setServiceNotes('');
            setServiceDoctor('');
            setAlert({ type: 'success', message: 'Đã cập nhật thông tin dịch vụ thành công' });

        } catch (error) {
            console.error('Lỗi khi cập nhật dịch vụ:', error);
            setAlert({ type: 'danger', message: 'Có lỗi xảy ra khi cập nhật dịch vụ' });
        }
    };

    const handleInputChange = (field: keyof ExaminationData, value: string) => {
        setExaminationData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveExamination = async () => {
        try {
            setSaving(true);

            // Validate required fields
            if (!examinationData.chanDoan.trim()) {
                setAlert({ type: 'danger', message: 'Vui lòng nhập chẩn đoán' });
                return;
            }

            // TODO: Gọi API để lưu kết quả khám
            // await medicalExaminationService.saveExamination(appointmentId, examinationData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setAlert({ type: 'success', message: 'Đã lưu kết quả khám thành công' });

            // Update appointment status to completed
            if (appointment) {
                setAppointment({ ...appointment, status: 'DA_DEN' });
            }

        } catch (error) {
            console.error('Lỗi khi lưu kết quả khám:', error);
            setAlert({ type: 'danger', message: 'Có lỗi xảy ra khi lưu kết quả khám' });
        } finally {
            setSaving(false);
        }
    };

    const handleCompleteExamination = async () => {
        await handleSaveExamination();
        // Redirect back to examination list
        router.push('/bac-si/kham-benh');
    };

    if (loading) return <Loading />;

    if (!appointment) {
        return (
            <div className="container-fluid">
                <Alert variant="danger">Không tìm thấy thông tin lịch hẹn</Alert>
            </div>
        );
    }

    const handlePrintInvoice = () => {
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn khám bệnh</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .patient-info { margin-bottom: 20px; }
                    .services-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .services-table th, .services-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                    .services-table th { background-color: #f0f0f0; }
                    .total { font-weight: bold; font-size: 16px; }
                    .footer { margin-top: 40px; text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>PHÒNG KHÁM ĐA KHOA</h2>
                    <h3>HÓA ĐƠN KHÁM BỆNH</h3>
                </div>
                
                <div class="patient-info">
                    <p><strong>Bệnh nhân:</strong> ${appointment.fullName}</p>
                    <p><strong>Số điện thoại:</strong> ${appointment.phone}</p>
                    <p><strong>Ngày sinh:</strong> ${appointment.birth}</p>
                    <p><strong>Địa chỉ:</strong> ${appointment.address || 'Không có'}</p>
                    <p><strong>Ngày khám:</strong> ${appointment.date} ${appointment.time}</p>
                </div>

                <table class="services-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên dịch vụ</th>
                            <th>Đơn giá</th>
                            <th>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paidServices.map((service, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${service.serviceName}</td>
                                <td>${service.price.toLocaleString()} đ</td>
                                <td>${service.notes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total">
                            <td colspan="2">Tổng cộng</td>
                            <td>${paidServices.reduce((total, service) => total + service.price, 0).toLocaleString()} đ</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer">
                    <p>Bác sĩ khám: ${user?.name || 'Chưa xác định'}</p>
                    <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="container-fluid">
            <style>{printStyles}</style>
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2>Khám bệnh - {appointment.fullName}</h2>
                <Button
                    variant="outline-secondary"
                    onClick={() => router.push('/bac-si/kham-benh')}
                >
                    Quay lại danh sách
                </Button>
            </div>

            {alert && (
                <Alert
                    variant={alert.type}
                    dismissible
                    onClose={() => setAlert(null)}
                    className="mb-4"
                >
                    {alert.message}
                </Alert>
            )}

            <Row>
                {/* Thông tin bệnh nhân */}
                <Col lg={4}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-primary text-white">
                            <PersonFill className="me-2" />
                            Thông tin bệnh nhân
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Họ tên:</strong> {appointment.fullName}
                            </div>
                            <div className="mb-3">
                                <strong>Số điện thoại:</strong> {appointment.phone}
                            </div>
                            <div className="mb-3">
                                <strong>Ngày sinh:</strong> {appointment.birth}
                            </div>
                            <div className="mb-3">
                                <strong>Giới tính:</strong> {appointment.gender || 'Không xác định'}
                            </div>
                            <div className="mb-3">
                                <strong>Địa chỉ:</strong> {appointment.address || 'Không có'}
                            </div>
                            <div className="mb-3">
                                <strong>Thời gian hẹn:</strong> {appointment.time} - {appointment.date}
                            </div>
                            <div>
                                <strong>Triệu chứng ban đầu:</strong><br />
                                <span className="text-muted">{appointment.symptoms || 'Không có'}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Form khám bệnh */}
                <Col lg={8}>
                    <Card className="shadow-sm">
                        <Card.Header>
                            <ClipboardData className="me-2" />
                            Thông tin khám bệnh
                        </Card.Header>
                        <Card.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k || 'examination')}
                                className="mb-4"
                            >
                                <Tab eventKey="examination" title="Khám bệnh">
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Triệu chứng <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        placeholder="Mô tả triệu chứng chi tiết..."
                                                        value={examinationData.trieuChung}
                                                        onChange={(e) => handleInputChange('trieuChung', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Chẩn đoán <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        placeholder="Kết quả chẩn đoán..."
                                                        value={examinationData.chanDoan}
                                                        onChange={(e) => handleInputChange('chanDoan', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Hướng điều trị</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Hướng điều trị và lời khuyên..."
                                                value={examinationData.huongDieuTri}
                                                onChange={(e) => handleInputChange('huongDieuTri', e.target.value)}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Ghi chú</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                placeholder="Ghi chú thêm..."
                                                value={examinationData.ghiChu}
                                                onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Form>
                                </Tab>

                                <Tab eventKey="prescription" title="Đơn thuốc">
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <Prescription2 className="me-2" />
                                            Đơn thuốc
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={10}
                                            placeholder={`Ví dụ:
1. Paracetamol 500mg - Uống 1 viên x 3 lần/ngày sau ăn - 10 viên
2. Amoxicillin 250mg - Uống 1 viên x 2 lần/ngày - 14 viên
3. Vitamin C 1000mg - Uống 1 viên/ngày - 30 viên

Lời dặn:
- Uống thuốc đúng giờ
- Không được tự ý ngưng thuốc
- Tái khám sau 1 tuần`}
                                            value={examinationData.donThuoc}
                                            onChange={(e) => handleInputChange('donThuoc', e.target.value)}
                                        />
                                    </Form.Group>
                                </Tab>

                                <Tab eventKey="services" title={
                                    <span>
                                        <Activity className="me-1" />
                                        Dịch vụ & Chỉ định
                                    </span>
                                }>
                                    {/* Phần Dịch vụ hiện tại */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6>
                                                <Activity className="me-2" />
                                                Dịch vụ trong lần khám
                                            </h6>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handlePrintInvoice}
                                                className="d-flex align-items-center"
                                            >
                                                <Printer className="me-1" size={16} />
                                                In hóa đơn
                                            </Button>
                                        </div>
                                        {paidServices.length > 0 ? (
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên dịch vụ</th>
                                                        <th>Giá</th>
                                                        <th>Bác sĩ chỉ định</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paidServices.map((service, index) => (
                                                        <tr key={service.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{service.serviceName}</td>
                                                            <td>{service.price.toLocaleString()} đ</td>
                                                            <td>{service.assignedDoctor || 'Chưa chỉ định'}</td>

                                                            <td>
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleEditPrescription(service.id)}
                                                                    className="d-flex align-items-center"
                                                                    title="Chỉnh sửa thông tin chỉ định"
                                                                    disabled={loadingLabOrderDetail}
                                                                >
                                                                    {loadingLabOrderDetail ? (
                                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                                    ) : (
                                                                        <PencilSquare size={16} />
                                                                    )}
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="table-warning">
                                                        <td colSpan={2}><strong>Tổng cộng</strong></td>
                                                        <td><strong>{paidServices.reduce((total, service) => total + service.price, 0).toLocaleString()} đ</strong></td>
                                                        <td colSpan={5}></td>
                                                    </tr>
                                                </tfoot>
                                            </Table>
                                        ) : (
                                            <Alert variant="info" className="text-center py-4">
                                                <Receipt size={48} className="mb-2" />
                                                <p className="mb-0">Chưa có dịch vụ nào được thêm vào lần khám này.</p>
                                                <small className="text-muted">Dịch vụ sẽ được hiển thị tại đây sau khi bệnh nhân đăng ký.</small>
                                            </Alert>
                                        )}
                                    </div>

                                    <hr className="my-4" />

                                    {/* Phần Chỉ định mới */}
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6>
                                                <FileText className="me-2" />
                                                Chỉ định bổ sung
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
                                                        <th>Bác sĩ chỉ định</th>
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
                                                            <td>{user?.name || 'Chưa chọn'}</td>
                                                            <td>{prescription.notes || '-'}</td>
                                                            <td>
                                                                <Badge bg="warning">Chờ xác nhận</Badge>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => handleEditPrescription(prescription.id)}
                                                                        title="Chỉnh sửa chỉ định"
                                                                    >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDeletePrescription(prescription.id)}
                                                                    >
                                                                        <X className="me-1" />
                                                                        Xóa
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        ) : (
                                            <Alert variant="info">
                                                <FileText className="me-2" />
                                                Chưa có chỉ định bổ sung nào. Nhấn "Thêm chỉ định mới" để thêm.
                                            </Alert>
                                        )}
                                    </div>
                                </Tab>
                            </Tabs>

                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="outline-primary"
                                    onClick={handleSaveExamination}
                                    disabled={saving}
                                >
                                    <Save className="me-1" />
                                    {saving ? 'Đang lưu...' : 'Lưu tạm'}
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={handleCompleteExamination}
                                    disabled={saving || !examinationData.chanDoan.trim()}
                                >
                                    Hoàn thành khám
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

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

            {/* Modal sửa chỉ định */}
            <Modal show={showEditPrescriptionModal} onHide={() => setShowEditPrescriptionModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa chỉ định</Modal.Title>
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
                            <Form.Label>Bác sĩ chỉ định</Form.Label>
                            <Form.Select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                            >
                                <option value="">-- Chọn bác sĩ chỉ định --</option>
                                <option value={user?.name || ''}>
                                    {user?.name} (Hiện tại)
                                </option>
                                {availableDoctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.name}>
                                        {doctor.name} - {doctor.specialty}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Chọn bác sĩ sẽ thực hiện dịch vụ được chỉ định
                            </Form.Text>
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
                    <Button variant="secondary" onClick={() => setShowEditPrescriptionModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePrescription}>
                        <Check className="me-1" />
                        Cập nhật chỉ định
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal sửa dịch vụ hiện có */}
            <Modal show={showEditServiceModal} onHide={() => setShowEditServiceModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa thông tin dịch vụ</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên dịch vụ</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingService?.serviceName || ''}
                                disabled
                                className="bg-light"
                            />
                            <Form.Text className="text-muted">
                                Không thể thay đổi tên dịch vụ
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bác sĩ chỉ định</Form.Label>
                            <Form.Select
                                value={serviceDoctor}
                                onChange={(e) => setServiceDoctor(e.target.value)}
                            >
                                <option value="">-- Chọn bác sĩ chỉ định --</option>
                                <option value={user?.name || ''}>
                                    {user?.name} (Hiện tại)
                                </option>
                                {availableDoctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.name}>
                                        {doctor.name} - {doctor.specialty}
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
                                value={serviceReason}
                                onChange={(e) => setServiceReason(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ghi chú thêm (nếu có)..."
                                value={serviceNotes}
                                onChange={(e) => setServiceNotes(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditServiceModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleUpdateService}>
                        <Check className="me-1" />
                        Cập nhật dịch vụ
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal sửa chỉ định */}
            <Modal show={showEditPrescriptionModal} onHide={() => setShowEditPrescriptionModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết chỉ định</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingLabOrderDetail && (
                        <div className="text-center mb-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải chi tiết chỉ định...</span>
                            </div>
                            <p className="mt-2 text-muted">Đang tải thông tin chi tiết chỉ định...</p>
                        </div>
                    )}

                    {labOrderDetail && (
                        <div className="alert alert-info mb-3">
                            <h6 className="alert-heading mb-2">
                                <InfoCircle className="me-2" />
                                Thông tin chi tiết chỉ định
                            </h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Mã chỉ định:</strong> #{labOrderDetail.id}
                                </div>
                                <div className="col-md-6">
                                    <strong>Tên dịch vụ:</strong> {labOrderDetail.healthPlanName}
                                </div>
                                <div className="col-md-6 mt-2">
                                    <strong>Giá dịch vụ:</strong> {labOrderDetail.price?.toLocaleString()} đ
                                </div>
                                <div className="col-md-6 mt-2">
                                    <strong>Phòng thực hiện:</strong> {labOrderDetail.room || 'Chưa xác định'}
                                </div>
                                <div className="col-md-6 mt-2">
                                    <strong>Bác sĩ chỉ định:</strong> {labOrderDetail.doctorOrdered || 'Chưa có'}
                                </div>
                                <div className="col-md-6 mt-2">
                                    <strong>Bác sĩ thực hiện:</strong> {labOrderDetail.doctorPerformed || 'Chưa có'}
                                </div>
                                <div className="col-md-6 mt-2">
                                    <strong>Trạng thái:</strong>{' '}
                                    <Badge bg={
                                        labOrderDetail.status === 'HOAN_THANH' ? 'success' :
                                            labOrderDetail.status === 'DANG_THUC_HIEN' ? 'warning' :
                                                labOrderDetail.status === 'HUY' ? 'danger' : 'secondary'
                                    }>
                                        {labOrderDetail.status === 'CHO_THUC_HIEN' ? 'Chờ thực hiện' :
                                            labOrderDetail.status === 'DANG_THUC_HIEN' ? 'Đang thực hiện' :
                                                labOrderDetail.status === 'HOAN_THANH' ? 'Hoàn thành' : 'Hủy'}
                                    </Badge>
                                </div>
                                <div className="col-md-6 mt-2">
                                    <strong>Trạng thái thanh toán:</strong>{' '}
                                    <Badge bg={labOrderDetail.statusPayment === 'DA_THANH_TOAN' ? 'success' : 'warning'}>
                                        {labOrderDetail.statusPayment === 'DA_THANH_TOAN' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </Badge>
                                </div>
                                <div className="col-12 mt-2">
                                    <strong>Ngày chỉ định:</strong> {new Date(labOrderDetail.orderDate).toLocaleString('vi-VN')}
                                </div>
                                {labOrderDetail.expectedResultDate && (
                                    <div className="col-12 mt-2">
                                        <strong>Ngày dự kiến có kết quả:</strong> {new Date(labOrderDetail.expectedResultDate).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hiển thị thông tin chi tiết dịch vụ từ API services */}
                    {serviceDetail && (
                        <div className="alert alert-success mb-3">
                            <h6 className="alert-heading mb-2">
                                <Gear className="me-2" />
                                Thông tin dịch vụ
                            </h6>
                            <div className="row">
                                <div className="col-12">
                                    <strong>Mã dịch vụ:</strong> {serviceDetail.code}
                                </div>
                                <div className="col-12 mt-2">
                                    <strong>Tên dịch vụ:</strong> {serviceDetail.name}
                                </div>
                                <div className="col-12 mt-2">
                                    <strong>Giá dịch vụ:</strong> {serviceDetail.price?.toLocaleString()} đ
                                </div>
                                <div className="col-12 mt-2">
                                    <strong>Mô tả:</strong> {serviceDetail.description || 'Không có mô tả'}
                                </div>

                            </div>
                        </div>
                    )}

                    <Form>
                        {/* Dropdown chọn bác sĩ chỉ định */}
                        <Form.Group className="mb-3">
                            <Form.Label>Chọn bác sĩ chỉ định</Form.Label>
                            <Form.Select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                disabled={loadingLabOrderDetail}
                            >
                                <option value="">-- Chọn bác sĩ chỉ định --</option>

                                {/* Bác sĩ hiện tại đang khám */}
                                {/* <option value={user?.name || ''}>
                                    {user?.name} (Bác sĩ hiện tại - Đang khám)
                                </option> */}

                                {/* Bác sĩ từ chỉ định hiện tại (nếu có) */}
                                {labOrderDetail?.doctorOrdered && labOrderDetail.doctorOrdered !== user?.name && (
                                    <option value={labOrderDetail.doctorOrdered}>
                                        {labOrderDetail.doctorOrdered} (Bác sĩ đã chỉ định)
                                    </option>
                                )}

                                {labOrderDetail?.doctorPerformed && labOrderDetail.doctorPerformed !== user?.name && labOrderDetail.doctorPerformed !== labOrderDetail.doctorOrdered && (
                                    <option value={labOrderDetail.doctorPerformed}>
                                        {labOrderDetail.doctorPerformed} (Bác sĩ đã thực hiện)
                                    </option>
                                )}

                                {/* Bác sĩ được phân công cho dịch vụ này */}
                                {availableDoctorsForAssignment.length > 0 && (
                                    <>
                                        {availableDoctorsForAssignment.map(doctor => (
                                            <option key={`assigned-${doctor.id}`} value={doctor.fullName}>
                                                {doctor.fullName}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </Form.Select>

                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú bổ sung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Thêm ghi chú cho chỉ định này..."
                                value={prescriptionNotes}
                                onChange={(e) => setPrescriptionNotes(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditPrescriptionModal(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            // TODO: Thêm function để cập nhật bác sĩ chỉ định
                            console.log('Cập nhật bác sĩ chỉ định:', selectedDoctor);
                            setAlert({ type: 'success', message: `Đã cập nhật bác sĩ chỉ định: ${selectedDoctor}` });
                            setShowEditPrescriptionModal(false);
                        }}
                        disabled={!selectedDoctor || loadingLabOrderDetail}
                    >
                        <Check className="me-1" />
                        Cập nhật bác sĩ chỉ định
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ExaminationDetailPage