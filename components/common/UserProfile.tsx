"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Alert, Tab, Tabs, Badge, Modal, Image } from "react-bootstrap";
import {
    PersonFill,
    TelephoneFill,
    EnvelopeFill,
    GeoAltFill,
    CalendarEventFill,
    ShieldFill,
    AwardFill,
    BookFill,
    ClockFill,
    CameraFill,
    PencilSquare,
    EyeFill,
    EyeSlashFill,
    Save,
    XCircle
} from "react-bootstrap-icons";
import { useAuth } from "../../contexts/AuthContext";
import { userService, type UserProfile, type UserProfileUpdateData, type ChangePasswordData } from "../../services";

interface UserProfileComponentProps {
    userRole: 'DOCTOR' | 'RECEPTIONIST';
}

const UserProfileComponent: React.FC<UserProfileComponentProps> = ({ userRole }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfileUpdateData>({});

    // Password change states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState<ChangePasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Avatar upload states
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getCurrentUserProfile();
            if (response.data) {
                setProfile(response.data);
                setFormData({
                    fullName: response.data.fullName,
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    birth: response.data.dateOfBirth || '',
                    profileImage: response.data.avatar || '',
                    exp: response.data.experience || 0,
                    position: response.data.position || '',
                    available: response.data.available || true
                });
            }
        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.message || 'Không thể tải thông tin người dùng'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof UserProfileUpdateData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const response = await userService.updateProfile(formData);
            if (response.data) {
                setProfile(response.data);
                setIsEditing(false);
                setAlert({
                    type: 'success',
                    message: 'Cập nhật thông tin thành công!'
                });
            }
        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.message || 'Không thể cập nhật thông tin'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setAlert({
                type: 'danger',
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp!'
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setAlert({
                type: 'danger',
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
            });
            return;
        }

        try {
            setSaving(true);
            await userService.changePassword(passwordData);
            setAlert({
                type: 'success',
                message: 'Đổi mật khẩu thành công!'
            });
            setShowPasswordModal(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.message || 'Không thể đổi mật khẩu'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) return;

        try {
            setSaving(true);
            const response = await userService.uploadAvatar(selectedFile);
            if (response.data) {
                await fetchProfile(); // Refresh profile data
                setAlert({
                    type: 'success',
                    message: 'Cập nhật ảnh đại diện thành công!'
                });
                setShowAvatarModal(false);
                setSelectedFile(null);
                setPreviewUrl('');
            }
        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.message || 'Không thể cập nhật ảnh đại diện'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'DOCTOR': return 'primary';
            case 'RECEPTIONIST': return 'info';
            case 'ADMIN': return 'danger';
            default: return 'secondary';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'DOCTOR': return 'Bác sĩ';
            case 'RECEPTIONIST': return 'Lễ tân';
            case 'ADMIN': return 'Quản trị viên';
            default: return 'Không xác định';
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <Alert variant="danger">
                Không thể tải thông tin người dùng. Vui lòng thử lại sau.
            </Alert>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Thông tin cá nhân</h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={() => setShowAvatarModal(true)}
                        size="sm"
                    >
                        <CameraFill className="me-1" />
                        Đổi ảnh đại diện
                    </Button>
                    <Button
                        variant="outline-warning"
                        onClick={() => setShowPasswordModal(true)}
                        size="sm"
                    >
                        <ShieldFill className="me-1" />
                        Đổi mật khẩu
                    </Button>
                </div>
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
                {/* Profile Card */}
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100">
                        <Card.Body>
                            <div className="position-relative d-inline-block mb-3">
                                <Image
                                    src={profile.avatar || '/images/default-avatar.png'}
                                    roundedCircle
                                    width="120"
                                    height="120"
                                    className="border border-3"
                                    style={{ objectFit: 'cover' }}
                                />
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle"
                                    style={{ width: '32px', height: '32px' }}
                                    onClick={() => setShowAvatarModal(true)}
                                >
                                    <CameraFill size={14} />
                                </Button>
                            </div>

                            <h5 className="mb-2">{profile.fullName}</h5>
                            <Badge bg={getRoleBadgeVariant(profile.role)} className="mb-3">
                                {getRoleText(profile.role)}
                            </Badge>

                            <div className="text-start">
                                <div className="mb-3 border-bottom pb-2">
                                    <small className="text-secondary fw-bold text-uppercase d-block mb-1">
                                        <EnvelopeFill className="me-1" />
                                        Email
                                    </small>
                                    <div className="text-dark fw-semibold">
                                        {profile.email || <span className="text-muted fst-italic">Trống</span>}
                                    </div>
                                </div>
                                <div className="mb-3 border-bottom pb-2">
                                    <small className="text-secondary fw-bold text-uppercase d-block mb-1">
                                        <TelephoneFill className="me-1" />
                                        Số điện thoại
                                    </small>
                                    <div className="text-dark fw-semibold">
                                        {profile.phone || <span className="text-muted fst-italic">Trống</span>}
                                    </div>
                                </div>
                                <div className="mb-3 border-bottom pb-2">
                                    <small className="text-secondary fw-bold text-uppercase d-block mb-1">
                                        <CalendarEventFill className="me-1" />
                                        Ngày tham gia
                                    </small>
                                    <div className="text-dark fw-semibold">
                                        {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            {profile.position && (
                                <div className="mb-3 border-bottom pb-2">
                                    <small className="text-secondary fw-bold text-uppercase d-block mb-1">
                                        <AwardFill className="me-1" />
                                        Chức vụ
                                    </small>
                                    <div className="text-dark fw-semibold">{profile.position}</div>
                                </div>
                            )}

                            {profile.experience && profile.experience > 0 && (
                                <div className="mb-3 border-bottom pb-2">
                                    <small className="text-secondary fw-bold text-uppercase d-block mb-1">
                                        <ClockFill className="me-1" />
                                        Kinh nghiệm
                                    </small>
                                    <div className="text-dark fw-semibold">{profile.experience} năm</div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Details Tabs */}
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Chi tiết thông tin</h6>
                                <Button
                                    variant={isEditing ? "outline-secondary" : "outline-primary"}
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            setFormData({
                                                fullName: profile.fullName,
                                                phone: profile.phone || '',
                                                address: profile.address || '',
                                                birth: profile.dateOfBirth || '',
                                                profileImage: profile.avatar || '',
                                                exp: profile.experience || 0,
                                                position: profile.position || '',
                                                available: profile.available || true
                                            });
                                        }
                                        setIsEditing(!isEditing);
                                    }}
                                >
                                    {isEditing ? (
                                        <>
                                            <XCircle className="me-1" />
                                            Hủy
                                        </>
                                    ) : (
                                        <>
                                            <PencilSquare className="me-1" />
                                            Chỉnh sửa
                                        </>
                                    )}
                                </Button>
                            </div>

                            <Tabs defaultActiveKey="basic" className="mb-3">
                                {/* Basic Info Tab */}
                                <Tab eventKey="basic" title="Thông tin cơ bản">
                                    <Row>
                                        <Col md={6} className="mb-4">
                                            <div className="border-bottom pb-2 mb-2">
                                                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                    <PersonFill className="me-1" />
                                                    Họ và tên
                                                </Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.fullName || ''}
                                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="fw-semibold text-dark fs-6">
                                                        {profile.fullName || <span className="text-muted fst-italic">Trống</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </Col>

                                        <Col md={6} className="mb-4">
                                            <div className="border-bottom pb-2 mb-2">
                                                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                    <EnvelopeFill className="me-1" />
                                                    Email
                                                </Form.Label>
                                                <div className="fw-semibold text-dark fs-6">
                                                    {profile.email || <span className="text-muted fst-italic">Trống</span>}
                                                    <small className="text-muted d-block">(không thể thay đổi)</small>
                                                </div>
                                            </div>
                                        </Col>

                                        <Col md={6} className="mb-4">
                                            <div className="border-bottom pb-2 mb-2">
                                                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                    <TelephoneFill className="me-1" />
                                                    Số điện thoại
                                                </Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        type="tel"
                                                        value={formData.phone || ''}
                                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                                        placeholder="Nhập số điện thoại"
                                                    />
                                                ) : (
                                                    <div className="fw-semibold text-dark fs-6">
                                                        {profile.phone || <span className="text-muted fst-italic">Trống</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </Col>

                                        <Col md={6} className="mb-4">
                                            <div className="border-bottom pb-2 mb-2">
                                                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                    <CalendarEventFill className="me-1" />
                                                    Ngày sinh
                                                </Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.birth || ''}
                                                        onChange={(e) => handleInputChange('birth', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="fw-semibold text-dark fs-6">
                                                        {profile.dateOfBirth
                                                            ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                                                            : <span className="text-muted fst-italic">Trống</span>
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </Col>

                                        <Col md={12} className="mb-4">
                                            <div className="border-bottom pb-2 mb-2">
                                                <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                    <GeoAltFill className="me-1" />
                                                    Địa chỉ
                                                </Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        value={formData.address || ''}
                                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                                        placeholder="Nhập địa chỉ"
                                                    />
                                                ) : (
                                                    <div className="fw-semibold text-dark fs-6">
                                                        {profile.address || <span className="text-muted fst-italic">Trống</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab>

                                {/* Professional Info Tab - Only for Doctors */}
                                {userRole === 'DOCTOR' && (
                                    <Tab eventKey="professional" title="Thông tin nghề nghiệp">
                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <div className="border-bottom pb-2 mb-2">
                                                    <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                        <AwardFill className="me-1" />
                                                        Chức vụ
                                                    </Form.Label>
                                                    {isEditing ? (
                                                        <Form.Control
                                                            type="text"
                                                            value={formData.position || ''}
                                                            onChange={(e) => handleInputChange('position', e.target.value)}
                                                            placeholder="Nhập chức vụ"
                                                        />
                                                    ) : (
                                                        <div className="fw-semibold text-dark fs-6">
                                                            {profile.position || <span className="text-muted fst-italic">Trống</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>

                                            <Col md={6} className="mb-4">
                                                <div className="border-bottom pb-2 mb-2">
                                                    <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                        <ClockFill className="me-1" />
                                                        Kinh nghiệm
                                                    </Form.Label>
                                                    {isEditing ? (
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            value={formData.exp || 0}
                                                            onChange={(e) => handleInputChange('exp', parseInt(e.target.value) || 0)}
                                                            placeholder="Số năm kinh nghiệm"
                                                        />
                                                    ) : (
                                                        <div className="fw-semibold text-dark fs-6">
                                                            {profile.experience ? `${profile.experience} năm` : <span className="text-muted fst-italic">Trống</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>

                                            <Col md={6} className="mb-4">
                                                <div className="border-bottom pb-2 mb-2">
                                                    <Form.Label className="fw-bold text-secondary small text-uppercase mb-1">
                                                        <ShieldFill className="me-1" />
                                                        Trạng thái
                                                    </Form.Label>
                                                    {isEditing ? (
                                                        <Form.Select
                                                            value={formData.available ? 'true' : 'false'}
                                                            onChange={(e) => handleInputChange('available', e.target.value === 'true')}
                                                        >
                                                            <option value="true">Có thể khám</option>
                                                            <option value="false">Tạm nghỉ</option>
                                                        </Form.Select>
                                                    ) : (
                                                        <div className="fw-semibold text-dark fs-6">
                                                            <Badge bg={profile.available ? 'success' : 'warning'}>
                                                                {profile.available ? 'Có thể khám' : 'Tạm nghỉ'}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Tab>
                                )}
                            </Tabs>

                            {isEditing && (
                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                fullName: profile.fullName,
                                                phone: profile.phone || '',
                                                address: profile.address || '',
                                                birth: profile.dateOfBirth || '',
                                                profileImage: profile.avatar || '',
                                                exp: profile.experience || 0,
                                                position: profile.position || '',
                                                available: profile.available || true
                                            });
                                        }}
                                        disabled={saving}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="me-1" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Password Change Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Đổi mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu hiện tại</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPasswords(prev => ({
                                        ...prev,
                                        current: !prev.current
                                    }))}
                                >
                                    {showPasswords.current ? <EyeSlashFill /> : <EyeFill />}
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mật khẩu mới</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }))}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPasswords(prev => ({
                                        ...prev,
                                        new: !prev.new
                                    }))}
                                >
                                    {showPasswords.new ? <EyeSlashFill /> : <EyeFill />}
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }))}
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPasswords(prev => ({
                                        ...prev,
                                        confirm: !prev.confirm
                                    }))}
                                >
                                    {showPasswords.confirm ? <EyeSlashFill /> : <EyeFill />}
                                </Button>
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleChangePassword}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            'Đổi mật khẩu'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Avatar Upload Modal */}
            <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cập nhật ảnh đại diện</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <Image
                            src={previewUrl || profile.avatar || '/images/default-avatar.png'}
                            roundedCircle
                            width="150"
                            height="150"
                            className="border border-3"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <Form.Group>
                        <Form.Label>Chọn ảnh mới</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Form.Text className="text-muted">
                            Chấp nhận các định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAvatarUpload}
                        disabled={saving || !selectedFile}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Đang upload...
                            </>
                        ) : (
                            'Cập nhật'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserProfileComponent;