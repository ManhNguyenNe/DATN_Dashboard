//import custom components
import Loading from "components/common/Loading";

const DashboardLoading = () => {
    return (
        <div className="min-vh-100">
            <Loading
                size="lg"
                text="Đang tải Dashboard..."
                className="py-5"
            />
        </div>
    );
};

export default DashboardLoading;