# Hướng dẫn sử dụng Message API

## Tổng quan

Dự án đã được cập nhật để sử dụng Message API của Ant Design thay vì các thông báo trực tiếp. Điều này đảm bảo:
- Thông báo nhất quán trong toàn bộ ứng dụng
- Hoạt động client-side không cần reload trang
- Trải nghiệm người dùng tốt hơn

## Cách sử dụng

### 1. Import MessageProvider

Trong component của bạn, import hook useMessage:

```tsx
import { useMessage } from '../common/MessageProvider';
```

### 2. Khởi tạo hook

```tsx
const MyComponent = () => {
    const message = useMessage();
    
    // Component logic...
}
```

### 3. Sử dụng các phương thức message

```tsx
// Hiển thị thông báo thành công
message.success("Thao tác thành công!");

// Hiển thị thông báo lỗi
message.error("Có lỗi xảy ra!");

// Hiển thị thông báo thông tin
message.info("Thông tin quan trọng");

// Hiển thị thông báo cảnh báo
message.warning("Cảnh báo!");

// Hiển thị thông báo loading
message.loading("Đang xử lý...");
```

### 4. Với thời gian tùy chỉnh

```tsx
// Hiển thị message trong 5 giây
message.success("Thành công!", 5);

// Hiển thị message trong 10 giây
message.error("Lỗi!", 10);
```

## Nguyên tắc sử dụng

### ✅ Nên làm

1. **Sử dụng message API cho mọi thông báo:**
```tsx
// ✅ Đúng
message.success("Đã tạo lịch khám thành công!");

// ❌ Sai - không dùng console.log
console.log("Thành công");

// ❌ Sai - không dùng alert
alert("Thành công");
```

2. **Cập nhật state ngay lập tức (client-side):**
```tsx
// ✅ Đúng - cập nhật UI ngay, sau đó gọi API
const handleDelete = async (id: number) => {
    // Cập nhật UI ngay lập tức
    setItems(prev => prev.filter(item => item.id !== id));
    
    try {
        await api.delete(id);
        message.success("Đã xóa thành công!");
    } catch (error) {
        // Rollback nếu có lỗi
        await loadItems();
        message.error("Lỗi khi xóa!");
    }
};
```

3. **Hiển thị loading state:**
```tsx
const handleSave = async () => {
    message.loading("Đang lưu...");
    
    try {
        await api.save(data);
        message.success("Đã lưu thành công!");
    } catch (error) {
        message.error("Lỗi khi lưu!");
    }
};
```

### ❌ Không nên làm

1. **Không reload trang sau thao tác:**
```tsx
// ❌ Sai
const handleCreate = async () => {
    await api.create(data);
    window.location.reload(); // Không làm điều này!
};

// ✅ Đúng
const handleCreate = async () => {
    const newItem = await api.create(data);
    setItems(prev => [...prev, newItem]);
    message.success("Đã tạo thành công!");
};
```

2. **Không sử dụng nhiều message cùng lúc:**
```tsx
// ❌ Sai
message.loading("Đang xử lý...");
message.success("Thành công!"); // Sẽ bị ghi đè

// ✅ Đúng
message.loading("Đang xử lý...");
// Chờ xử lý xong
await processData();
message.success("Thành công!");
```

## Ví dụ hoàn chỉnh

```tsx
"use client";

import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useMessage } from '../common/MessageProvider';
import { appointmentService } from '../../services';

const MyComponent = () => {
    const message = useMessage();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCreate = async (data) => {
        setLoading(true);
        message.loading("Đang tạo lịch khám...");
        
        try {
            const newAppointment = await appointmentService.create(data);
            
            // Cập nhật UI ngay lập tức
            setAppointments(prev => [...prev, newAppointment]);
            
            message.success("Đã tạo lịch khám thành công!");
        } catch (error) {
            message.error(error.message || "Lỗi khi tạo lịch khám");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        // Cập nhật UI ngay lập tức
        const originalAppointments = appointments;
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        
        try {
            await appointmentService.delete(id);
            message.success("Đã xóa lịch khám thành công!");
        } catch (error) {
            // Rollback nếu có lỗi
            setAppointments(originalAppointments);
            message.error("Lỗi khi xóa lịch khám");
        }
    };

    return (
        <div>
            {/* UI components */}
        </div>
    );
};

export default MyComponent;
```

## Migration từ code cũ

### Thay thế các thông báo cũ

```tsx
// Cũ
console.log("Thành công");
alert("Thành công");
showSuccess("Thành công", "Chi tiết");

// Mới  
message.success("Thành công");
```

### Thay thế reload trang

```tsx
// Cũ
window.location.reload();
router.refresh();

// Mới - cập nhật state local
setData(newData);
message.success("Cập nhật thành công!");
```

### Thay thế loading states

```tsx
// Cũ
setLoading(true);
// ... API call
setLoading(false);

// Mới
message.loading("Đang xử lý...");
// ... API call  
message.success("Hoàn thành!");
```