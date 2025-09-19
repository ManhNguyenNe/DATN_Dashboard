"use client";

//import node module libraries
import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { IconUser, IconPhone, IconMail, IconMapPin, IconCreditCard, IconCalendar } from "@tabler/icons-react";

//import services
import { patientService, type NewPatientCreateData } from "../../services";

interface AddPatientFormProps {
    show: boolean;
    onHide: () => void;
    onPatientAdded?: (patient: any) => void;
    onLoadingChange?: (loading: boolean) => void;
    onSuccess?: (message: string) => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({
    show,
    onHide,
    onPatientAdded,
    onLoadingChange,
    onSuccess
}) => {
    const [formData, setFormData] = useState<NewPatientCreateData>({
        phone: null,
        email: null,
        fullName: '',
        address: '',
        cccd: '',
        birth: '',
        gender: 'NAM',
        bloodType: 'O',
        weight: 0,
        height: 0,
        profileImage: null,
        phoneLink: null
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Handle form field changes
    const handleChange = (field: keyof NewPatientCreateData, value: any) => {
        setFormData((prev: NewPatientCreateData) => ({
            ...prev,
            [field]: value
        }));
        // Clear messages when user types
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    // Validate form data
    const validateForm = (): string | null => {
        if (!formData.fullName.trim()) {
            return "Họ tên không được để trống";
        }
        if (!formData.cccd.trim()) {
            return "CCCD không được để trống";
        }
        if (!formData.birth) {
            return "Ngày sinh không được để trống";
        }
        if (!formData.address.trim()) {
            return "Địa chỉ không được để trống";
        }
        if (!formData.phone && !formData.phoneLink) {
            return "Cần điền ít nhất một trong hai: Số điện thoại hoặc Số điện thoại liên hệ";
        }
        if (formData.weight <= 0) {
            return "Cân nặng phải lớn hơn 0";
        }
        if (formData.height <= 0) {
            return "Chiều cao phải lớn hơn 0";
        }
        return null;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        if (onLoadingChange) onLoadingChange(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await patientService.createNewPatient(formData);

            // Show toast notification via parent
            if (onSuccess) {
                onSuccess("Thêm bệnh nhân thành công!");
            }

            // Notify parent component
            if (onPatientAdded && response.data) {
                onPatientAdded(response.data);
            }

            // Close form immediately
            handleClose();

        } catch (err: any) {
            console.error('Error creating patient:', err);
            setError(err.message || "Lỗi khi thêm bệnh nhân");
        } finally {
            setLoading(false);
            if (onLoadingChange) onLoadingChange(false);
        }
    };

    // Handle close modal
    const handleClose = () => {
        setFormData({
            phone: null,
            email: null,
            fullName: '',
            address: '',
            cccd: '',
            birth: '',
            gender: 'NAM',
            bloodType: 'O',
            weight: 0,
            height: 0,
            profileImage: null,
            phoneLink: null
        });
        setError(null);
        setSuccess(null);
        setLoading(false);
        onHide();
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <IconUser size={20} className="me-2" />
                        Thêm bệnh nhân mới
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success" className="mb-3">
                                {success}
                            </Alert>
                        )}

                        <Row className="g-3">
                            {/* Full Name */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconUser size={16} className="me-1" />
                                        Họ tên <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                        placeholder="Nhập họ tên bệnh nhân"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* CCCD */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconCreditCard size={16} className="me-1" />
                                        CCCD <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.cccd}
                                        onChange={(e) => handleChange('cccd', e.target.value)}
                                        placeholder="Nhập số CCCD"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Birth Date */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconCalendar size={16} className="me-1" />
                                        Ngày sinh <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.birth}
                                        onChange={(e) => handleChange('birth', e.target.value)}
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Gender */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Giới tính <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.gender}
                                        onChange={(e) => handleChange('gender', e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="NAM">Nam</option>
                                        <option value="NU">Nữ</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Blood Type */}
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Nhóm máu <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={formData.bloodType}
                                        onChange={(e) => handleChange('bloodType', e.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="O">O</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Phone */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconPhone size={16} className="me-1" />
                                        Số điện thoại
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.phone || ''}
                                        onChange={(e) => handleChange('phone', e.target.value || null)}
                                        placeholder="Nhập số điện thoại"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Phone Link */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconPhone size={16} className="me-1" />
                                        Số điện thoại liên hệ
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.phoneLink || ''}
                                        onChange={(e) => handleChange('phoneLink', e.target.value || null)}
                                        placeholder="Nhập số điện thoại liên hệ"
                                        disabled={loading}
                                    />
                                    <Form.Text className="text-muted">
                                        * Cần điền ít nhất một trong hai số điện thoại
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* Email */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconMail size={16} className="me-1" />
                                        Email
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => handleChange('email', e.target.value || null)}
                                        placeholder="Nhập địa chỉ email"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Address */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>
                                        <IconMapPin size={16} className="me-1" />
                                        Địa chỉ <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="Nhập địa chỉ"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Weight */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Cân nặng (kg) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.weight}
                                        onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                                        placeholder="Nhập cân nặng"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Height */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Chiều cao (cm) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.height}
                                        onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
                                        placeholder="Nhập chiều cao"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Profile Image URL */}
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>URL hình ảnh</Form.Label>
                                    <Form.Control
                                        type="url"
                                        value={formData.profileImage || ''}
                                        onChange={(e) => handleChange('profileImage', e.target.value || null)}
                                        placeholder="Nhập URL hình ảnh (tùy chọn)"
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang thêm...
                                </>
                            ) : (
                                <>
                                    <IconUser size={16} className="me-2" />
                                    Thêm bệnh nhân
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default AddPatientForm;