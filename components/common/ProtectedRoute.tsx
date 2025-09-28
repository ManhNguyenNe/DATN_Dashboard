"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../services';
import { Spinner, Alert, Container, Card } from 'react-bootstrap';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles = [],
    fallbackPath = '/sign-in'
}) => {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, hasRole } = useAuth();

    // Hiển thị loading khi đang kiểm tra authentication
    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang kiểm tra quyền truy cập...</p>
                </div>
            </Container>
        );
    }

    // Chuyển hướng nếu chưa đăng nhập
    if (!isAuthenticated) {
        router.push(fallbackPath);
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang chuyển hướng...</p>
                </div>
            </Container>
        );
    }

    // Kiểm tra quyền truy cập nếu có yêu cầu role cụ thể
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        return (
            <Container className="mt-5">
                <Card>
                    <Card.Body className="text-center p-5">
                        <Alert variant="danger">
                            <Alert.Heading>Không có quyền truy cập</Alert.Heading>
                            <p>
                                Bạn không có quyền truy cập vào trang này.
                                Trang này yêu cầu quyền: <strong>{requiredRoles.join(', ')}</strong>
                            </p>
                            <p>
                                Quyền hiện tại của bạn: <strong>{user?.role}</strong>
                            </p>
                            <hr />
                            <p className="mb-0">
                                Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                            </p>
                        </Alert>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Render children nếu đã xác thực và có quyền
    return <>{children}</>;
};

export default ProtectedRoute;