"use client";

//import node module libraries
import { Row, Col, Button } from "react-bootstrap";
import { IconPlus } from "@tabler/icons-react";

interface AppointmentHeaderProps {
  onNewAppointment?: () => void;
  searchPhone?: string; 
}

const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({ 
  onNewAppointment, 
  searchPhone 
}) => {
  return (
    <div className="pb-4">
      {/* Header */}
      <Row className="align-items-center">
        <Col xl={12} lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-flex align-items-center justify-content-between">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-1 h2 fw-bold">Quản lý đặt lịch khám</h1>
              <p className="mb-0">
                Quản lý lịch hẹn khám bệnh của bệnh nhân
              </p>
            </div>
            <div className="d-flex">
              <Button 
                variant="primary" 
                onClick={onNewAppointment}
                className="d-flex align-items-center"
              >
                <IconPlus size={16} className="me-1" />
                Đặt lịch mới
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentHeader;