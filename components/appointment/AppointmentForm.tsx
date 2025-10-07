"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";

//import services
import {
  appointmentService,
  patientService,
  departmentService,
  doctorService,
  type AppointmentCreateData,
  type Patient,
  type Department,
  type Doctor
} from "../../services";

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, onCancel }) => {
  // Form state
  const [formData, setFormData] = useState<Partial<AppointmentCreateData>>({
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    notes: ''
  });

  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Load doctors when department changes
  useEffect(() => {
    if (formData.departmentId) {
      loadDoctorsByDepartment(formData.departmentId);
    } else {
      setDoctors([]);
      setFormData(prev => ({ ...prev, doctorId: undefined }));
    }
  }, [formData.departmentId]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAllDepartments();
      setDepartments(response.data || []);
    } catch (err: any) {
      setError("Lỗi khi tải danh sách khoa");
    }
  };

  const loadDoctorsByDepartment = async (departmentId: number) => {
    try {
      const response = await doctorService.getDoctorsByDepartment(departmentId);
      setDoctors(response.data || []);
    } catch (err: any) {
      setError("Lỗi khi tải danh sách bác sĩ");
    }
  };

  const searchPatients = async (phone: string) => {
    if (!phone.trim()) return;

    setLoading(true);
    try {
      const response = await patientService.getPatientsByPhone(phone);
      setPatients(response.data || []);

      if (response.data && response.data.length === 1) {
        setSelectedPatient(response.data[0]);
        setFormData(prev => ({ ...prev, patientId: response.data[0].id }));
      }
    } catch (err: any) {
      setError("Không tìm thấy bệnh nhân với số điện thoại này");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId || !formData.departmentId ||
      !formData.appointmentDate || !formData.appointmentTime) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await appointmentService.createAppointment(formData as AppointmentCreateData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo lịch khám");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Đặt lịch khám mới</h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Patient Search */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại bệnh nhân *</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => searchPatients(searchPhone)}
                    disabled={loading || !searchPhone.trim()}
                  >
                    Tìm
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Chọn bệnh nhân *</Form.Label>
                <Form.Select
                  value={formData.patientId || ''}
                  onChange={(e) => {
                    const patientId = Number(e.target.value);
                    const patient = patients.find(p => p.id === patientId);
                    setSelectedPatient(patient || null);
                    handleInputChange('patientId', patientId);
                  }}
                  required
                >
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Department & Doctor */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Khoa khám *</Form.Label>
                <Form.Select
                  value={formData.departmentId || ''}
                  onChange={(e) => handleInputChange('departmentId', Number(e.target.value))}
                  required
                >
                  <option value="">Chọn khoa</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Bác sĩ *</Form.Label>
                <Form.Select
                  value={formData.doctorId || ''}
                  onChange={(e) => handleInputChange('doctorId', Number(e.target.value))}
                  required
                  disabled={!formData.departmentId}
                >
                  <option value="">Chọn bác sĩ</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Date & Time */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày khám *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.appointmentDate || ''}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Giờ khám *</Form.Label>
                <Form.Control
                  type="time"
                  value={formData.appointmentTime || ''}
                  onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Symptoms & Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Triệu chứng</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.symptoms || ''}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              placeholder="Mô tả triệu chứng của bệnh nhân..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Ghi chú thêm..."
            />
          </Form.Group>

          {/* Buttons */}
          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Đang tạo..." : "Đặt lịch"}
            </Button>
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AppointmentForm;