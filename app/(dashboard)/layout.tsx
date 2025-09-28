//import custom components
import { Suspense } from "react";
import Header from "layouts/header/Header";
import Sidebar from "layouts/Sidebar";
import Loading from "components/common/Loading";
import ProtectedRoute from "components/common/ProtectedRoute";
import { UserRole } from "services";

interface DashboardProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardProps> = ({ children }) => {
  return (
    <ProtectedRoute requiredRoles={[UserRole.BAC_SI, UserRole.LE_TAN, UserRole.ADMIN]}>
      <div>
        <Sidebar hideLogo={false} containerId='miniSidebar' />
        <div id='content' className='position-relative h-100'>
          <Header />
          <div className='custom-container'>
            <Suspense fallback={<Loading size="lg" text="Đang tải..." className="py-5" />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
