//import custom components
import Loading from "components/common/Loading";

const EcommerceLoading = () => {
    return (
        <div style={{ minHeight: '400px' }}>
            <Loading
                size="md"
                text="Đang tải Ecommerce..."
                className="py-4"
            />
        </div>
    );
}; export default EcommerceLoading;