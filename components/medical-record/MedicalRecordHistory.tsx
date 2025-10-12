"use client";

//import node module libraries
import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Button, Table, Badge, Alert, Spinner } from "react-bootstrap";
import { IconEye, IconCalendar, IconUser, IconFileText } from "@tabler/icons-react";

//import services
import { medicalRecordService, type MedicalRecordListItem, MedicalRecordStatus } from "../../services";

interface MedicalRecordHistoryProps {
    show: boolean;
    onHide: () => void;
    patientId: number;
    patientName?: string;
    onViewDetail?: (medicalRecordId: string) => void;
    currentMedicalRecordId?: string;
}

interface ApiErrorLike {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (typeof error === 'object' && error !== null) {
        const apiError = error as ApiErrorLike;
        if (apiError.response?.data?.message) {
            return apiError.response.data.message;
        }

        if (apiError.message) {
            return apiError.message;
        }
    }

    return fallback;
};

const MedicalRecordHistory: React.FC<MedicalRecordHistoryProps> = ({
    show,
    onHide,
    patientId,
    patientName,
    onViewDetail,
    currentMedicalRecordId
}) => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecordListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMedicalRecords = useCallback(async () => {
        if (!patientId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await medicalRecordService.getMedicalRecordByPatientId(patientId);
            const records = Array.isArray(response.data) ? response.data : [];

            const sortedRecords = [...records].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });

            setMedicalRecords(sortedRecords);
        } catch (fetchError: unknown) {
            const messageText = getErrorMessage(fetchError, 'Có lỗi xảy ra khi tải lịch sử khám bệnh');
            setError(messageText);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    // Fetch medical records when modal opens
    useEffect(() => {
        if (show && patientId) {
            fetchMedicalRecords();
        }
    }, [show, patientId, fetchMedicalRecords]);

    const getStatusBadge = (status: MedicalRecordStatus | string | undefined) => {
        switch (status) {
            case MedicalRecordStatus.DANG_KHAM:
                return <Badge bg="primary">Đang khám</Badge>;
            case MedicalRecordStatus.CHO_XET_NGHIEM:
                return <Badge bg="warning">Chờ xét nghiệm</Badge>;
            case MedicalRecordStatus.HOAN_THANH:
                return <Badge bg="success">Hoàn thành</Badge>;
            case MedicalRecordStatus.HUY:
                return <Badge bg="danger">Hủy</Badge>;
            default:
                return <Badge bg="secondary">Không xác định</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const highlightedRecordId = useMemo(() => {
        const ongoingRecord = medicalRecords.find(record => record.status === MedicalRecordStatus.DANG_KHAM);
        return ongoingRecord?.id || medicalRecords[0]?.id;
    }, [medicalRecords]);

    const handleViewDetail = (medicalRecordId: string) => {
        if (onViewDetail) {
            onViewDetail(medicalRecordId);
            onHide(); // Đóng modal lịch sử khi xem chi tiết
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <IconFileText size={24} className="me-2" />
                    Lịch sử khám bệnh
                    {patientName && (
                        <span className="text-muted ms-2">- {patientName}</span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading && (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Đang tải lịch sử khám bệnh...</p>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Lỗi:</strong> {error}
                    </Alert>
                )}

                {!loading && !error && medicalRecords.length === 0 && (
                    <Alert variant="info" className="text-center">
                        <IconUser size={48} className="d-block mx-auto mb-2 text-muted" />
                        <strong>Chưa có lịch sử khám bệnh</strong>
                        <p className="mb-0 text-muted">Bệnh nhân này chưa có phiếu khám bệnh nào trong hệ thống.</p>
                    </Alert>
                )}

                {!loading && !error && medicalRecords.length > 0 && (
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '120px' }}>Mã phiếu</th>
                                    <th style={{ width: '150px' }}>
                                        <IconCalendar size={16} className="me-1" />
                                        Ngày khám
                                    </th>
                                    <th>Triệu chứng</th>
                                    <th>Chẩn đoán</th>
                                    <th style={{ width: '120px' }}>Trạng thái</th>
                                    <th style={{ width: '100px' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicalRecords.map((record) => {
                                    const isCurrent = currentMedicalRecordId === record.id;
                                    const isHighlighted = highlightedRecordId === record.id;
                                    const highlightLabel = record.status === MedicalRecordStatus.DANG_KHAM ? 'Đang khám' : 'Phiếu gần nhất';

                                    return (
                                        <tr key={record.id} className={isHighlighted ? 'table-active' : undefined}>
                                            <td>
                                                <code className="text-primary">{record.code}</code>
                                                {isHighlighted && (
                                                    <Badge bg="info" className="ms-2">
                                                        {highlightLabel}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="text-muted">
                                                {formatDate(record.date)}
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                    {record.symptoms || 'Không có thông tin'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                    {record.diagnosis || 'Chưa có chẩn đoán'}
                                                </div>
                                            </td>

                                            <td>
                                                {getStatusBadge(record.status)}
                                            </td>
                                            <td>
                                                <Button
                                                    variant={isCurrent ? 'secondary' : 'outline-primary'}
                                                    size="sm"
                                                    onClick={() => handleViewDetail(record.id)}
                                                    title={isCurrent ? 'Phiếu khám đang được mở' : 'Xem chi tiết phiếu khám này'}
                                                    className="d-flex align-items-center"
                                                    disabled={isCurrent}
                                                >
                                                    <IconEye size={16} className="me-1" />
                                                    <span className="d-none d-md-inline">{isCurrent ? 'Đang xem' : 'Chi tiết'}</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="text-muted">
                        {!loading && medicalRecords.length > 0 && (
                            <small>
                                Tổng cộng: <strong>{medicalRecords.length}</strong> phiếu khám
                            </small>
                        )}
                    </div>
                    <div>
                        <Button variant="secondary" onClick={onHide}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default MedicalRecordHistory;