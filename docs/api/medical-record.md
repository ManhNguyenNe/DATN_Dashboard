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
        "id": "85",
        "code": "PK1759562038",
        "symptoms": "Ỉa chẻ cấp độ 7",
        "clinicalExamination": "",
        "diagnosis": "ỉa chẻ",
        "treatmentPlan": "thuốc chống ẻ",
        "note": "Theo dõi nhiệt độ hàng ngày",
        "total": 5000.00,
        "patientId": 50,
        "patientName": "Bùi Việt Quốc",
        "patientPhone": "0389321548",
        "patientAddress": "Hà Nội",
        "patientGender": "NAM",
        "date": "2025-10-04T14:13:58",
        "status": "DANG_KHAM",
        "labOrdersResponses": [
            {
                "id": 136,
                "code": "XN1759562038334",
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
                "orderDate": "2025-10-04T14:13:58",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": null,
                "labResultResponse": null
            },
            {
                "id": 137,
                "code": "XN1759562038342",
                "recordId": null,
                "healthPlanId": 11,
                "healthPlanName": "Xét nghiệm công thức máu",
                "room": "Phòng khám Nội tổng quát - 101A",
                "doctorPerformed": "BS. PHAM VAN TIEN",
                "doctorPerformedId": 3,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 5000.00,
                "orderDate": "2025-10-04T14:13:58",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
                "labResultResponse": null
            },
            {
                "id": 138,
                "code": "XN1759562038347",
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
                "orderDate": "2025-10-04T14:13:58",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
                "labResultResponse": null
            },
            {
                "id": 139,
                "code": "XN1759562038353",
                "recordId": null,
                "healthPlanId": 13,
                "healthPlanName": "Chụp X-quang ngực",
                "room": "Phòng khám Nhi khoa - 103A",
                "doctorPerformed": "BS. LE THI CC",
                "doctorPerformedId": 32,
                "doctorOrdered": "tien",
                "status": "HOAN_THANH",
                "statusPayment": "DA_THANH_TOAN",
                "price": 15000.00,
                "orderDate": "2025-10-04T14:13:58",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
                "labResultResponse": null
            },
            {
                "id": 140,
                "code": "XN1759562038358",
                "recordId": null,
                "healthPlanId": 14,
                "healthPlanName": "Siêu âm ổ bụng tổng quát",
                "room": "Phòng khám Sản phụ khoa - 104A",
                "doctorPerformed": "BS. LE THI CC",
                "doctorPerformedId": 32,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 2345.00,
                "orderDate": "2025-10-04T14:13:58",
                "diagnosis": null,
                "expectedResultDate": null,
                "serviceParent": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
                "labResultResponse": null
            },
            {
                "id": 141,
                "code": "XN1759562113072",
                "recordId": null,
                "healthPlanId": 2,
                "healthPlanName": "Xét nghiệm máu cơ bản",
                "room": "Phòng xét nghiệm  - 204A",
                "doctorPerformed": "BS. LE THI CC",
                "doctorPerformedId": 32,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 2000.00,
                "orderDate": "2025-10-04T14:15:13",
                "diagnosis": "adfs",
                "expectedResultDate": null,
                "serviceParent": null,
                "labResultResponse": null
            }
        ],
        "invoiceId": 94
    },
    "message": "Get medical record by id successfully"
}
## GET -lấy tất cả phiếu khám
**api** /api/medical-record?date=2025-09-13&status=&keyword=PK1759052571
- response trả về
{
    "data": [
        {
            "id": "85",
            "code": "PK1759562038",
            "symptoms": "Ỉa chẻ cấp độ 7",
            "clinicalExamination": "",
            "diagnosis": "ỉa chẻ",
            "treatmentPlan": "thuốc chống ẻ",
            "note": "Theo dõi nhiệt độ hàng ngày",
            "total": 5000.00,
            "patientId": 50,
            "patientName": "Bùi Việt Quốc",
            "patientPhone": "0389321548",
            "patientAddress": "Hà Nội",
            "patientGender": "NAM",
            "date": "2025-10-04T14:13:58",
            "status": "DANG_KHAM",
            "labOrdersResponses": [
                {
                    "id": 136,
                    "code": "XN1759562038334",
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
                    "orderDate": "2025-10-04T14:13:58",
                    "diagnosis": null,
                    "expectedResultDate": null,
                    "serviceParent": null,
                    "labResultResponse": null
                }
            ]
        }
    ]
}
## GET lấy tất cả phiếu khám theo id bệnh nhân
**api** /api/medical-record/patient/50
response
{
    "data": [
        {
            "id": "84",
            "code": "PK1759559228",
            "symptoms": "Không có triệu chứng",
            "clinicalExamination": "",
            "diagnosis": "ádf",
            "treatmentPlan": "",
            "note": "",
            "total": 5000.00,
            "patientId": null,
            "patientName": null,
            "patientPhone": null,
            "patientAddress": null,
            "patientGender": null,
            "date": "2025-10-04T13:27:08",
            "status": "DANG_KHAM",
            "labOrdersResponses": null,
            "invoiceId": null
        },
        {
            "id": "85",
            "code": "PK1759562038",
            "symptoms": "Ỉa chẻ cấp độ 7",
            "clinicalExamination": "",
            "diagnosis": "ỉa chẻ",
            "treatmentPlan": "thuốc chống ẻ",
            "note": "Theo dõi nhiệt độ hàng ngày",
            "total": 5000.00,
            "patientId": null,
            "patientName": null,
            "patientPhone": null,
            "patientAddress": null,
            "patientGender": null,
            "date": "2025-10-04T14:13:58",
            "status": "DANG_KHAM",
            "labOrdersResponses": null,
            "invoiceId": null
        }
    ],
    "message": "Get medical record by id successfully"
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
  "id": 85,
    "status": "HOAN_THANH"
}
- có 4 trạng thái
DANG_KHAM, CHO_XET_NGHIEM, HOAN_THANH, HUY

