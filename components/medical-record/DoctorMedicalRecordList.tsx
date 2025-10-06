"use client";

//import node module libraries
import { useState } from "react";
import { Table, Badge, Button, Card, Alert } from "react-bootstrap";
import { IconRefresh, IconChevronDown, IconChevronUp, IconHistory } from "@tabler/icons-react";

//import services  
import { type MedicalRecordListItem, MedicalRecordStatus } from "../../services";

//import components
import MedicalRecordHistory from "./MedicalRecordHistory";

interface DoctorMedicalRecordListProps {
    medicalRecords: MedicalRecordListItem[];
    loading?: boolean;
    onRefresh?: () => void;
    onViewDetail?: (medicalRecordId: string) => void;
    onStartExamination?: (medicalRecordId: string) => void;
}

const DoctorMedicalRecordList: React.FC<DoctorMedicalRecordListProps> = ({
    medicalRecords,
    loading = false,
    onRefresh,
    onViewDetail,
    onStartExamination
}) => {
    const [showAll, setShowAll] = useState<boolean>(false);
    const INITIAL_DISPLAY_COUNT = 10;

    // Medical Record History state
    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [selectedPatientName, setSelectedPatientName] = useState<string>("");

    // Determine which medical records to display
    const displayedMedicalRecords = showAll
        ? medicalRecords
        : medicalRecords.slice(0, INITIAL_DISPLAY_COUNT);

    const hasMoreRecords = medicalRecords.length > INITIAL_DISPLAY_COUNT;

    const getStatusBadge = (status: MedicalRecordStatus | string | undefined) => {
        const statusStr = status as string;
        switch (statusStr) {
            case MedicalRecordStatus.DANG_KHAM:
            case 'DANG_KHAM':
                return <Badge bg="warning">Đang khám</Badge>;
            case MedicalRecordStatus.CHO_XET_NGHIEM:
            case 'CHO_XET_NGHIEM':
                return <Badge bg="info">Chờ xét nghiệm</Badge>;
            case MedicalRecordStatus.HOAN_THANH:
            case 'HOAN_THANH':
                return <Badge bg="success">Hoàn thành</Badge>;
            case MedicalRecordStatus.HUY:
            case 'HUY':
                return <Badge bg="danger">Hủy</Badge>;
            default:
                return <Badge bg="secondary">Chờ khám</Badge>;
        }
    };

    const formatDateTime = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const handleViewHistory = (patientId: number, patientName: string) => {
        setSelectedPatientId(patientId);
        setSelectedPatientName(patientName);
        setShowHistoryModal(true);
    };

    const canStartExamination = (status: MedicalRecordStatus | string | undefined) => {
        const statusStr = status as string;
        return statusStr === MedicalRecordStatus.DANG_KHAM || statusStr === MedicalRecordStatus.CHO_XET_NGHIEM || statusStr === 'CHO_KHAM' || !statusStr;
    };

    const isCompleted = (status: MedicalRecordStatus | string | undefined) => {
        const statusStr = status as string;
        return statusStr === MedicalRecordStatus.HOAN_THANH;
    };

    const getButtonText = (status: MedicalRecordStatus | string | undefined) => {
        const statusStr = status as string;
        if (statusStr === MedicalRecordStatus.CHO_XET_NGHIEM) {
            return "Khám bệnh";
        }
        return "Bắt đầu khám";
    };

    if (loading) {
        return (
            <Card>
                <Card.Body className="text-center py-4">
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        <span>Đang tải danh sách phiếu khám...</span>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    if (!medicalRecords || medicalRecords.length === 0) {
        return (
            <Card>
                <Card.Body className="text-center py-4">
                    <Alert variant="info" className="mb-0">
                        Không tìm thấy phiếu khám nào. Hãy thử điều chỉnh bộ lọc tìm kiếm.
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        Danh sách phiếu khám ({medicalRecords.length})
                    </h5>
                    <Button variant="outline-primary" size="sm" onClick={onRefresh}>
                        <IconRefresh size={16} className="me-1" />
                        Tải lại
                    </Button>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive striped className="mb-0">
                        <thead>
                            <tr>
                                <th>Mã phiếu</th>
                                <th>Bệnh nhân</th>
                                <th>Ngày tạo</th>
                                <th>Bác sĩ</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedMedicalRecords.map((record, index) => (
                                <tr key={record.id || index}>
                                    <td className="fw-semibold text-primary">{record.id}</td>
                                    <td>
                                        <div>
                                            <div className="fw-semibold">{record.patientName}</div>
                                            <small className="text-muted">Mã: {record.code}</small>
                                        </div>
                                    </td>
                                    <td>{formatDateTime(record.date)}</td>
                                    <td>
                                        <span className="text-muted">
                                            Bác sĩ khám
                                        </span>
                                    </td>
                                    <td>{getStatusBadge(record.status)}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {canStartExamination(record.status) && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => onStartExamination?.(record.id)}
                                                    className="d-flex align-items-center"
                                                >
                                                    <i className="bi bi-stethoscope me-1"></i>
                                                    {getButtonText(record.status)}
                                                </Button>
                                            )}
                                            {isCompleted(record.status) && (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => onViewDetail?.(record.id)}
                                                    className="d-flex align-items-center"
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Xem kết quả
                                                </Button>
                                            )}
                                            {!canStartExamination(record.status) && !isCompleted(record.status) && (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => onViewDetail?.(record.id)}
                                                    className="d-flex align-items-center"
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Xem chi tiết
                                                </Button>
                                            )}
                                            {record.patientId && (
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewHistory(record.patientId!, record.patientName)}
                                                    title="Xem lịch sử khám bệnh"
                                                >
                                                    <IconHistory size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Show More/Less Button */}
                    {hasMoreRecords && (
                        <div className="text-center py-3 border-top">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setShowAll(!showAll)}
                                className="d-flex align-items-center mx-auto"
                            >
                                {showAll ? (
                                    <>
                                        <IconChevronUp size={16} className="me-1" />
                                        Ẩn bớt
                                    </>
                                ) : (
                                    <>
                                        <IconChevronDown size={16} className="me-1" />
                                        Xem thêm ({medicalRecords.length - INITIAL_DISPLAY_COUNT} phiếu khám)
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Medical Record History Modal */}
            {selectedPatientId && (
                <MedicalRecordHistory
                    show={showHistoryModal}
                    onHide={() => setShowHistoryModal(false)}
                    patientId={selectedPatientId}
                    patientName={selectedPatientName}
                    onViewDetail={(recordId) => {
                        // Điều hướng đến trang chi tiết của phiếu khám được chọn
                        onViewDetail?.(recordId);
                        setShowHistoryModal(false);
                    }}
                />
            )}
        </>
    );
};

export default DoctorMedicalRecordList;