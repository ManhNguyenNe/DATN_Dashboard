"use client";

//import node module libraries
import { useState } from "react";
import { Table, Badge, Button, Card, Alert } from "react-bootstrap";
import { IconRefresh, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

//import services  
import { type MedicalRecordListItem, MedicalRecordStatus } from "../../services";

interface MedicalRecordListProps {
    medicalRecords: MedicalRecordListItem[];
    loading?: boolean;
    onRefresh?: () => void;
    onViewDetail?: (medicalRecordId: string) => void;
}

const MedicalRecordList: React.FC<MedicalRecordListProps> = ({
    medicalRecords,
    loading = false,
    onRefresh,
    onViewDetail
}) => {
    const [showAll, setShowAll] = useState<boolean>(false);
    const INITIAL_DISPLAY_COUNT = 10;

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
                return <Badge bg="secondary">Không xác định ({statusStr})</Badge>;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString('vi-VN') + ' - ' + date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (medicalRecords.length === 0) {
        return (
            <Card>
                <Card.Body className="text-center py-5">
                    <Alert variant="info">
                        <h5>Chưa có phiếu khám nào</h5>
                        <p className="mb-0">Tìm kiếm theo ngày, mã phiếu khám hoặc tên bệnh nhân để xem danh sách phiếu khám.</p>
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    Danh sách phiếu khám ({medicalRecords.length})
                </h5>
                {onRefresh && (
                    <Button variant="outline-primary" size="sm" onClick={onRefresh}>
                        <IconRefresh size={16} />
                    </Button>
                )}
            </Card.Header>
            <Card.Body className="p-0">
                <Table responsive className="mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Mã phiếu khám</th>
                            <th>Bệnh nhân</th>
                            <th>Ngày khám</th>
                            <th>Triệu chứng</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedMedicalRecords.map((record) => (
                            <tr key={record.id}>
                                <td>
                                    <div className="fw-semibold text-primary">
                                        {record.code}
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-semibold">
                                        {record.patientName || 'Chưa xác định'}
                                    </div>
                                </td>
                                <td>
                                    <small>
                                        {formatDateTime(record.date)}
                                    </small>
                                </td>
                                <td>
                                    <small className="text-muted">
                                        {record.symptoms
                                            ? (record.symptoms.length > 50
                                                ? `${record.symptoms.substring(0, 50)}...`
                                                : record.symptoms)
                                            : 'Không có'
                                        }
                                    </small>
                                </td>
                                <td>{getStatusBadge(record.status)}</td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => onViewDetail?.(record.id)}
                                        className="d-flex align-items-center"
                                    >
                                        <i className="bi bi-eye me-1"></i>
                                        Xem chi tiết
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* Show More/Less Button */}
                {hasMoreRecords && (
                    <div className="text-center py-3 border-top">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowAll(!showAll)}
                            className="d-flex align-items-center mx-auto"
                        >
                            {showAll ? (
                                <>
                                    <IconChevronUp size={16} className="me-1" />
                                    Thu gọn ({medicalRecords.length - INITIAL_DISPLAY_COUNT} bản ghi)
                                </>
                            ) : (
                                <>
                                    <IconChevronDown size={16} className="me-1" />
                                    Xem thêm {medicalRecords.length - INITIAL_DISPLAY_COUNT} bản ghi
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default MedicalRecordList;