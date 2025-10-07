"use client";

import React, { useState, useCallback } from 'react';
import { Card, Nav, Tab, Container } from 'react-bootstrap';
import { IconCalendar, IconCalendarOff } from '@tabler/icons-react';
import WorkSchedule from './WorkSchedule';
import LeaveManagement from './LeaveManagement';

interface SchedulePageWrapperProps {
    className?: string;
    defaultActiveKey?: 'work-schedule' | 'leave-management';
}

const SchedulePageWrapper: React.FC<SchedulePageWrapperProps> = ({
    className = '',
    defaultActiveKey = 'work-schedule'
}) => {
    const [activeKey, setActiveKey] = useState<string>(defaultActiveKey);

    const handleTabSelect = useCallback((key: string | null) => {
        if (key) {
            setActiveKey(key);
        }
    }, []);

    return (
        <Container fluid className={className}>
            <Tab.Container
                activeKey={activeKey}
                onSelect={handleTabSelect}
                transition={false} // Tắt transition để tránh re-render không mượt
            >
                {/* Tab Navigation */}
                <Card className="mb-0 border-0">
                    <Card.Header className="pb-0 pt-4 bg-white border-0">
                        <Nav
                            variant="tabs"
                            className="nav-tabs-custom "
                        >
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="work-schedule"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <IconCalendar size={18} />
                                    <span>Lịch làm việc</span>
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="leave-management"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <IconCalendarOff size={18} />
                                    <span>Quản lý nghỉ phép</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                </Card>

                {/* Tab Content */}
                <Tab.Content className="mt-6">
                    <Tab.Pane eventKey="work-schedule" className="p-0">
                        <WorkSchedule />
                    </Tab.Pane>

                    <Tab.Pane eventKey="leave-management" className="p-0">
                        <LeaveManagement />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Custom CSS để style tabs */}

        </Container>
    );
};

export default SchedulePageWrapper;