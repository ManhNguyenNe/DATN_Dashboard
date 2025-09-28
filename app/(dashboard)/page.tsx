"use client";
//import node module libraries
import { Fragment, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../services";
import Loading from "../../components/common/Loading";

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Điều hướng dựa trên role
      switch (user.role) {
        case UserRole.BAC_SI:
          window.location.href = '/bac-si';
          break;
        case UserRole.LE_TAN:
          window.location.href = '/le-tan';
          break;
        case UserRole.ADMIN:
          // Admin có thể ở trang tổng quan chung
          break;
        default:
          window.location.href = '/le-tan';
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    window.location.href = '/sign-in';
    return <Loading />;
  }

  // Nếu là admin thì hiển thị dashboard tổng quan
  return (
    <Fragment>
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <h2>Chào mừng đến với hệ thống quản lý phòng khám</h2>
            <p className="text-muted">Đang điều hướng bạn đến trang phù hợp...</p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default HomePage;
