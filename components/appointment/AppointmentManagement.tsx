"use client";

//import node module libraries
import { useState, useEffect } from "react";
import { Row, Col, Card, Tab, Tabs, Alert } from "react-bootstrap";

//import custom components
import AppointmentList from "./AppointmentList";
import AppointmentSearch from "./AppointmentSearch";
import MedicalRecordForm from "./MedicalRecordForm";
import PatientManagement from "./PatientManagement";

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
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<AppointmentFilter>({});
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  // Use external or internal active tab
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = onTabChange || setInternalActiveTab;

  // Load appointments with filters
  const handleSearch = async (filters: AppointmentFilter) => {
    setLoading(true);
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
      setLoading(false);
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
    setLoading(true);
    setError(null);

    try {
      await appointmentService.confirmAppointment(appointmentId, status);

      // Find the confirmed appointment
      const confirmedAppointment = appointments.find(apt => apt.id === appointmentId);

      // If confirmed successfully, switch to medical record form with appointment data
      if (status === AppointmentStatus.DA_XAC_NHAN && confirmedAppointment) {
        setSelectedAppointment(confirmedAppointment);
        setActiveTab("medical-record");
      }

      // Refresh appointments list after confirmation
      if (Object.keys(currentFilters).length > 0) {
        await handleSearch(currentFilters);
      }

      // Show success message (you can add toast here)
      console.log("Appointment confirmed successfully");
    } catch (err: any) {
      setError(err.message || "Lỗi khi xác nhận lịch khám");
    } finally {
      setLoading(false);
    }
  };

  // Handle medical record created successfully
  const handleMedicalRecordCreated = async () => {
    setSelectedAppointment(null); // Clear selected appointment
    setSelectedPatient(null); // Clear selected patient
    setActiveTab("list");
    // Optionally refresh data or show success message
  };

  // Handle medical record cancelled
  const handleMedicalRecordCancelled = () => {
    setSelectedAppointment(null); // Clear selected appointment
    setSelectedPatient(null); // Clear selected patient
    setActiveTab("list");
  };

  // Handle fill patient to medical record
  const handleFillPatientToMedicalRecord = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setSelectedAppointment(null); // Clear any appointment data
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
                    loading={loading}
                  />

                  <AppointmentList
                    appointments={appointments}
                    loading={loading}
                    onConfirm={handleConfirmAppointment}
                    onRefresh={() => Object.keys(currentFilters).length > 0 && handleSearch(currentFilters)}
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

              <Tab eventKey="patients" title="Bệnh nhân">
                <div className="pt-4">
                  <PatientManagement
                    onFillToMedicalRecord={handleFillPatientToMedicalRecord}
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