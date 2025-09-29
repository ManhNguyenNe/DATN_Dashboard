"use client";

//import node module libraries
import { useState, useEffect, useMemo, useCallback } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { IconSearch, IconPlus, IconRefresh } from "@tabler/icons-react";
import { AppointmentStatus, type AppointmentFilter } from "../../services";
import { getTodayDate } from "../../helper/utils";
import { useDebouncedCallback } from "../../hooks/useOptimizedInteractions";

interface OptimizedAppointmentSearchProps {
    onSearch: (filters: AppointmentFilter) => void;
    loading?: boolean;
    onNewAppointment?: () => void;
}

const OptimizedAppointmentSearch: React.FC<OptimizedAppointmentSearchProps> = ({
    onSearch,
    loading = false,
    onNewAppointment
}) => {
    const [phone, setPhone] = useState<string>("");
    const [date, setDate] = useState<string>(() => getTodayDate());
    const [status, setStatus] = useState<string>("");

    // Memoize filters để tránh re-computation không cần thiết
    const filters = useMemo<AppointmentFilter>(() => {
        const result: AppointmentFilter = {};

        if (phone.trim()) {
            result.phone = phone.trim();
        }

        if (date) {
            result.date = date;
        }

        if (status) {
            result.status = status as AppointmentStatus;
        }

        return result;
    }, [phone, date, status]);

    // Debounced search function
    const debouncedSearch = useDebouncedCallback(
        useCallback((searchFilters: AppointmentFilter) => {
            onSearch(searchFilters);
        }, [onSearch]),
        300
    );

    // Trigger search khi filters thay đổi
    useEffect(() => {
        debouncedSearch(filters);
    }, [filters, debouncedSearch]);

    // Handlers với useCallback để tránh re-render
    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
    }, []);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    }, []);

    const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    }, []);

    const handleRefresh = useCallback(() => {
        onSearch(filters);
    }, [onSearch, filters]);

    const handleReset = useCallback(() => {
        setPhone("");
        setDate(getTodayDate());
        setStatus("");
    }, []);

    return (
        <Row className="g-3 mb-4">
            <Col md={4}>
                <Form.Group>
                    <Form.Label>Số điện thoại</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Nhập số điện thoại..."
                            value={phone}
                            onChange={handlePhoneChange}
                            disabled={loading}
                        />
                        <InputGroup.Text>
                            <IconSearch size={16} />
                        </InputGroup.Text>
                    </InputGroup>
                </Form.Group>
            </Col>

            <Col md={3}>
                <Form.Group>
                    <Form.Label>Ngày khám</Form.Label>
                    <Form.Control
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        disabled={loading}
                    />
                </Form.Group>
            </Col>

            <Col md={3}>
                <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                        value={status}
                        onChange={handleStatusChange}
                        disabled={loading}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value={AppointmentStatus.CHO_XAC_NHAN}>Chờ xác nhận</option>
                        <option value={AppointmentStatus.DA_XAC_NHAN}>Đã xác nhận</option>
                        <option value={AppointmentStatus.DA_DEN}>Đã đến</option>
                        <option value={AppointmentStatus.KHONG_DEN}>Không đến</option>
                    </Form.Select>
                </Form.Group>
            </Col>

            <Col md={2}>
                <Form.Label>&nbsp;</Form.Label>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex-fill"
                    >
                        <IconRefresh size={16} />
                    </Button>

                    {onNewAppointment && (
                        <Button
                            variant="primary"
                            onClick={onNewAppointment}
                            disabled={loading}
                            className="flex-fill"
                        >
                            <IconPlus size={16} />
                        </Button>
                    )}
                </div>
            </Col>

            <Col xs={12}>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Đặt lại bộ lọc
                    </Button>

                    <small className="text-muted align-self-center">
                        {loading ? "Đang tìm kiếm..." : "Tìm kiếm tự động khi bạn nhập"}
                    </small>
                </div>
            </Col>
        </Row>
    );
};

export default OptimizedAppointmentSearch;