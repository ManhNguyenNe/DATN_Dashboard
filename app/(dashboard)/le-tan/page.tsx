"use client";
import { Card, Col, Row } from "react-bootstrap";
import { useState, useEffect } from "react";
import { CalendarCheck, Clock, PersonFill, TelephoneFill } from "react-bootstrap-icons";
import { useAuth } from "../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../services/appointmentService";
import Loading from "../../../components/common/Loading";

interface ReceptionistStats {
    todayAppointments: number;
    pendingConfirmation: number;
    confirmedAppointments: number;
    totalPatients: number;
}

const ReceptionistDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<ReceptionistStats>({
        todayAppointments: 0,
        pendingConfirmation: 0,
        confirmedAppointments: 0,
        totalPatients: 0
    });
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceptionistData();
    }, []);

    const fetchReceptionistData = async () => {
        try {
            setLoading(true);
            // Lấy danh sách lịch hẹn hôm nay 
            const response = await appointmentService.getAppointments({
                date: new Date().toISOString().split('T')[0]
            });

            if (response.data) {
                const appointments = response.data;
                setTodayAppointments(appointments);

                // Tính toán thống kê
                const pending = appointments.filter((apt: Appointment) => apt.status === 'CHO_XAC_NHAN').length;
                const confirmed = appointments.filter((apt: Appointment) => apt.status === 'DA_XAC_NHAN').length;
                const uniquePatients = new Set(appointments.map(apt => `${apt.fullName}_${apt.phone}`)).size;

                setStats({
                    todayAppointments: appointments.length,
                    pendingConfirmation: pending,
                    confirmedAppointments: confirmed,
                    totalPatients: uniquePatients
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu lễ tân:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status?: string) => {
        switch (status) {
            case 'CHO_XAC_NHAN': return 'badge bg-warning';
            case 'DA_XAC_NHAN': return 'badge bg-info';
            case 'DA_DEN': return 'badge bg-success';
            case 'KHONG_DEN': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'CHO_XAC_NHAN': return 'Chờ xác nhận';
            case 'DA_XAC_NHAN': return 'Đã xác nhận';
            case 'DA_DEN': return 'Đã đến';
            case 'KHONG_DEN': return 'Không đến';
            default: return status || 'N/A';
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard Lễ tân</h2>
                <span className="text-muted">Chào mừng, {user?.name || user?.email}</span>
            </div>

            {/* Thống kê tổng quan */}
            <Row className="mb-4">
                <Col xl={3} lg={6} md={6} sm={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded">
                                        <CalendarCheck className="text-primary" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Lịch hôm nay</h6>
                                    <h4 className="mb-0 text-primary">{stats.todayAppointments}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6} sm={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-warning bg-opacity-10 p-3 rounded">
                                        <Clock className="text-warning" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Chờ xác nhận</h6>
                                    <h4 className="mb-0 text-warning">{stats.pendingConfirmation}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6} sm={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                        <TelephoneFill className="text-info" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Đã xác nhận</h6>
                                    <h4 className="mb-0 text-info">{stats.confirmedAppointments}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={3} lg={6} md={6} sm={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <PersonFill className="text-success" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Bệnh nhân hôm nay</h6>
                                    <h4 className="mb-0 text-success">{stats.totalPatients}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="h-100 border-0 shadow-sm cursor-pointer"
                        onClick={() => window.location.href = '/le-tan/dat-lich'}>
                        <Card.Body className="text-center">
                            <CalendarCheck size={32} className="text-primary mb-3" />
                            <h6>Đặt lịch hẹn</h6>
                            <p className="text-muted small">Tạo lịch hẹn mới cho bệnh nhân</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="h-100 border-0 shadow-sm cursor-pointer"
                        onClick={() => window.location.href = '/le-tan/phieu-kham'}>
                        <Card.Body className="text-center">
                            <Clock size={32} className="text-warning mb-3" />
                            <h6>Quản lý phiếu khám</h6>
                            <p className="text-muted small">Xem và quản lý phiếu khám bệnh</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="h-100 border-0 shadow-sm cursor-pointer">
                        <Card.Body className="text-center">
                            <PersonFill size={32} className="text-info mb-3" />
                            <h6>Quản lý bệnh nhân</h6>
                            <p className="text-muted small">Thông tin và lịch sử bệnh nhân</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="h-100 border-0 shadow-sm cursor-pointer">
                        <Card.Body className="text-center">
                            <TelephoneFill size={32} className="text-success mb-3" />
                            <h6>Xác nhận cuộc hẹn</h6>
                            <p className="text-muted small">Xác nhận và liên lạc bệnh nhân</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Danh sách lịch hẹn hôm nay */}
            <Card className="shadow-sm">
                <Card.Header className="bg-white">
                    <h5 className="mb-0">Lịch hẹn hôm nay</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {todayAppointments.length === 0 ? (
                        <div className="text-center py-5">
                            <CalendarCheck size={48} className="text-muted mb-3" />
                            <p className="text-muted">Không có lịch hẹn nào hôm nay</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Bệnh nhân</th>
                                        <th>Liên hệ</th>
                                        <th>Triệu chứng</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayAppointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-semibold">{appointment.time}</span>
                                                    <small className="text-muted">{appointment.date}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-semibold">{appointment.fullName}</span>
                                                    <small className="text-muted">
                                                        {appointment.gender} - {appointment.birth}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span>{appointment.phone}</span>
                                                    {appointment.email && (
                                                        <small className="text-muted">{appointment.email}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{appointment.symptoms || 'Không có triệu chứng'}</td>
                                            <td>
                                                <span className={getStatusBadgeClass(appointment.status)}>
                                                    {getStatusText(appointment.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    {appointment.status === 'CHO_XAC_NHAN' && (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => window.location.href = `/le-tan/dat-lich?confirm=${appointment.id}`}
                                                        >
                                                            Xác nhận
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => window.location.href = `/le-tan/phieu-kham/${appointment.id}`}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ReceptionistDashboard;