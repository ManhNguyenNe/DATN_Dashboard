
## 1. Tổng quan Dự án
- **Mục đích:** dự án này là Frontend dashboard quản lí phòng khám đa khoa dành cho lễ tân và bác sĩ
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
