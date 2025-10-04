"use client";

//import node module libraries
import { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { IconRefresh } from "@tabler/icons-react";

//import services  
import { type MedicalRecordFilter, MedicalRecordStatus } from "../../services";
import { getTodayDate } from "../../helper/utils";

interface MedicalRecordSearchProps {
    onSearch: (filters: MedicalRecordFilter) => void;
    loading?: boolean;
}

const MedicalRecordSearch: React.FC<MedicalRecordSearchProps> = ({
    onSearch,
    loading = false
}) => {
    const [keyword, setKeyword] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [status, setStatus] = useState<string>(MedicalRecordStatus.CHO_XET_NGHIEM); // Mặc định chờ xét nghiệm
    const isInitialMount = useRef<boolean>(true);

    // Set default date to today on mount
    useEffect(() => {
        const today = getTodayDate();
        setDate(today);
    }, []); // Chỉ chạy khi mount

    // Initial search với ngày hôm nay và trạng thái mặc định khi component đã mount và có date
    useEffect(() => {
        if (date && isInitialMount.current) {
            // Search ban đầu với ngày hôm nay và trạng thái mặc định
            onSearch({
                date,
                status: MedicalRecordStatus.CHO_XET_NGHIEM
            });
        }
    }, [date, onSearch]); // Trigger khi có date hoặc onSearch thay đổi

    // Auto search khi các field thay đổi với debounce
    useEffect(() => {
        // Bỏ qua lần render đầu tiên (khi component mount)
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const filters: MedicalRecordFilter = {};

        if (keyword.trim()) {
            filters.keyword = keyword.trim();
        }

        if (date) {
            filters.date = date;
        }

        if (status) {
            filters.status = status;
        }

        // Debounce: chỉ search sau 400ms kể từ lần thay đổi cuối
        const timeoutId = setTimeout(() => {
            onSearch(filters);
        }, 400);

        // Cleanup function để clear timeout khi component re-render
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, date, status]); // Bỏ onSearch khỏi dependency array

    const handleClear = () => {
        setKeyword("");
        const today = getTodayDate();
        setDate(today);
        setStatus(MedicalRecordStatus.CHO_XET_NGHIEM); // Reset về trạng thái mặc định

        // Search with default date and status
        onSearch({
            date: today,
            status: MedicalRecordStatus.CHO_XET_NGHIEM
        });
    };

    return (
        <div className="mb-4">
            <Form>
                <Row className="align-items-end">
                    {/* Keyword Input */}
                    <Col xl={4} lg={4} md={6} sm={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mã phiếu khám / Tên bệnh nhân</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập mã phiếu khám hoặc tên bệnh nhân..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                style={{
                                    transition: 'none', // Bỏ transition để tránh giật khi gõ
                                }}
                            />
                        </Form.Group>
                    </Col>

                    {/* Date Input */}
                    <Col xl={3} lg={3} md={6} sm={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ngày khám</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Form.Group>
                    </Col>

                    {/* Status Select */}
                    <Col xl={4} lg={4} md={6} sm={12}>
                        <Form.Group className="mb-3">
                            <Form.Label>Trạng thái</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex-fill"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value={MedicalRecordStatus.DANG_KHAM}>Đang khám</option>
                                    <option value={MedicalRecordStatus.CHO_XET_NGHIEM}>Chờ xét nghiệm</option>
                                    <option value={MedicalRecordStatus.HOAN_THANH}>Hoàn thành</option>
                                    <option value={MedicalRecordStatus.HUY}>Hủy</option>
                                </Form.Select>
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleClear}
                                    title="Xóa bộ lọc và tìm theo ngày hôm nay"
                                >
                                    <IconRefresh size={16} />
                                </Button>
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default MedicalRecordSearch;