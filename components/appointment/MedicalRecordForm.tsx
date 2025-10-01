"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Row, Col, Form, Button, Card } from "react-bootstrap";
import { IconUser, IconPhone, IconMail, IconCalendar, IconMapPin, IconId, IconStethoscope, IconTrash } from "@tabler/icons-react";
// Import Bootstrap Icons CSS for payment icons
import "bootstrap-icons/font/bootstrap-icons.css";
// Import Ant Design components
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

//import services
import {
  departmentService,
  doctorService,
  healthPlanService,
  patientService,
  medicalRecordService,
  paymentService,
  type Department,
  type Doctor,
  type HealthPlan,
  type LinkedPatient,
  type Appointment,
  type PatientSearchResult,
  type PatientDetail,
  type SimpleMedicalRecordCreateData,
  type SimpleApiResponse,
  type PaymentLinkRequest,
  type PaymentLinkResponse
} from "../../services";

// Import Ant Design notification
import { useAntdNotification } from 'components/common/AntdNotificationProvider';

//import components
import ServiceCostDisplay from "./ServiceCostDisplay";
import QRPaymentModal from "../payment/QRPaymentModal";// Extended interface để handle response structure thực tế
interface DoctorResponse extends Doctor {
  fullName?: string;
  position?: string;
  available?: boolean;
  examinationFee?: number;
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
  symptoms: string; // Triệu chứng
  selectedPatientId?: number; // ID of selected linked patient
  examinationFee: number; // Chi phí khám bệnh
  paymentMethod: string; // 'bank_transfer' | 'cash'
}

interface MedicalRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  appointmentData?: Appointment; // Pre-fill data from appointment
  patientData?: PatientSearchResult; // Pre-fill data from patient search
  onMedicalRecordCreated?: (medicalRecordId?: number) => void; // Optional callback when medical record is created
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ onSuccess, onCancel, appointmentData, patientData, onMedicalRecordCreated }) => {
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
    symptoms: '',
    selectedPatientId: undefined,
    examinationFee: 0,
    paymentMethod: 'cash' // Default to cash payment
  });

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [showLinkedPatients, setShowLinkedPatients] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false); // Track payment completion

  // Ant Design notification hook
  const { showSuccess, showError } = useAntdNotification();

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<{
    invoiceId: number;
    qrCode: string;
  } | null>(null);


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
    if (appointmentData && !patientData) { // Only use appointmentData if no patientData
      console.log('🎯 useEffect triggered - Auto-filling form with appointment data:', appointmentData);

      // Reset payment completed state when new appointment is loaded
      setPaymentCompleted(false);
      console.log('💸 Payment completed state reset to false');

      // No need to clear error/success messages as they are now toast notifications

      // Check if we have patientId to get detailed patient information
      if (appointmentData.patientId) {
        console.log('👤 Loading patient detail for ID:', appointmentData.patientId);
        loadPatientDetail(appointmentData.patientId);
      } else {
        // Use appointment data directly if no patientId
        console.log('📝 Using appointment data directly (no patientId)');
        fillFormWithAppointmentData(appointmentData);
      }

      // Load linked patients if we have a phone number
      if (appointmentData.phone) {
        console.log('🔗 Loading linked patients for phone:', appointmentData.phone);
        loadLinkedPatients(appointmentData.phone);
      }
    } else if (appointmentData && patientData) {
      console.log('⚠️ Both appointmentData and patientData present, prioritizing patientData');
    }
  }, [appointmentData, patientData]); // Add patientData as dependency

  // Recalculate examination fee when doctor/health plan data becomes available
  useEffect(() => {
    if (formData.examinationType && formData.serviceDoctor) {
      const newFee = calculateExaminationFee(formData.examinationType, formData.serviceDoctor);
      if (newFee > 0 && newFee !== formData.examinationFee) {
        console.log('Recalculating examination fee after data load:', {
          examinationType: formData.examinationType,
          serviceDoctor: formData.serviceDoctor,
          oldFee: formData.examinationFee,
          newFee: newFee,
          doctorsCount: doctors.length,
          healthPlansCount: healthPlans.length
        });
        setFormData(prev => ({
          ...prev,
          examinationFee: newFee
        }));
      }
    }
  }, [doctors, healthPlans, formData.examinationType, formData.serviceDoctor]);

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

        const fee = calculateExaminationFee(examinationType, serviceDoctor);

        setFormData(prev => ({
          ...prev,
          selectedPatientId: patientId, // Set the patient ID for API call
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
          symptoms: appointmentData.symptoms || '', // Fill symptoms from appointment
          examinationFee: fee
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
    console.log('🔄 fillFormWithAppointmentData called with:', appointmentData);

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

    const fee = calculateExaminationFee(examinationType, serviceDoctor);

    setFormData(prev => ({
      ...prev,
      selectedPatientId: appointmentData.patientId || prev.selectedPatientId, // Set patient ID if available
      fullName: appointmentData.fullName || '',
      phoneNumber: appointmentData.phone || '',
      email: appointmentData.email || '',
      dateOfBirth: appointmentData.birth || '',
      gender: appointmentData.gender || '',
      address: appointmentData.address || '',
      examinationType: examinationType,
      serviceDoctor: serviceDoctor,
      symptoms: appointmentData.symptoms || '', // Fill symptoms from appointment
      // Keep existing values for new fields if any
      bloodType: prev.bloodType,
      weight: prev.weight,
      height: prev.height,
      citizenId: prev.citizenId,
      examinationFee: fee
    }));
  };

  // Pre-fill form with patient search data
  useEffect(() => {
    if (patientData) {
      console.log('📝 Auto-filling form with patient search data:', patientData);

      // Reset payment completed state when new patient is loaded
      setPaymentCompleted(false);
      console.log('💸 Payment completed state reset to false');

      // No need to clear error/success messages as they are now toast notifications

      // IMPORTANT: Clear form first to avoid mixing old data
      setFormData({
        fullName: patientData.fullName || '',
        phoneNumber: patientData.phone || '',
        email: '', // PatientSearchResult doesn't have email
        dateOfBirth: patientData.birth || '',
        gender: patientData.gender === 'NAM' ? 'Nam' : patientData.gender === 'NU' ? 'Nữ' : 'Khác',
        address: patientData.address || '',
        citizenId: patientData.cccd || '',
        bloodType: patientData.bloodType || '',
        weight: patientData.weight?.toString() || '',
        height: patientData.height?.toString() || '',
        examinationType: '',
        serviceDoctor: '',
        symptoms: '',
        selectedPatientId: patientData.id,
        examinationFee: 0,
        paymentMethod: 'cash'
      });

      console.log('✅ Form filled with patient data:', {
        patientId: patientData.id,
        fullName: patientData.fullName,
        phone: patientData.phone,
        bloodType: patientData.bloodType || 'Không có',
        weight: patientData.weight ? `${patientData.weight} kg` : 'Chưa nhập',
        height: patientData.height ? `${patientData.height} cm` : 'Chưa nhập'
      });

      // Don't load linked patients for direct patient selection
      setLinkedPatients([]);
      setShowLinkedPatients(false);
    } else {
      console.log('⚠️ No patientData available');
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

  // Function to calculate examination fee based on selection
  const calculateExaminationFee = (examinationType: string, serviceDoctorId: string): number => {
    if (!examinationType || !serviceDoctorId) {
      return 0;
    }

    try {
      if (examinationType === 'package') {
        // Health plan examination
        const healthPlan = healthPlans.find(plan => plan.id.toString() === serviceDoctorId);
        const fee = healthPlan?.price || 0;
        console.log('Calculated health plan fee:', { healthPlanId: serviceDoctorId, fee, healthPlan });
        return fee;
      } else if (examinationType === 'doctor' || examinationType.startsWith('department-')) {
        // Doctor examination (either from all doctors or department doctors)
        const doctor = doctors.find(doc => doc.id.toString() === serviceDoctorId);
        const fee = doctor?.examinationFee || 0;
        console.log('Calculated doctor fee:', { doctorId: serviceDoctorId, fee, doctor });
        return fee;
      }
    } catch (error) {
      console.error('Error calculating examination fee:', error);
    }

    console.log('No fee calculated for:', { examinationType, serviceDoctorId });
    return 0;
  };

  // Function to format currency in VND
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Function to get current selected service info
  const getCurrentServiceInfo = () => {
    if (!formData.serviceDoctor || !formData.examinationType) {
      return null;
    }

    try {
      if (formData.examinationType === 'package') {
        // Health plan examination
        const healthPlan = healthPlans.find(plan => plan.id.toString() === formData.serviceDoctor);
        if (healthPlan) {
          return {
            name: healthPlan.name,
            price: healthPlan.price,
            roomNumber: healthPlan.roomNumber,
            roomName: healthPlan.roomName
          };
        }
      } else if (formData.examinationType === 'doctor' || formData.examinationType.startsWith('department-')) {
        // Doctor examination (either from all doctors or department doctors)
        const doctor = doctors.find(doc => doc.id.toString() === formData.serviceDoctor);
        if (doctor) {
          return {
            name: doctor.position || doctor.name || 'Khám bác sĩ',
            price: doctor.examinationFee || 0,
            roomNumber: doctor.roomNumber,
            roomName: doctor.roomName
          };
        }
      }
    } catch (error) {
      console.error('Error getting current service info:', error);
    }

    return null;
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
      showError('Lỗi khi tải dữ liệu', 'Không thể tải dữ liệu khởi tạo. Vui lòng thử lại.');
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
          showError('Chưa tải được danh sách khoa', 'Vui lòng thử lại sau.');
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
      showError('Lỗi khi tải dữ liệu', 'Không thể tải danh sách dịch vụ/bác sĩ');
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
      serviceDoctor: '', // Reset service/doctor selection when manually changed
      examinationFee: 0 // Reset examination fee
    }));
  };

  const handleServiceDoctorChange = async (value: string) => {
    const fee = calculateExaminationFee(formData.examinationType, value);
    setFormData(prev => ({
      ...prev,
      serviceDoctor: value,
      examinationFee: fee
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };

  const handleCreateQRCode = async () => {
    try {
      setLoading(true);
      // No need to clear error as it's now handled by toast

      // Prepare payment request data
      const paymentRequest = {
        medicalRecordId: null, // Chưa có medical record, set null
        healthPlanIds: formData.examinationType === 'package' ? [parseInt(formData.serviceDoctor)] : [],
        doctorId: formData.examinationType !== 'package' ? parseInt(formData.serviceDoctor) : null
      };

      console.log('Creating payment link with data:', paymentRequest);

      // Call API to create payment link
      const response = await paymentService.createPaymentLink(paymentRequest);

      if (response && response.data) {
        console.log('Payment link created successfully:', response.data);

        // Show QR payment modal
        setPaymentData({
          invoiceId: response.data.invoiceId,
          qrCode: response.data.qrCode
        });
        setShowPaymentModal(true);
      } else {
        throw new Error(response?.message || 'Không thể tạo liên kết thanh toán');
      }

    } catch (err: any) {
      console.error('Error creating payment link:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tạo mã QR thanh toán';
      showError("Lỗi tạo QR thanh toán", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    // Check if we have a selected patient ID (most important requirement)
    if (!formData.selectedPatientId) {
      showError("Thiếu thông tin bệnh nhân", "Vui lòng chọn bệnh nhân hoặc tạo bệnh nhân mới trước khi thanh toán");
      return;
    }

    // Check if examination type and service/doctor are selected
    if (!formData.examinationType || !formData.serviceDoctor) {
      showError("Thiếu thông tin khám", "Vui lòng chọn loại khám và dịch vụ/bác sĩ");
      return;
    }

    // Check if examination fee is calculated
    if (formData.examinationFee <= 0) {
      showError("Lỗi phí khám", "Không thể xác định phí khám. Vui lòng chọn lại dịch vụ");
      return;
    }

    console.log('All form data for payment:', formData);

    setLoading(true);
    // No need to clear error/success as they are now toast notifications

    try {
      // Prepare request data for medical record creation with cash payment
      const requestData: SimpleMedicalRecordCreateData = {
        patientId: formData.selectedPatientId,
        doctorId: formData.examinationType === 'package' ? null : (formData.serviceDoctor ? parseInt(formData.serviceDoctor) : null),
        healthPlanId: formData.examinationType === 'package' ? (formData.serviceDoctor ? parseInt(formData.serviceDoctor) : null) : null,
        symptoms: formData.symptoms || 'Không có triệu chứng'
        // invoiceId is undefined for cash payment (no invoice needed)
      };

      console.log('Creating medical record with cash payment:', requestData);

      // Call API to create medical record
      const response: SimpleApiResponse = await medicalRecordService.createSimpleMedicalRecord(requestData);

      console.log('Cash payment API Response:', response);

      // Check if API call was successful
      if (response && (response.message === "successfully" || response.message.toLowerCase().includes("success"))) {
        showSuccess("Thanh toán thành công!", "Thanh toán tiền mặt thành công! Phiếu khám đã được tạo.");
        setPaymentCompleted(true);

        // Call medical record created callback if provided (but not onSuccess to avoid unwanted actions)
        onMedicalRecordCreated?.(response.data?.medicalRecordId); // Pass medical record ID if available
      } else {
        console.error('API Error Response:', response);
        showError("Lỗi tạo phiếu khám", response?.message || "Lỗi khi tạo phiếu khám bệnh");
      }
    } catch (err: any) {
      console.error('Error confirming cash payment:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi xác nhận thanh toán tiền mặt';
      showError("Lỗi thanh toán", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Payment modal handlers
  const handlePaymentSuccess = () => {
    showSuccess("Thanh toán thành công!", "Thanh toán thành công! Phiếu khám đã được tạo.");
    setPaymentCompleted(true); // Set payment completed state
    // Chỉ hiển thị thông báo thành công, không làm gì khác
    // Modal vẫn mở để user có thể xem thông báo thành công
  };

  const handlePaymentError = (errorMessage: string) => {
    showError("Lỗi thanh toán", errorMessage);
    setShowPaymentModal(false);
    setPaymentData(null);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setPaymentData(null);

    // Nếu đã thanh toán thành công (payment completed), không làm gì thêm
    // UI sẽ hiển thị trạng thái "Đã thanh toán thành công"
  };

  const handlePrintInvoice = () => {
    // TODO: Implement print invoice functionality
    alert('Chức năng in hóa đơn sẽ được triển khai sau');
  };

  const handleClearForm = () => {
    // Simple confirmation
    if (window.confirm('Bạn có chắc chắn muốn làm mới tất cả thông tin không?')) {
      console.log('🗑️ Clearing form and localStorage...');

      // Reset payment completed state
      setPaymentCompleted(false);

      // Clear all localStorage related to medical record
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedAppointment');
        localStorage.removeItem('selectedPatientForMedicalRecord');
        localStorage.removeItem('medicalRecordActiveTab');
        console.log('✅ Cleared all localStorage data');
      }

      // Clear form data
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
        serviceDoctor: '',
        symptoms: '',
        selectedPatientId: undefined,
        examinationFee: 0,
        paymentMethod: 'cash'
      });

      // Clear linked patients if any
      setLinkedPatients([]);
      setShowLinkedPatients(false);

      // Clear doctors and reset to initial state
      setDoctors([]);

      // Call onCancel to notify parent component and navigate away
      if (onCancel) {
        console.log('📤 Calling onCancel to return to list');
        onCancel();
      }

      console.log('✅ Form cleared successfully');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Medical record creation is now only handled through payment confirmation
    // No direct creation without payment
    showError("Phải thanh toán", "Vui lòng chọn phương thức thanh toán để tạo phiếu khám");
    return;
  };

  // Handle linked patient selection
  const handleLinkedPatientSelect = (patientId: string) => {
    const selectedPatient = linkedPatients.find(p => p.id.toString() === patientId);

    if (selectedPatient) {
      console.log('Auto-filling form with linked patient data:', selectedPatient);

      // Reset payment completed state when new patient is selected
      setPaymentCompleted(false);
      console.log('💸 Payment completed state reset to false');

      // No need to clear error/success messages as they are now toast notifications

      setFormData(prev => ({
        ...prev,
        selectedPatientId: selectedPatient.id,
        fullName: selectedPatient.fullName,
        dateOfBirth: selectedPatient.birth,
        gender: selectedPatient.gender === 'NAM' ? 'Nam' : selectedPatient.gender === 'NU' ? 'Nữ' : 'Khác',
        address: selectedPatient.address,
        citizenId: selectedPatient.cccd, // Map CCCD to citizenId
        // Fill medical information from linked patient data
        bloodType: selectedPatient.bloodType || '',
        weight: selectedPatient.weight?.toString() || '',
        height: selectedPatient.height?.toString() || '',
        symptoms: '', // Clear symptoms as linked patient data doesn't have this
        // Keep existing phoneNumber as it's used for the search
      }));

      console.log('Filled medical info from linked patient:', {
        bloodType: selectedPatient.bloodType || 'Không có',
        weight: selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Chưa nhập',
        height: selectedPatient.height ? `${selectedPatient.height} cm` : 'Chưa nhập'
      });
    } else if (patientId === '') {
      // Reset to appointment data if available, or empty
      // Reset payment completed state when deselecting patient
      setPaymentCompleted(false);
      console.log('💸 Payment completed state reset to false');

      // No need to clear error/success messages as they are now toast notifications

      if (appointmentData) {
        setFormData(prev => ({
          ...prev,
          selectedPatientId: undefined,
          fullName: appointmentData.fullName || '',
          dateOfBirth: appointmentData.birth || '',
          gender: appointmentData.gender || '',
          address: appointmentData.address || '',
          citizenId: '', // Clear CCCD when not selecting a patient
          // Clear medical info when deselecting
          bloodType: '',
          weight: '',
          height: '',
          symptoms: appointmentData.symptoms || '', // Restore symptoms from appointment if available
        }));
      } else {
        // No appointment data - reset to empty form
        setFormData(prev => ({
          ...prev,
          selectedPatientId: undefined,
          fullName: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          citizenId: '',
          bloodType: '',
          weight: '',
          height: '',
          symptoms: '',
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
        ...healthPlans.map(plan => {
          let label = `${plan.name} - ${plan.price?.toLocaleString()}đ`;
          if (plan.roomNumber || plan.roomName) {
            const roomInfo = [plan.roomNumber, plan.roomName].filter(Boolean).join(' - ');
            label += ` (${roomInfo})`;
          }
          return {
            value: plan.id.toString(),
            label
          };
        })
      ];
    } else if (formData.examinationType.startsWith('department-')) {
      // Chuyên khoa cụ thể -> hiển thị bác sĩ trong khoa đó
      console.log('Returning department doctors options:', doctors);
      return [
        { value: '', label: 'Chọn bác sĩ trong khoa' },
        ...doctors.map(doctor => {
          let label = (doctor as any).fullName || (doctor as any).position || doctor.name || `Bác sĩ #${doctor.id}`;
          if (doctor.examinationFee) {
            label += ` - ${doctor.examinationFee.toLocaleString()}đ`;
          }
          if (doctor.roomNumber || doctor.roomName) {
            const roomInfo = [doctor.roomNumber, doctor.roomName].filter(Boolean).join(' - ');
            label += ` (${roomInfo})`;
          }
          return {
            value: doctor.id.toString(),
            label
          };
        })
      ];
    } else if (formData.examinationType === 'doctor') {
      // Tất cả bác sĩ -> hiển thị tất cả bác sĩ kèm tên khoa
      console.log('Returning all doctors options:', doctors);
      return [
        { value: '', label: 'Chọn bác sĩ' },
        ...doctors.map(doctor => {
          let label = `${(doctor as any).fullName || (doctor as any).position || doctor.name || `Bác sĩ #${doctor.id}`}${doctor.departmentName ? ` - ${doctor.departmentName}` : ''}`;
          if (doctor.examinationFee) {
            label += ` - ${doctor.examinationFee.toLocaleString()}đ`;
          }
          if (doctor.roomNumber || doctor.roomName) {
            const roomInfo = [doctor.roomNumber, doctor.roomName].filter(Boolean).join(' - ');
            label += ` (${roomInfo})`;
          }
          return {
            value: doctor.id.toString(),
            label
          };
        })
      ];
    }

    return [baseOption];
  };

  return (
    <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
      <Card>
        <Card.Header className="d-flex align-items-center">
          <IconStethoscope size={20} className="me-2" />
          <h5 className="mb-0">Phiếu khám bệnh</h5>
        </Card.Header>
        <Card.Body>
          {/* Error/Success messages are now handled by Toast notifications */}

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
                      readOnly
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
                        readOnly
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
                        readOnly
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
                        readOnly
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Giới tính *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      placeholder="Chọn giới tính"
                      required
                      readOnly
                    />
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
                        readOnly
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
                    readOnly
                  />
                </div>
              </Form.Group>

              {/* Additional medical info */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nhóm máu</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.bloodType}
                      onChange={(e) => handleInputChange('bloodType', e.target.value)}
                      placeholder="Chọn nhóm máu"
                      readOnly
                    />
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
                      readOnly
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
                      readOnly
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



              {/* Symptoms field */}
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Triệu chứng</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange('symptoms', e.target.value)}
                      placeholder="Mô tả triệu chứng và lý do khám bệnh..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Payment Method Selection */}
              {formData.serviceDoctor && formData.examinationFee > 0 && (
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Phương thức thanh toán *</Form.Label>
                      <div className="d-flex gap-4 mt-2">
                        <Form.Check
                          type="radio"
                          name="paymentMethod"
                          id="cash"
                          label="Tiền mặt"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        />
                        <Form.Check
                          type="radio"
                          name="paymentMethod"
                          id="bank_transfer"
                          label="Chuyển khoản"
                          value="bank_transfer"
                          checked={formData.paymentMethod === 'bank_transfer'}
                          onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </div>
            {/* Examination Fee Display */}
            {formData.serviceDoctor && formData.examinationFee > 0 && (() => {
              const serviceInfo = getCurrentServiceInfo();
              return serviceInfo ? (
                <Row className="mb-3">
                  <Col md={12}>
                    <ServiceCostDisplay service={serviceInfo} />
                  </Col>
                </Row>
              ) : null;
            })()}

            {/* Action Buttons */}
            {!paymentCompleted ? (
              // Payment buttons when payment not completed
              <div className="d-flex gap-2 pt-3 border-top">
                {/* Show payment buttons only if service is selected and has fee */}
                {formData.serviceDoctor && formData.examinationFee > 0 && (
                  <>
                    {formData.paymentMethod === 'bank_transfer' ? (
                      <Button
                        type="button"
                        variant="success"
                        onClick={handleCreateQRCode}
                        disabled={loading}
                        className="d-flex align-items-center"
                      >
                        {loading ? (
                          <>
                            <LoadingOutlined className="me-2" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-qr-code me-2"></i>
                            Tạo mã QR thanh toán
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="warning"
                        onClick={handleConfirmPayment}
                        disabled={loading}
                        className="d-flex align-items-center"
                      >
                        {loading ? (
                          <>
                            <LoadingOutlined className="me-2" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cash-coin me-2"></i>
                            Xác nhận thanh toán tiền mặt
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

                <Button
                  type="button"
                  variant="outline-warning"
                  onClick={handleClearForm}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <IconTrash size={16} className="me-2" />
                  Làm mới
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>
              </div>
            ) : (
              // Payment completed view
              <div className="pt-3 border-top">
                {/* Success message */}
                <div className="alert alert-success d-flex align-items-center mb-3">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <strong>Đã thanh toán thành công! Phiếu khám đã được tạo.</strong>
                </div>

                {/* Show Print Invoice and Refresh buttons */}
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePrintInvoice}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-printer me-2"></i>
                    In hóa đơn
                  </Button>

                  <Button
                    type="button"
                    variant="outline-warning"
                    onClick={handleClearForm}
                    className="d-flex align-items-center"
                  >
                    <IconTrash size={16} className="me-2" />
                    Làm mới
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* QR Payment Modal */}
      {paymentData && (
        <QRPaymentModal
          show={showPaymentModal}
          onHide={handlePaymentModalClose}
          qrCodeData={paymentData.qrCode}
          invoiceId={paymentData.invoiceId}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          medicalRecordData={{
            patientId: formData.selectedPatientId || 0,
            doctorId: formData.examinationType !== 'package' ? parseInt(formData.serviceDoctor) : undefined,
            healthPlanId: formData.examinationType === 'package' ? parseInt(formData.serviceDoctor) : undefined,
            symptoms: formData.symptoms
          }}
        />
      )}
    </Spin>
  );
};

export default MedicalRecordForm;