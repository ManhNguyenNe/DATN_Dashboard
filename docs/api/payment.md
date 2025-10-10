## API Lấy qr thanh toán
**api** /api/payments/create-link
request
{
  "medicalRecordId": 70,
  "healthPlanIds": [3,10],
  "doctorId": null
  "totalAmount": 12345,
}
{
    "data": {
        "invoiceId": 132,
        "qrCode": "00020101021238570010A000000727012700069704220113VQRQAERDP55590208QRIBFTTA5303704540420005802VN62220818Thanh toan hoa don6304CA3C",
        "orderCode": 1760019747
    },
    "message": "Payment link created successfully"
}


## api thanh toán tiền mặt (khi lễ tân bấm vào thanh toán ở chi tiết)
/api/invoices/pay-cash
request
{
  "medicalRecordId": 102,
  "healthPlanIds": [
    10
  ],
  "totalAmount": 3000
}