"use client";
//import node module libraries
import { Fragment, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../services";
import Loading from "../../components/common/Loading";

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Điều hướng dựa trên role
      switch (user.role) {
        case UserRole.BAC_SI:
          router.push('/bac-si');
          break;
        case UserRole.LE_TAN:
          router.push('/le-tan');
          break;
        case UserRole.ADMIN:
          // Admin có thể ở trang tổng quan chung
          break;
        default:
          router.push('/le-tan');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    router.push('/sign-in');
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
