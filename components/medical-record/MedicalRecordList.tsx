"use client";

//import node module libraries
import { useMemo, useState } from "react";
import { Table, Badge, Button, Card, Alert } from "react-bootstrap";
import { IconRefresh, IconChevronDown, IconChevronUp, IconEye } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

//import services  
import { type MedicalRecordListItem, MedicalRecordStatus } from "../../services";

interface MedicalRecordListProps {
    medicalRecords: MedicalRecordListItem[];
    loading?: boolean;
    onRefresh?: () => void;
    onViewDetail?: (medicalRecordId: string) => void;
    userRole?: 'BAC_SI' | 'LE_TAN' | 'ADMIN';
}

const MedicalRecordList: React.FC<MedicalRecordListProps> = ({
    medicalRecords,
    loading = false,
    onRefresh,
    onViewDetail,
    userRole
}) => {
    const router = useRouter();
    const [showAll, setShowAll] = useState<boolean>(false);
    const INITIAL_DISPLAY_COUNT = 10;

    const sortedMedicalRecords = useMemo(() => {
        if (!Array.isArray(medicalRecords)) {
            return [] as MedicalRecordListItem[];
        }

        return [...medicalRecords].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    }, [medicalRecords]);

    const highlightedRecordId = useMemo(() => {
        const ongoingRecord = sortedMedicalRecords.find(record => record.status === MedicalRecordStatus.DANG_KHAM || record.status === 'DANG_KHAM');
        return ongoingRecord?.id || sortedMedicalRecords[0]?.id;
    }, [sortedMedicalRecords]);

    const displayedMedicalRecords = showAll
        ? sortedMedicalRecords
        : sortedMedicalRecords.slice(0, INITIAL_DISPLAY_COUNT);

    const hasMoreRecords = sortedMedicalRecords.length > INITIAL_DISPLAY_COUNT;

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

    if (sortedMedicalRecords.length === 0) {
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
        <>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        Danh sách phiếu khám ({sortedMedicalRecords.length})
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
                            {displayedMedicalRecords.map((record) => {
                                const isHighlighted = highlightedRecordId === record.id;
                                const highlightLabel = record.status === MedicalRecordStatus.DANG_KHAM || record.status === 'DANG_KHAM'
                                    ? 'Đang khám'
                                    : 'Phiếu gần nhất';

                                return (
                                    <tr key={record.id} className={isHighlighted ? 'table-active' : undefined}>
                                        <td>
                                            <div className="fw-semibold text-primary">
                                                {record.code}
                                                {/* {isHighlighted && (
                                                    <Badge bg="info" className="ms-2">
                                                        {highlightLabel}
                                                    </Badge>
                                                )} */}
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
                                            <div className="d-flex gap-2">
                                                {userRole === 'BAC_SI' ? (
                                                    // Bác sĩ: nút khám bệnh + lịch sử khám
                                                    <>
                                                        <Button
                                                            variant={record.status === 'HOAN_THANH' ? 'success' : 'primary'}
                                                            size="sm"
                                                            onClick={() => router.push(`/bac-si/kham-benh/${record.id}`)}
                                                            className="d-flex align-items-center"
                                                        >
                                                            <i className={`bi ${record.status === 'HOAN_THANH' ? 'bi-check-circle' : 'bi-stethoscope'} me-1`}></i>
                                                            {record.status === 'HOAN_THANH' ? 'Xem kết quả' : 'Bắt đầu khám'}
                                                        </Button>

                                                    </>
                                                ) : (
                                                    // Lễ tân: nút xem chi tiết
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => onViewDetail?.(record.id)}
                                                        className="d-flex align-items-center"
                                                    >
                                                        <IconEye size={16} className="me-1" />
                                                        Xem chi tiết
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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
                                        Thu gọn ({sortedMedicalRecords.length - INITIAL_DISPLAY_COUNT} bản ghi)
                                    </>
                                ) : (
                                    <>
                                        <IconChevronDown size={16} className="me-1" />
                                        Xem thêm {sortedMedicalRecords.length - INITIAL_DISPLAY_COUNT} bản ghi
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default MedicalRecordList;