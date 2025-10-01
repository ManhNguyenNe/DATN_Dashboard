"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Row, Col, Card, Tab, Tabs, Alert } from "react-bootstrap";

//import custom components
import AppointmentList from "./AppointmentList";
import AppointmentSearch from "./AppointmentSearch";
import MedicalRecordForm from "./MedicalRecordForm";

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
  const [internalActiveTab, setInternalActiveTab] = useState<string>("list");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    if ((selectedAppointment || selectedPatient) && !externalActiveTab) {
      console.log('🔄 Auto-navigating to medical-record tab', {
        hasAppointment: !!selectedAppointment,
        hasPatient: !!selectedPatient
      });
      setInternalActiveTab("medical-record");
    }
  }, [selectedAppointment, selectedPatient, externalActiveTab]);

  // Debug log when selectedPatient changes
  useEffect(() => {
    console.log('🔍 selectedPatient state changed:', selectedPatient);
  }, [selectedPatient]);

  // Load appointments with filters
  const handleSearch = async (filters: AppointmentFilter) => {
    setSearchLoading(true);
    setError(null);

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
      setError(err.message || "Lỗi khi tải danh sách lịch khám");
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
    setError(null);

    try {
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
        console.log('Switching to medical record form with appointment:', updatedAppointment);
        setSelectedAppointment(updatedAppointment);
        setActiveTab("medical-record");
      }

      // Show success message (you can add toast here)
      console.log("Appointment status updated successfully, status:", status);
    } catch (err: any) {
      setError(err.message || "Lỗi khi cập nhật trạng thái lịch khám");
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

  // Handle medical record created successfully
  const handleMedicalRecordCreated = async () => {
    setSelectedAppointment(null); // Clear selected appointment
    setSelectedPatient(null); // Clear selected patient
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedAppointment');
      localStorage.removeItem('selectedPatientForMedicalRecord');
      localStorage.removeItem('medicalRecordActiveTab');
    }
    setActiveTab("list");
    // Optionally refresh data or show success message
  };

  // Handle medical record cancelled
  const handleMedicalRecordCancelled = () => {
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
    setSelectedPatient(patient);
    setSelectedAppointment(null); // Clear any appointment data
    setActiveTab("medical-record");
  };

  // Handle fill appointment to medical record
  const handleFillAppointmentToMedicalRecord = (appointment: Appointment) => {
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
                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

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