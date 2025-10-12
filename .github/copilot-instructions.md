
## 1. Tổng quan Dự án**Nguyên tắc đặc biệt quan trọng**
- Ứng dụng phải hoạt động theo cơ chế client-side, đảm bảo không reload toàn bộ trang khi người dùng thao tác.

Ví dụ: khi người dùng nhấn nút "Thêm", bản ghi mới sẽ được thêm ngay vào danh sách hiển thị phía dưới thông qua cập nhật dữ liệu trên client (JS/Angular/React...), sau đó mới gửi request lên server để lưu lại, mà không cần tải lại trang.

- **LUÔN LUÔN** sử dụng Message API của Ant Design cho mọi thông báo:
```tsx
// Import
import { useMessage } from '../common/MessageProvider';

// Sử dụng
const message = useMessage();

// Các phương thức
message.success('Thành công!');
message.error('Có lỗi xảy ra!');
message.info('Thông tin quan trọng');
message.warning('Cảnh báo!');
message.loading('Đang xử lý...');
```

- **TUYỆT ĐỐI KHÔNG** sử dụng:
  - `console.log()` để thông báo cho người dùng
  - `alert()` hoặc `confirm()` trực tiếp
  - `window.location.reload()`
  - Reload component sau khi thao tác

- **Quy trình client-side chuẩn:**
  1. Hiển thị loading message
  2. Cập nhật UI ngay lập tức (optimistic update)
  3. Gọi API
  4. Hiển thị message thành công/lỗi
  5. Nếu lỗi, rollback UI về trạng thái trước đóch:** dự án này là Frontend dashboard quản lí phòng khám đa khoa dành cho lễ tân và bác sĩ
- **Quy tắc:** Không sử dụng console log trong code
- **Quy tắc:** Luôn Luôn trả lời tin nhắn bằng tiếng việt 

## 2. Kiến trúc & Mẫu thiết kế 
- **Cấu trúc thư mục:** Tuân thủ cấu trúc thư mục đã được định sẵn
- **Tài liệu API:**
  - Toàn bộ tài liệu về các endpoint của API nằm trong thư mục `/docs/api`.
  - Toàn bộ tài liệu về  luồng quy trình nằm trong thư mục `/docs/explain`
  - Toàn bộ api khi gọi đều phải gán kèm theo jwt token trong header
  - Luôn tham khảo tài liệu này để biết các tham số yêu cầu, body và cấu trúc phản hồi.
---

## 3. Những điều cần TRÁNH ❌
- **KHÔNG** sử dụng `fetch()` API gốc của trình duyệt. Luôn sử dụng instance `axios` đã được cấu hình.
- **TRÁNH** tạo các component quá lớn (god components). Hãy chia nhỏ chúng thành các component con, tái sử dụng được.
- **TRÁNH** sử dụng `any` trong TypeScript. Cố gắng định nghĩa kiểu dữ liệu (type/interface) rõ ràng nhất có thể.
- **TRÁNH** tác riêng biệt các interface sao cho hợp lí, không gộp chung 1 file.


**Nguyên tắc đặc biệt quan trọng**
- Ứng dụng phải hoạt động theo cơ chế client-side, đảm bảo không reload toàn bộ trang khi người dùng thao tác.

Ví dụ: khi người dùng nhấn nút “Thêm”, bản ghi mới sẽ được thêm ngay vào danh sách hiển thị phía dưới thông qua cập nhật dữ liệu trên client (JS/Angular/React...), sau đó mới gửi request lên server để lưu lại, mà không cần tải lại trang.

- Mọi thao tác khi thực hiện như thêm sửa xóa đều dùng Component Message thông báo của antd
vi du 
messageApi.open({
      type: 'success',
      content: 'This is a success message',
    });