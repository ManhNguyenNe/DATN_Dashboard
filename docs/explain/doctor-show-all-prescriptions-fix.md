# Fix: Hiển thị Tất Cả Chỉ Định Trong Khám Bệnh (Bác Sĩ)

## 🔴 VẤN ĐỀ

Ở trang **Dashboard Bác Sĩ** → **Khám bệnh** → Khi bấm vào một phiếu khám:
- ❌ Chỉ hiển thị các chỉ định **đã thanh toán**
- ❌ Các chỉ định **chưa thanh toán** bị ẩn
- ❌ Bác sĩ không thấy được toàn bộ chỉ định của bệnh nhân

### Yêu Cầu
Hiển thị **TẤT CẢ** chỉ định (cả đã thanh toán và chưa thanh toán) để bác sĩ có cái nhìn toàn diện về tình trạng bệnh nhân.

---

## ✅ GIẢI PHÁP

### 1. Xóa Filter Chỉ Hiển Thị Đã Thanh Toán

#### ❌ Code Cũ (Chỉ lấy đã thanh toán)

```typescript
const services: AppointmentService[] = record.labOrdersResponses
    .filter(labOrder => labOrder.statusPayment === 'DA_THANH_TOAN') // ← Lọc
    .map((labOrder) => ({
        id: labOrder.id,
        serviceName: labOrder.healthPlanName,
        status: ServiceStatus.DA_THANH_TOAN, // Luôn là đã thanh toán
        // ...
    }));
```

**Vấn đề:**
- Filter loại bỏ tất cả chỉ định chưa thanh toán
- Bác sĩ không biết có chỉ định nào chưa được thanh toán

---

#### ✅ Code Mới (Lấy tất cả)

```typescript
const services: AppointmentService[] = (record.labOrdersResponses || [])
    .map((labOrder) => {
        // Xác định trạng thái thanh toán động
        const paymentStatus = labOrder.statusPayment === 'DA_THANH_TOAN' 
            ? ServiceStatus.DA_THANH_TOAN 
            : ServiceStatus.CHO_THANH_TOAN;
        
        return {
            id: labOrder.id,
            serviceId: labOrder.healthPlanId,
            serviceName: labOrder.healthPlanName,
            price: labOrder.price,
            status: paymentStatus, // ← Có thể là ĐÃ hoặc CHỜ thanh toán
            paymentDate: labOrder.statusPayment === 'DA_THANH_TOAN' ? record.date : undefined,
            orderDate: labOrder.orderDate || undefined,
            room: labOrder.room || '',
            assignedDoctor: labOrder.doctorPerformed || 'Chưa phân công',
            reason: labOrder.diagnosis || '',
            executionStatus: labOrder.status
        };
    });
```

**Cải thiện:**
- ✅ Không filter → Lấy tất cả chỉ định
- ✅ Xác định `status` động dựa trên `statusPayment`
- ✅ Hiển thị đầy đủ thông tin cho bác sĩ

---

### 2. Thêm Cột Trạng Thái Thanh Toán

#### ❌ UI Cũ (Không phân biệt trạng thái thanh toán)

```tsx
<thead>
    <tr>
        <th>STT</th>
        <th>Tên dịch vụ</th>
        <th>Bác sĩ thực hiện</th>
        <th>Phòng chỉ định</th>
        <th>Trạng thái chỉ định</th>  {/* Chỉ có trạng thái thực hiện */}
        <th>Ngày chỉ định</th>
        <th>Thao tác</th>
    </tr>
</thead>
```

**Vấn đề:**
- Không biết chỉ định nào đã thanh toán, chưa thanh toán
- Gây nhầm lẫn khi có chỉ định chưa thanh toán

---

#### ✅ UI Mới (Hiển thị cả 2 trạng thái)

```tsx
<thead>
    <tr>
        <th>STT</th>
        <th>Tên dịch vụ</th>
        <th>Bác sĩ thực hiện</th>
        <th>Phòng chỉ định</th>
        <th>TT Thanh toán</th>      {/* ← MỚI: Trạng thái thanh toán */}
        <th>TT Thực hiện</th>        {/* ← Trạng thái thực hiện */}
        <th>Ngày chỉ định</th>
        <th>Thao tác</th>
    </tr>
</thead>

<tbody>
    {paidServices.map((service, index) => (
        <tr key={service.id}>
            {/* ... các cột khác ... */}
            
            {/* Trạng thái thanh toán */}
            <td>
                <Badge bg={service.status === ServiceStatus.DA_THANH_TOAN ? 'success' : 'warning'}>
                    {service.status === ServiceStatus.DA_THANH_TOAN ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </Badge>
            </td>
            
            {/* Trạng thái thực hiện */}
            <td>
                <Badge bg={
                    service.executionStatus === 'HOAN_THANH' ? 'success' :
                    service.executionStatus === 'DANG_THUC_HIEN' ? 'warning' :
                    service.executionStatus === 'HUY' ? 'danger' : 'secondary'
                }>
                    {service.executionStatus === 'CHO_THUC_HIEN' ? 'Chờ thực hiện' :
                     service.executionStatus === 'DANG_THUC_HIEN' ? 'Đang thực hiện' :
                     service.executionStatus === 'HOAN_THANH' ? 'Hoàn thành' :
                     service.executionStatus === 'HUY' ? 'Hủy' : 'Chưa xác định'}
                </Badge>
            </td>
            
            {/* ... các cột khác ... */}
        </tr>
    ))}
</tbody>
```

**Cải thiện:**
- ✅ Phân biệt rõ 2 loại trạng thái
- ✅ Badge màu khác nhau:
  - **Xanh lá**: Đã thanh toán / Hoàn thành
  - **Vàng**: Chờ thanh toán / Đang thực hiện
  - **Xám**: Chờ thực hiện
  - **Đỏ**: Hủy
- ✅ Dễ nhận biết trạng thái một cách trực quan

---

### 3. Cập Nhật Tiêu Đề Phần Dịch Vụ

#### ❌ Tiêu đề cũ

```tsx
<h6>
    Dịch vụ đã thanh toán trong lần khám
    <Badge bg="success">{paidServices.length} dịch vụ</Badge>
</h6>
```

**Vấn đề:**
- Gây hiểu nhầm là chỉ có dịch vụ đã thanh toán
- Badge màu xanh không phù hợp khi có dịch vụ chưa thanh toán

---

#### ✅ Tiêu đề mới

```tsx
<h6>
    Danh sách chỉ định trong lần khám
    <Badge bg="primary">{paidServices.length} chỉ định</Badge>
</h6>
```

**Cải thiện:**
- ✅ Tên trung lập, không gây hiểu nhầm
- ✅ Badge màu xanh dương (primary) phù hợp hơn
- ✅ Dùng từ "chỉ định" thay vì "dịch vụ" chuẩn y khoa hơn

---

## 📊 SO SÁNH TRƯỚC VÀ SAU

### ❌ TRƯỚC

**Dữ liệu Backend:**
```json
{
  "labOrdersResponses": [
    { "id": 1, "healthPlanName": "Xét nghiệm máu", "statusPayment": "DA_THANH_TOAN" },
    { "id": 2, "healthPlanName": "X-Quang", "statusPayment": "CHO_THANH_TOAN" },
    { "id": 3, "healthPlanName": "Siêu âm", "statusPayment": "DA_THANH_TOAN" }
  ]
}
```

**UI Hiển thị:**
| STT | Tên dịch vụ | Trạng thái |
|-----|-------------|------------|
| 1 | Xét nghiệm máu | Chờ thực hiện |
| 2 | Siêu âm | Chờ thực hiện |

❌ **X-Quang bị ẩn vì chưa thanh toán!**

---

### ✅ SAU

**Dữ liệu Backend:** (Giống trên)

**UI Hiển thị:**
| STT | Tên dịch vụ | TT Thanh toán | TT Thực hiện |
|-----|-------------|---------------|--------------|
| 1 | Xét nghiệm máu | ✅ Đã thanh toán | ⏳ Chờ thực hiện |
| 2 | X-Quang | ⚠️ Chờ thanh toán | ⏳ Chờ thực hiện |
| 3 | Siêu âm | ✅ Đã thanh toán | ⏳ Chờ thực hiện |

✅ **Hiển thị đầy đủ 3 chỉ định với trạng thái rõ ràng!**

---

## 🎯 LỢI ÍCH

### Cho Bác Sĩ:
1. ✅ **Thấy toàn bộ chỉ định** - Cả đã thanh toán và chưa thanh toán
2. ✅ **Biết được tình trạng** - Phân biệt rõ chỉ định nào đã thanh toán
3. ✅ **Quyết định chính xác** - Dựa trên đầy đủ thông tin
4. ✅ **Tư vấn bệnh nhân** - Nhắc nhở thanh toán các chỉ định còn thiếu

### Cho Hệ Thống:
1. ✅ **Dữ liệu đầy đủ** - Không bỏ sót thông tin
2. ✅ **Logic đơn giản** - Bỏ filter phức tạp
3. ✅ **Dễ maintain** - Code rõ ràng hơn
4. ✅ **Tránh bug** - Giảm thiểu logic điều kiện

---

## 🔍 CÁC TRƯỜNG HỢP SỬ DỤNG

### Case 1: Bệnh nhân chưa thanh toán tất cả
```
Tình huống: Bệnh nhân được chỉ định 3 dịch vụ, mới thanh toán 1

Trước: Bác sĩ chỉ thấy 1 dịch vụ ❌
Sau:   Bác sĩ thấy cả 3 dịch vụ với trạng thái rõ ràng ✅
```

### Case 2: Bệnh nhân thanh toán từng phần
```
Tình huống: Thanh toán dần từng dịch vụ

Trước: Danh sách liên tục thay đổi, khó theo dõi ❌
Sau:   Danh sách cố định, chỉ badge thay đổi ✅
```

### Case 3: Cần nhắc nhở bệnh nhân
```
Tình huống: Bác sĩ muốn nhắc bệnh nhân thanh toán

Trước: Không biết còn dịch vụ nào chưa thanh toán ❌
Sau:   Thấy ngay với badge "Chờ thanh toán" màu vàng ✅
```

---

## 📝 ĐIỂM LƯU Ý

### 1. Tên Biến
- Tên biến `paidServices` vẫn giữ nguyên vì đã được sử dụng nhiều nơi
- Nhưng thực tế bây giờ chứa TẤT CẢ services (cả đã và chưa thanh toán)
- Có thể refactor thành `allServices` trong tương lai

### 2. Logic Xác Định Status
```typescript
const paymentStatus = labOrder.statusPayment === 'DA_THANH_TOAN' 
    ? ServiceStatus.DA_THANH_TOAN 
    : ServiceStatus.CHO_THANH_TOAN;
```
- Dựa vào `statusPayment` từ backend
- Mapping sang enum `ServiceStatus` của frontend

### 3. Hiển Thị paymentDate
```typescript
paymentDate: labOrder.statusPayment === 'DA_THANH_TOAN' ? record.date : undefined
```
- Chỉ set `paymentDate` khi đã thanh toán
- Tránh hiển thị ngày không chính xác

---

## 🔗 Related Files

- `/app/(dashboard)/bac-si/kham-benh/[id]/page.tsx` - Main fix
- `/types/MedicalServiceType.ts` - ServiceStatus enum
- `/services/medicalRecordService.ts` - API interface

---

## 📅 Ngày cập nhật
10/10/2025

## ✅ Status
**FIXED** - Bác sĩ hiện có thể xem tất cả chỉ định (cả đã và chưa thanh toán) với trạng thái rõ ràng
