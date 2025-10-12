"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card,
    Table,
    Badge,
    Button,
    Row,
    Col,
    Modal,
    Form,
    Spinner,
    FormCheck,
    Pagination
} from 'react-bootstrap';
import {
    IconPlus,
    IconEdit,
    IconTrash,
    IconCalendarOff,
    IconFilter
} from '@tabler/icons-react';
import { useMessage } from '../common/MessageProvider';
import { useAuth } from '../../contexts/AuthContext';
import {
    LeaveRequest,
    LeaveRequestData,
    LeaveFilterParams,
    LeaveStatus,
    Shift
} from '../../types/ScheduleTypes';
import scheduleService from '../../services/scheduleService';

interface LeaveManagementProps {
    className?: string;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ className = '' }) => {
    const { user } = useAuth();
    const message = useMessage();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);

    const [filters, setFilters] = useState<LeaveFilterParams>({});
    const [showFilters, setShowFilters] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [formData, setFormData] = useState<{
        day: string;
        shifts: Shift[];
        reason: string;
    }>({
        day: '',
        shifts: [],
        reason: ''
    });

    const fetchLeaveRequests = useCallback(async () => {
        if (!user?.doctor?.id) return;

        setLoading(true);

        try {
            const response = await scheduleService.getMyLeaves(filters);
            setLeaveRequests(response.data || []);
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Không thể tải dữ liệu nghỉ phép. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [user?.doctor?.id, filters]);

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleOpenModal = useCallback((request?: LeaveRequest) => {
        if (request) {
            setEditingRequest(request);
            const shifts: Shift[] = [];
            if (request.startTime && request.endTime) {
                const startHour = parseInt(request.startTime.split(':')[0]);
                const endHour = parseInt(request.endTime.split(':')[0]);

                // 7-12: Sáng
                // 12-17: Chiều  
                // 17 trở lên: Tối
                if (startHour >= 7 && startHour < 12) {
                    shifts.push(Shift.SANG);
                }
                if ((startHour >= 12 && startHour < 17) || (endHour > 12 && endHour <= 17)) {
                    shifts.push(Shift.CHIEU);
                }
                if (startHour >= 17 || endHour > 17) {
                    shifts.push(Shift.TOI);
                }
            }

            setFormData({
                day: request.date || '',
                shifts: shifts,
                reason: request.reason || ''
            });
        } else {
            setEditingRequest(null);
            setFormData({
                day: '',
                shifts: [],
                reason: ''
            });
        }
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setEditingRequest(null);
        setFormData({
            day: '',
            shifts: [],
            reason: ''
        });
    }, []);

    const handleShiftToggle = useCallback((shift: Shift) => {
        setFormData(prev => {
            const isSelected = prev.shifts.includes(shift);
            return {
                ...prev,
                shifts: isSelected
                    ? prev.shifts.filter(s => s !== shift)
                    : [...prev.shifts, shift]
            };
        });
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.day || formData.shifts.length === 0 || !formData.reason.trim()) {
            message.error('Vui lòng điền đầy đủ thông tin và chọn ít nhất một ca làm việc.');
            return;
        }

        setLoading(true);

        try {
            const requestData: LeaveRequestData = {
                doctorId: null,
                day: formData.day,
                shifts: formData.shifts,
                reason: formData.reason.trim(),
                leaveStatus: LeaveStatus.CHO_DUYET
            };

            if (editingRequest?.id) {
                requestData.id = editingRequest.id;
                await scheduleService.updateLeave(requestData);
            } else {
                await scheduleService.createLeave(requestData);
            }
            message.success(editingRequest ? 'Cập nhật yêu cầu nghỉ phép thành công.' : 'Tạo yêu cầu nghỉ phép thành công.');

            handleCloseModal();
            fetchLeaveRequests();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Không thể lưu yêu cầu nghỉ phép. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [formData, editingRequest, handleCloseModal, fetchLeaveRequests]);

    const handleDelete = useCallback(async (requestId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu nghỉ phép này?')) {
            return;
        }

        setLoading(true);

        try {
            await scheduleService.deleteLeave(requestId);
            fetchLeaveRequests();
            message.success('Xóa yêu cầu nghỉ phép thành công.');
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Không thể xóa yêu cầu nghỉ phép. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [fetchLeaveRequests]);

    const renderStatusBadge = useCallback((status?: LeaveStatus) => {
        const variants = {
            [LeaveStatus.CHO_DUYET]: { bg: 'warning', text: 'Chờ duyệt' },
            [LeaveStatus.DA_DUYET]: { bg: 'success', text: 'Đã duyệt' },
            [LeaveStatus.TU_CHOI]: { bg: 'danger', text: 'Từ chối' }
        };

        const variant = status ? variants[status] : { bg: 'secondary', text: 'Không rõ' };
        return <Badge bg={variant.bg}>{variant.text}</Badge>;
    }, []);

    const renderShifts = useCallback((startTime?: string, endTime?: string) => {
        if (!startTime || !endTime) return '-';

        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        const shifts: string[] = [];

        // 7-12: Sáng
        // 12-17: Chiều  
        // 17 trở lên: Tối
        if (startHour >= 7 && startHour < 12) {
            shifts.push('Sáng');
        }
        if ((startHour >= 12 && startHour < 17) || (endHour > 12 && endHour <= 17)) {
            shifts.push('Chiều');
        }
        if (startHour >= 17 || endHour > 17) {
            shifts.push('Tối');
        }

        return shifts.join(', ') || '-';
    }, []);

    const handleApplyFilter = useCallback(() => {
        setShowFilters(false);
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleResetFilter = useCallback(() => {
        setFilters({});
        setShowFilters(false);
        setCurrentPage(1);
    }, []);

    // Pagination calculations
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return leaveRequests.slice(startIndex, endIndex);
    }, [leaveRequests, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(leaveRequests.length / itemsPerPage);
    }, [leaveRequests.length, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    if (!user?.doctor) {
        return (
            <Card className={className}>
                <Card.Body className="text-center text-warning">
                    <IconCalendarOff size={48} className="mb-2" />
                    <p className="mb-0">Chỉ có bác sĩ mới có thể quản lý nghỉ phép.</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card className={className}>
                <Card.Header>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">
                                <IconCalendarOff size={20} className="me-2" />
                                Quản lý nghỉ phép
                            </h5>
                            <small className="text-muted">
                                Bác sĩ: {user.doctor.fullName}
                            </small>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="me-2"
                            >
                                <IconFilter size={16} className="me-1" />
                                Bộ lọc
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenModal()}
                                disabled={loading}
                            >
                                <IconPlus size={16} className="me-1" />
                                Tạo yêu cầu nghỉ phép
                            </Button>
                        </Col>
                    </Row>

                    {showFilters && (
                        <Row className="mt-3 pt-3 border-top">
                            <Col md={4}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small">Ngày</Form.Label>
                                    <Form.Control
                                        type="date"
                                        size="sm"
                                        value={filters.date || ''}
                                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small">Trạng thái</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        value={filters.status || ''}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            status: e.target.value ? e.target.value as LeaveStatus : undefined
                                        }))}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value={LeaveStatus.CHO_DUYET}>Chờ duyệt</option>
                                        <option value={LeaveStatus.DA_DUYET}>Đã duyệt</option>
                                        <option value={LeaveStatus.TU_CHOI}>Từ chối</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleApplyFilter}
                                    className="me-2 mb-2"
                                >
                                    Áp dụng
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleResetFilter}
                                    className="mb-2"
                                >
                                    Đặt lại
                                </Button>
                            </Col>
                        </Row>
                    )}
                </Card.Header>

                <Card.Body>
                    {loading && leaveRequests.length === 0 ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <div className="mt-2">Đang tải dữ liệu...</div>
                        </div>
                    ) : leaveRequests.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <p className="mb-0">Chưa có yêu cầu nghỉ phép nào.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>STT</th>
                                            <th>Ngày nghỉ</th>
                                            <th>Ngày nộp đơn</th>
                                            <th>Ca nghỉ</th>
                                            <th>Thời gian</th>
                                            <th>Lý do</th>
                                            <th>Trạng thái</th>
                                            <th>Người duyệt</th>
                                            <th style={{ width: '120px' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((request, index) => {
                                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                            return (
                                                <tr key={request.id || index}>
                                                    <td>{globalIndex}</td>
                                                    <td>
                                                        <strong>
                                                            {request.date ?
                                                                new Date(request.date).toLocaleDateString('vi-VN')
                                                                : '-'
                                                            }
                                                        </strong>
                                                    </td>
                                                    <td className="small text-muted">
                                                        {request.submitDate ?
                                                            new Date(request.submitDate).toLocaleDateString('vi-VN')
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td>
                                                        <Badge bg="info">
                                                            {renderShifts(request.startTime, request.endTime)}
                                                        </Badge>
                                                    </td>
                                                    <td className="small">
                                                        {request.startTime && request.endTime
                                                            ? request.startTime.substring(0, 5) + ' - ' + request.endTime.substring(0, 5)
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                        {request.reason}
                                                    </td>
                                                    <td>
                                                        {renderStatusBadge(request.leaveStatus)}
                                                    </td>
                                                    <td>
                                                        {request.userApprover || '-'}
                                                    </td>
                                                    <td>
                                                        {request.leaveStatus === LeaveStatus.CHO_DUYET ? (
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleOpenModal(request)}
                                                                    disabled={loading}
                                                                    title="Sửa"
                                                                >
                                                                    <IconEdit size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => request.id && handleDelete(request.id)}
                                                                    disabled={loading}
                                                                    title="Xóa"
                                                                >
                                                                    <IconTrash size={14} />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                                    <div className="text-muted small">
                                        Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, leaveRequests.length)} trong tổng số {leaveRequests.length} yêu cầu
                                    </div>
                                    <Pagination className="mb-0">
                                        <Pagination.First
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        />

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                            // Hiển thị trang hiện tại, 2 trang trước và 2 trang sau
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 2 && page <= currentPage + 2)
                                            ) {
                                                return (
                                                    <Pagination.Item
                                                        key={page}
                                                        active={page === currentPage}
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </Pagination.Item>
                                                );
                                            } else if (page === currentPage - 3 || page === currentPage + 3) {
                                                return <Pagination.Ellipsis key={page} disabled />;
                                            }
                                            return null;
                                        })}

                                        <Pagination.Next
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        />
                                        <Pagination.Last
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingRequest ? 'Sửa yêu cầu nghỉ phép' : 'Tạo yêu cầu nghỉ phép mới'}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày nghỉ *</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.day}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    day: e.target.value
                                }))}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ca nghỉ * (chọn ít nhất 1 ca)</Form.Label>
                            <div className="d-flex gap-3">
                                <FormCheck
                                    type="checkbox"
                                    id="shift-sang"
                                    label="Sáng (7:00 - 11:00)"
                                    checked={formData.shifts.includes(Shift.SANG)}
                                    onChange={() => handleShiftToggle(Shift.SANG)}
                                />
                                <FormCheck
                                    type="checkbox"
                                    id="shift-chieu"
                                    label="Chiều (13:00 - 17:00)"
                                    checked={formData.shifts.includes(Shift.CHIEU)}
                                    onChange={() => handleShiftToggle(Shift.CHIEU)}
                                />
                                <FormCheck
                                    type="checkbox"
                                    id="shift-toi"
                                    label="Tối (18:00 - 21:00)"
                                    checked={formData.shifts.includes(Shift.TOI)}
                                    onChange={() => handleShiftToggle(Shift.TOI)}
                                />
                            </div>
                            {formData.shifts.length === 0 && (
                                <Form.Text className="text-danger">
                                    Vui lòng chọn ít nhất một ca làm việc
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Lý do nghỉ phép *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    reason: e.target.value
                                }))}
                                placeholder="Nhập lý do nghỉ phép..."
                                required
                                maxLength={500}
                            />
                            <Form.Text className="text-muted">
                                {formData.reason.length}/500 ký tự
                            </Form.Text>
                        </Form.Group>

                        {formData.shifts.length > 0 && (
                            <div className="alert alert-info">
                                <strong>Ca nghỉ đã chọn:</strong> {' '}
                                {formData.shifts.map(s => scheduleService.getVietnameseShiftName(s)).join(', ')}
                            </div>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading || formData.shifts.length === 0}
                        >
                            {loading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                editingRequest ? 'Cập nhật' : 'Tạo yêu cầu'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default LeaveManagement;
