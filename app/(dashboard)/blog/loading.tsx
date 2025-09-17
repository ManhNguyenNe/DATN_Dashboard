//import custom components
import Loading from "components/common/Loading";

const BlogLoading = () => {
    return (
        <div style={{ minHeight: '400px' }}>
            <Loading
                size="md"
                text="Đang tải Blog..."
                className="py-4"
            />
        </div>
    );
};

export default BlogLoading;