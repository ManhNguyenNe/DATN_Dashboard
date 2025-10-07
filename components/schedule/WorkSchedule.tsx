"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Table, Badge, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { IconChevronLeft, IconChevronRight, IconCalendar, IconRefresh } from '@tabler/icons-react';
import { Skeleton } from 'antd';
import scheduleService from '../../services/scheduleService';
import {
    DaySchedule,
    Shift,
    DateName,
    SHIFTS,
    WEEKDAYS
} from '../../types/ScheduleTypes';
import { useAuth } from '../../contexts/AuthContext';

interface WorkScheduleProps {
    className?: string;
}

// Component riêng cho cell với smooth transition
const ScheduleCell = React.memo<{
    dateString: string;
    shift: Shift;
    weekSchedules: DaySchedule[];
    doctorId: number;
}>(({ dateString, shift, weekSchedules, doctorId }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const cellData = useMemo(() => {
        const daySchedule = weekSchedules.find(schedule => schedule.date === dateString);
        if (!daySchedule) return { isWorking: false, isOnLeave: false };

        const doctorShift = daySchedule.doctors.find(doctor =>
            doctor.id === doctorId && doctor.shift === shift
        );

        if (!doctorShift) return { isWorking: false, isOnLeave: false };

        return {
            isWorking: doctorShift.available,
            isOnLeave: !doctorShift.available
        };
    }, [dateString, shift, weekSchedules, doctorId]);

    // Trigger transition effect khi data thay đổi
    useEffect(() => {
        if (weekSchedules.length > 0) {
            setIsTransitioning(true);
            const timer = setTimeout(() => setIsTransitioning(false), 0);
            return () => clearTimeout(timer);
        }
    }, [weekSchedules]);

    const badgeClass = `w-100 schedule-cell-badge ${isTransitioning ? 'transitioning' : ''}`;

    if (cellData.isWorking) {
        return <Badge bg="success" className={badgeClass}>Làm việc</Badge>;
    } else if (cellData.isOnLeave) {
        return <Badge bg="danger" className={badgeClass}>Nghỉ phép</Badge>;
    } else {
        return <Badge bg="secondary" className={badgeClass}>Không có lịch</Badge>;
    }
});

ScheduleCell.displayName = 'ScheduleCell';

// Component riêng cho header cell
const DateHeaderCell = React.memo<{
    dateObj: Date;
    dateName: DateName;
}>(({ dateObj, dateName }) => {
    const shortLabel = WEEKDAYS.find(wd => wd.value === dateName)?.shortLabel || '';

    return (
        <th className="text-center">
            <div>{shortLabel}</div>
            <small className="text-muted">
                {dateObj.getDate()}/{dateObj.getMonth() + 1}
            </small>
        </th>
    );
});

DateHeaderCell.displayName = 'DateHeaderCell';

const WorkSchedule: React.FC<WorkScheduleProps> = ({ className = '' }) => {
    const { user } = useAuth();
    const [weekSchedules, setWeekSchedules] = useState<DaySchedule[]>([]);
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [skeletonLoading, setSkeletonLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Tính toán tuần hiện tại - chỉ thay đổi khi currentWeek thay đổi
    const weekRange = useMemo(() => {
        const weekStart = scheduleService.getWeekStart(currentWeek);
        const weekEnd = scheduleService.getWeekEnd(currentWeek);
        return { weekStart, weekEnd };
    }, [currentWeek]);

    // Tạo structure cố định cho 7 ngày trong tuần - không phụ thuộc vào weekSchedules
    const weekDays = useMemo(() => {
        const days = [];
        const startDate = new Date(weekRange.weekStart);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = scheduleService.formatDate(date);

            days.push({
                date: dateString,
                dateObj: date,
                dateName: Object.values(DateName)[i] as DateName
            });
        }
        return days;
    }, [weekRange]); // Chỉ phụ thuộc vào weekRange, không phụ thuộc weekSchedules

    const fetchScheduleData = useCallback(async (withDelay: boolean = false) => {
        if (!user?.doctor?.id) return;

        setLoading(true);
        setError(null);

        // Nếu có delay, hiển thị skeleton
        if (withDelay) {
            setSkeletonLoading(true);
        }

        try {
            // Delay 1.5s nếu cần
            if (withDelay) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            const startDate = scheduleService.formatDate(weekRange.weekStart);
            const endDate = scheduleService.formatDate(weekRange.weekEnd);

            const response = await scheduleService.getDoctorWeeklySchedule(
                user.doctor.id,
                startDate,
                endDate
            );

            if (response.data) {
                setWeekSchedules(response.data);
            }
        } catch (err: any) {
            setError('Không thể tải dữ liệu lịch làm việc. Vui lòng thử lại.');
        } finally {
            setLoading(false);
            setSkeletonLoading(false);
        }
    }, [user?.doctor?.id, weekRange]);

    // Load dữ liệu khi component mount hoặc tuần thay đổi
    useEffect(() => {
        fetchScheduleData(true); // Luôn có delay khi thay đổi tuần
    }, [fetchScheduleData]);

    // Điều hướng tuần với debounce để tránh spam click
    const navigateWeek = useCallback((direction: 'prev' | 'next') => {
        if (loading) return; // Tránh spam khi đang loading

        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    }, [loading]);

    // Về tuần hiện tại
    const goToCurrentWeek = useCallback(() => {
        if (loading) return;
        setCurrentWeek(new Date());
    }, [loading]);

    // Refresh data với delay
    const handleRefresh = useCallback(() => {
        fetchScheduleData(true);
    }, [fetchScheduleData]);

    // Format hiển thị tuần - memoized
    const weekDisplayText = useMemo(() => {
        const start = weekRange.weekStart.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
        const end = weekRange.weekEnd.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        return `${start} - ${end}`;
    }, [weekRange]);

    if (!user?.doctor) {
        return (
            <Alert variant="warning">
                <IconCalendar size={20} className="me-2" />
                Chỉ có bác sĩ mới có thể xem lịch làm việc.
            </Alert>
        );
    }

    return (
        <Card className={className}>
            <Card.Header>
                <Row className="align-items-center">
                    <Col>
                        <h5 className="mb-2">
                            <IconCalendar size={20} className="me-2" />
                            Lịch làm việc tuần
                        </h5>

                    </Col>
                    <Col xs="auto">
                        <div className="d-flex gap-2 align-items-center">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => navigateWeek('prev')}
                                className="btn-nav-week"
                            >
                                <IconChevronLeft size={16} />
                            </Button>

                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={goToCurrentWeek}
                                className="btn-nav-week"
                            >
                                Tuần hiện tại
                            </Button>

                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => navigateWeek('next')}
                                className="btn-nav-week"
                            >
                                <IconChevronRight size={16} />
                            </Button>

                            <Button
                                variant="outline-success"
                                size="sm"
                                onClick={handleRefresh}
                                className="btn-nav-week"
                            >
                                <IconRefresh size={16} />
                            </Button>
                        </div>
                    </Col>
                </Row>

                <Row className="mt-2">
                    <Col>
                        <h6 className="mb-0 text-primary">{weekDisplayText}</h6>
                    </Col>
                </Row>
            </Card.Header>

            <Card.Body className="p-0">
                {error && (
                    <Alert variant="danger" className="m-3 mb-0">
                        {error}
                    </Alert>
                )}

                {/* Hiển thị skeleton khi đang loading */}
                {skeletonLoading ? (
                    <div className="p-4">
                        <Skeleton active paragraph={{ rows: 8 }} />
                    </div>
                ) : (
                    <div className="table-responsive">
                        <Table className="mb-0" hover>
                            <thead className="bg-light">
                                <tr>
                                    <th style={{ width: '120px' }}>Ca làm việc</th>
                                    {weekDays.map((day) => (
                                        <DateHeaderCell
                                            key={day.date}
                                            dateObj={day.dateObj}
                                            dateName={day.dateName}
                                        />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {SHIFTS.map((shift) => (
                                    <tr key={shift.value}>
                                        <td className="fw-medium">
                                            <div>{shift.label}</div>
                                            <small className="text-muted">{shift.time}</small>
                                        </td>
                                        {weekDays.map((day) => (
                                            <td key={`${day.date}-${shift.value}`} className="text-center">

                                                <ScheduleCell
                                                    dateString={day.date}
                                                    shift={shift.value}
                                                    weekSchedules={weekSchedules}
                                                    doctorId={user.doctor!.id}
                                                />

                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card.Body>

            <Card.Footer className="bg-light">
                <Row>
                    <Col>
                        <small className="text-muted">
                            <Badge bg="success" className="me-2">Làm việc</Badge>
                            <Badge bg="danger" className="me-2">Nghỉ phép</Badge>
                            <Badge bg="secondary">Không có lịch</Badge>
                        </small>
                    </Col>
                    <Col xs="auto">
                        <small className="text-muted">
                            Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
                        </small>
                    </Col>
                </Row>
            </Card.Footer>

        </Card>
    );
};

export default WorkSchedule;