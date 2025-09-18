"use client";

//import node module libraries
import { useState } from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { IconUser, IconPhone, IconMail, IconCalendar, IconMapPin, IconId, IconStethoscope } from "@tabler/icons-react";

interface MedicalRecordFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  citizenId: string;
  examinationType: string;
  serviceDoctor: string;
}

interface MedicalRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ onSuccess, onCancel }) => {
  // Form state
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    citizenId: '',
    examinationType: '',
    serviceDoctor: ''
  });

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof MedicalRecordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['fullName', 'phoneNumber', 'dateOfBirth', 'gender', 'citizenId', 'examinationType'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof MedicalRecordFormData].trim());
    
    if (missingFields.length > 0) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Call API to create medical record
      console.log('Medical Record Data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Tạo phiếu khám bệnh thành công!");
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          fullName: '',
          phoneNumber: '',
          email: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          citizenId: '',
          examinationType: '',
          serviceDoctor: ''
        });
        setSuccess(null);
        onSuccess?.();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo phiếu khám bệnh");
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: '', label: 'Chọn giới tính' },
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' }
  ];

  const examinationTypes = [
    { value: '', label: 'Chọn loại khám' },
    { value: 'Khám tổng quát', label: 'Khám tổng quát' },
    { value: 'Khám chuyên khoa', label: 'Khám chuyên khoa' },
    { value: 'Khám định kỳ', label: 'Khám định kỳ' },
    { value: 'Khám theo yêu cầu', label: 'Khám theo yêu cầu' }
  ];

  const serviceDoctorOptions = [
    { value: '', label: 'Chọn dịch vụ/bác sĩ' },
    { value: 'BS. Nguyễn Văn A - Tim mạch', label: 'BS. Nguyễn Văn A - Tim mạch' },
    { value: 'BS. Trần Thị B - Nội khoa', label: 'BS. Trần Thị B - Nội khoa' },
    { value: 'BS. Lê Văn C - Ngoại khoa', label: 'BS. Lê Văn C - Ngoại khoa' },
    { value: 'BS. Phạm Thị D - Sản phụ khoa', label: 'BS. Phạm Thị D - Sản phụ khoa' },
    { value: 'BS. Hoàng Văn E - Nhi khoa', label: 'BS. Hoàng Văn E - Nhi khoa' }
  ];

  return (
    <Card>
      <Card.Header className="d-flex align-items-center">
        <IconStethoscope size={20} className="me-2" />
        <h5 className="mb-0">Phiếu khám bệnh</h5>
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

        <Form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 d-flex align-items-center">
              <IconUser size={18} className="me-2" />
              Thông tin cá nhân
            </h6>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại *</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconPhone size={16} />
                    </span>
                    <Form.Control
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconMail size={16} />
                    </span>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sinh *</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconCalendar size={16} />
                    </span>
                    <Form.Control
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính *</Form.Label>
                  <Form.Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    required
                  >
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Căn cước công dân *</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <IconId size={16} />
                    </span>
                    <Form.Control
                      type="text"
                      value={formData.citizenId}
                      onChange={(e) => handleInputChange('citizenId', e.target.value)}
                      placeholder="Nhập số căn cước công dân"
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <IconMapPin size={16} />
                </span>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ đầy đủ"
                />
              </div>
            </Form.Group>
          </div>

          {/* Medical Information */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 d-flex align-items-center">
              <IconStethoscope size={18} className="me-2" />
              Thông tin khám bệnh
            </h6>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại khám *</Form.Label>
                  <Form.Select
                    value={formData.examinationType}
                    onChange={(e) => handleInputChange('examinationType', e.target.value)}
                    required
                  >
                    {examinationTypes.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dịch vụ/Bác sĩ</Form.Label>
                  <Form.Select
                    value={formData.serviceDoctor}
                    onChange={(e) => handleInputChange('serviceDoctor', e.target.value)}
                  >
                    {serviceDoctorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 pt-3 border-top">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tạo...
                </>
              ) : (
                'Tạo phiếu khám'
              )}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={onCancel} 
              disabled={loading}
            >
              Hủy bỏ
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MedicalRecordForm;