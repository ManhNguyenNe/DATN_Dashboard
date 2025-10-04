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
        "id": "83",
        "code": "PK1759497762",
        "symptoms": "",
        "clinicalExamination": null,
        "diagnosis": null,
        "treatmentPlan": null,
        "note": null,
        "total": 5000.00,
        "patientName": "kakaka",
        "patientPhone": null,
        "patientAddress": "hà nọi",
        "patientGender": "NAM",
        "date": "2025-10-03T20:22:43",
        "status": "DANG_KHAM",
        "labOrdersResponses": [
            {
                "id": 124,
                "recordId": null,
                "healthPlanId": 1,
                "healthPlanName": "khám bệnh",
                "room": "Phòng khám Nội tổng quát - 101A",
                "doctorPerformed": "tien",
                "doctorPerformedId": 1,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 0.00,
                "orderDate": "2025-10-03T20:22:43",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": null
            },
            {
                "id": 125,
                "recordId": null,
                "healthPlanId": 11,
                "healthPlanName": "Xét nghiệm công thức máu",
                "room": "Phòng khám Nội tổng quát - 101A",
                "doctorPerformed": null,
                "doctorPerformedId": null,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 5000.00,
                "orderDate": "2025-10-03T20:22:43",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG"
            },
            {
                "id": 126,
                "recordId": null,
                "healthPlanId": 12,
                "healthPlanName": "Nội soi dạ dày",
                "room": "Phòng khám Ngoại chấn thương - 102A",
                "doctorPerformed": null,
                "doctorPerformedId": null,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 4000.00,
                "orderDate": "2025-10-03T20:22:43",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG"
            },
            {
                "id": 127,
                "recordId": null,
                "healthPlanId": 13,
                "healthPlanName": "Chụp X-quang ngực",
                "room": "Phòng khám Nhi khoa - 103A",
                "doctorPerformed": null,
                "doctorPerformedId": null,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 15000.00,
                "orderDate": "2025-10-03T20:22:43",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG"
            },
            {
                "id": 128,
                "recordId": null,
                "healthPlanId": 14,
                "healthPlanName": "Siêu âm ổ bụng tổng quát",
                "room": "Phòng khám Sản phụ khoa - 104A",
                "doctorPerformed": null,
                "doctorPerformedId": null,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 2345.00,
                "orderDate": "2025-10-03T20:22:43",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG"
            },
            {
                "id": 129,
                "recordId": null,
                "healthPlanId": 2,
                "healthPlanName": "Xét nghiệm máu cơ bản",
                "room": "Phòng xét nghiệm  - 204A",
                "doctorPerformed": "BS. NGUYEN THI S",
                "doctorPerformedId": 22,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 2000.00,
                "orderDate": "2025-10-03T20:23:50",
                "diagnosis": "123",
                "expectedResultDate": null,
                "serviceParent": null
            }
        ],
        "invoiceId": 92
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

## PUT cập nhật phiếu khám
**api** /api/medical-record
request
{
  "id": 85,
  "symptoms": "Sốt cao, ho khan, đau đầu",
  "clinicalExamination": "Khám tổng quát, nghe tim phổi, đo huyết áp",
  "diagnosis": "Viêm phế quản cấp",
  "treatmentPlan": "Dùng kháng sinh, hạ sốt, nghỉ ngơi",
  "note": "Theo dõi nhiệt độ hàng ngày"
}
# PUT cập nhật trạng thái
**api** /api/medical-record/status
request
{

}