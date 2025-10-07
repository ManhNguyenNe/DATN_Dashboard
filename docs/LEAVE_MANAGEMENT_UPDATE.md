# Cập nhật Tab Quản lý Nghỉ Phép

## Tóm tắt
Đã hoàn thiện tab quản lý nghỉ phép theo API mới với đầy đủ chức năng:
- Hiển thị danh sách lịch nghỉ phép
- Bộ lọc theo ngày và trạng thái
- Tạo mới yêu cầu nghỉ phép
- Cập nhật yêu cầu nghỉ phép
- Xóa yêu cầu nghỉ phép
- Tích chọn nhiều ca làm việc (Sáng, Chiều, Tối)

## Chi tiết các thay đổi

### 1. Types (`types/ScheduleTypes.ts`)

#### Thêm Enum LeaveStatus
```typescript
export enum LeaveStatus {
    CHO_DUYET = 'CHO_DUYET',
    DA_DUYET = 'DA_DUYET',
    TU_CHOI = 'TU_CHOI'
}
```

#### Interface LeaveRequest (Response từ API)
```typescript
export interface LeaveRequest {
    id?: number;
    doctorName?: string;
    startTime?: string; // Format: "HH:mm:ss"
    endTime?: string; // Format: "HH:mm:ss"
    submitDate?: string | null;
    reason: string;
    userApprover?: string;
    leaveStatus?: LeaveStatus;
}
```

#### Interface LeaveRequestData (Request to API)
```typescript
export interface LeaveRequestData {
    id?: number;
    doctorId?: number | null;
    day: string; // Format: "YYYY-MM-DD"
    shifts: Shift[]; // Mảng ca làm việc: ['SANG', 'CHIEU', 'TOI']
    reason: string;
    leaveStatus?: LeaveStatus;
}
```

#### Interface LeaveFilterParams
```typescript
export interface LeaveFilterParams {
    date?: string; // Format: "YYYY-MM-DD"
    status?: LeaveStatus;
}
```

### 2. Services (`services/scheduleService.ts`)

#### Các API mới được thêm vào:

**getMyLeaves** - Lấy danh sách lịch nghỉ của bác sĩ hiện tại
```typescript
getMyLeaves: async (params: LeaveFilterParams = {}): Promise<ApiResponse<LeaveRequest[]>>
```
- Endpoint: `GET /api/schedules/leave/me`
- Params: `date`, `status`

**createLeave** - Thêm lịch nghỉ mới
```typescript
createLeave: async (data: LeaveRequestData): Promise<ApiResponse<LeaveRequest>>
```
- Endpoint: `POST /api/schedules/leave`
- Body: `{ doctorId, day, shifts, reason }`

**updateLeave** - Cập nhật lịch nghỉ
```typescript
updateLeave: async (data: LeaveRequestData): Promise<ApiResponse<LeaveRequest>>
```
- Endpoint: `PUT /api/schedules/leave`
- Body: `{ id, day, shifts, reason, leaveStatus }`

**deleteLeave** - Xóa lịch nghỉ
```typescript
deleteLeave: async (id: number): Promise<ApiResponse<void>>
```
- Endpoint: `DELETE /api/schedules/leave`
- Body: `{ id }`

### 3. Component (`components/schedule/LeaveManagement.tsx`)

#### Tính năng chính:

1. **Hiển thị danh sách lịch nghỉ phép**
   - Bảng hiển thị với các cột: STT, Ngày nghỉ, Ca nghỉ, Thời gian, Lý do, Trạng thái, Người duyệt, Thao tác
   - Badge màu sắc cho trạng thái: Chờ duyệt (warning), Đã duyệt (success), Từ chối (danger)
   - Badge hiển thị ca nghỉ (Sáng, Chiều, Tối)

2. **Bộ lọc**
   - Lọc theo ngày (date picker)
   - Lọc theo trạng thái (select box)
   - Nút "Áp dụng" và "Đặt lại"
   - Toggle hiển thị/ẩn bộ lọc

3. **Form tạo/sửa yêu cầu nghỉ phép**
   - Input ngày nghỉ (date picker, không cho chọn ngày quá khứ)
   - Checkbox tích chọn ca nghỉ (Sáng, Chiều, Tối)
     - Có thể chọn nhiều ca cùng lúc
     - Validate phải chọn ít nhất 1 ca
   - Textarea lý do nghỉ phép (max 500 ký tự)
   - Hiển thị số ký tự đã nhập
   - Alert hiển thị ca đã chọn

4. **Thao tác**
   - Nút "Tạo yêu cầu nghỉ phép"
   - Nút "Sửa" (chỉ hiển thị với yêu cầu đang chờ duyệt)
   - Nút "Xóa" (disable nếu đã duyệt)
   - Confirm dialog khi xóa

5. **Xử lý dữ liệu**
   - Parse ca làm việc từ `startTime` và `endTime` của API
   - Tự động mapping:
     - Sáng: 7h-12h
     - Chiều: 12h-18h
     - Tối: 18h trở đi

6. **Loading & Error handling**
   - Spinner khi đang tải dữ liệu
   - Alert hiển thị lỗi (có thể dismiss)
   - Disable các button khi đang xử lý

## Cách sử dụng

### Component LeaveManagement
```tsx
import LeaveManagement from '@/components/schedule/LeaveManagement';

// Trong component
<LeaveManagement className="mb-4" />
```

### Gọi API trực tiếp
```typescript
import scheduleService from '@/services/scheduleService';
import { LeaveStatus } from '@/types/ScheduleTypes';

// Lấy danh sách
const leaves = await scheduleService.getMyLeaves({
    date: '2025-10-15',
    status: LeaveStatus.DA_DUYET
});

// Tạo mới
const newLeave = await scheduleService.createLeave({
    doctorId: null, // Lấy từ token
    day: '2025-10-15',
    shifts: [Shift.SANG, Shift.CHIEU],
    reason: 'Lý do nghỉ phép'
});

// Cập nhật
const updated = await scheduleService.updateLeave({
    id: 10,
    day: '2025-10-16',
    shifts: [Shift.TOI],
    reason: 'Lý do mới',
    leaveStatus: LeaveStatus.CHO_DUYET
});

// Xóa
await scheduleService.deleteLeave(10);
```

## Lưu ý quan trọng

1. **Bảo mật**: 
   - `doctorId` được set là `null` trong request, API sẽ tự động lấy từ JWT token
   - Không cần truyền thông tin bác sĩ từ frontend

2. **Validate**:
   - Ngày nghỉ không được chọn quá khứ
   - Phải chọn ít nhất 1 ca làm việc
   - Lý do không được để trống và tối đa 500 ký tự

3. **Quyền hạn**:
   - Chỉ được sửa/xóa yêu cầu đang ở trạng thái "Chờ duyệt"
   - Không được xóa yêu cầu đã được duyệt

4. **UI/UX**:
   - Không reload toàn bộ trang khi thay đổi filter
   - Chỉ refresh danh sách khi cần thiết
   - Smooth loading states

## Các file đã thay đổi

1. `/types/ScheduleTypes.ts` - Thêm interfaces và enums mới
2. `/services/scheduleService.ts` - Thêm 4 API functions
3. `/components/schedule/LeaveManagement.tsx` - Hoàn toàn mới

## Checklist hoàn thành

- [x] Cập nhật ScheduleTypes với các interface mới
- [x] Cập nhật scheduleService với các API nghỉ phép
- [x] Hoàn thiện LeaveManagement component
- [x] Bộ lọc ngày và trạng thái
- [x] Tích chọn ca làm việc (Sáng, Chiều, Tối)
- [x] Hiển thị thông tin chi tiết theo API mới
- [x] CRUD operations hoàn chỉnh
- [x] Error handling và loading states
- [x] Validate form đầy đủ
