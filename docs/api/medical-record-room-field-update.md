# Update: Add Room Field to Medical Record API Response

## 🎉 CẬP NHẬT API

API chi tiết phiếu khám (`GET /api/medical-record/{id}`) đã được cập nhật, thêm field `room` vào `multipleLab` và `singleLab`.

---

## 📊 THAY ĐỔI CẤU TRÚC API

### ❌ TRƯỚC (Không có field room)

```json
{
  "multipleLab": [
    {
      "id": 211,
      "code": "XN1760023951841",
      "name": "khám bệnh",
      "doctorPerforming": "tien",
      "createdAt": "2025-10-09T22:32:32",
      "status": "CHO_THUC_HIEN"
    }
  ]
}
```

---

### ✅ SAU (Có field room)

```json
{
  "multipleLab": [
    {
      "id": 211,
      "code": "XN1760023951841",
      "name": "khám bệnh",
      "doctorPerforming": "tien",
      "room": "Phòng khám Nội tổng quát - 101A",  // ← MỚI
      "createdAt": "2025-10-09T22:32:32",
      "status": "CHO_THUC_HIEN"
    },
    {
      "id": 212,
      "code": "XN1760023951849",
      "name": "Xét nghiệm công thức máu",
      "doctorPerforming": null,
      "room": "Phòng khám Nội tổng quát - 101A",  // ← MỚI
      "createdAt": "2025-10-09T22:32:32",
      "status": "CHO_THUC_HIEN"
    }
  ]
}
```

---

## 🔧 CÁC THAY ĐỔI CODE

### 1. Cập Nhật Type Definitions

#### File: `/services/medicalRecordService.ts`

**Thêm field `room` vào cả `SingleLabResponse` và `MultipleLabResponse`:**

```typescript
// Interface cho Single Lab trong Invoice Details
export interface SingleLabResponse {
  id: number;
  code: string;
  name?: string;
  doctorPerforming: string | null;
  room?: string; // ← THÊM MỚI: Phòng thực hiện dịch vụ
  createdAt: string;
  status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
}

// Interface cho Multiple Lab trong Invoice Details
export interface MultipleLabResponse {
  id: number;
  code: string;
  name?: string;
  doctorPerforming: string | null;
  room?: string; // ← THÊM MỚI: Phòng thực hiện dịch vụ
  createdAt: string;
  status: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
}
```

---

### 2. Cập Nhật Logic Parse Data

#### File: `/app/(dashboard)/bac-si/kham-benh/[id]/page.tsx`

**TRƯỚC (Set empty string):**
```typescript
// Xử lý MULTIPLE services
if (invoice.typeService === 'MULTIPLE' && invoice.multipleLab) {
    invoice.multipleLab.forEach((lab) => {
        services.push({
            // ...
            room: '', // ❌ Không có thông tin phòng trong API mới
            // ...
        });
    });
}

// Xử lý SINGLE service
else if (invoice.typeService === 'SINGLE' && invoice.singleLab) {
    const lab = invoice.singleLab;
    services.push({
        // ...
        room: '', // ❌ Không có thông tin phòng trong API mới
        // ...
    });
}
```

---

**SAU (Lấy từ API):**
```typescript
// Xử lý MULTIPLE services
if (invoice.typeService === 'MULTIPLE' && invoice.multipleLab) {
    invoice.multipleLab.forEach((lab) => {
        services.push({
            // ...
            room: lab.room || '', // ✅ Lấy thông tin phòng từ lab
            // ...
        });
    });
}

// Xử lý SINGLE service
else if (invoice.typeService === 'SINGLE' && invoice.singleLab) {
    const lab = invoice.singleLab;
    services.push({
        // ...
        room: lab.room || '', // ✅ Lấy thông tin phòng từ lab
        // ...
    });
}
```

---

## 📊 SO SÁNH KẾT QUẢ

### ❌ TRƯỚC (UI hiển thị "Chưa xác định")

| STT | Tên dịch vụ | Phòng chỉ định |
|-----|-------------|----------------|
| 1 | khám bệnh | *Chưa xác định* |
| 2 | Xét nghiệm công thức máu | *Chưa xác định* |
| 3 | Nội soi dạ dày | *Chưa xác định* |

---

### ✅ SAU (UI hiển thị phòng chính xác)

| STT | Tên dịch vụ | Phòng chỉ định |
|-----|-------------|----------------|
| 1 | khám bệnh | Phòng khám Nội tổng quát - 101A |
| 2 | Xét nghiệm công thức máu | Phòng khám Nội tổng quát - 101A |
| 3 | Nội soi dạ dày | Phòng khám Ngoại chấn thương - 102A |

---

## 🎯 LỢI ÍCH

### Cho Bác Sĩ:
1. ✅ **Biết rõ phòng thực hiện** - Không còn hiển thị "Chưa xác định"
2. ✅ **Hướng dẫn bệnh nhân** - Có thể chỉ đường chính xác
3. ✅ **Phân bổ công việc** - Biết dịch vụ nào ở phòng nào

### Cho Hệ Thống:
1. ✅ **Dữ liệu đầy đủ** - Thông tin phòng được lưu trữ đúng
2. ✅ **Tích hợp tốt hơn** - Có thể kết nối với hệ thống quản lý phòng
3. ✅ **Báo cáo chính xác** - Thống kê theo phòng ban

---

## 🔍 CHI TIẾT FIELD `room`

### Định dạng
```
"Phòng khám [Chuyên khoa] - [Mã phòng]"
```

### Ví dụ:
- `"Phòng khám Nội tổng quát - 101A"`
- `"Phòng khám Ngoại chấn thương - 102A"`
- `"Phòng khám Nhi khoa - 103A"`
- `"Phòng khám Sản phụ khoa - 104A"`

### Xử lý edge cases:
```typescript
room: lab.room || '' // Nếu null/undefined → empty string
```

**Hiển thị UI:**
```tsx
{service.room && service.room.trim() !== '' ?
    service.room :
    <span className="text-muted fst-italic">Chưa xác định</span>
}
```

---

## 📝 CHECKLIST MIGRATION

- [x] Thêm field `room` vào `SingleLabResponse`
- [x] Thêm field `room` vào `MultipleLabResponse`
- [x] Cập nhật logic parse MULTIPLE services
- [x] Cập nhật logic parse SINGLE services
- [x] Test hiển thị UI với data có room
- [x] Test hiển thị UI với data không có room (fallback)
- [x] Verify không có TypeScript errors
- [x] Verify không có runtime errors

---

## ⚠️ LƯU Ý

### 1. Optional Field
Field `room` được define là optional (`room?: string`) vì:
- Có thể null từ API
- Backward compatibility với data cũ
- Fallback an toàn với empty string

### 2. Fallback Display
Vẫn giữ logic hiển thị "Chưa xác định" nếu:
- `room` = null
- `room` = undefined  
- `room` = empty string

### 3. Consistency
Format của field `room` phải nhất quán giữa:
- `multipleLab[].room`
- `singleLab.room`
- `labOrdersResponses[].room` (cấu trúc cũ)

---

## 🔗 Related Changes

### Modified Files:
1. `/services/medicalRecordService.ts` - Type definitions
2. `/app/(dashboard)/bac-si/kham-benh/[id]/page.tsx` - Parse logic

### Related Files:
3. `/docs/api/medical-record.md` - API documentation (đã cập nhật)
4. `/docs/api/medical-record-api-migration.md` - Migration guide (cần cập nhật)

---

## 📅 Ngày cập nhật
10/10/2025

## ✅ Status
**UPDATED** - Field `room` đã được thêm vào API và code đã được cập nhật để sử dụng field này
