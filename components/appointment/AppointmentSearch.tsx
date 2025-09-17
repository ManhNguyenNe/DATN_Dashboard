"use client";

//import node module libraries
import { useState } from "react";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { IconSearch, IconPlus } from "@tabler/icons-react";

interface AppointmentSearchProps {
  onSearch: (phone: string) => void;
  loading?: boolean;
  onNewAppointment?: () => void;
}

const AppointmentSearch: React.FC<AppointmentSearchProps> = ({ 
  onSearch, 
  loading = false, 
  onNewAppointment 
}) => {
  const [phone, setPhone] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(phone);
  };

  const handleClear = () => {
    setPhone("");
    onSearch("");
  };

  return (
    <div className="mb-4">
      <Row className="align-items-end">
        <Col xl={8} lg={8} md={12} sm={12}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tìm kiếm lịch khám theo số điện thoại</Form.Label>
              <InputGroup>
                <Form.Control
                  type="tel"
                  placeholder="Nhập số điện thoại bệnh nhân..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading || !phone.trim()}
                >
                  <IconSearch size={16} className="me-1" />
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
                {phone && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Xóa
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Form>
        </Col>
        
        <Col xl={4} lg={4} md={12} sm={12}>
          <div className="mb-3 d-grid">
            <Button 
              variant="success" 
              onClick={onNewAppointment}
              className="d-flex align-items-center justify-content-center"
            >
              <IconPlus size={16} className="me-1" />
              Đặt lịch khám mới
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentSearch;