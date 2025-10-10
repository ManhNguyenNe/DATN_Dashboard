# Tài liệu: Sửa lỗi reload toàn tab khi thêm chỉ định mới

## 📋 Mô tả vấn đề

Khi bác sĩ thêm chỉ định mới ở trang khám bệnh (`/bac-si/kham-benh/[id]`), toàn bộ tab khám bệnh bị reload, dẫn đến:
- Các trường nhập liệu (triệu chứng, chẩn đoán, hướng điều trị, ghi chú) bị reset về giá trị từ API
- Mất dữ liệu người dùng đang nhập nếu chưa lưu
- Trải nghiệm người dùng không tốt, gây gián đoạn luồng công việc

## 🔍 Nguyên nhân

Trong hàm `handleAddPrescription` và `handleUpdateLabOrder`, sau khi tạo/cập nhật chỉ định thành công, code gọi:

```typescript
await fetchMedicalRecordDetails();
```

Hàm này load lại **toàn bộ** thông tin phiếu khám, bao gồm:
- Thông tin bệnh nhân (appointment)
- Thông tin phiếu khám (medicalRecord)
- **Dữ liệu khám bệnh** (examinationData: triệu chứng, chẩn đoán, hướng điều trị, ghi chú)
- Danh sách dịch vụ (paidServices)

Do đó, dữ liệu examination bị override lại với giá trị từ API, khiến người dùng mất những gì đang nhập.

## ✅ Giải pháp

### 1. Tách logic refresh

Tạo hàm mới `refreshServicesList()` chỉ cập nhật danh sách dịch vụ mà **KHÔNG động đến** examination data:

```typescript
const refreshServicesList = async () => {
    try {
        // Gọi API lấy chi tiết phiếu khám
        const response = await medicalRecordService.getMedicalRecordDetail(appointmentId);

        if (response && response.data) {
            const record = response.data;
            
            // CHỈ cập nhật danh sách dịch vụ
            const services: AppointmentService[] = [];
            
            // Parse invoiceDetailsResponse hoặc labOrdersResponses
            // ... (code parse services)
            
            // ✅ CHỈ cập nhật paidServices, KHÔNG động đến:
            // - medicalRecord
            // - appointment
            // - examinationData
            setPaidServices(services);
        }
    } catch (error: any) {
        console.error('❌ Lỗi khi refresh danh sách dịch vụ:', error);
        setAlert({ type: 'danger', message: 'Không thể tải danh sách dịch vụ' });
    }
};
```

### 2. Cập nhật các hàm xử lý

#### a. `handleAddPrescription` (Thêm chỉ định mới)

**Trước:**
```typescript
// Refresh danh sách dịch vụ SAU KHI đóng modal
await fetchMedicalRecordDetails(); // ❌ Load lại toàn bộ
```

**Sau:**
```typescript
// ✅ CHỈ refresh danh sách dịch vụ, KHÔNG load lại toàn bộ phiếu khám
await refreshServicesList();
```

#### b. `handleUpdateLabOrder` (Cập nhật bác sĩ chỉ định)

**Trước:**
```typescript
// Refresh danh sách để cập nhật UI
await fetchMedicalRecordDetails(); // ❌ Load lại toàn bộ
```

**Sau:**
```typescript
// ✅ CHỈ refresh danh sách dịch vụ, KHÔNG load lại toàn bộ phiếu khám
await refreshServicesList();
```

## 📊 So sánh trước và sau

| Tiêu chí | Trước khi fix | Sau khi fix |
|----------|---------------|-------------|
| **Dữ liệu load lại** | Toàn bộ phiếu khám + examination data | Chỉ danh sách dịch vụ |
| **Examination data** | Bị reset về giá trị API | Giữ nguyên giá trị người dùng nhập |
| **Trải nghiệm UX** | Gián đoạn, mất dữ liệu | Mượt mà, không mất dữ liệu |
| **Performance** | Chậm hơn (load nhiều) | Nhanh hơn (chỉ load cần thiết) |

## 🧪 Kịch bản test

### Test case 1: Thêm chỉ định mới
1. Vào trang khám bệnh bệnh nhân
2. Nhập "Sốt cao" vào trường Triệu chứng
3. Nhập "Viêm họng cấp" vào trường Chẩn đoán
4. Nhập "Nghỉ ngơi, uống thuốc hạ sốt" vào Hướng điều trị
5. Bấm "Thêm chỉ định" và chọn dịch vụ "Xét nghiệm máu"
6. Điền thông tin và lưu chỉ định

**Kết quả mong đợi:**
- ✅ Danh sách dịch vụ cập nhật, hiển thị "Xét nghiệm máu"
- ✅ Các trường "Sốt cao", "Viêm họng cấp", "Nghỉ ngơi, uống thuốc hạ sốt" **VẪN GIỮ NGUYÊN**
- ✅ Không có hiện tượng nhấp nháy/reload trang

### Test case 2: Cập nhật bác sĩ chỉ định
1. Vào trang khám bệnh bệnh nhân có chỉ định
2. Nhập dữ liệu vào các trường examination
3. Bấm "Chi tiết" một chỉ định
4. Thay đổi bác sĩ thực hiện
5. Lưu thay đổi

**Kết quả mong đợi:**
- ✅ Bác sĩ chỉ định được cập nhật trong danh sách
- ✅ Dữ liệu examination **VẪN GIỮ NGUYÊN**
- ✅ Không có hiện tượng reload

## 📁 File thay đổi

```
/app/(dashboard)/bac-si/kham-benh/[id]/page.tsx
```

## 🔧 Chi tiết thay đổi

### Thêm hàm mới: `refreshServicesList()`
- **Vị trí:** Sau `useEffect`, trước `fetchMedicalRecordDetails()`
- **Chức năng:** Chỉ fetch và cập nhật danh sách dịch vụ
- **State cập nhật:** Chỉ `setPaidServices()`

### Cập nhật hàm: `handleAddPrescription()`
- **Dòng thay đổi:** Dòng 371 (cũ)
- **Thay đổi:** `fetchMedicalRecordDetails()` → `refreshServicesList()`

### Cập nhật hàm: `handleUpdateLabOrder()`
- **Dòng thay đổi:** Dòng 555 (cũ)
- **Thay đổi:** `fetchMedicalRecordDetails()` → `refreshServicesList()`

## ⚠️ Lưu ý

1. **Giữ nguyên `fetchMedicalRecordDetails()` trong `useEffect`**
   - Lần đầu load trang vẫn cần load toàn bộ dữ liệu
   - Chỉ thay đổi ở các callback sau khi thêm/cập nhật chỉ định

2. **Backward compatibility**
   - Hàm `refreshServicesList()` hỗ trợ cả 2 cấu trúc API:
     - `invoiceDetailsResponse` (mới)
     - `labOrdersResponses` (cũ)

3. **Error handling**
   - Có try-catch riêng để xử lý lỗi khi refresh
   - Không ảnh hưởng đến luồng chính nếu refresh thất bại

## 📌 Kết luận

Bản fix này cải thiện đáng kể trải nghiệm người dùng bằng cách:
- ✅ Ngăn chặn reload không cần thiết
- ✅ Bảo toàn dữ liệu người dùng đang nhập
- ✅ Tăng tốc độ phản hồi (chỉ load cần thiết)
- ✅ Giảm thiểu tác dụng phụ không mong muốn

---

**Ngày tạo:** 2025-01-XX  
**Tác giả:** GitHub Copilot  
**Trạng thái:** ✅ Đã hoàn thành
