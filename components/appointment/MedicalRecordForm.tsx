"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { IconUser, IconPhone, IconMail, IconCalendar, IconMapPin, IconId, IconStethoscope } from "@tabler/icons-react";

//import services
import {
  departmentService,
  doctorService,
  healthPlanService,
  patientService,
  type Department,
  type Doctor,
  type HealthPlan,
  type LinkedPatient,
  type Appointment,
  type PatientSearchResult,
  type PatientDetail
} from "../../services";// Extended interface để handle response structure thực tế
interface DoctorResponse extends Doctor {
  fullName?: string;
  position?: string;
  available?: boolean;
}

interface MedicalRecordFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  citizenId: string;
  bloodType: string;
  weight: string;
  height: string;
  examinationType: string; // 'package' | 'department' | 'doctor'
  serviceDoctor: string;
  selectedPatientId?: number; // ID of selected linked patient
}

interface MedicalRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  appointmentData?: Appointment; // Pre-fill data from appointment
  patientData?: PatientSearchResult; // Pre-fill data from patient search
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ onSuccess, onCancel, appointmentData, patientData }) => {
  // Form state
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    citizenId: '',
    bloodType: '',
    weight: '',
    height: '',
    examinationType: '',
    serviceDoctor: '',
    selectedPatientId: undefined
  });

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLinkedPatients, setShowLinkedPatients] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle examination type change
  useEffect(() => {
    if (formData.examinationType) {
      loadServiceDoctorOptions(formData.examinationType);
      // Only reset service/doctor selection if it's not already set (to preserve auto-fill from appointment data)
      if (!formData.serviceDoctor) {
        setFormData(prev => ({ ...prev, serviceDoctor: '' }));
      }
    }
  }, [formData.examinationType]);

  // Special effect to load service/doctor options when form data is auto-filled from appointment
  useEffect(() => {
    if (appointmentData && formData.examinationType && formData.serviceDoctor) {
      console.log('Auto-fill detected: Loading service/doctor options for auto-filled data', {
        examinationType: formData.examinationType,
        serviceDoctor: formData.serviceDoctor
      });
      // Auto-filled data detected, make sure the options are loaded
      loadServiceDoctorOptions(formData.examinationType);
    }
  }, [appointmentData, formData.examinationType, formData.serviceDoctor]);

  // Pre-fill form with appointment data
  useEffect(() => {
    if (appointmentData) {
      console.log('Auto-filling form with appointment data:', appointmentData);

      // Check if we have patientId to get detailed patient information
      if (appointmentData.patientId) {
        loadPatientDetail(appointmentData.patientId);
      } else {
        // Use appointment data directly if no patientId
        fillFormWithAppointmentData(appointmentData);
      }

      // Load linked patients if we have a phone number
      if (appointmentData.phone) {
        loadLinkedPatients(appointmentData.phone);
      }
    }
  }, [appointmentData]);

  // Function to load patient detail by ID
  const loadPatientDetail = async (patientId: number) => {
    try {
      setLoading(true);
      console.log('Loading patient detail by ID:', patientId);

      const response = await patientService.getPatientById(patientId);
      console.log('Patient detail response:', response);

      if (response.data && appointmentData) {
        const patientDetail = response.data;

        // Determine examination type and service/doctor from appointment data
        let examinationType = '';
        let serviceDoctor = '';

        if (appointmentData.healthPlanResponse) {
          examinationType = 'package';
          serviceDoctor = appointmentData.healthPlanResponse.id.toString();
          console.log('Auto-filled: Health plan detected', {
            planId: appointmentData.healthPlanResponse.id,
            planName: appointmentData.healthPlanResponse.name
          });
        } else if (appointmentData.departmentResponse) {
          examinationType = `department-${appointmentData.departmentResponse.id}`;
          if (appointmentData.doctorResponse) {
            serviceDoctor = appointmentData.doctorResponse.id.toString();
            console.log('Auto-filled: Department + doctor detected', {
              departmentId: appointmentData.departmentResponse.id,
              departmentName: appointmentData.departmentResponse.name,
              doctorId: appointmentData.doctorResponse.id,
              doctorName: appointmentData.doctorResponse.position
            });
          } else {
            console.log('Auto-filled: Department only detected', {
              departmentId: appointmentData.departmentResponse.id,
              departmentName: appointmentData.departmentResponse.name
            });
          }
        } else if (appointmentData.doctorResponse) {
          examinationType = 'doctor';
          serviceDoctor = appointmentData.doctorResponse.id.toString();
          console.log('Auto-filled: Doctor only detected', {
            doctorId: appointmentData.doctorResponse.id,
            doctorName: appointmentData.doctorResponse.position
          });
        }

        console.log('Setting form data with detailed patient information:', {
          examinationType,
          serviceDoctor,
          patientDetail
        });

        setFormData(prev => ({
          ...prev,
          fullName: patientDetail.fullName || '',
          phoneNumber: patientDetail.phone || '',
          email: appointmentData.email || '', // Use appointment email if available
          dateOfBirth: patientDetail.birth || '',
          gender: patientDetail.gender === 'NAM' ? 'Nam' : patientDetail.gender === 'NU' ? 'Nữ' : 'Khác',
          address: patientDetail.address || '',
          citizenId: patientDetail.cccd?.toString() || '',
          bloodType: patientDetail.bloodType || '',
          weight: patientDetail.weight?.toString() || '',
          height: patientDetail.height?.toString() || '',
          examinationType: examinationType,
          serviceDoctor: serviceDoctor,
        }));
      }
    } catch (error: any) {
      console.error('Error loading patient detail:', error);
      // Fallback to appointment data if patient detail fails
      if (appointmentData) {
        fillFormWithAppointmentData(appointmentData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fill form with appointment data only
  const fillFormWithAppointmentData = (appointmentData: Appointment) => {
    // Determine examination type and service/doctor from appointment data
    let examinationType = '';
    let serviceDoctor = '';

    if (appointmentData.healthPlanResponse) {
      // Appointment has health plan - set as package examination
      examinationType = 'package';
      serviceDoctor = appointmentData.healthPlanResponse.id.toString();
      console.log('Auto-filled: Health plan detected, setting package examination', {
        planId: appointmentData.healthPlanResponse.id,
        planName: appointmentData.healthPlanResponse.name
      });
    } else if (appointmentData.departmentResponse) {
      // Appointment has department - set as department examination
      examinationType = `department-${appointmentData.departmentResponse.id}`;
      if (appointmentData.doctorResponse) {
        // Also has specific doctor in that department
        serviceDoctor = appointmentData.doctorResponse.id.toString();
        console.log('Auto-filled: Department + doctor detected', {
          departmentId: appointmentData.departmentResponse.id,
          departmentName: appointmentData.departmentResponse.name,
          doctorId: appointmentData.doctorResponse.id,
          doctorName: appointmentData.doctorResponse.position
        });
      } else {
        console.log('Auto-filled: Department only detected', {
          departmentId: appointmentData.departmentResponse.id,
          departmentName: appointmentData.departmentResponse.name
        });
      }
    } else if (appointmentData.doctorResponse) {
      // Appointment has doctor only - set as doctor examination
      examinationType = 'doctor';
      serviceDoctor = appointmentData.doctorResponse.id.toString();
      console.log('Auto-filled: Doctor only detected', {
        doctorId: appointmentData.doctorResponse.id,
        doctorName: appointmentData.doctorResponse.position
      });
    }

    console.log('Setting form data with appointment values:', {
      examinationType,
      serviceDoctor
    });

    setFormData(prev => ({
      ...prev,
      fullName: appointmentData.fullName || '',
      phoneNumber: appointmentData.phone || '',
      email: appointmentData.email || '',
      dateOfBirth: appointmentData.birth || '',
      gender: appointmentData.gender || '',
      address: appointmentData.address || '',
      examinationType: examinationType,
      serviceDoctor: serviceDoctor,
      // Keep existing values for new fields if any
      bloodType: prev.bloodType,
      weight: prev.weight,
      height: prev.height,
      citizenId: prev.citizenId,
    }));
  };

  // Pre-fill form with patient search data
  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        fullName: patientData.fullName || '',
        // Note: PatientSearchResult doesn't have phone in the API structure shown
        // We'll keep existing phoneNumber if any
        email: '', // PatientSearchResult doesn't have email
        dateOfBirth: patientData.birth || '',
        gender: patientData.gender === 'NAM' ? 'Nam' : patientData.gender === 'NU' ? 'Nữ' : 'Khác',
        address: patientData.address || '',
        citizenId: patientData.cccd || '',
        phoneNumber: patientData.phone || ''
      }));

      // Don't load linked patients for direct patient selection
      setLinkedPatients([]);
      setShowLinkedPatients(false);
    }
  }, [patientData]);

  // Load linked patients by phone number
  const loadLinkedPatients = async (phone: string) => {
    try {
      setLoading(true);
      const response = await patientService.getLinkedPatientsByPhone(phone);

      if (response.data && response.data.patients) {
        setLinkedPatients(response.data.patients);
        setShowLinkedPatients(response.data.patients.length > 1); // Only show if there are multiple patients
      }
    } catch (err: any) {
      console.error('Error loading linked patients:', err);
      // Don't show error for linked patients, it's not critical
      setLinkedPatients([]);
      setShowLinkedPatients(false);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load departments and health plans
      const [deptResponse, healthPlanResponse] = await Promise.all([
        departmentService.getAllDepartments(),
        healthPlanService.getAllHealthPlans()
      ]);

      console.log('Departments Response:', deptResponse); // Debug log
      console.log('Health Plans Response:', healthPlanResponse); // Debug log

      // Handle departments response structure
      let departmentsData: Department[] = [];
      if (deptResponse.data && Array.isArray(deptResponse.data)) {
        departmentsData = deptResponse.data;
      } else if (deptResponse && Array.isArray(deptResponse)) {
        departmentsData = deptResponse as Department[];
      } else {
        console.warn('Unexpected departments response structure:', deptResponse);
        departmentsData = [];
      }

      // Handle health plans response structure
      let healthPlansData: HealthPlan[] = [];
      if (healthPlanResponse.data && Array.isArray(healthPlanResponse.data)) {
        healthPlansData = healthPlanResponse.data;
      } else if (healthPlanResponse && Array.isArray(healthPlanResponse)) {
        healthPlansData = healthPlanResponse as HealthPlan[];
      } else {
        console.warn('Unexpected health plans response structure:', healthPlanResponse);
        healthPlansData = [];
      }

      console.log('Processed departments:', departmentsData); // Debug log
      console.log('Processed health plans:', healthPlansData); // Debug log

      setDepartments(departmentsData);
      setHealthPlans(healthPlansData);
    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError('Lỗi khi tải dữ liệu khởi tạo');
    }
  };

  const loadServiceDoctorOptions = async (examinationType: string) => {
    try {
      setLoading(true);

      if (examinationType === 'package') {
        // Health plans already loaded
        return;
      } else if (examinationType.startsWith('department-')) {
        // Load doctors for specific department
        const departmentId = parseInt(examinationType.replace('department-', ''));
        if (!isNaN(departmentId)) {
          const response = await doctorService.getDoctorsByDepartment(departmentId);
          console.log('Doctors Response:', response); // Debug log

          // Handle doctors response structure
          let doctorsData: DoctorResponse[] = [];
          if (response.data && Array.isArray(response.data)) {
            doctorsData = response.data as DoctorResponse[];
          } else if (response && Array.isArray(response)) {
            doctorsData = response as DoctorResponse[];
          } else {
            console.warn('Unexpected doctors response structure:', response);
            doctorsData = [];
          }

          // Debug: Log doctor structure for single department
          if (doctorsData.length > 0) {
            console.log('Sample doctor object from department:', doctorsData[0]);
            console.log('Available fields:', Object.keys(doctorsData[0]));
          }

          console.log('Processed doctors:', doctorsData); // Debug log
          setDoctors(doctorsData);
        }
      } else if (examinationType === 'doctor') {
        // Load all doctors from all departments
        console.log('Loading all doctors, departments available:', departments.length);

        if (departments.length === 0) {
          console.warn('No departments loaded yet, cannot load doctors');
          setError('Chưa tải được danh sách khoa. Vui lòng thử lại.');
          return;
        }

        const allDoctors: DoctorResponse[] = [];
        for (const dept of departments) {
          try {
            console.log(`Loading doctors for department: ${dept.name} (ID: ${dept.id})`);
            const response = await doctorService.getDoctorsByDepartment(dept.id);
            console.log(`Doctors for department ${dept.id}:`, response); // Debug log

            // Handle doctors response structure
            let doctorsData: DoctorResponse[] = [];
            if (response.data && Array.isArray(response.data)) {
              doctorsData = response.data as DoctorResponse[];
            } else if (response && Array.isArray(response)) {
              doctorsData = response as DoctorResponse[];
            } else {
              console.warn('Unexpected doctors response structure:', response);
              doctorsData = [];
            }

            // Debug: Log doctor structure
            if (doctorsData.length > 0) {
              console.log('Sample doctor object structure:', doctorsData[0]);
              console.log('Available fields:', Object.keys(doctorsData[0]));
            }

            // Add department name to doctors
            doctorsData = doctorsData.map(doctor => {
              console.log('Processing doctor:', doctor);
              return {
                ...doctor,
                departmentName: doctor.departmentName || dept.name
              };
            });

            if (doctorsData.length > 0) {
              allDoctors.push(...doctorsData);
            }
          } catch (err) {
            console.warn(`Failed to load doctors for department ${dept.id}`, err);
          }
        }

        console.log('All processed doctors:', allDoctors); // Debug log
        setDoctors(allDoctors);
      }
    } catch (err: any) {
      console.error('Error loading service/doctor options:', err);
      setError('Lỗi khi tải danh sách dịch vụ/bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MedicalRecordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExaminationTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      examinationType: value,
      serviceDoctor: '' // Reset service/doctor selection when manually changed
    }));
  };

  const handleServiceDoctorChange = async (value: string) => {
    setFormData(prev => ({ ...prev, serviceDoctor: value }));
    // Logic xử lý đã được chuyển vào loadServiceDoctorOptions
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['fullName', 'phoneNumber', 'dateOfBirth', 'gender', 'citizenId', 'examinationType'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof MedicalRecordFormData];
      return typeof value === 'string' ? !value.trim() : !value;
    });

    if (missingFields.length > 0) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Call API to create medical record
      console.log('Medical Record Data:', {
        ...formData,
        // Highlight new fields
        medicalInfo: {
          bloodType: formData.bloodType || 'Không xác định',
          weight: formData.weight ? `${formData.weight} kg` : 'Chưa nhập',
          height: formData.height ? `${formData.height} cm` : 'Chưa nhập'
        }
      });

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
          bloodType: '',
          weight: '',
          height: '',
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

  // Handle linked patient selection
  const handleLinkedPatientSelect = (patientId: string) => {
    const selectedPatient = linkedPatients.find(p => p.id.toString() === patientId);

    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        selectedPatientId: selectedPatient.id,
        fullName: selectedPatient.fullName,
        dateOfBirth: selectedPatient.birth,
        gender: selectedPatient.gender === 'NAM' ? 'Nam' : selectedPatient.gender === 'NU' ? 'Nữ' : 'Khác',
        address: selectedPatient.address,
        citizenId: selectedPatient.cccd, // Map CCCD to citizenId
        // Keep existing phoneNumber as it's used for the search
      }));
    } else if (patientId === '') {
      // Reset to appointment data if available, or empty
      if (appointmentData) {
        setFormData(prev => ({
          ...prev,
          selectedPatientId: undefined,
          fullName: appointmentData.fullName || '',
          dateOfBirth: appointmentData.birth || '',
          gender: appointmentData.gender || '',
          address: appointmentData.address || '',
          citizenId: '', // Clear CCCD when not selecting a patient
        }));
      }
    }
  };

  const genderOptions = [
    { value: '', label: 'Chọn giới tính' },
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' },
    { value: 'Khác', label: 'Khác' }
  ];



  // Get service/doctor options based on examination type
  const getServiceDoctorOptions = () => {
    const baseOption = { value: '', label: 'Chọn dịch vụ/bác sĩ' };

    console.log('getServiceDoctorOptions called with examinationType:', formData.examinationType);
    console.log('Current doctors array:', doctors);

    if (formData.examinationType === 'package') {
      // Gói khám -> hiển thị các gói khám
      console.log('Returning health plans options:', healthPlans);
      return [
        baseOption,
        ...healthPlans.map(plan => ({
          value: plan.id.toString(),
          label: `${plan.name} - ${plan.price?.toLocaleString()}đ`
        }))
      ];
    } else if (formData.examinationType.startsWith('department-')) {
      // Chuyên khoa cụ thể -> hiển thị bác sĩ trong khoa đó
      console.log('Returning department doctors options:', doctors);
      return [
        { value: '', label: 'Chọn bác sĩ trong khoa' },
        ...doctors.map(doctor => ({
          value: doctor.id.toString(),
          label: (doctor as any).fullName || (doctor as any).position || doctor.name || `Bác sĩ #${doctor.id}`
        }))
      ];
    } else if (formData.examinationType === 'doctor') {
      // Tất cả bác sĩ -> hiển thị tất cả bác sĩ kèm tên khoa
      console.log('Returning all doctors options:', doctors);
      return [
        { value: '', label: 'Chọn bác sĩ' },
        ...doctors.map(doctor => ({
          value: doctor.id.toString(),
          label: `${(doctor as any).fullName || (doctor as any).position || doctor.name || `Bác sĩ #${doctor.id}`}${doctor.departmentName ? ` - ${doctor.departmentName}` : ''}`
        }))
      ];
    }

    return [baseOption];
  };

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

            {/* Linked Patient Selection */}
            {showLinkedPatients && (
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chọn bệnh nhân liên kết</Form.Label>
                    <Form.Select
                      value={formData.selectedPatientId?.toString() || ''}
                      onChange={(e) => handleLinkedPatientSelect(e.target.value)}
                    >
                      <option value="">Chọn bệnh nhân (hoặc để trống để nhập thủ công)</option>
                      {linkedPatients.map((patient) => (
                        <option key={patient.id} value={patient.id.toString()}>
                          {patient.fullName} - {patient.relationship}
                          {patient.birth && ` (${new Date(patient.birth).toLocaleDateString('vi-VN')})`}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Danh sách bệnh nhân liên kết với số điện thoại này
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            )}

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

            {/* Additional medical info */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhóm máu</Form.Label>
                  <Form.Select
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange('bloodType', e.target.value)}
                  >
                    <option value="">Chọn nhóm máu</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Cân nặng (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="300"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Nhập cân nặng"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Chiều cao (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="250"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="Nhập chiều cao"
                  />
                </Form.Group>
              </Col>
            </Row>
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
                    onChange={(e) => handleExaminationTypeChange(e.target.value)}
                    required
                  >
                    <option value="">Chọn loại khám</option>

                    {/* Gói khám */}
                    <optgroup label="Gói khám">
                      <option value="package">Gói khám</option>
                    </optgroup>

                    {/* Chuyên khoa */}
                    <optgroup label="Chuyên khoa">
                      {departments.map(dept => (
                        <option key={`dept-${dept.id}`} value={`department-${dept.id}`}>
                          {dept.name}
                        </option>
                      ))}
                    </optgroup>

                    {/* Bác sĩ */}
                    <optgroup label="Bác sĩ">
                      <option value="doctor">Tất cả bác sĩ</option>
                    </optgroup>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dịch vụ/Bác sĩ</Form.Label>
                  <Form.Select
                    value={formData.serviceDoctor}
                    onChange={(e) => handleServiceDoctorChange(e.target.value)}
                    disabled={!formData.examinationType || loading}
                  >
                    {loading && (formData.examinationType === 'doctor' || formData.examinationType.startsWith('department-')) ? (
                      <option value="">Đang tải danh sách bác sĩ...</option>
                    ) : (
                      getServiceDoctorOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    )}
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