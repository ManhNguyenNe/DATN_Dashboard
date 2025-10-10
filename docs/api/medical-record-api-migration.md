# Migration: Medical Record API Structure Update

## 🔄 THAY ĐỔI CẤU TRÚC API

API chi tiết phiếu khám (`GET /api/medical-record/{id}`) đã thay đổi cấu trúc response từ `labOrdersResponses` sang `invoiceDetailsResponse` với nested structure.

---

## 📊 SO SÁNH CẤU TRÚC

### ❌ CẤU TRÚC CŨ (labOrdersResponses)

```json
{
  "data": {
    "id": "85",
    "code": "PK1759562038",
    "symptoms": "Ỉa chẻ cấp độ 7",
    "labOrdersResponses": [
      {
        "id": 136,
        "code": "XN1759562038334",
        "healthPlanId": 1,
        "healthPlanName": "khám bệnh",
        "room": "Phòng khám Nội tổng quát - 101A",
        "doctorPerformed": "tien",
        "status": "CHO_THUC_HIEN",
        "statusPayment": "DA_THANH_TOAN",
        "price": 5000,
        "orderDate": "2025-10-04T14:13:58"
      }
    ]
  }
}
```

**Đặc điểm:**
- Flat structure - mỗi labOrder là 1 dịch vụ
- Thông tin thanh toán: `statusPayment`, `price`
- Thông tin phòng: `room`
- Không phân biệt dịch vụ đơn lẻ vs gói dịch vụ

---

### ✅ CẤU TRÚC MỚI (invoiceDetailsResponse)

```json
{
  "data": {
    "id": "111",
    "code": "PK1760023951",
    "symptoms": "Không có triệu chứng",
    "healthPlanId": 10,
    "healthPlanName": "GOI DICH VU SIEU CAP VU TRU",
    "total": 5000,
    "paid": 5000,
    "invoiceDetailsResponse": [
      {
        "id": 256,
        "healthPlanId": 10,
        "healthPlanName": "GOI DICH VU SIEU CAP VU TRU",
        "healthPlanPrice": 5000,
        "paid": 5000,
        "status": "DA_THANH_TOAN",
        "typeService": "MULTIPLE",
        "multipleLab": [
          {
            "id": 211,
            "code": "XN1760023951841",
            "name": "khám bệnh",
            "doctorPerforming": "tien",
            "createdAt": "2025-10-09T22:32:32",
            "status": "CHO_THUC_HIEN"
          },
          {
            "id": 212,
            "code": "XN1760023951849",
            "name": "Xét nghiệm công thức máu",
            "doctorPerforming": null,
            "createdAt": "2025-10-09T22:32:32",
            "status": "CHO_THUC_HIEN"
          }
        ],
        "singleLab": null
      }
    ]
  }
}
```

**Đặc điểm:**
- Nested structure - `invoiceDetailsResponse` → `multipleLab` / `singleLab`
- Phân biệt rõ: `typeService` = `SINGLE` hoặc `MULTIPLE`
- Gói dịch vụ (`MULTIPLE`): Có nhiều lab con trong `multipleLab[]`
- Dịch vụ đơn (`SINGLE`): Có 1 lab trong `singleLab`
- Thông tin thanh toán ở level invoice, không ở level lab
- Không có field `room` - cần xử lý khác

---

## 🔧 CÁC THAY ĐỔI CODE

### 1. Cập Nhật Type Definition

#### File: `/types/MedicalServiceType.ts`

```typescript
export interface AppointmentService {
    id: number | null;
    serviceId: number;
    serviceName: string;
    price: number;
    status: 'CHO_THANH_TOAN' | 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'HUY';
    paymentDate?: string;
    orderDate?: string;
    room?: string;
    result?: string;
    notes?: string;
    assignedDoctor?: string;
    reason?: string;
    executionStatus?: 'CHO_THUC_HIEN' | 'DANG_THUC_HIEN' | 'HOAN_THANH' | 'HUY';
    serviceParent?: string; // ← THÊM MỚI: Tên gói dịch vụ
}
```

---

### 2. Cập Nhật Logic Parse Data

#### File: `/app/(dashboard)/bac-si/kham-benh/[id]/page.tsx`

```typescript
// ✅ CODE MỚI - Parse invoiceDetailsResponse
const services: AppointmentService[] = [];

if (record.invoiceDetailsResponse) {
    record.invoiceDetailsResponse.forEach((invoice) => {
        const paymentStatus = invoice.status === 'DA_THANH_TOAN' 
            ? ServiceStatus.DA_THANH_TOAN 
            : ServiceStatus.CHO_THANH_TOAN;

        // Xử lý MULTIPLE services (gói dịch vụ)
        if (invoice.typeService === 'MULTIPLE' && invoice.multipleLab) {
            invoice.multipleLab.forEach((lab) => {
                services.push({
                    id: lab.id,
                    serviceId: invoice.healthPlanId,
                    serviceName: lab.name || invoice.healthPlanName,
                    price: invoice.healthPlanPrice / invoice.multipleLab!.length,
                    status: paymentStatus,
                    paymentDate: invoice.status === 'DA_THANH_TOAN' ? record.date : undefined,
                    orderDate: lab.createdAt || undefined,
                    room: '', // Không có trong API mới
                    assignedDoctor: lab.doctorPerforming || 'Chưa phân công',
                    reason: '',
                    executionStatus: lab.status,
                    serviceParent: invoice.healthPlanName // ← Lưu tên gói
                });
            });
        }
        
        // Xử lý SINGLE service (dịch vụ đơn lẻ)
        else if (invoice.typeService === 'SINGLE' && invoice.singleLab) {
            const lab = invoice.singleLab;
            services.push({
                id: lab.id,
                serviceId: invoice.healthPlanId,
                serviceName: lab.name || invoice.healthPlanName,
                price: invoice.healthPlanPrice,
                status: paymentStatus,
                paymentDate: invoice.status === 'DA_THANH_TOAN' ? record.date : undefined,
                orderDate: lab.createdAt || undefined,
                room: '',
                assignedDoctor: lab.doctorPerforming || 'Chưa phân công',
                reason: '',
                executionStatus: lab.status
            });
        }
    });
}
// Fallback cho backward compatibility
else if (record.labOrdersResponses) {
    // ... xử lý cấu trúc cũ
}
```

---

### 3. Cập Nhật UI Hiển Thị

#### Hiển thị thông tin gói dịch vụ

```tsx
<td>
    <div>
        <div>{service.serviceName}</div>
        {service.serviceParent && (
            <small className="text-muted fst-italic">
                <i className="bi bi-box-seam me-1"></i>
                Thuộc gói: {service.serviceParent}
            </small>
        )}
    </div>
</td>
```

**Kết quả hiển thị:**
```
Xét nghiệm công thức máu
  📦 Thuộc gói: GOI DICH VU SIEU CAP VU TRU
```

---

## 🔍 ĐIỂM QUAN TRỌNG

### 1. Xử Lý Giá Dịch Vụ

**Vấn đề:** API mới không có `price` riêng cho từng lab con

**Giải pháp:**
```typescript
// Chia đều giá gói cho các dịch vụ con
price: invoice.healthPlanPrice / invoice.multipleLab!.length
```

**Lưu ý:** Đây là cách tính đơn giản. Nếu backend cung cấp giá riêng cho từng lab, cần cập nhật lại.

---

### 2. Trạng Thái Thanh Toán

**Cũ:**
```typescript
statusPayment: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN'
```

**Mới:**
```typescript
status: 'DA_THANH_TOAN' | 'CHUA_THANH_TOAN' | 'THANH_TOAN_MOT_PHAN'
```

→ Field name thay đổi từ `statusPayment` sang `status`

---

### 3. Thông Tin Phòng

**Cũ:**
```typescript
room: "Phòng khám Nội tổng quát - 101A"
```

**Mới:**
```typescript
room: "" // Không có trong API mới
```

**Giải pháp tạm thời:** Set empty string
**Giải pháp lâu dài:** Yêu cầu backend bổ sung field `room` vào `multipleLab` và `singleLab`

---

### 4. Ngày Chỉ Định

**Cũ:**
```typescript
orderDate: "2025-10-04T14:13:58"
```

**Mới:**
```typescript
createdAt: "2025-10-09T22:32:32" // Trong multipleLab/singleLab
```

→ Field name thay đổi từ `orderDate` sang `createdAt`

---

## 📋 MAPPING FIELDS

| Cũ (labOrdersResponses) | Mới (invoiceDetailsResponse) | Ghi chú |
|-------------------------|------------------------------|---------|
| `id` | `multipleLab[].id` hoặc `singleLab.id` | ID của lab |
| `healthPlanId` | `healthPlanId` | Ở level invoice |
| `healthPlanName` | `healthPlanName` hoặc `multipleLab[].name` | |
| `room` | N/A | ❌ Không có trong API mới |
| `doctorPerformed` | `multipleLab[].doctorPerforming` | Typo: "Performing" |
| `status` | `multipleLab[].status` | Trạng thái thực hiện |
| `statusPayment` | `status` (ở level invoice) | Field name khác |
| `price` | `healthPlanPrice` | Ở level invoice |
| `orderDate` | `createdAt` | Field name khác |

---

## 🎯 KẾT QUẢ

### Trước Khi Migration

```
❌ Parse labOrdersResponses - Flat structure
❌ Không phân biệt dịch vụ đơn vs gói
❌ Không biết dịch vụ nào thuộc gói nào
```

### Sau Khi Migration

```
✅ Parse invoiceDetailsResponse - Nested structure
✅ Phân biệt SINGLE vs MULTIPLE service
✅ Hiển thị tên gói cho dịch vụ con
✅ Backward compatible với cấu trúc cũ
✅ UI hiển thị rõ ràng hơn
```

---

## 🧪 TESTING CHECKLIST

- [ ] Test với gói dịch vụ (`MULTIPLE`)
  - [ ] Hiển thị đủ tất cả dịch vụ con
  - [ ] Hiển thị tên gói ở mỗi dịch vụ con
  - [ ] Trạng thái thanh toán đúng
  - [ ] Trạng thái thực hiện đúng

- [ ] Test với dịch vụ đơn lẻ (`SINGLE`)
  - [ ] Hiển thị đúng thông tin
  - [ ] Không hiển thị thông tin gói

- [ ] Test backward compatibility
  - [ ] Vẫn hoạt động với `labOrdersResponses` (nếu có)

- [ ] Test edge cases
  - [ ] Không có dịch vụ nào
  - [ ] `invoiceDetailsResponse` = null
  - [ ] `multipleLab` = null hoặc empty array

---

## ⚠️ LƯU Ý

### 1. Backward Compatibility

Code hiện tại có fallback để hỗ trợ cả 2 cấu trúc:
```typescript
if (record.invoiceDetailsResponse) {
    // Parse cấu trúc mới
} else if (record.labOrdersResponses) {
    // Parse cấu trúc cũ
}
```

### 2. Thiếu Thông Tin Room

API mới không có field `room`. Cần:
- [ ] Yêu cầu backend thêm field này
- [ ] Hoặc lấy từ nguồn khác (service detail API)

### 3. Tính Giá Dịch vụ Con

Hiện tại chia đều giá gói cho các dịch vụ con. Nếu backend có giá riêng, cần cập nhật.

---

## 🔗 Related Files

### Modified
- `/app/(dashboard)/bac-si/kham-benh/[id]/page.tsx` - Logic parse data mới
- `/types/MedicalServiceType.ts` - Thêm field `serviceParent`

### Related
- `/services/medicalRecordService.ts` - Interface definitions
- `/docs/api/medical-record.md` - API documentation

---

## 📅 Ngày cập nhật
10/10/2025

## ✅ Status
**MIGRATED** - Code đã được cập nhật để hỗ trợ cấu trúc API mới với backward compatibility
