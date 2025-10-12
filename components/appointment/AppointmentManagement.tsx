"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Row, Col, Card, Tab, Tabs } from "react-bootstrap";

//import custom components
import AppointmentList from "./AppointmentList";
import AppointmentSearch from "./AppointmentSearch";
import MedicalRecordForm from "./MedicalRecordForm";
import { useMessage } from "../common/MessageProvider";

//import services
import { appointmentService, AppointmentStatus, type Appointment, type AppointmentFilter, type PatientSearchResult } from "../../services";

interface AppointmentManagementProps {
  onSearch?: (filters: AppointmentFilter) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  onSearch,
  activeTab: externalActiveTab,
  onTabChange
}) => {
  const message = useMessage();
  const [internalActiveTab, setInternalActiveTab] = useState<string>("list");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<AppointmentFilter>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(() => {
    // Restore from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedAppointment');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(() => {
    // Restore from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedPatientForMedicalRecord');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('📋 Restored patient data from localStorage:', parsedData);
        return parsedData;
      }
    }
    return null;
  });
  const [updatingAppointments, setUpdatingAppointments] = useState<Set<number>>(new Set());

  // Use external or internal active tab
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // Auto-navigate to medical-record tab if we have a selected appointment or patient from localStorage
  useEffect(() => {
    // Chỉ auto-navigate nếu không có external active tab được set
    if ((selectedAppointment || selectedPatient) && !externalActiveTab) {
      console.log('🔄 Auto-navigating to medical-record tab', {
        hasAppointment: !!selectedAppointment,
        hasPatient: !!selectedPatient,
        currentActiveTab: activeTab
      });

      // Delay để đảm bảo component đã render xong
      setTimeout(() => {
        setInternalActiveTab("medical-record");
      }, 100);
    }
  }, [selectedAppointment, selectedPatient, externalActiveTab]);

  // Debug log when selectedPatient changes
  useEffect(() => {
    console.log('🔍 selectedPatient state changed:', selectedPatient);
  }, [selectedPatient]);

  // Debug log when activeTab changes
  useEffect(() => {
    console.log('📑 activeTab changed:', {
      activeTab,
      externalActiveTab,
      internalActiveTab,
      hasSelectedPatient: !!selectedPatient,
      hasSelectedAppointment: !!selectedAppointment
    });
  }, [activeTab, externalActiveTab, internalActiveTab, selectedPatient, selectedAppointment]);

  // Load appointments with filters
  const handleSearch = async (filters: AppointmentFilter) => {
    setSearchLoading(true);

    try {
      const response = await appointmentService.getAppointments(filters);
      console.log('API Response:', response); // Debug log

      let appointmentsData: Appointment[] = [];

      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response && Array.isArray(response)) {
        appointmentsData = response as Appointment[];
      } else if (response.data && (response.data as any).appointments && Array.isArray((response.data as any).appointments)) {
        appointmentsData = (response.data as any).appointments;
      } else {
        console.warn('Unexpected response structure:', response);
        appointmentsData = [];
      }

      console.log('Processed appointments:', appointmentsData); // Debug log
      setAppointments(appointmentsData);
      setCurrentFilters(filters);
      onSearch?.(filters);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      message.error(err.message || "Lỗi khi tải danh sách lịch khám");
      setAppointments([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load appointments by phone (backward compatibility)
  const handleSearchByPhone = async (phone: string) => {
    if (!phone.trim()) {
      setAppointments([]);
      setCurrentFilters({});
      onSearch?.({});
      return;
    }

    await handleSearch({ phone: phone.trim() });
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = async (appointmentId: number, status: AppointmentStatus) => {
    // Chỉ set loading cho appointment cụ thể
    setUpdatingAppointments(prev => new Set(prev).add(appointmentId));

    try {
      // Hiển thị loading message
      message.loading(`Đang cập nhật trạng thái lịch khám...`);

      await appointmentService.confirmAppointment(appointmentId, status);

      // Tìm appointment hiện tại trước khi cập nhật
      const currentAppointment = appointments.find(apt => apt.id === appointmentId);

      // Tạo appointment với trạng thái mới
      const updatedAppointment = currentAppointment ? { ...currentAppointment, status: status as string } : null;

      // Cập nhật chỉ bản ghi được thay đổi trong state local (không reload toàn bộ danh sách)
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: status as string }
            : apt
        )
      );

      // Chỉ chuyển sang medical record form khi trạng thái là DA_DEN (đã đến)
      if (status === AppointmentStatus.DA_DEN && updatedAppointment) {
        setSelectedAppointment(updatedAppointment);
        setActiveTab("medical-record");
        message.success("Đã cập nhật trạng thái và chuyển sang phiếu khám bệnh");
      } else {
        // Hiển thị message thành công với thông tin cụ thể
        const statusMessage = getStatusMessage(status);
        message.success(`Đã cập nhật trạng thái thành: ${statusMessage}`);
      }
    } catch (err: any) {
      message.error(err.message || "Lỗi khi cập nhật trạng thái lịch khám");
      // Chỉ khi có lỗi mới reload để đảm bảo data đúng
      await handleSearch(currentFilters);
    } finally {
      // Remove từ updating state
      setUpdatingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  // Helper function để lấy text trạng thái
  const getStatusMessage = (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.CHO_XAC_NHAN:
        return "Chờ xác nhận";
      case AppointmentStatus.DA_XAC_NHAN:
        return "Đã xác nhận";
      case AppointmentStatus.DA_DEN:
        return "Đã đến";
      case AppointmentStatus.KHONG_DEN:
        return "Không đến";
      default:
        return "Không xác định";
    }
  };

  // Handle medical record created successfully
  const handleMedicalRecordCreated = async () => {
    message.success("Đã tạo hồ sơ bệnh án thành công!");
    setSelectedAppointment(null); // Clear selected appointment
    setSelectedPatient(null); // Clear selected patient
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedAppointment');
      localStorage.removeItem('selectedPatientForMedicalRecord');
      localStorage.removeItem('medicalRecordActiveTab');
    }
    setActiveTab("list");
    // Refresh appointments để cập nhật trạng thái mới nhất
    await handleSearch(currentFilters);
  };

  // Handle medical record cancelled
  const handleMedicalRecordCancelled = () => {
    message.info("Đã hủy tạo hồ sơ bệnh án");
    setSelectedAppointment(null); // Clear selected appointment
    setSelectedPatient(null); // Clear selected patient
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedAppointment');
      localStorage.removeItem('selectedPatientForMedicalRecord');
      localStorage.removeItem('medicalRecordActiveTab');
    }
    setActiveTab("list");
  };

  // Handle fill patient to medical record
  const handleFillPatientToMedicalRecord = (patient: PatientSearchResult) => {
    message.info("Đã chọn bệnh nhân để tạo hồ sơ khám bệnh");
    setSelectedPatient(patient);
    setSelectedAppointment(null); // Clear any appointment data
    setActiveTab("medical-record");
  };

  // Handle fill appointment to medical record
  const handleFillAppointmentToMedicalRecord = (appointment: Appointment) => {
    message.info("Đã chọn lịch khám để tạo hồ sơ khám bệnh");
    setSelectedAppointment(appointment);
    // Save to localStorage for persistence across page refreshes
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    }
    setSelectedPatient(null); // Clear any patient data
    setActiveTab("medical-record");
  };

  return (
    <Row>
      <Col xl={12} lg={12} md={12} sm={12}>
        <Card>
          <Card.Header className="border-bottom-0 pb-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "list")}
              className="mb-0"
            >
              <Tab eventKey="list" title="Danh sách lịch khám">
                <div className="pt-4">
                  <AppointmentSearch
                    onSearch={handleSearch}
                    loading={false}
                  />

                  <AppointmentList
                    appointments={appointments}
                    loading={searchLoading}
                    updatingAppointments={updatingAppointments}
                    onConfirm={handleConfirmAppointment}
                    onRefresh={() => handleSearch(currentFilters)}
                    onFillMedicalRecord={handleFillAppointmentToMedicalRecord}
                  />
                </div>
              </Tab>

              <Tab eventKey="medical-record" title="Phiếu khám bệnh">
                <div className="pt-4">
                  <MedicalRecordForm
                    appointmentData={selectedAppointment || undefined}
                    patientData={selectedPatient || undefined}
                    onSuccess={handleMedicalRecordCreated}
                    onCancel={handleMedicalRecordCancelled}
                  />
                </div>
              </Tab>
            </Tabs>
          </Card.Header>
        </Card>
      </Col>
    </Row>
  );
};

export default AppointmentManagement;