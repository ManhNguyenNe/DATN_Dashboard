"use client";
import { Card, Col, Row, Form, Button, Badge, Tab, Tabs } from "react-bootstrap";
import { useState, useEffect } from "react";
import { BarChart, Calendar, PersonCheck, GraphUp, Download, Printer } from "react-bootstrap-icons";
import { useAuth } from "../../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../../services/appointmentService";
import Loading from "../../../../components/common/Loading";

interface ReportStats {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalPatients: number;
    averagePerDay: number;
    monthlyGrowth: number;
}

interface MonthlyData {
    month: string;
    appointments: number;
    patients: number;
}

const DoctorReportsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [stats, setStats] = useState<ReportStats>({
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        totalPatients: 0,
        averagePerDay: 0,
        monthlyGrowth: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        fetchReportData();
    }, [selectedMonth]);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            // Fetch all appointments for statistics
            const response = await appointmentService.getAppointments({});
            const allAppointments = response.data || [];

            // Filter appointments for selected month
            const monthStart = new Date(selectedMonth + '-01');
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

            const monthAppointments = allAppointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= monthStart && aptDate <= monthEnd;
            });

            // Calculate statistics
            const totalAppointments = monthAppointments.length;
            const completedAppointments = monthAppointments.filter(apt =>
                apt.status === 'DA_DEN'
            ).length;
            const cancelledAppointments = monthAppointments.filter(apt =>
                apt.status === 'KHONG_DEN'
            ).length;

            // Count unique patients
            const uniquePatients = new Set(monthAppointments.map(apt =>
                `${apt.fullName}_${apt.phone}`
            )).size;

            // Calculate average per day
            const daysInMonth = monthEnd.getDate();
            const averagePerDay = totalAppointments / daysInMonth;

            setStats({
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                totalPatients: uniquePatients,
                averagePerDay: Math.round(averagePerDay * 100) / 100,
                monthlyGrowth: 0 // TODO: Calculate based on previous month
            });

            // Generate monthly data for the past 6 months
            const monthlyStats: MonthlyData[] = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthKey = date.toISOString().slice(0, 7);

                const monthAppts = allAppointments.filter(apt =>
                    apt.date.startsWith(monthKey)
                );
                const monthPatients = new Set(monthAppts.map(apt =>
                    `${apt.fullName}_${apt.phone}`
                )).size;

                monthlyStats.push({
                    month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                    appointments: monthAppts.length,
                    patients: monthPatients
                });
            }
            setMonthlyData(monthlyStats);

            // Set recent appointments
            const recent = monthAppointments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10);
            setRecentAppointments(recent);

        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeVariant = (status?: string) => {
        switch (status) {
            case 'CHO_XAC_NHAN': return 'warning';
            case 'DA_XAC_NHAN': return 'info';
            case 'DA_DEN': return 'success';
            case 'KHONG_DEN': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'CHO_XAC_NHAN': return 'Chờ xác nhận';
            case 'DA_XAC_NHAN': return 'Đã xác nhận';
            case 'DA_DEN': return 'Đã đến';
            case 'KHONG_DEN': return 'Không đến';
            default: return 'N/A';
        }
    };

    const calculateCompletionRate = (): string => {
        if (stats.totalAppointments === 0) return '0';
        return ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1);
    };

    const handleExportReport = () => {
        // TODO: Implement export functionality
        alert('Tính năng xuất báo cáo sẽ được triển khai sau');
    };

    const handlePrintReport = () => {
        // TODO: Implement print functionality
        window.print();
    };

    if (loading) return <Loading />;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Báo cáo thống kê</h2>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={handleExportReport}>
                        <Download className="me-1" size={16} />
                        Xuất báo cáo
                    </Button>
                    <Button variant="outline-secondary" onClick={handlePrintReport}>
                        <Printer className="me-1" size={16} />
                        In báo cáo
                    </Button>
                </div>
            </div>

            {/* Month Selector */}
            <Card className="shadow-sm mb-4">
                <Card.Body className="py-3">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="d-flex align-items-center">
                                <Calendar className="me-2 text-primary" />
                                <span className="fw-semibold">Báo cáo tháng:</span>
                                <Form.Control
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="ms-2"
                                    style={{ width: 'auto' }}
                                />
                            </div>
                        </Col>
                        <Col md={6} className="text-end">
                            <span className="text-muted">
                                BS. {user?.name || user?.email}
                            </span>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'overview')}
                className="mb-4"
            >
                <Tab eventKey="overview" title="Tổng quan">
                    {/* Monthly Statistics */}
                    <Row className="mb-4">
                        <Col xl={3} lg={6} md={6} sm={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary bg-opacity-10 p-3 rounded">
                                                <Calendar className="text-primary" size={24} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-0">Tổng lịch hẹn</h6>
                                            <h4 className="mb-0 text-primary">{stats.totalAppointments}</h4>
                                            <small className="text-muted">
                                                Trung bình: {stats.averagePerDay}/ngày
                                            </small>
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
                                            <h6 className="mb-0">Hoàn thành</h6>
                                            <h4 className="mb-0 text-success">{stats.completedAppointments}</h4>
                                            <small className="text-muted">
                                                Tỷ lệ: {calculateCompletionRate()}%
                                            </small>
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
                                            <h6 className="mb-0">Bệnh nhân</h6>
                                            <h4 className="mb-0 text-info">{stats.totalPatients}</h4>
                                            <small className="text-muted">Duy nhất</small>
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
                                                <GraphUp className="text-warning" size={24} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-0">Không đến</h6>
                                            <h4 className="mb-0 text-warning">{stats.cancelledAppointments}</h4>
                                            <small className="text-muted">
                                                {stats.totalAppointments > 0 ?
                                                    ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1)
                                                    : 0}%
                                            </small>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Monthly Trend */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Xu hướng 6 tháng gần đây</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                {monthlyData.map((data, index) => (
                                    <Col key={index} md={2} className="text-center mb-3">
                                        <div className="bg-light rounded p-3">
                                            <div className="text-muted small">{data.month}</div>
                                            <div className="h5 text-primary mb-1">{data.appointments}</div>
                                            <div className="text-muted small">
                                                {data.patients} BN
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="detailed" title="Chi tiết">
                    {/* Recent Appointments */}
                    <Card className="shadow-sm">
                        <Card.Header>
                            <h5 className="mb-0">Lịch hẹn gần đây trong tháng</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {recentAppointments.length === 0 ? (
                                <div className="text-center py-5">
                                    <Calendar size={48} className="text-muted mb-3" />
                                    <p className="text-muted">Không có lịch hẹn nào trong tháng này</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Ngày giờ</th>
                                                <th>Bệnh nhân</th>
                                                <th>Triệu chứng</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentAppointments.map((appointment) => (
                                                <tr key={appointment.id}>
                                                    <td>
                                                        <div>
                                                            <div className="fw-semibold">
                                                                {new Date(appointment.date).toLocaleDateString('vi-VN')}
                                                            </div>
                                                            <small className="text-muted">{appointment.time}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div className="fw-semibold">{appointment.fullName}</div>
                                                            <small className="text-muted">{appointment.phone}</small>
                                                        </div>
                                                    </td>
                                                    <td>{appointment.symptoms || 'Không có'}</td>
                                                    <td>
                                                        <Badge bg={getStatusBadgeVariant(appointment.status)}>
                                                            {getStatusText(appointment.status)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
};

export default DoctorReportsPage;