//import custom components
import Loading from "components/common/Loading";

const DatLichLoading = () => {
    return (
        <div style={{ minHeight: '400px' }}>
            <Loading
                size="md"
                text="Đang tải Đặt lịch khám..."
                className="py-4"
            />
        </div>
    );
}; 

export default DatLichLoading;