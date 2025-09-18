"use client";

//import node module libraries
import { useState } from "react";
import { Table, Badge, Button, Card, Alert } from "react-bootstrap";
import { IconCheck, IconX, IconClock, IconRefresh, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

//import services  
import { type Appointment, AppointmentStatus } from "../../services";

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  onConfirm: (appointmentId: number, status: AppointmentStatus) => void;
  onRefresh?: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  loading = false,
  onConfirm,
  onRefresh
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const INITIAL_DISPLAY_COUNT = 5;

  // Determine which appointments to display
  const displayedAppointments = showAll
    ? appointments
    : appointments.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMoreAppointments = appointments.length > INITIAL_DISPLAY_COUNT;

  const getStatusBadge = (status: AppointmentStatus | string | undefined) => {
    const statusStr = status as string;
    switch (statusStr) {
      case AppointmentStatus.CHO_XAC_NHAN:
      case 'CHO_XAC_NHAN':
        return <Badge bg="warning">Chờ xác nhận</Badge>;
      case AppointmentStatus.DA_XAC_NHAN:
      case 'DA_XAC_NHAN':
        return <Badge bg="success">Đã xác nhận</Badge>;
      case AppointmentStatus.KHONG_DEN:
      case 'KHONG_DEN':
        return <Badge bg="danger">Không đến</Badge>;
      case undefined:
      case null:
      case '':
      case 'CHUA_XAC_DINH':
        return <Badge bg="warning">Chờ xác nhận</Badge>;
      default:
        return <Badge bg="secondary">Không xác định ({statusStr})</Badge>;
    }
  };

  const formatDateTime = (appointment: Appointment) => {
    try {
      // Use new backend fields first, fallback to legacy fields
      const date = appointment.date || appointment.appointmentDate;
      const time = appointment.time || appointment.appointmentTime;

      if (!date || date === 'undefined' || date === 'null') {
        return 'Chưa xác định';
      }

      if (!time || time === 'undefined' || time === 'null') {
        return date;
      }

      // Parse date
      let formattedDate;
      if (date.includes('/')) {
        formattedDate = date;
      } else {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return `${date} - ${time}`;
        }
        formattedDate = dateObj.toLocaleDateString('vi-VN');
      }

      // Format time (remove seconds if present)
      let formattedTime = time;
      if (time.includes(':')) {
        const timeParts = time.split(':');
        formattedTime = `${timeParts[0]}:${timeParts[1]}`;
      }

      return `${formattedDate} - ${formattedTime}`;
    } catch (error) {
      console.error('Error formatting date:', error, { appointment });
      return 'Lỗi định dạng ngày';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <IconClock size={48} className="text-muted mb-2" />
          <p className="text-muted">Đang tải danh sách lịch khám...</p>
        </Card.Body>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Alert variant="info">
            <h5>Chưa có lịch khám nào</h5>
            <p className="mb-0">Nhập số điện thoại để tìm kiếm lịch khám của bệnh nhân.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          Danh sách lịch khám ({appointments.length})

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
              <th>Bệnh nhân</th>
              <th>Ngày & Giờ</th>
              <th>Bác sĩ</th>
              <th>Khoa / Dịch vụ</th>
              <th>Triệu chứng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayedAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  <div>
                    <div className="fw-semibold">
                      {appointment.fullName || appointment.patientName || 'Chưa xác định'}
                    </div>
                    <small className="text-muted">
                      {appointment.phone || appointment.patientPhone || 'N/A'}
                    </small>
                  </div>
                </td>
                <td>
                  <small>
                    {formatDateTime(appointment)}
                  </small>
                </td>
                <td>
                  {appointment.doctorResponse?.position ||
                    appointment.doctorName ||
                    (appointment.doctorResponse?.id ? `ID: ${appointment.doctorResponse.id}` : 'Chưa xác định')}
                </td>
                <td>
                  <div>
                    {appointment.departmentResponse?.name && (
                      <div className="fw-semibold text-primary">
                        {appointment.departmentResponse.name}
                      </div>
                    )}
                    {appointment.healthPlanResponse?.name && (
                      <div className="text-success">
                        <small>{appointment.healthPlanResponse.name}</small>
                      </div>
                    )}
                    {!appointment.departmentResponse && !appointment.healthPlanResponse && (
                      <span className="text-muted">Chưa xác định</span>
                    )}
                  </div>
                </td>
                <td>
                  <small className="text-muted">
                    {appointment.symptoms
                      ? (appointment.symptoms.length > 50
                        ? `${appointment.symptoms.substring(0, 50)}...`
                        : appointment.symptoms)
                      : 'Không có'
                    }
                  </small>
                </td>
                <td>{getStatusBadge(appointment.status || 'CHUA_XAC_DINH')}</td>
                <td>
                  <div className="d-flex gap-1">
                    {((appointment.status as string) === AppointmentStatus.CHO_XAC_NHAN ||
                      (appointment.status as string) === 'CHO_XAC_NHAN' ||
                      !appointment.status) && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => onConfirm(appointment.id, AppointmentStatus.DA_XAC_NHAN)}
                            title="Xác nhận"
                          >
                            <IconCheck size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onConfirm(appointment.id, AppointmentStatus.KHONG_DEN)}
                            title="Không đến"
                          >
                            <IconX size={14} />
                          </Button>
                        </>
                      )}
                    {((appointment.status as string) === AppointmentStatus.DA_XAC_NHAN ||
                      (appointment.status as string) === 'DA_XAC_NHAN') && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => onConfirm(appointment.id, AppointmentStatus.KHONG_DEN)}
                          title="Đánh dấu không đến"
                        >
                          <IconX size={14} />
                        </Button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Show More/Less Button */}
        {hasMoreAppointments && (
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
                  Thu gọn ({appointments.length - INITIAL_DISPLAY_COUNT} bản ghi)
                </>
              ) : (
                <>
                  <IconChevronDown size={16} className="me-1" />
                  Xem thêm {appointments.length - INITIAL_DISPLAY_COUNT} bản ghi
                </>
              )}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AppointmentList;