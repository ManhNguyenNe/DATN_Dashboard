## GET - lấy danh sách phiếu khám 
- **api** api/medical-record?date=2025-09-13&keyword=PK1757770605929&status
- status sẽ có 4 giá trị DANG_KHAM, CHO_XET_NGHIEM, HOAN_THANH, HUY
- date mặc định sẽ lấy ngày hôm nay
- **response**
{
    "data": [
        {
            "id": "7",
            "code": "PK1757770605929",
            "symptoms": "viêm họng, đau đầu 22dđ",
            "clinicalExamination": null,
            "diagnosis": null,
            "treatmentPlan": null,
            "note": null,
            "total": 300000.00,
            "patientName": "Pham ngoc CDEF",
            "date": "2025-09-13T20:36:46",
            "status": "DANG_KHAM"
        }
    ],
    "message": "Get all medical record successfully"
}
- **NOTE** chỉ hiển thị thông tin date, status, code, patientName

## POST - Tạo phiếu khám
**api** /api/medical-record
**request**
{
  "patientId": 5,
  "doctorId": 10,
  "healthPlanId": null,
  "symptoms": "viêm họng, đau đầu",
  "invoiceId": 20
}

## GET - Chi tiết phiếu khám
**api** /api/medical-record/{id}
**response** 
{
    "data": {
        "id": "34",
        "code": "PK1759052378",
        "symptoms": "",
        "clinicalExamination": null,
        "diagnosis": null,
        "treatmentPlan": null,
        "note": null,
        "total": 5000.00,
        "patientName": "Mạnh Sĩ",
        "date": "2025-09-28T16:39:38",
        "status": "DANG_KHAM",
        "labOrdersResponses": [
            {
                "id": 25,
                "recordId": null,
                "healthPlanId": 11,
                "healthPlanName": "Xét nghiệm công thức máu",
                "room": "",
                "healthPlanResponse": null,
                "doctorPerformed": null,
                "doctorOrdered": null,
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 120000.00,
                "createdAt": null,
                "expectedResultDate": null
            },
            {
                "id": 26,
                "recordId": null,
                "healthPlanId": 12,
                "healthPlanName": "Nội soi dạ dày",
                "room": "",
                "healthPlanResponse": null,
                "doctorPerformed": null,
                "doctorOrdered": null,
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 900000.00,
                "createdAt": null,
                "expectedResultDate": null
            },
            {
                "id": 27,
                "recordId": null,
                "healthPlanId": 13,
                "healthPlanName": "Chụp X-quang ngực",
                "room": "",
                "healthPlanResponse": null,
                "doctorPerformed": null,
                "doctorOrdered": null,
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 150000.00,
                "createdAt": null,
                "expectedResultDate": null
            },
            {
                "id": 28,
                "recordId": null,
                "healthPlanId": 14,
                "healthPlanName": "Siêu âm ổ bụng tổng quát",
                "room": "",
                "healthPlanResponse": null,
                "doctorPerformed": null,
                "doctorOrdered": null,
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 250000.00,
                "createdAt": null,
                "expectedResultDate": null
            }
        ]
    },
    "message": "Get medical record by id successfully"
}

## GET -lấy tất cả phiếu khám
**api** /api/medical-record?date=2025-09-13&status=&keyword=PK1759052571
- response trả về
{
    "data": [
        {
            "id": "36",
            "code": "PK1759052571",
            "symptoms": "",
            "clinicalExamination": null,
            "diagnosis": null,
            "treatmentPlan": null,
            "note": null,
            "total": 2000.00,
            "patientName": "Con ông mạnh",
            "date": "2025-09-28T16:42:51",
            "status": "DANG_KHAM",
            "labOrdersResponses": [
                {
                    "id": 30,
                    "recordId": null,
                    "healthPlanId": 2,
                    "healthPlanName": "Xét nghiệm máu cơ bản",
                    "room": "",
                    "healthPlanResponse": null,
                    "doctorPerformed": null,
                    "doctorOrdered": null,
                    "status": "CHO_THUC_HIEN",
                    "statusPayment": "CHUA_THANH_TOAN",
                    "price": 2000.00,
                    "orderDate": "2025-09-28T16:42:51",
                    "expectedResultDate": null
                },
                {
                    "id": 31,
                    "recordId": null,
                    "healthPlanId": 3,
                    "healthPlanName": "X-quang phổi",
                    "room": "",
                    "healthPlanResponse": null,
                    "doctorPerformed": null,
                    "doctorOrdered": null,
                    "status": "CHO_THUC_HIEN",
                    "statusPayment": "DA_THANH_TOAN",
                    "price": 3000.00,
                    "orderDate": "2025-09-28T12:57:14",
                    "expectedResultDate": null
                }
            ]
        }
    ],
    "message": "Get all medical record successfully"
}

## POST Thêm phiếu khám
**api** /api/medical-record
request
{
  "patientId": 5,
  "doctorId": 10,
  "healthPlanId": null,
  "symptoms": "viêm họng, đau đầu",
  "invoiceId": null
}
- Khi bấm xác nhận thanh toán (tiền mặt) thì invoiceId sẽ là null
