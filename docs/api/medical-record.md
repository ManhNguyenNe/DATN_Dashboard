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