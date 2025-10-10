# Fix: Missing healthPlanIds in QR Payment Creation

## 🔴 VẤN ĐỀ

Ở trang **Chi tiết phiếu khám**, khi bấm nút "Tạo mã QR" để thanh toán, request gửi đi **không có `healthPlanIds`** mà lại gửi `labOrderIds`.

### API Yêu cầu (theo docs/api/payment.md)

```json
POST /api/payments/create-link
{
  "medicalRecordId": 70,
  "healthPlanIds": [3, 10],  // ← CẦN PHẢI CÓ
  "doctorId": null,
  "totalAmount": 12345
}
```

### Code Trước Khi Fix ❌

```typescript
const handleCreateQRPayment = async () => {
    // Lấy danh sách ID KHÔNG ĐÚNG
    const pendingLabOrderIds = medicalRecord?.invoiceDetailsResponse
        ? pendingServices.map(service => service.healthPlanId).filter(...)
        : unpaidServices.map(service => service.id).filter(...);
    
    // Gửi SAI field
    const paymentRequest: PaymentLinkRequest = {
        medicalRecordId: parseInt(medicalRecordId),
        labOrderIds: pendingLabOrderIds,  // ← SAI: Gửi labOrderIds
        healthPlanIds: null,               // ← SAI: healthPlanIds = null
        doctorId: null,
        totalAmount: totalAmount
    };
};
```

### So sánh với Cash Payment (Đúng) ✅

```typescript
const handleCashPayment = async () => {
    const pendingServices = getPendingPaymentInvoiceDetails();
    
    // Lấy healthPlanIds ĐÚNG
    const healthPlanIds = pendingServices
        .map(service => service.healthPlanId)
        .filter((id): id is number => id !== null && id !== undefined);
    
    // Gửi ĐÚNG field
    const cashPaymentRequest: CashPaymentRequest = {
        medicalRecordId: parseInt(medicalRecordId),
        healthPlanIds: healthPlanIds,  // ← ĐÚNG
        totalAmount: totalAmount
    };
};
```

---

## ✅ GIẢI PHÁP

### Làm cho QR Payment giống với Cash Payment

```typescript
const handleCreateQRPayment = async () => {
    try {
        setPaymentLoading(true);
        setError(null);

        // ✅ Lấy dịch vụ cần thanh toán GIỐNG cash payment
        const pendingServices = getPendingPaymentInvoiceDetails();

        // ✅ Lấy healthPlanIds ĐÚNG
        const healthPlanIds = pendingServices
            .map(service => service.healthPlanId)
            .filter((id): id is number => id !== null && id !== undefined);

        // ✅ Validate
        if (healthPlanIds.length === 0) {
            throw new Error('Không có dịch vụ hợp lệ để thanh toán');
        }

        // ✅ Tính tổng tiền ĐÚNG
        const totalAmount = pendingServices.reduce((total, service) =>
            total + (service.healthPlanPrice - service.paid), 0
        );

        // ✅ Tạo request ĐÚNG
        const paymentRequest: PaymentLinkRequest = {
            medicalRecordId: parseInt(medicalRecordId),
            labOrderIds: null,
            healthPlanIds: healthPlanIds,  // ← ĐÚNG RỒI!
            doctorId: null,
            totalAmount: totalAmount
        };

        const response = await paymentService.createPaymentLink(paymentRequest);
        
        // ... xử lý response
    }
};
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU

### ❌ TRƯỚC

**Request gửi đi:**
```json
{
  "medicalRecordId": 102,
  "labOrderIds": [10, 15],      // ← SAI field
  "healthPlanIds": null,         // ← NULL!
  "doctorId": null,
  "totalAmount": 3000
}
```

**Vấn đề:**
- ❌ Backend không nhận được `healthPlanIds`
- ❌ Có thể gây lỗi hoặc không tính đúng dịch vụ
- ❌ Logic không thống nhất với cash payment

---

### ✅ SAU

**Request gửi đi:**
```json
{
  "medicalRecordId": 102,
  "labOrderIds": null,
  "healthPlanIds": [10, 15],     // ← ĐÚNG RỒI!
  "doctorId": null,
  "totalAmount": 3000
}
```

**Cải thiện:**
- ✅ Backend nhận được `healthPlanIds` đúng format
- ✅ Logic thống nhất với cash payment
- ✅ Đúng theo API documentation

---

## 🔍 NGUYÊN NHÂN LỖI

### 1. Copy-paste từ code cũ
Code QR payment có vẻ được copy từ một phiên bản cũ sử dụng `labOrderIds`

### 2. Logic phức tạp không cần thiết
```typescript
// Code cũ - PHỨC TẠP
const pendingLabOrderIds = medicalRecord?.invoiceDetailsResponse
    ? pendingServices.map(service => service.healthPlanId).filter(...)
    : unpaidServices.map(service => service.id).filter(...);

// Code mới - ĐƠN GIẢN
const healthPlanIds = pendingServices
    .map(service => service.healthPlanId)
    .filter((id): id is number => id !== null && id !== undefined);
```

### 3. Không nhất quán với Cash Payment
- Cash payment: Dùng `getPendingPaymentInvoiceDetails()` + `healthPlanIds` ✅
- QR payment (cũ): Logic khác, dùng `labOrderIds` ❌
- QR payment (mới): GIỐNG cash payment ✅

---

## 🎯 KẾT QUẢ

### Trước khi fix:
```typescript
// QR Payment
labOrderIds: [10, 15]
healthPlanIds: null

// Cash Payment  
healthPlanIds: [10, 15]
```

### Sau khi fix:
```typescript
// QR Payment
labOrderIds: null
healthPlanIds: [10, 15]  // ← Thống nhất rồi!

// Cash Payment
healthPlanIds: [10, 15]
```

---

## 📝 ĐIỂM CẦN LưU Ý

1. **Luôn dùng `healthPlanIds`** cho thanh toán ở chi tiết phiếu khám
2. **Logic phải thống nhất** giữa cash và QR payment
3. **Luôn lấy từ `getPendingPaymentInvoiceDetails()`** để có dữ liệu chính xác
4. **Tính tiền dựa trên** `healthPlanPrice - paid` để xử lý thanh toán một phần

---

## 🔗 Related Files

- `/components/medical-record/MedicalRecordDetail.tsx` - Main fix
- `/docs/api/payment.md` - API documentation
- `/services/api.ts` - Payment service types

---

## 📅 Ngày cập nhật
10/10/2025

## ✅ Status
**FIXED** - QR Payment now sends healthPlanIds correctly like Cash Payment
