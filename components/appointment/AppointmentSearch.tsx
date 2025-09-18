"use client";

//import node module libraries
import { useState, useEffect } from "react";
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

  // Set default date to today on mount
  useEffect(() => {
    const today = getTodayDate();
    setDate(today);
  }, []);

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
          <Col xl={3} lg={3} md={6} sm={12}>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="">Tất cả trạng thái</option>
                <option value={AppointmentStatus.CHO_XAC_NHAN}>Chờ xác nhận</option>
                <option value={AppointmentStatus.DA_XAC_NHAN}>Đã xác nhận</option>
                <option value={AppointmentStatus.KHONG_DEN}>Không đến</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Action Buttons */}
          <Col xl={2} lg={2} md={6} sm={12}>
            <div className="mb-3 d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex-fill"
              >
                <IconSearch size={16} className="me-1" />
                {loading ? "..." : "Tìm"}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={handleClear}
                disabled={loading}
                title="Xóa bộ lọc và tìm theo ngày hôm nay"
              >
                <IconRefresh size={16} />
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* New Appointment Button */}

    </div>
  );
};

export default AppointmentSearch;