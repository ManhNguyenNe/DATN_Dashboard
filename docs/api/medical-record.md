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
        "id": "26",
        "code": "PK1758977705",
        "symptoms": "viêm họng, đau đầu",
        "clinicalExamination": null,
        "diagnosis": null,
        "treatmentPlan": null,
        "note": null,
        "total": 6000.00,
        "patientName": "Nguyen Van A",
        "date": "2025-09-27T19:55:06",
        "status": "DANG_KHAM",
        "services": [
            {
                "serviceName": "Khám bệnh",
                "doctorName": "BS. HOANG VAN G",
                "price": 6000.00,
                "room": "Phòng khám Tim mạch - 108A",
                "status": "CHUA_THANH_TOAN"
            },
            {
                "serviceName": "Xét nghiệm máu cơ bản",
                "doctorName": "BS. HOANG VAN G",
                "price": 2000.00,
                "room": "Phòng xét nghiệm  - 204A",
                "status": "DA_THANH_TOAN"
            },
            {
                "serviceName": "X-quang phổi",
                "doctorName": "BS. NGO THI H",
                "price": 3000.00,
                "room": "Phòng khám Nội tổng quát - 101A",
                "status": "DA_THANH_TOAN"
            }
        ]
    },
    "message": "Get medical record by id successfully"
}