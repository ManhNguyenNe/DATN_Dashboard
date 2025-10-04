"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Col, Row, Form, Button, Alert, Table, Badge, InputGroup } from 'react-bootstrap';
import { Search, Calendar, Filter, ArrowClockwise, FileText } from 'react-bootstrap-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import labOrderService, { DoctorLabOrder, DoctorLabOrderFilter } from '../../../../services/labOrderService';
import labResultService from '../../../../services/labResultService';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ChiDinhXetNghiemPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [labOrders, setLabOrders] = useState<DoctorLabOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

    // Search states (individual for better control)
    const [keyword, setKeyword] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [status, setStatus] = useState<string>('CHO_THUC_HIEN'); // Mặc định là chờ thực hiện

    const isInitialMount = useRef<boolean>(true);

    // Set default date to today on mount
    useEffect(() => {
        const today = getTodayDate();
        setDate(today);
    }, []);

    // Initial search với ngày hôm nay khi component đã mount và có date
    useEffect(() => {
        if (date && isInitialMount.current) {
            // Search ban đầu với ngày hôm nay và status mặc định
            fetchLabOrders({ date, status: 'CHO_THUC_HIEN' });
        }
    }, [date]);

    // Auto search khi các field thay đổi với debounce
    useEffect(() => {
        // Bỏ qua lần render đầu tiên (khi component mount)
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const filters: DoctorLabOrderFilter = {};

        if (keyword.trim()) {
            filters.keyword = keyword.trim();
        }

        if (date) {
            filters.date = date;
        }

        if (status) {
            filters.status = status as any;
        }

        // Debounce: chỉ search sau 400ms kể từ lần thay đổi cuối
        const timeoutId = setTimeout(() => {
            fetchLabOrders(filters);
        }, 400);

        // Cleanup function để clear timeout khi component re-render
        return () => clearTimeout(timeoutId);
    }, [keyword, date, status]);

    const fetchLabOrders = async (searchFilters?: DoctorLabOrderFilter) => {
        try {
            setLoading(true);
            const response = await labOrderService.getDoctorLabOrders(searchFilters);

            if (response && response.data) {
                setLabOrders(response.data);
            } else {
                setLabOrders([]);
            }
        } catch (error: any) {
            console.error('Error fetching lab orders:', error);
            setAlert({
                type: 'danger',
                message: error.message || 'Không thể tải danh sách chỉ định'
            });
            setLabOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setKeyword('');
        const today = getTodayDate();
        setDate(today);
        setStatus('CHO_THUC_HIEN');

        // Search with default filters
        fetchLabOrders({ date: today, status: 'CHO_THUC_HIEN' });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'CHO_THUC_HIEN':
                return 'warning';
            case 'DANG_THUC_HIEN':
                return 'info';
            case 'HOAN_THANH':
                return 'success';
            case 'HUY_BO':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CHO_THUC_HIEN':
                return 'Chờ thực hiện';
            case 'DANG_THUC_HIEN':
                return 'Đang thực hiện';
            case 'HOAN_THANH':
                return 'Hoàn thành';
            case 'HUY_BO':
                return 'Hủy bỏ';
            default:
                return status;
        }
    };

    const handleViewResult = (labOrder: DoctorLabOrder) => {
        // Điều hướng đến trang xem kết quả xét nghiệm
        router.push(`/bac-si/ket-qua-xet-nghiem/${labOrder.id}`);
    };

    const handleExecuteTest = (labOrder: DoctorLabOrder) => {
        // Điều hướng đến trang thực hiện xét nghiệm
        router.push(`/bac-si/xet-nghiem/${labOrder.id}`);
    };

    const handleCancelTest = async (labOrder: DoctorLabOrder) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy xét nghiệm "${labOrder.healthPlanName}"?`)) {
            return;
        }

        try {
            setAlert(null);
            await labResultService.updateLabOrderStatus({
                id: labOrder.id,
                status: 'HUY_BO'
            });

            setAlert({
                type: 'success',
                message: `Đã hủy xét nghiệm "${labOrder.healthPlanName}" thành công`
            });

            // Refresh danh sách sau khi hủy
            const currentFilters: DoctorLabOrderFilter = {};
            if (keyword.trim()) currentFilters.keyword = keyword.trim();
            if (date) currentFilters.date = date;
            if (status) currentFilters.status = status as any;
            fetchLabOrders(currentFilters);

        } catch (error: any) {
            setAlert({
                type: 'danger',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi hủy xét nghiệm'
            });
        }
    };

    return (
        <>
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 className="mb-1">Chỉ định xét nghiệm của tôi</h4>
                            <p className="mb-0 text-muted">
                                Quản lý các chỉ định xét nghiệm và dịch vụ y tế
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    const currentFilters: DoctorLabOrderFilter = {};
                                    if (keyword.trim()) currentFilters.keyword = keyword.trim();
                                    if (date) currentFilters.date = date;
                                    if (status) currentFilters.status = status as any;
                                    fetchLabOrders(currentFilters);
                                }}
                                disabled={loading}
                            >
                                <ArrowClockwise size={16} className="me-1" />
                                Tải lại
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Alert */}
            {alert && (
                <Row className="mb-3">
                    <Col>
                        <Alert
                            variant={alert.type}
                            dismissible
                            onClose={() => setAlert(null)}
                        >
                            {alert.message}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Filter Section */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <div className="d-flex align-items-center">
                                <Filter size={18} className="me-2" />
                                <h6 className="mb-0">Bộ lọc tìm kiếm</h6>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Từ khóa</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <Search size={16} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Tìm theo tên dịch vụ, chẩn đoán..."
                                                value={keyword}
                                                onChange={(e) => setKeyword(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Ngày</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <Calendar size={16} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="">Tất cả</option>
                                            <option value="CHO_THUC_HIEN">Chờ thực hiện</option>
                                            <option value="DANG_THUC_HIEN">Đang thực hiện</option>
                                            <option value="HOAN_THANH">Hoàn thành</option>
                                            <option value="HUY_BO">Hủy bỏ</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleClear}
                                        disabled={loading}
                                        title="Xóa bộ lọc"
                                        className="w-100"
                                    >
                                        <ArrowClockwise size={16} className="me-1" />
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Lab Orders Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                    Danh sách chỉ định
                                    <Badge bg="primary" className="ms-2">
                                        {labOrders.length}
                                    </Badge>
                                </h6>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Đang tải...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Đang tải danh sách chỉ định...</p>
                                </div>
                            ) : labOrders.length > 0 ? (
                                <div className="table-responsive">
                                    <Table striped hover>
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Dịch vụ</th>
                                                <th>Phòng</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày chỉ định</th>
                                                <th>Chẩn đoán</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {labOrders.map((labOrder, index) => (
                                                <tr key={labOrder.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div>
                                                            <strong>{labOrder.healthPlanName}</strong>
                                                            {labOrder.serviceParent && (
                                                                <div className="text-muted small">
                                                                    <i className="bi bi-box me-1"></i>
                                                                    {labOrder.serviceParent}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>{labOrder.room || 'Chưa xác định'}</td>
                                                    <td>
                                                        <Badge bg={getStatusBadgeVariant(labOrder.status)}>
                                                            {getStatusText(labOrder.status)}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {new Date(labOrder.orderDate).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td>
                                                        {labOrder.diagnosis || (
                                                            <span className="text-muted">Chưa có</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            {labOrder.status === 'CHO_THUC_HIEN' && (
                                                                <>
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        size="sm"
                                                                        onClick={() => handleExecuteTest(labOrder)}
                                                                        title="Thực hiện xét nghiệm"
                                                                    >
                                                                        Thực hiện
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleCancelTest(labOrder)}
                                                                        title="Hủy xét nghiệm"
                                                                    >
                                                                        Hủy
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {['DANG_THUC_HIEN', 'HOAN_THANH'].includes(labOrder.status) && (
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handleViewResult(labOrder)}
                                                                    title="Xem kết quả"
                                                                >
                                                                    Xem kết quả
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <FileText size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">Không có chỉ định nào</h6>
                                    <p className="text-muted">
                                        {(status && status !== 'CHO_THUC_HIEN') || keyword || (date && date !== getTodayDate())
                                            ? 'Không tìm thấy chỉ định phù hợp với điều kiện lọc.'
                                            : 'Chưa có chỉ định xét nghiệm nào.'}
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default ChiDinhXetNghiemPage;