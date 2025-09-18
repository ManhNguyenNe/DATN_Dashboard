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
  type Department,
  type Doctor,
  type HealthPlan
} from "../../services";

// Extended interface để handle response structure thực tế
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
  examinationType: string; // 'package' | 'department' | 'doctor'
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

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle examination type change
  useEffect(() => {
    if (formData.examinationType) {
      loadServiceDoctorOptions(formData.examinationType);
      // Reset service/doctor selection when examination type changes
      setFormData(prev => ({ ...prev, serviceDoctor: '' }));
    }
  }, [formData.examinationType]);

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
      serviceDoctor: '' // Reset service/doctor selection
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