"use client";
import { Card, Col, Row, Form, Button, InputGroup, Table, Badge, Modal, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { PersonFill, Search, Eye, Plus, Telephone, PencilSquare, Trash } from "react-bootstrap-icons";
import { useAuth } from "../../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../../services/appointmentService";
import Loading from "../../../../components/common/Loading";

interface PatientInfo {
    id: number;
    fullName: string;
    phone: string;
    email?: string;
    gender?: string;
    birth: string;
    address?: string;
    totalAppointments: number;
    lastVisit: string;
    appointments: Appointment[];
}

const ReceptionistPatientsPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState<PatientInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            // Fetch all appointments to extract patient information
            const response = await appointmentService.getAppointments({});

            if (response.data) {
                // Group appointments by patient
                const patientMap = new Map<string, PatientInfo>();

                response.data.forEach(appointment => {
                    const patientKey = `${appointment.fullName}_${appointment.phone}`;

                    if (patientMap.has(patientKey)) {
                        const patient = patientMap.get(patientKey)!;
                        patient.appointments.push(appointment);
                        patient.totalAppointments++;

                        // Update last visit if this appointment is more recent
                        if (new Date(appointment.date) > new Date(patient.lastVisit)) {
                            patient.lastVisit = appointment.date;
                        }
                    } else {
                        // Create new patient info
                        const newPatient: PatientInfo = {
                            id: appointment.id,
                            fullName: appointment.fullName,
                            phone: appointment.phone,
                            email: appointment.email,
                            gender: appointment.gender || undefined,
                            birth: appointment.birth,
                            address: appointment.address,
                            totalAppointments: 1,
                            lastVisit: appointment.date,
                            appointments: [appointment]
                        };
                        patientMap.set(patientKey, newPatient);
                    }
                });

                // Convert map to array and sort by last visit
                const patientsList = Array.from(patientMap.values())
                    .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());

                setPatients(patientsList);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            setAlert({ type: 'danger', message: 'Không thể tải danh sách bệnh nhân' });
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const getStatusBadgeVariant = (status?: string) => {
        switch (status) {
            case 'CHO_XAC_NHAN': return 'warning';
            case 'DA_XAC_NHAN': return 'info';
            case 'DA_DEN': return 'success';
            case 'KHONG_DEN': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'CHO_XAC_NHAN': return 'Chờ xác nhận';
            case 'DA_XAC_NHAN': return 'Đã xác nhận';
            case 'DA_DEN': return 'Đã đến';
            case 'KHONG_DEN': return 'Không đến';
            default: return 'N/A';
        }
    };

    const handleViewPatientDetail = (patient: PatientInfo) => {
        setSelectedPatient(patient);
        setShowDetailModal(true);
    };

    const handleCreateAppointment = (patient: PatientInfo) => {
        // Redirect to appointment creation with patient data
        const queryParams = new URLSearchParams({
            fullName: patient.fullName,
            phone: patient.phone,
            email: patient.email || '',
            gender: patient.gender || '',
            birth: patient.birth,
            address: patient.address || ''
        });

        window.location.href = `/le-tan/dat-lich?${queryParams.toString()}`;
    };

    if (loading) return <Loading />;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý bệnh nhân</h2>
                <Button
                    variant="primary"
                    onClick={() => window.location.href = '/le-tan/dat-lich'}
                >
                    <Plus className="me-1" size={16} />
                    Thêm lịch hẹn mới
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

            {/* Search and Statistics */}
            <Row className="mb-4">
                <Col md={8}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân theo tên, số điện thoại hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <Row>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="text-center">
                                    <PersonFill size={24} className="text-primary mb-2" />
                                    <h5 className="mb-0">{patients.length}</h5>
                                    <small className="text-muted">Tổng bệnh nhân</small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body className="text-center">
                                    <Telephone size={24} className="text-success mb-2" />
                                    <h5 className="mb-0">{patients.reduce((sum, p) => sum + p.totalAppointments, 0)}</h5>
                                    <small className="text-muted">Tổng lịch hẹn</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Patients List */}
            <Card className="shadow-sm">
                <Card.Header>
                    <h5 className="mb-0">Danh sách bệnh nhân</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {filteredPatients.length === 0 ? (
                        <div className="text-center py-5">
                            <PersonFill size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                {searchTerm ? 'Không tìm thấy bệnh nhân nào' : 'Chưa có bệnh nhân nào'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Bệnh nhân</th>
                                        <th>Thông tin liên hệ</th>
                                        <th>Tuổi</th>
                                        <th>Lần khám gần nhất</th>
                                        <th>Tổng lịch hẹn</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={`${patient.fullName}_${patient.phone}`}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                                        <PersonFill className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{patient.fullName}</div>
                                                        <small className="text-muted">
                                                            {patient.gender || 'Không xác định'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-semibold">
                                                        <Telephone className="me-1" size={14} />
                                                        {patient.phone}
                                                    </div>
                                                    {patient.email && (
                                                        <small className="text-muted">{patient.email}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{calculateAge(patient.birth)} tuổi</td>
                                            <td>{new Date(patient.lastVisit).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <Badge bg="info">{patient.totalAppointments} lần</Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => handleViewPatientDetail(patient)}
                                                    >
                                                        <Eye size={14} className="me-1" />
                                                        Chi tiết
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-success"
                                                        onClick={() => handleCreateAppointment(patient)}
                                                    >
                                                        <Plus size={14} className="me-1" />
                                                        Đặt lịch
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Patient Detail Modal */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <PersonFill className="me-2" />
                        Chi tiết bệnh nhân: {selectedPatient?.fullName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPatient && (
                        <Row>
                            <Col md={6}>
                                <Card className="border-0 bg-light">
                                    <Card.Body>
                                        <h6 className="text-primary mb-3">Thông tin cá nhân</h6>
                                        <div className="mb-2">
                                            <strong>Họ tên:</strong> {selectedPatient.fullName}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Tuổi:</strong> {calculateAge(selectedPatient.birth)} tuổi
                                        </div>
                                        <div className="mb-2">
                                            <strong>Giới tính:</strong> {selectedPatient.gender || 'Không xác định'}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Số điện thoại:</strong> {selectedPatient.phone}
                                        </div>
                                        {selectedPatient.email && (
                                            <div className="mb-2">
                                                <strong>Email:</strong> {selectedPatient.email}
                                            </div>
                                        )}
                                        {selectedPatient.address && (
                                            <div className="mb-2">
                                                <strong>Địa chỉ:</strong> {selectedPatient.address}
                                            </div>
                                        )}
                                        <div className="mb-2">
                                            <strong>Tổng lịch hẹn:</strong>
                                            <Badge bg="info" className="ms-2">{selectedPatient.totalAppointments} lần</Badge>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <h6 className="text-primary mb-3">
                                    Lịch sử hẹn khám
                                </h6>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedPatient.appointments
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((appointment) => (
                                            <Card key={appointment.id} className="mb-2 border-0 shadow-sm">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <small className="text-muted">
                                                            {new Date(appointment.date).toLocaleDateString('vi-VN')} - {appointment.time}
                                                        </small>
                                                        <Badge bg={getStatusBadgeVariant(appointment.status)}>
                                                            {getStatusText(appointment.status)}
                                                        </Badge>
                                                    </div>
                                                    {appointment.symptoms && (
                                                        <div className="text-muted">
                                                            <small><strong>Triệu chứng:</strong> {appointment.symptoms}</small>
                                                        </div>
                                                    )}
                                                    <div className="mt-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => window.location.href = `/le-tan/phieu-kham/${appointment.id}`}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (selectedPatient) {
                                handleCreateAppointment(selectedPatient);
                            }
                        }}
                    >
                        Đặt lịch hẹn mới
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReceptionistPatientsPage;