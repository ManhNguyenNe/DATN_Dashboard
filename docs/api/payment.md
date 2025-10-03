## API Lấy qr thanh toán
**api** /api/payments/create-link
request
{
  "medicalRecordId": 70,
  "labOrderIds": [
    11,12,13,14
  ],
  "healthPlanIds": null,
  "doctorId": null
  "totalAmount": 0,

}
response
{
    "data": {
        "invoiceId": null,
        "qrCode": "00020101021238570010A000000727012700069704220113VQRQAENYI05290208QRIBFTTA53037045405100005802VN62160812TT70111213146304EC4E"
    },
    "message": "Payment link created successfully"
}