"use client";

//import node module libraries
import { useState } from "react";
import { Row, Col, Alert } from "react-bootstrap";

//import custom components
import MedicalRecordList from "./MedicalRecordList";
import MedicalRecordSearch from "./MedicalRecordSearch";
import MedicalRecordDetail from "./MedicalRecordDetail";

//import services
import {
    medicalRecordService,
    type MedicalRecordListItem,
    type MedicalRecordFilter
} from "../../services";

const MedicalRecordManagement: React.FC = () => {
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
        } catch (err: any) {
            console.error('Error fetching medical records:', err);
            setError(err.message || "Lỗi khi tải danh sách phiếu khám");
            setMedicalRecords([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle view detail
    const handleViewDetail = (medicalRecordId: string) => {
        setSelectedRecordId(medicalRecordId);
        setViewMode('detail');
    };

    // Handle back to list
    const handleBackToList = () => {
        setViewMode('list');
        setSelectedRecordId(null);
        // Refresh list to get updated data
        handleSearch(currentFilters);
    };

    return (
        <Row>
            <Col xl={12} lg={12} md={12} sm={12}>
                <h1 className="mb-1 h2 fw-bold">
                    {viewMode === 'list' ? 'Quản lý phiếu khám' : 'Chi tiết phiếu khám'}
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

                            <MedicalRecordList
                                medicalRecords={medicalRecords}
                                loading={loading}
                                onRefresh={() => handleSearch(currentFilters)}
                                onViewDetail={handleViewDetail}
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

export default MedicalRecordManagement;