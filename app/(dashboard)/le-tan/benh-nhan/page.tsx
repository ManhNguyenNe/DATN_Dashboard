"use client";
import { Card, Col, Row, Form, Button, InputGroup, Table, Badge, Modal, Alert, Pagination } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PersonFill, Search, Eye, Plus, Telephone, PencilSquare, FileEarmarkMedical } from "react-bootstrap-icons";
import { useAuth } from "../../../../contexts/AuthContext";
import patientService, { PatientApiData } from "../../../../services/patientService";
import Loading from "../../../../components/common/Loading";

interface PatientInfo {
    id: number;
    code: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    gender: 'NAM' | 'NU';
    birth: string;
    address: string;
    bloodType: string;
    weight: number;
    height: number;
    registrationDate: string;
    profileImage: string | null;
    cccd: string | null;
    relationship: string | null;
}

const ReceptionistPatientsPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [patients, setPatients] = useState<PatientInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

    // Form data cho edit patient
    const [editFormData, setEditFormData] = useState({
        id: 0,
        fullName: '',
        phone: '',
        email: '',
        address: '',
        cccd: '',
        birth: '',
        gender: 'NAM' as 'NAM' | 'NU',
        bloodType: '',
        weight: 0,
        height: 0,
        profileImage: null as string | null
    });
    const [editLoading, setEditLoading] = useState(false);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage] = useState(10);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async (keyword?: string) => {
        try {
            setLoading(true);
            const response = await patientService.getPatients(keyword);

            if (response.data) {
                // Convert PatientApiData to PatientInfo
                const patientsList: PatientInfo[] = response.data.map(patient => ({
                    id: patient.id,
                    code: patient.code,
                    fullName: patient.fullName,
                    phone: patient.phone,
                    email: patient.email,
                    gender: patient.gender,
                    birth: patient.birth,
                    address: patient.address,
                    bloodType: patient.bloodType,
                    weight: patient.weight,
                    height: patient.height,
                    registrationDate: patient.registrationDate,
                    profileImage: patient.profileImage,
                    cccd: patient.cccd,
                    relationship: patient.relationship
                }));

                // Sort by registration date (newest first)
                patientsList.sort((a, b) =>
                    new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
                );

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
        (patient.phone && patient.phone.includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.cccd && patient.cccd.includes(searchTerm))
    );

    // Phân trang
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

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

    const handleCreateMedicalRecord = (patient: PatientInfo) => {
        console.log('🏥 Creating medical record for patient:', patient);

        // Chuyển đổi PatientInfo sang PatientSearchResult format
        const patientData = {
            id: patient.id,
            code: patient.code,
            fullName: patient.fullName,
            phone: patient.phone || '',
            address: patient.address,
            cccd: patient.cccd || '',
            birth: patient.birth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            weight: patient.weight,
            height: patient.height,
            registrationDate: patient.registrationDate,
            profileImage: patient.profileImage,
            relationship: patient.relationship
        };

        console.log('💾 Saving patient data to localStorage:', patientData);

        // Lưu dữ liệu bệnh nhân vào localStorage để sử dụng trong trang đặt lịch
        if (typeof window !== 'undefined') {
            // XÓA appointment data cũ để tránh conflict
            localStorage.removeItem('selectedAppointment');

            // Lưu patient data mới
            localStorage.setItem('selectedPatientForMedicalRecord', JSON.stringify(patientData));
            localStorage.setItem('medicalRecordActiveTab', 'medical-record');

            // Verify data was saved
            const saved = localStorage.getItem('selectedPatientForMedicalRecord');
            console.log('✅ Verified localStorage data:', saved ? JSON.parse(saved) : 'NOT SAVED');
            console.log('🗑️ Removed old appointment data');
        }

        // Redirect đến trang đặt lịch khám
        console.log('🚀 Redirecting to /le-tan/dat-lich');
        router.push('/le-tan/dat-lich');
    };

    const handleEditPatient = (patient: PatientInfo) => {
        setEditFormData({
            id: patient.id,
            fullName: patient.fullName,
            phone: patient.phone || '',
            email: patient.email || '',
            address: patient.address,
            cccd: patient.cccd || '',
            birth: patient.birth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            weight: patient.weight,
            height: patient.height,
            profileImage: patient.profileImage
        });
        setSelectedPatient(patient);
        setShowEditModal(true);
    };

    const handleUpdatePatient = async () => {
        try {
            setEditLoading(true);

            const updateData = {
                id: editFormData.id,
                phone: editFormData.phone || '',
                email: editFormData.email || null,
                fullName: editFormData.fullName,
                address: editFormData.address,
                cccd: editFormData.cccd,
                birth: editFormData.birth,
                gender: editFormData.gender,
                bloodType: editFormData.bloodType,
                weight: editFormData.weight,
                height: editFormData.height,
                profileImage: editFormData.profileImage
            };

            await patientService.updatePatient(updateData);

            setAlert({ type: 'success', message: 'Cập nhật thông tin bệnh nhân thành công!' });
            setShowEditModal(false);

            // Refresh data
            await fetchPatients();

        } catch (error) {
            console.error('Error updating patient:', error);
            setAlert({ type: 'danger', message: 'Có lỗi xảy ra khi cập nhật thông tin bệnh nhân' });
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Quản lý bệnh nhân</h2>
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
                                    <h5 className="mb-0">{filteredPatients.length}</h5>
                                    <small className="text-muted">Kết quả tìm kiếm</small>
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
                                        <th>Ngày đăng ký</th>
                                        <th>Nhóm máu</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPatients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                                        <PersonFill className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{patient.fullName}</div>
                                                        <small className="text-muted">
                                                            {patient.gender === 'NAM' ? 'Nam' : 'Nữ'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-semibold">
                                                        <Telephone className="me-1" size={14} />
                                                        {patient.phone || 'Chưa có SĐT'}
                                                    </div>
                                                    {patient.email && (
                                                        <small className="text-muted">{patient.email}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{calculateAge(patient.birth)} tuổi</td>
                                            <td>{new Date(patient.registrationDate).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <Badge bg="secondary">{patient.bloodType}</Badge>
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
                                                        onClick={() => handleCreateMedicalRecord(patient)}
                                                    >
                                                        <FileEarmarkMedical size={14} className="me-1" />
                                                        Tạo phiếu khám
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-warning"
                                                        onClick={() => handleEditPatient(patient)}
                                                    >
                                                        <PencilSquare size={14} className="me-1" />
                                                        Sửa
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
                {totalPages > 1 && (
                    <Card.Footer className="d-flex justify-content-center">
                        <Pagination>
                            <Pagination.First
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            />
                            <Pagination.Prev
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            />

                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const startPage = Math.max(1, currentPage - 2);
                                const pageNumber = startPage + index;

                                if (pageNumber > totalPages) return null;

                                return (
                                    <Pagination.Item
                                        key={pageNumber}
                                        active={pageNumber === currentPage}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </Pagination.Item>
                                );
                            })}

                            <Pagination.Next
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            />
                            <Pagination.Last
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </Card.Footer>
                )}
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
                                            <strong>Mã bệnh nhân:</strong> {selectedPatient.code}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Họ tên:</strong> {selectedPatient.fullName}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Tuổi:</strong> {calculateAge(selectedPatient.birth)} tuổi
                                        </div>
                                        <div className="mb-2">
                                            <strong>Giới tính:</strong> {selectedPatient.gender === 'NAM' ? 'Nam' : 'Nữ'}
                                        </div>
                                        <div className="mb-2">
                                            <strong>CCCD:</strong> {selectedPatient.cccd || 'Chưa có'}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Số điện thoại:</strong> {selectedPatient.phone || 'Chưa có'}
                                        </div>
                                        {selectedPatient.email && (
                                            <div className="mb-2">
                                                <strong>Email:</strong> {selectedPatient.email}
                                            </div>
                                        )}
                                        <div className="mb-2">
                                            <strong>Địa chỉ:</strong> {selectedPatient.address}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Ngày đăng ký:</strong> {new Date(selectedPatient.registrationDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="border-0 bg-light">
                                    <Card.Body>
                                        <h6 className="text-primary mb-3">Thông tin y tế</h6>
                                        <div className="mb-2">
                                            <strong>Nhóm máu:</strong>
                                            <Badge bg="secondary" className="ms-2">{selectedPatient.bloodType}</Badge>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Cân nặng:</strong> {selectedPatient.weight} kg
                                        </div>
                                        <div className="mb-2">
                                            <strong>Chiều cao:</strong> {selectedPatient.height} cm
                                        </div>
                                        <div className="mb-2">
                                            <strong>BMI:</strong>
                                            <span className="ms-2">
                                                {(selectedPatient.weight / Math.pow(selectedPatient.height / 100, 2)).toFixed(1)}
                                            </span>
                                        </div>
                                        {selectedPatient.relationship && (
                                            <div className="mb-2">
                                                <strong>Mối quan hệ:</strong> {selectedPatient.relationship}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
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
                                handleCreateMedicalRecord(selectedPatient);
                                setShowDetailModal(false);
                            }
                        }}
                    >
                        <FileEarmarkMedical className="me-1" size={16} />
                        Tạo phiếu khám
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Patient Edit Modal */}
            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <PencilSquare className="me-2" />
                        Sửa thông tin bệnh nhân: {selectedPatient?.fullName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.fullName}
                                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CCCD <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.cccd}
                                        onChange={(e) => setEditFormData({ ...editFormData, cccd: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày sinh <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editFormData.birth}
                                        onChange={(e) => setEditFormData({ ...editFormData, birth: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giới tính <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={editFormData.gender}
                                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as 'NAM' | 'NU' })}
                                        required
                                    >
                                        <option value="NAM">Nam</option>
                                        <option value="NU">Nữ</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={editFormData.address}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nhóm máu <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={editFormData.bloodType}
                                        onChange={(e) => setEditFormData({ ...editFormData, bloodType: e.target.value })}
                                        required
                                    >
                                        <option value="">Chọn nhóm máu</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cân nặng (kg) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={editFormData.weight}
                                        onChange={(e) => setEditFormData({ ...editFormData, weight: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chiều cao (cm) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={editFormData.height}
                                        onChange={(e) => setEditFormData({ ...editFormData, height: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={editLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdatePatient}
                        disabled={editLoading || !editFormData.fullName || !editFormData.cccd || !editFormData.birth}
                    >
                        {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReceptionistPatientsPage;