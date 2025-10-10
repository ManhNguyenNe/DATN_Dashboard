# Cập nhật Sử dụng OrderCode cho Kiểm tra Trạng thái Thanh toán

## Tổng quan
Cập nhật hệ thống thanh toán để sử dụng `orderCode` thay vì `invoiceId` khi kiểm tra trạng thái thanh toán qua API `/api/payments/status/{orderCode}`.

## Thay đổi chi tiết

### 1. Services Layer (`/services/api.ts`)

#### Interface PaymentLinkResponse
```typescript
export interface PaymentLinkResponse {
  invoiceId: number;
  qrCode: string;
  orderCode: number;  // ✨ Thêm mới
}
```

#### Function checkPaymentStatus
```typescript
// Thay đổi từ invoiceId sang orderCode
checkPaymentStatus: async (orderCode: number): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiClient.get<PaymentStatusResponse>(`/api/payments/status/${orderCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}
```

### 2. QRPaymentModal Component (`/components/payment/QRPaymentModal.tsx`)

#### Props Interface
```typescript
interface QRPaymentModalProps {
    show: boolean;
    onHide: () => void;
    qrCodeData: string;
    invoiceId: number;
    orderCode: number;  // ✨ Thêm mới
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
    medicalRecordData?: {
        patientId: number;
        doctorId?: number | undefined;
        healthPlanId?: number | undefined;
        symptoms: string;
    };
}
```

#### Sử dụng orderCode
- Trong `startPaymentStatusChecking()`: Log với orderCode
- Trong `checkPaymentStatus()`: Gọi API với orderCode

```typescript
console.log('🚀 Starting payment status polling for orderCode:', orderCode);
const response: PaymentStatusResponse = await paymentService.checkPaymentStatus(orderCode);
```

### 3. MedicalRecordForm Component (`/components/appointment/MedicalRecordForm.tsx`)

#### State paymentData
```typescript
const [paymentData, setPaymentData] = useState<{
    invoiceId: number;
    qrCode: string;
    orderCode: number;  // ✨ Thêm mới
} | null>(null);
```

#### Lưu orderCode từ API response
```typescript
setPaymentData({
    invoiceId: response.data.invoiceId,
    qrCode: response.data.qrCode,
    orderCode: response.data.orderCode  // ✨ Thêm mới
});
```

#### Truyền orderCode vào QRPaymentModal
```tsx
<QRPaymentModal
    show={showPaymentModal}
    onHide={handlePaymentModalClose}
    qrCodeData={paymentData.qrCode}
    invoiceId={paymentData.invoiceId}
    orderCode={paymentData.orderCode}  {/* ✨ Thêm mới */}
    onPaymentSuccess={handlePaymentSuccess}
    onPaymentError={handlePaymentError}
    medicalRecordData={{...}}
/>
```

### 4. MedicalRecordDetail Component (`/components/medical-record/MedicalRecordDetail.tsx`)

#### Interface PaymentData
```typescript
interface PaymentData {
    invoiceId: number;
    qrCode: string;
    orderCode: number;  // ✨ Thêm mới
}
```

#### Lưu orderCode từ API response
```typescript
setPaymentData({
    invoiceId: response.data.invoiceId,
    qrCode: response.data.qrCode,
    orderCode: response.data.orderCode  // ✨ Thêm mới
});
```

#### Truyền orderCode vào QRPaymentModal
```tsx
<QRPaymentModal
    show={showPaymentModal}
    onHide={handlePaymentModalClose}
    qrCodeData={paymentData.qrCode}
    invoiceId={paymentData.invoiceId}
    orderCode={paymentData.orderCode}  {/* ✨ Thêm mới */}
    onPaymentSuccess={handlePaymentSuccess}
    onPaymentError={handlePaymentError}
/>
```

## Luồng hoạt động

1. **Tạo QR Code**: Người dùng bấm nút "Tạo QR Code"
2. **API Response**: API trả về `invoiceId`, `qrCode` và `orderCode`
3. **Lưu Data**: Component lưu cả 3 giá trị vào state `paymentData`
4. **Hiển thị Modal**: QRPaymentModal nhận `orderCode` qua props
5. **Kiểm tra trạng thái**: Modal sử dụng `orderCode` để gọi API `/api/payments/status/{orderCode}`
6. **Polling**: Mỗi 5 giây, hệ thống tự động kiểm tra trạng thái thanh toán bằng `orderCode`
7. **Thành công**: Khi thanh toán thành công, modal tự động tạo phiếu khám (nếu có dữ liệu)

## API Endpoint

### Kiểm tra trạng thái thanh toán
```
GET /api/payments/status/{orderCode}
```

**Response:**
```json
{
  "data": true,  // true nếu đã thanh toán, false nếu chưa
  "message": "Payment status message"
}
```

## Lợi ích

- ✅ **Chính xác hơn**: Sử dụng `orderCode` theo đúng thiết kế API của backend
- ✅ **Đồng nhất**: Tất cả nơi kiểm tra trạng thái đều dùng `orderCode`
- ✅ **Dễ debug**: Log rõ ràng với `orderCode` thay vì `invoiceId`
- ✅ **Type-safe**: TypeScript đảm bảo orderCode được truyền đầy đủ

## Ngày cập nhật
10/10/2025
