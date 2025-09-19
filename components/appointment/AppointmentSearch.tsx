"use client";

//import node module libraries
import { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { IconSearch, IconPlus, IconRefresh } from "@tabler/icons-react";
import { AppointmentStatus, type AppointmentFilter } from "../../services";
import { getTodayDate } from "../../helper/utils";

interface AppointmentSearchProps {
  onSearch: (filters: AppointmentFilter) => void;
  loading?: boolean;
  onNewAppointment?: () => void;
}

const AppointmentSearch: React.FC<AppointmentSearchProps> = ({
  onSearch,
  loading = false,
  onNewAppointment
}) => {
  const [phone, setPhone] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const isInitialMount = useRef<boolean>(true);

  // Set default date to today on mount
  useEffect(() => {
    const today = getTodayDate();
    setDate(today);
  }, []); // Chỉ chạy khi mount

  // Initial search với ngày hôm nay khi component đã mount và có date
  useEffect(() => {
    if (date && isInitialMount.current) {
      // Search ban đầu với ngày hôm nay
      onSearch({ date });
    }
  }, [date, onSearch]); // Trigger khi có date hoặc onSearch thay đổi

  // Auto search khi các field thay đổi với debounce
  useEffect(() => {
    // Bỏ qua lần render đầu tiên (khi component mount)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const filters: AppointmentFilter = {};

    if (phone.trim()) {
      filters.phone = phone.trim();
    }

    if (date) {
      filters.date = date;
    }

    if (status) {
      filters.status = status as AppointmentStatus;
    }

    // Debounce: chỉ search sau 300ms kể từ lần thay đổi cuối
    const timeoutId = setTimeout(() => {
      onSearch(filters);
    }, 300);

    // Cleanup function để clear timeout khi component re-render
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, date, status]); // Bỏ onSearch khỏi dependency array

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filters: AppointmentFilter = {};

    if (phone.trim()) {
      filters.phone = phone.trim();
    }

    if (date) {
      filters.date = date;
    }

    if (status) {
      filters.status = status as AppointmentStatus;
    }

    onSearch(filters);
  };

  const handleClear = () => {
    setPhone("");
    const today = getTodayDate();
    setDate(today);
    setStatus("");

    // Search with default date only
    onSearch({ date: today });
  };

  const handleReset = () => {
    setPhone("");
    setDate("");
    setStatus("");
    onSearch({});
  };

  return (
    <div className="mb-4">
      <Form onSubmit={handleSubmit}>
        <Row className="align-items-end">
          {/* Phone Input */}
          <Col xl={4} lg={4} md={6} sm={12}>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Nhập số điện thoại..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
                  className="flex-fill"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value={AppointmentStatus.CHO_XAC_NHAN}>Chờ xác nhận</option>
                  <option value={AppointmentStatus.DA_XAC_NHAN}>Đã xác nhận</option>
                  <option value={AppointmentStatus.DA_DEN}>Đã đến</option>
                  <option value={AppointmentStatus.KHONG_DEN}>Không đến</option>
                </Form.Select>
                <Button
                  variant="outline-secondary"
                  onClick={handleClear}
                  disabled={loading}
                  title="Xóa bộ lọc và tìm theo ngày hôm nay"
                >
                  <IconRefresh size={16} />
                </Button>
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* New Appointment Button */}

    </div>
  );
};

export default AppointmentSearch;