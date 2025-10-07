"use client";
import { Card, Col, Row } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, PersonCheck, BarChart } from "react-bootstrap-icons";
import { useAuth } from "../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../services/appointmentService";
import Loading from "../../../components/common/Loading";

interface DoctorStats {
    todayAppointments: number;
    pendingExams: number;
    completedToday: number;
    monthlyTotal: number;
}

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DoctorStats>({
        todayAppointments: 0,
        pendingExams: 0,
        completedToday: 0,
        monthlyTotal: 0
    });
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDoctorData();
    }, []);

    const fetchDoctorData = async () => {
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
                const completed = appointments.filter((apt: Appointment) => apt.status === 'DA_DEN').length;

                setStats({
                    todayAppointments: appointments.length,
                    pendingExams: pending,
                    completedToday: completed,
                    monthlyTotal: appointments.length // Tạm thời, cần API riêng cho tháng
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu bác sĩ:', error);
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
                <h2>Dashboard Bác sĩ</h2>
                <span className="text-muted">Chào mừng, BS. {user?.doctor?.fullName || user?.email}</span>
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
                                    <h4 className="mb-0 text-warning">{stats.pendingExams}</h4>
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
                                        <PersonCheck className="text-success" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Đã đến hôm nay</h6>
                                    <h4 className="mb-0 text-success">{stats.completedToday}</h4>
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
                                        <BarChart className="text-info" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Tổng tháng này</h6>
                                    <h4 className="mb-0 text-info">{stats.monthlyTotal}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Danh sách lịch khám hôm nay */}
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
                                                    <small className="text-muted">{appointment.phone}</small>
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
                                                    {appointment.status === 'DA_XAC_NHAN' && (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => router.push(`/bac-si/kham-benh/${appointment.id}`)}
                                                        >
                                                            Bắt đầu khám
                                                        </button>
                                                    )}
                                                    {appointment.status === 'DA_DEN' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => router.push(`/dat-lich?id=${appointment.id}`)}
                                                        >
                                                            Xem chi tiết
                                                        </button>
                                                    )}
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

export default DoctorDashboard;