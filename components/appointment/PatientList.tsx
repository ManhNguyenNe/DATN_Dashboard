"use client";

//import node module libraries
import { useState } from "react";
import { Card, Table, Button, Badge, Alert, Modal, Row, Col, Form } from "react-bootstrap";
import { IconEdit, IconFileText, IconCalendar, IconPhone, IconMapPin, IconId, IconDroplet } from "@tabler/icons-react";

//import types
import { type PatientSearchResult } from "../../services";

interface PatientListProps {
    patients: PatientSearchResult[];
    loading?: boolean;
    onEdit?: (patient: PatientSearchResult) => void;
    onFillToMedicalRecord?: (patient: PatientSearchResult) => void;
}

const PatientList: React.FC<PatientListProps> = ({
    patients,
    loading = false,
    onEdit,
    onFillToMedicalRecord
}) => {
    const [editingPatient, setEditingPatient] = useState<PatientSearchResult | null>(null);
    const [editFormData, setEditFormData] = useState<PatientSearchResult | null>(null);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const getGenderText = (gender: 'NAM' | 'NU') => {
        return gender === 'NAM' ? 'Nam' : 'Nữ';
    };

    const getGenderVariant = (gender: 'NAM' | 'NU') => {
        return gender === 'NAM' ? 'primary' : 'secondary';
    };

    const handleEditClick = (patient: PatientSearchResult) => {
        setEditingPatient(patient);
        setEditFormData({ ...patient });
    };

    const handleEditFormChange = (field: keyof PatientSearchResult, value: string | number) => {
        if (editFormData) {
            setEditFormData({
                ...editFormData,
                [field]: value
            });
        }
    };

    const handleSaveEdit = () => {
        if (editFormData && onEdit) {
            onEdit(editFormData);
            setEditingPatient(null);
            setEditFormData(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingPatient(null);
        setEditFormData(null);
    };

    const handleFillClick = (patient: PatientSearchResult) => {
        if (onFillToMedicalRecord) {
            onFillToMedicalRecord(patient);
        }
    };

    if (loading) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 mb-0">Đang tìm kiếm bệnh nhân...</p>
                </Card.Body>
            </Card>
        );
    }

    if (patients.length === 0) {
        return (
            <Card>
                <Card.Body>
                    <Alert variant="info" className="mb-0">
                        <strong>Không tìm thấy bệnh nhân nào</strong>
                        <br />
                        Hãy thử tìm kiếm với từ khóa khác.
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <Card.Header>
                    <h5 className="mb-0">Danh sách bệnh nhân ({patients.length} kết quả)</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Mã BN</th>
                                <th>Họ tên</th>
                                <th>Số điện thoại</th>
                                <th>CCCD</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Nhóm máu</th>
                                <th>Ngày đăng ký</th>
                                <th className="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <code>{patient.code}</code>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{patient.fullName}</strong>
                                            {patient.address && (
                                                <div className="text-muted small">
                                                    <IconMapPin size={12} className="me-1" />
                                                    {patient.address}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-primary">
                                            <IconPhone size={14} className="me-1" />
                                            {patient.phone || 'Chưa có'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted">
                                            <IconId size={14} className="me-1" />
                                            {patient.cccd}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted">
                                            <IconCalendar size={14} className="me-1" />
                                            {formatDate(patient.birth)}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={getGenderVariant(patient.gender)}>
                                            {getGenderText(patient.gender)}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="text-danger">
                                            <IconDroplet size={14} className="me-1" />
                                            {patient.bloodType}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-muted small">
                                            {formatDate(patient.registrationDate)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditClick(patient)}
                                                title="Sửa thông tin"
                                            >
                                                <IconEdit size={14} />
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleFillClick(patient)}
                                                title="Điền vào phiếu khám"
                                            >
                                                <IconFileText size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Edit Patient Modal */}
            <Modal show={!!editingPatient} onHide={handleCancelEdit} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Sửa thông tin bệnh nhân</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editFormData && (
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.fullName}
                                        onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={editFormData.phone || ''}
                                        onChange={(e) => handleEditFormChange('phone', e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CCCD *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.cccd}
                                        onChange={(e) => handleEditFormChange('cccd', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ngày sinh *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editFormData.birth}
                                        onChange={(e) => handleEditFormChange('birth', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Giới tính *</Form.Label>
                                    <Form.Select
                                        value={editFormData.gender}
                                        onChange={(e) => handleEditFormChange('gender', e.target.value)}
                                    >
                                        <option value="NAM">Nam</option>
                                        <option value="NU">Nữ</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editFormData.address}
                                        onChange={(e) => handleEditFormChange('address', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nhóm máu</Form.Label>
                                    <Form.Select
                                        value={editFormData.bloodType}
                                        onChange={(e) => handleEditFormChange('bloodType', e.target.value)}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                        <option value="O">O</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cân nặng (kg)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={editFormData.weight}
                                        onChange={(e) => handleEditFormChange('weight', parseFloat(e.target.value) || 0)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Chiều cao (cm)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        value={editFormData.height}
                                        onChange={(e) => handleEditFormChange('height', parseFloat(e.target.value) || 0)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelEdit}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PatientList;