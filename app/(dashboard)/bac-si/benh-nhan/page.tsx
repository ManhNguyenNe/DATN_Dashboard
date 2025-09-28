"use client";
import { Card, Col, Row, Form, Button, InputGroup, Table, Badge, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { PersonFill, Search, Eye, ClipboardData, Telephone } from "react-bootstrap-icons";
import { useAuth } from "../../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../../services/appointmentService";
import Loading from "../../../../components/common/Loading";

interface PatientHistory {
    id: number;
    patientName: string;
    phone: string;
    gender?: string;
    birth: string;
    lastVisit: string;
    totalVisits: number;
    lastDiagnosis?: string;
    appointments: Appointment[];
}

const DoctorPatientsPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState<PatientHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientHistory | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchDoctorPatients();
    }, []);

    const fetchDoctorPatients = async () => {
        try {
            setLoading(true);
            // Fetch all appointments for the doctor
            const response = await appointmentService.getAppointments({});

            if (response.data) {
                // Group appointments by patient to create patient history
                const patientMap = new Map<string, PatientHistory>();

                response.data.forEach(appointment => {
                    const patientKey = `${appointment.fullName}_${appointment.phone}`;

                    if (patientMap.has(patientKey)) {
                        const patient = patientMap.get(patientKey)!;
                        patient.appointments.push(appointment);
                        patient.totalVisits++;

                        // Update last visit if this appointment is more recent
                        if (new Date(appointment.date) > new Date(patient.lastVisit)) {
                            patient.lastVisit = appointment.date;
                        }
                    } else {
                        // Create new patient history
                        const newPatient: PatientHistory = {
                            id: appointment.id,
                            patientName: appointment.fullName,
                            phone: appointment.phone,
                            gender: appointment.gender || undefined,
                            birth: appointment.birth,
                            lastVisit: appointment.date,
                            totalVisits: 1,
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
            console.error('Error fetching doctor patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
    );

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

    const handleViewPatientDetail = (patient: PatientHistory) => {
        setSelectedPatient(patient);
        setShowDetailModal(true);
    };

    if (loading) return <Loading />;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Bệnh nhân của tôi</h2>
            </div>

            {/* Search and Statistics */}
            <Row className="mb-4">
                <Col md={8}>
                    <InputGroup>
                        <InputGroup.Text>
                            <Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân theo tên hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center">
                            <PersonFill size={24} className="text-primary mb-2" />
                            <h5 className="mb-0">{patients.length}</h5>
                            <small className="text-muted">Tổng số bệnh nhân</small>
                        </Card.Body>
                    </Card>
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
                                        <th>Tuổi</th>
                                        <th>Số điện thoại</th>
                                        <th>Lần khám gần nhất</th>
                                        <th>Số lần khám</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={`${patient.patientName}_${patient.phone}`}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                                        <PersonFill className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{patient.patientName}</div>
                                                        <small className="text-muted">
                                                            {patient.gender || 'Không xác định'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{calculateAge(patient.birth)} tuổi</td>
                                            <td>
                                                <Telephone className="me-1" size={14} />
                                                {patient.phone}
                                            </td>
                                            <td>{new Date(patient.lastVisit).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <Badge bg="info">{patient.totalVisits} lần</Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        onClick={() => handleViewPatientDetail(patient)}
                                                    >
                                                        <Eye size={14} className="me-1" />
                                                        Xem chi tiết
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
                        Chi tiết bệnh nhân: {selectedPatient?.patientName}
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
                                            <strong>Họ tên:</strong> {selectedPatient.patientName}
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
                                        <div className="mb-2">
                                            <strong>Tổng số lần khám:</strong>
                                            <Badge bg="info" className="ms-2">{selectedPatient.totalVisits} lần</Badge>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <h6 className="text-primary mb-3">
                                    <ClipboardData className="me-2" />
                                    Lịch sử khám bệnh
                                </h6>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {selectedPatient.appointments
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((appointment, index) => (
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
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DoctorPatientsPage;