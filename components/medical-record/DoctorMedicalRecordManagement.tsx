"use client";

//import node module libraries
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Alert } from "react-bootstrap";

//import custom components
import MedicalRecordSearch from "./MedicalRecordSearch";
import MedicalRecordDetail from "./MedicalRecordDetail";
import DoctorMedicalRecordList from "./DoctorMedicalRecordList";

//import services
import {
    medicalRecordService,
    type MedicalRecordListItem,
    type MedicalRecordFilter
} from "../../services";

const DoctorMedicalRecordManagement: React.FC = () => {
    const router = useRouter();
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecordListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentFilters, setCurrentFilters] = useState<MedicalRecordFilter>({});

    // State for detail view
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    // Load medical records with filters
    const handleSearch = async (filters: MedicalRecordFilter) => {
        // Prevent multiple simultaneous requests
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await medicalRecordService.getMedicalRecords(filters);

            let recordsData: MedicalRecordListItem[] = [];

            // Handle different response structures
            if (response.data && Array.isArray(response.data)) {
                recordsData = response.data;
            } else if (response && Array.isArray(response)) {
                recordsData = response as MedicalRecordListItem[];
            } else {
                recordsData = [];
            }

            setMedicalRecords(recordsData);
            setCurrentFilters(filters);
        } catch (err) {
            console.error('Error loading medical records:', err);
            setError('Có lỗi xảy ra khi tải danh sách phiếu khám. Vui lòng thử lại.');
            setMedicalRecords([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle viewing record detail
    const handleViewDetail = (medicalRecordId: string) => {
        setSelectedRecordId(medicalRecordId);
        setViewMode('detail');
    };

    // Handle starting examination
    const handleStartExamination = (medicalRecordId: string) => {
        // Redirect to examination page
        router.push(`/bac-si/kham-benh/${medicalRecordId}`);
    };

    // Handle back to list
    const handleBackToList = () => {
        setViewMode('list');
        setSelectedRecordId(null);
    };

    return (
        <Row>
            <Col>
                <h1>
                    {viewMode === 'list' ? 'Danh sách phiếu khám' : 'Chi tiết phiếu khám'}
                </h1>
                <div className="pt-4">
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {viewMode === 'list' ? (
                        <>
                            <MedicalRecordSearch
                                onSearch={handleSearch}
                                loading={loading}
                            />

                            <DoctorMedicalRecordList
                                medicalRecords={medicalRecords}
                                loading={loading}
                                onRefresh={() => handleSearch(currentFilters)}
                                onViewDetail={handleViewDetail}
                                onStartExamination={handleStartExamination}
                            />
                        </>
                    ) : (
                        selectedRecordId && (
                            <MedicalRecordDetail
                                medicalRecordId={selectedRecordId}
                                onBack={handleBackToList}
                            />
                        )
                    )}
                </div>
            </Col>
        </Row>
    );
};

export default DoctorMedicalRecordManagement;