"use client";

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SchedulePageWrapper from '../../../../components/schedule/SchedulePageWrapper';
import { useAuth } from '../../../../contexts/AuthContext';

const DoctorSchedulePage: React.FC = () => {
    const { user } = useAuth();

    return (
        <Container fluid>
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 className="mb-1">Quản lý lịch làm việc</h4>
                            <p className="text-muted mb-0">
                                Xem lịch làm việc và quản lý nghỉ phép
                            </p>
                        </div>
                    </div>

                    <SchedulePageWrapper defaultActiveKey="work-schedule" />
                </Col>
            </Row>
        </Container>
    );
};

export default DoctorSchedulePage;