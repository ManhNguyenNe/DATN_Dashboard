"use client";
import { Card, Col, Row, Button, Badge, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, PersonFill, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { useAuth } from "../../../../contexts/AuthContext";
import appointmentService, { Appointment } from "../../../../services/appointmentService";
import Loading from "../../../../components/common/Loading";

interface WeeklySchedule {
    [date: string]: Appointment[];
}

const DoctorSchedulePage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [loading, setLoading] = useState(true);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchWeeklySchedule();
    }, [currentWeek]);

    const fetchWeeklySchedule = async () => {
        try {
            setLoading(true);
            const weekDates = getWeekDates(currentWeek);
            const scheduleData: WeeklySchedule = {};

            // Fetch appointments for each day of the week
            for (const date of weekDates) {
                try {
                    const response = await appointmentService.getAppointments({
                        date: date
                    });
                    scheduleData[date] = response.data || [];
                } catch (error) {
                    console.error(`Error fetching appointments for ${date}:`, error);
                    scheduleData[date] = [];
                }
            }

            setSchedule(scheduleData);
        } catch (error) {
            console.error('Error fetching weekly schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = (startOfWeek: Date): string[] => {
        const dates: string[] = [];
        const start = new Date(startOfWeek);
        start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }

        return dates;
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newWeek);
    };

    const getDayName = (date: string): string => {
        const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return dayNames[new Date(date).getDay()];
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

    const isToday = (date: string): boolean => {
        return date === new Date().toISOString().split('T')[0];
    };

    const getTotalAppointments = (): number => {
        return Object.values(schedule).reduce((total, dayAppointments) => total + dayAppointments.length, 0);
    };

    const getConfirmedAppointments = (): number => {
        return Object.values(schedule).reduce((total, dayAppointments) =>
            total + dayAppointments.filter(apt => apt.status === 'DA_XAC_NHAN' || apt.status === 'DA_DEN').length, 0
        );
    };

    if (loading) return <Loading />;

    const weekDates = getWeekDates(currentWeek);
    const weekStart = new Date(weekDates[0]);
    const weekEnd = new Date(weekDates[6]);

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Lịch làm việc</h2>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={() => setCurrentWeek(new Date())}
                    >
                        Hôm nay
                    </Button>
                </div>
            </div>

            {/* Week Navigation */}
            <Card className="shadow-sm mb-4">
                <Card.Body className="py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigateWeek('prev')}
                        >
                            <ChevronLeft />
                        </Button>

                        <div className="text-center">
                            <h5 className="mb-0">
                                {weekStart.toLocaleDateString('vi-VN')} - {weekEnd.toLocaleDateString('vi-VN')}
                            </h5>
                            <small className="text-muted">
                                Tuần {Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))} năm {weekStart.getFullYear()}
                            </small>
                        </div>

                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigateWeek('next')}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Weekly Stats */}
            <Row className="mb-4">
                <Col md={4}>
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
                                    <h4 className="mb-0 text-primary">{getTotalAppointments()}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-success bg-opacity-10 p-3 rounded">
                                        <PersonFill className="text-success" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Đã xác nhận</h6>
                                    <h4 className="mb-0 text-success">{getConfirmedAppointments()}</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-info bg-opacity-10 p-3 rounded">
                                        <Clock className="text-info" size={24} />
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-0">Giờ làm việc</h6>
                                    <h4 className="mb-0 text-info">8:00 - 17:00</h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Weekly Calendar Grid */}
            {/* Desktop View */}
            <Card className="shadow-sm d-none d-lg-block">
                <Card.Body className="p-0">
                    <div className="row g-0">
                        {weekDates.map((date, index) => (
                            <div key={date} className="col">
                                <div className={`h-100 ${index < weekDates.length - 1 ? 'border-end' : ''} ${isToday(date) ? 'bg-primary bg-opacity-5' : ''}`}>
                                    {/* Day Header */}
                                    <div className={`text-center py-3 border-bottom ${isToday(date) ? 'bg-primary text-white' : 'bg-light'}`}>
                                        <div className="fw-bold">{getDayName(date)}</div>
                                        <small className={isToday(date) ? 'text-white' : 'text-muted'}>
                                            {new Date(date).toLocaleDateString('vi-VN')}
                                        </small>
                                        {isToday(date) && (
                                            <div className="mt-1">
                                                <Badge bg="light" text="primary" className="small">Hôm nay</Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Day Content */}
                                    <div className="p-3" style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
                                        {schedule[date]?.length === 0 ? (
                                            <div className="text-center text-muted py-4">
                                                <Calendar size={32} className="mb-2 opacity-50" />
                                                <div><small>Không có lịch hẹn</small></div>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-2">
                                                {schedule[date]?.map((appointment) => (
                                                    <div
                                                        key={appointment.id}
                                                        className="border rounded-3 p-2 bg-white shadow-sm hover-shadow"
                                                        style={{
                                                            fontSize: '0.875rem',
                                                            transition: 'all 0.2s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                        }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="fw-bold text-primary d-flex align-items-center">
                                                                <Clock size={14} className="me-1" />
                                                                {appointment.time}
                                                            </div>
                                                            <Badge
                                                                bg={getStatusBadgeVariant(appointment.status)}
                                                                className="small"
                                                            >
                                                                {getStatusText(appointment.status)}
                                                            </Badge>
                                                        </div>

                                                        <div className="mb-2">
                                                            <div className="fw-semibold d-flex align-items-center mb-1" title={appointment.fullName}>
                                                                <PersonFill size={14} className="me-1 text-secondary" />
                                                                <span className="text-truncate">{appointment.fullName}</span>
                                                            </div>
                                                            {appointment.phone && (
                                                                <div className="text-muted small text-truncate" title={appointment.phone}>
                                                                    📞 {appointment.phone}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {appointment.symptoms && (
                                                            <div className="mb-2">
                                                                <div className="text-muted small border-start border-3 border-info ps-2" title={appointment.symptoms}>
                                                                    <div className="text-truncate">{appointment.symptoms}</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mt-2">
                                                            {appointment.status === 'DA_XAC_NHAN' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    className="w-100 d-flex align-items-center justify-content-center"
                                                                    onClick={() => router.push(`/bac-si/kham-benh/${appointment.id}`)}
                                                                >
                                                                    <PersonFill size={14} className="me-1" />
                                                                    Bắt đầu khám
                                                                </Button>
                                                            )}
                                                            {appointment.status === 'DA_DEN' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-success"
                                                                    className="w-100 d-flex align-items-center justify-content-center"
                                                                    onClick={() => router.push(`/dat-lich?id=${appointment.id}`)}
                                                                >
                                                                    <Calendar size={14} className="me-1" />
                                                                    Xem chi tiết
                                                                </Button>
                                                            )}
                                                            {appointment.status === 'CHO_XAC_NHAN' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-warning"
                                                                    className="w-100 d-flex align-items-center justify-content-center"
                                                                    disabled
                                                                >
                                                                    <Clock size={14} className="me-1" />
                                                                    Chờ xác nhận
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Mobile/Tablet View */}
            <div className="d-lg-none">
                {weekDates.map((date) => (
                    <Card key={date} className={`shadow-sm mb-3 ${isToday(date) ? 'border-primary' : ''}`}>
                        {/* Day Header */}
                        <Card.Header className={`d-flex justify-content-between align-items-center ${isToday(date) ? 'bg-primary text-white' : 'bg-light'}`}>
                            <div>
                                <div className="fw-bold">{getDayName(date)}</div>
                                <small className={isToday(date) ? 'text-white' : 'text-muted'}>
                                    {new Date(date).toLocaleDateString('vi-VN')}
                                </small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                {isToday(date) && (
                                    <Badge bg="light" text="primary" className="small">Hôm nay</Badge>
                                )}
                                <Badge bg="secondary">{schedule[date]?.length || 0} lịch hẹn</Badge>
                            </div>
                        </Card.Header>

                        {/* Day Content */}
                        <Card.Body>
                            {schedule[date]?.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <Calendar size={32} className="mb-2 opacity-50" />
                                    <div>Không có lịch hẹn</div>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {schedule[date]?.map((appointment) => (
                                        <div key={appointment.id} className="col-md-6 col-12">
                                            <div className="border rounded-3 p-3 bg-light h-100">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div className="fw-bold text-primary d-flex align-items-center">
                                                        <Clock size={18} className="me-1" />
                                                        {appointment.time}
                                                    </div>
                                                    <Badge
                                                        bg={getStatusBadgeVariant(appointment.status)}
                                                        className="small"
                                                    >
                                                        {getStatusText(appointment.status)}
                                                    </Badge>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="fw-semibold d-flex align-items-center mb-2">
                                                        <PersonFill size={16} className="me-2 text-secondary" />
                                                        {appointment.fullName}
                                                    </div>
                                                    {appointment.phone && (
                                                        <div className="text-muted">
                                                            📞 {appointment.phone}
                                                        </div>
                                                    )}
                                                </div>

                                                {appointment.symptoms && (
                                                    <div className="mb-3">
                                                        <div className="text-muted border-start border-3 border-info ps-3">
                                                            <small className="text-uppercase fw-bold text-secondary">Triệu chứng</small>
                                                            <div>{appointment.symptoms}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-auto">
                                                    {appointment.status === 'DA_XAC_NHAN' && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            className="w-100 d-flex align-items-center justify-content-center"
                                                            onClick={() => router.push(`/bac-si/kham-benh/${appointment.id}`)}
                                                        >
                                                            <PersonFill size={16} className="me-1" />
                                                            Bắt đầu khám
                                                        </Button>
                                                    )}
                                                    {appointment.status === 'DA_DEN' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline-success"
                                                            className="w-100 d-flex align-items-center justify-content-center"
                                                            onClick={() => router.push(`/dat-lich?id=${appointment.id}`)}
                                                        >
                                                            <Calendar size={16} className="me-1" />
                                                            Xem chi tiết
                                                        </Button>
                                                    )}
                                                    {appointment.status === 'CHO_XAC_NHAN' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline-warning"
                                                            className="w-100 d-flex align-items-center justify-content-center"
                                                            disabled
                                                        >
                                                            <Clock size={16} className="me-1" />
                                                            Chờ xác nhận
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default DoctorSchedulePage;