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
        "id": "111",
        "code": "PK1760023951",
        "symptoms": "Không có triệu chứng",
        "clinicalExamination": null,
        "diagnosis": null,
        "treatmentPlan": null,
        "note": null,
        "patientId": 51,
        "patientName": "tien pro",
        "patientPhone": "0395527777",
        "patientAddress": "121i24j",
        "patientGender": "NAM",
        "date": "2025-10-09T22:32:32",
        "status": "DANG_KHAM",
        "healthPlanId": 10,
        "healthPlanName": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
        "total": 5000,
        "paid": 5000,
        "invoiceDetailsResponse": [
            {
                "id": 256,
                "healthPlanId": 10,
                "healthPlanName": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
                "healthPlanPrice": 5000,
                "paid": 5000,
                "paymentMethod": null,
                "description": "GOI DICH VU SIEU CAP VU TRU TAI NHA TAN RANG",
                "status": "DA_THANH_TOAN",
                "multipleLab": [
                    {
                        "id": 211,
                        "code": "XN1760023951841",
                        "name": "khám bệnh",
                        "doctorPerforming": "tien",
                        "room": "Phòng khám Nội tổng quát - 101A",
                        "createdAt": "2025-10-09T22:32:32",
                        "status": "CHO_THUC_HIEN"
                    },
                    {
                        "id": 212,
                        "code": "XN1760023951849",
                        "name": "Xét nghiệm công thức máu",
                        "doctorPerforming": null,
                        "room": "Phòng khám Nội tổng quát - 101A",
                        "createdAt": "2025-10-09T22:32:32",
                        "status": "CHO_THUC_HIEN"
                    },
                    {
                        "id": 213,
                        "code": "XN1760023951856",
                        "name": "Nội soi dạ dày",
                        "doctorPerforming": null,
                        "room": "Phòng khám Ngoại chấn thương - 102A",
                        "createdAt": "2025-10-09T22:32:32",
                        "status": "CHO_THUC_HIEN"
                    },
                    {
                        "id": 214,
                        "code": "XN1760023951864",
                        "name": "Chụp X-quang ngực",
                        "doctorPerforming": null,
                        "room": "Phòng khám Nhi khoa - 103A",
                        "createdAt": "2025-10-09T22:32:32",
                        "status": "CHO_THUC_HIEN"
                    },
                    {
                        "id": 215,
                        "code": "XN1760023951871",
                        "name": "Siêu âm ổ bụng tổng quát",
                        "doctorPerforming": null,
                        "room": "Phòng khám Sản phụ khoa - 104A",
                        "createdAt": "2025-10-09T22:32:32",
                        "status": "CHO_THUC_HIEN"
                    },
                    {
                        "id": 216,
                        "code": "XN1760023951879",
                        "name": "khám bệnh",
                        "doctorPerforming": null,
                        "room": "Phòng khám Nội tổng quát - 101A",
                        "createdAt": "2025-10-09T22:32:32",
                        "status": "CHO_THUC_HIEN"
                    }
                ],
                "singleLab": null,
                "typeService": "MULTIPLE"
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

