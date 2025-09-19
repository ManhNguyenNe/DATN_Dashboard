"use client";

//import node module libraries
import { useState } from "react";
import { Alert } from "react-bootstrap";

//import custom components
import PatientSearch from "./PatientSearch";
import PatientList from "./PatientList";

//import services
import { patientService, type PatientSearchResult } from "../../services";

interface PatientManagementProps {
    onFillToMedicalRecord?: (patient: PatientSearchResult) => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({
    onFillToMedicalRecord
}) => {
    const [patients, setPatients] = useState<PatientSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

    // Handle patient search
    const handleSearch = async (keyword: string) => {
        if (!keyword.trim()) {
            setPatients([]);
            setSearchPerformed(false);
            return;
        }

        setLoading(true);
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
            setLoading(false);
        }
    };

    // Handle patient edit
    const handleEditPatient = async (patient: PatientSearchResult) => {
        try {
            setLoading(true);
            // TODO: Call API to update patient
            console.log('Updating patient:', patient);

            // Update local state
            setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));

            // Show success message (you can add toast here)
            console.log('Patient updated successfully');
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

    return (
        <div>
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <PatientSearch
                onSearch={handleSearch}
                loading={loading}
            />

            {searchPerformed && (
                <PatientList
                    patients={patients}
                    loading={loading}
                    onEdit={handleEditPatient}
                    onFillToMedicalRecord={handleFillToMedicalRecord}
                />
            )}
        </div>
    );
};

export default PatientManagement;