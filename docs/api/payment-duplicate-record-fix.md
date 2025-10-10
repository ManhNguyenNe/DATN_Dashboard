# Fix: Duplicate Medical Record Creation Issue

## 🔴 VẤN ĐỀ

Khi thanh toán thành công qua QR Code, hệ thống tạo **2 bản ghi phiếu khám** thay vì 1.

### Nguyên nhân

#### 1. Race Condition với Polling Interval

```typescript
// Luồng thời gian gây ra lỗi:
T0:  setInterval(() => checkPaymentStatus(), 5000) được tạo
T1:  Lần check thứ 1: checkPaymentStatus() được gọi
T2:  ├─ Set isCheckingRef = true
T3:  ├─ API response: payment success
T4:  ├─ Set isCompletedRef = true
T5:  ├─ cleanup() - TRY to clear interval
T6:  ├─ await createMedicalRecord() ← TẠO PHIẾU KHÁM LẦN 1
T7:  └─ finally: Set isCheckingRef = false ❌
     
T5.5: ⚠️ Interval đã được triggered (scheduled) TRƯỚC khi cleanup() clear
T8:  Lần check thứ 2: checkPaymentStatus() được gọi
T9:  ├─ Check: isCheckingRef = false (đã reset ở T7!)
T10: ├─ Check: isCompletedRef = true → SHOULD STOP HERE
T11: └─ NHƯNG nếu có timing issue → createMedicalRecord() LẦN 2 ❌
```

#### 2. Thiếu Protection trong `createMedicalRecord()`

Hàm `createMedicalRecord()` không có cơ chế ngăn chặn duplicate calls.

#### 3. Reset `isCheckingRef` trong `finally` Block

```typescript
finally {
    isCheckingRef.current = false; // ← Luôn reset, kể cả khi đã completed
}
```

Điều này tạo ra window nhỏ nơi mà check có thể được gọi lại.

---

## ✅ GIẢI PHÁP

### 1. Thêm Flag `isCreatingRecordRef`

```typescript
const isCreatingRecordRef = useRef<boolean>(false);

const createMedicalRecord = async () => {
    // PROTECTION: Ngăn chặn duplicate calls
    if (isCreatingRecordRef.current) {
        console.log('⚠️ Medical record creation already in progress - skipping duplicate call');
        return;
    }
    
    isCreatingRecordRef.current = true;
    console.log('🏥 Starting medical record creation...');
    
    try {
        // ... tạo phiếu khám
    } catch (error) {
        // ... xử lý lỗi
    }
    // Lưu ý: KHÔNG reset flag ở đây để tránh duplicate calls
};
```

### 2. Double-Check Sau Khi API Response

```typescript
const checkPaymentStatus = async () => {
    // Check lần 1: Trước khi gọi API
    if (isCheckingRef.current || isCompletedRef.current) {
        return;
    }
    
    isCheckingRef.current = true;
    const response = await paymentService.checkPaymentStatus(orderCode);
    
    // Check lần 2: SAU khi có response - tránh race condition
    if (isCompletedRef.current) {
        console.log('⚠️ Payment already completed during API call - aborting');
        return;
    }
    
    if (response.data === true) {
        // SET FLAG NGAY LẬP TỨC
        isCompletedRef.current = true;
        // ... xử lý tiếp
    }
};
```

### 3. Conditional Reset trong `finally`

```typescript
finally {
    // CHỈ reset isCheckingRef nếu CHƯA completed
    if (!isCompletedRef.current) {
        isCheckingRef.current = false;
    }
    // Nếu đã completed, giữ nguyên để tránh race condition
}
```

### 4. Reset Flag trong `handleClose()`

```typescript
const handleClose = () => {
    cleanup();
    
    // Reset TẤT CẢ flags khi đóng modal
    isCheckingRef.current = false;
    isCompletedRef.current = false;
    isCreatingRecordRef.current = false; // ← Thêm mới
    
    onHide();
};
```

### 5. Reset `isCheckingRef` trong `cleanup()`

```typescript
const cleanup = () => {
    // Clear all intervals
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
    }
    // ...
    
    // Reset checking flag khi cleanup
    isCheckingRef.current = false;
};
```

---

## 🛡️ CÁC LỚP BẢO VỆ

Sau khi fix, có **4 lớp bảo vệ** chống duplicate:

### Lớp 1: Check trước khi bắt đầu
```typescript
if (isCheckingRef.current || isCompletedRef.current) return;
```

### Lớp 2: Check sau khi API response
```typescript
if (isCompletedRef.current) return;
```

### Lớp 3: Conditional reset trong finally
```typescript
if (!isCompletedRef.current) {
    isCheckingRef.current = false;
}
```

### Lớp 4: Protection trong createMedicalRecord
```typescript
if (isCreatingRecordRef.current) return;
isCreatingRecordRef.current = true;
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU

### ❌ TRƯỚC (Có thể tạo 2 phiếu khám)

```
Lần 1: checkPaymentStatus()
  ├─ isCheckingRef = true
  ├─ API: success
  ├─ isCompletedRef = true
  ├─ cleanup()
  ├─ createMedicalRecord() ← PHIẾU 1
  └─ finally: isCheckingRef = false ❌

Lần 2: checkPaymentStatus() (từ interval đã scheduled)
  ├─ isCheckingRef = false ✓ (đã reset)
  ├─ isCompletedRef = true → Should stop
  └─ NHƯNG có thể vẫn gọi createMedicalRecord() ← PHIẾU 2 ❌
```

### ✅ SAU (Chỉ tạo 1 phiếu khám)

```
Lần 1: checkPaymentStatus()
  ├─ isCheckingRef = true
  ├─ API: success
  ├─ Check lại: isCompletedRef = false ✓
  ├─ isCompletedRef = true (SET NGAY)
  ├─ cleanup()
  ├─ createMedicalRecord()
  │   ├─ isCreatingRecordRef = true
  │   └─ Tạo phiếu khám ← PHIẾU 1 ✓
  └─ finally: KHÔNG reset vì isCompletedRef = true ✓

Lần 2: checkPaymentStatus() (từ interval đã scheduled)
  ├─ isCheckingRef = true (vẫn giữ nguyên) ✓
  ├─ isCompletedRef = true ✓
  └─ RETURN NGAY - KHÔNG làm gì cả ✓

Hoặc nếu vẫn vào được:
  ├─ Check sau API: isCompletedRef = true
  └─ RETURN - KHÔNG làm gì ✓

Hoặc nếu vẫn gọi createMedicalRecord():
  ├─ isCreatingRecordRef = true (đã set ở lần 1)
  └─ RETURN - KHÔNG tạo phiếu ✓
```

---

## 🧪 TESTING

### Test Case 1: Thanh toán thành công bình thường
- ✅ Chỉ tạo 1 phiếu khám
- ✅ Không có duplicate API calls

### Test Case 2: Multiple interval triggers cùng lúc
- ✅ Chỉ lần đầu tiên được xử lý
- ✅ Các lần sau bị block bởi flags

### Test Case 3: User đóng modal ngay sau khi thanh toán
- ✅ Flags được reset đúng cách
- ✅ Không có memory leaks

### Test Case 4: Network delay khi check payment status
- ✅ Double-check sau API response hoạt động
- ✅ Không có race condition

---

## 📝 CHÚ Ý KHI MAINTAIN

1. **KHÔNG bao giờ reset `isCreatingRecordRef` trong try/catch** - chỉ reset trong `handleClose()`
2. **Luôn check `isCompletedRef` SAU mỗi async operation** để tránh race condition
3. **Conditional reset trong finally block** là quan trọng - đừng xóa!
4. **Log rõ ràng** để dễ debug khi có vấn đề

---

## 🔗 Related Files

- `/components/payment/QRPaymentModal.tsx` - Main fix
- `/services/api.ts` - Payment service
- `/services/medicalRecordService.ts` - Medical record creation

---

## 📅 Ngày cập nhật
10/10/2025

## ✅ Status
**FIXED** - Tested and verified không còn tạo duplicate records
