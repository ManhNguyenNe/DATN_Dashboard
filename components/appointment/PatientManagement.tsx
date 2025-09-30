"use client";

//import node module libraries
import { useState } from "react";
import { Alert } from "react-bootstrap";

//import custom components
import PatientSearch from "./PatientSearch";
import PatientList from "./PatientList";
import { useAntdNotification } from "components/common/AntdNotificationProvider";
import AddPatientForm from "./AddPatientForm";

//import services
import { patientService, type PatientSearchResult, type PatientUpdateData } from "../../services";

interface PatientManagementProps {
    onFillToMedicalRecord?: (patient: PatientSearchResult) => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({
    onFillToMedicalRecord
}) => {
    const { showSuccess } = useAntdNotification();
    const [patients, setPatients] = useState<PatientSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
    const [showAddPatientForm, setShowAddPatientForm] = useState<boolean>(false);
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [currentKeyword, setCurrentKeyword] = useState<string>("");
    const [displayKeyword, setDisplayKeyword] = useState<string>(""); // Keyword real-time cho display

    // Handle patient search
    const handleSearch = async (keyword: string) => {
        setCurrentKeyword(keyword);

        if (!keyword.trim()) {
            setPatients([]);
            setSearchPerformed(false);
            return;
        }

        setSearchLoading(true);
        setError(null);
        setSearchPerformed(true);

        try {
            const response = await patientService.searchPatients(keyword);
            setPatients(response.data || []);

            if (response.data.length === 0) {
                console.log('No patients found for keyword:', keyword);
            }
        } catch (err: any) {
            console.error('Error searching patients:', err);
            setError(err.message || "Lỗi khi tìm kiếm bệnh nhân");
            setPatients([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Handle patient edit
    const handleEditPatient = async (patient: PatientSearchResult) => {
        try {
            setLoading(true);
            setError(null);

            // Prepare data for update API
            const updateData: PatientUpdateData = {
                id: patient.id,
                phone: patient.phone,
                email: null, // PatientSearchResult doesn't have email field, so set to null
                fullName: patient.fullName,
                address: patient.address,
                cccd: patient.cccd,
                birth: patient.birth,
                gender: patient.gender,
                bloodType: patient.bloodType,
                weight: patient.weight,
                height: patient.height,
                profileImage: patient.profileImage
            };

            // Call API to update patient
            const response = await patientService.updatePatient(updateData);
            console.log('Patient updated successfully:', response);

            // Update local state with the response data
            const updatedPatient: PatientSearchResult = {
                id: response.data.id,
                code: response.data.code,
                bloodType: response.data.bloodType || patient.bloodType,
                weight: response.data.weight || patient.weight,
                height: response.data.height || patient.height,
                registrationDate: response.data.registrationDate,
                phone: response.data.phone,
                fullName: response.data.fullName,
                address: response.data.address,
                cccd: String(response.data.cccd),
                birth: response.data.birth,
                gender: response.data.gender,
                profileImage: patient.profileImage, // Keep original profileImage as it's not in response
                relationship: patient.relationship // Keep original relationship as it's not in response
            };

            setPatients(prev => prev.map(p => p.id === patient.id ? updatedPatient : p));

            // Show success toast
            handleSuccess("Cập nhật thông tin bệnh nhân thành công!");

        } catch (err: any) {
            console.error('Error updating patient:', err);
            setError(err.message || "Lỗi khi cập nhật thông tin bệnh nhân");
        } finally {
            setLoading(false);
        }
    };

    // Handle fill to medical record
    const handleFillToMedicalRecord = (patient: PatientSearchResult) => {
        if (onFillToMedicalRecord) {
            onFillToMedicalRecord(patient);
        }
    };

    // Handle show add patient form
    const handleShowAddPatientForm = () => {
        setShowAddPatientForm(true);
    };

    // Handle hide add patient form
    const handleHideAddPatientForm = () => {
        setShowAddPatientForm(false);
    };

    // Handle patient added successfully
    const handlePatientAdded = (newPatient: any) => {
        console.log('New patient added:', newPatient);
        // Optionally refresh the search or add to current list
        setError(null);
        // You might want to refresh the search here or show a success message
    };

    // Handle form loading state change
    const handleFormLoadingChange = (loading: boolean) => {
        setFormLoading(loading);
    };

    // Handle success message from form
    const handleSuccess = (message: string) => {
        showSuccess('Thành công!', message);
    };

    return (
        <div>
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <PatientSearch
                onSearch={handleSearch}
                onKeywordChange={setDisplayKeyword}
                onAddPatient={handleShowAddPatientForm}
                loading={false}
            />

            <PatientList
                patients={patients}
                loading={searchLoading}
                currentKeyword={displayKeyword}
                onEdit={handleEditPatient}
                onFillToMedicalRecord={handleFillToMedicalRecord}
            />

            <AddPatientForm
                show={showAddPatientForm}
                onHide={handleHideAddPatientForm}
                onPatientAdded={handlePatientAdded}
                onLoadingChange={handleFormLoadingChange}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default PatientManagement;