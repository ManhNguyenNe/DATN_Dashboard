"use client";
import { Card, Col, Row, Form, Button, Alert, Tab, Tabs } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PersonFill, ClipboardData, Prescription2, Save } from "react-bootstrap-icons";
import { useAuth } from "../../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../../services/appointmentService";
import Loading from "../../../../components/common/Loading";

interface ExaminationData {
    chanDoan: string;
    trieuChung: string;
    huongDieuTri: string;
    donThuoc: string;
    ghiChu: string;
}

const ExaminationPage = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('id');

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState('examination');

    const [examinationData, setExaminationData] = useState<ExaminationData>({
        chanDoan: '',
        trieuChung: '',
        huongDieuTri: '',
        donThuoc: '',
        ghiChu: ''
    });

    useEffect(() => {
        if (appointmentId) {
            fetchAppointmentDetails();
        }
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            // Note: Cần tạo API để lấy chi tiết appointment theo ID
            // Tạm thời sử dụng dữ liệu mẫu
            const sampleAppointment: Appointment = {
                id: parseInt(appointmentId || '0'),
                fullName: 'Nguyễn Văn A',
                phone: '0123456789',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                symptoms: 'Đau đầu, sốt nhẹ',
                status: 'DA_XAC_NHAN',
                birth: '1990-01-01',
                gender: 'Nam',
                address: 'Hà Nội'
            };

            setAppointment(sampleAppointment);

            // Load existing examination data if any
            setExaminationData({
                chanDoan: '',
                trieuChung: sampleAppointment.symptoms || '',
                huongDieuTri: '',
                donThuoc: '',
                ghiChu: ''
            });

        } catch (error) {
            console.error('Lỗi khi tải thông tin lịch hẹn:', error);
            setAlert({ type: 'danger', message: 'Không thể tải thông tin lịch hẹn' });
        } finally {
            setLoading(false);
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
        // Redirect back to dashboard
        window.location.href = '/bac-si';
    };

    if (loading) return <Loading />;

    if (!appointment) {
        return (
            <div className="container-fluid">
                <Alert variant="danger">Không tìm thấy thông tin lịch hẹn</Alert>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Khám bệnh</h2>
                <Button
                    variant="outline-secondary"
                    onClick={() => window.location.href = '/bac-si'}
                >
                    Quay lại
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
        </div>
    );
};

export default ExaminationPage;