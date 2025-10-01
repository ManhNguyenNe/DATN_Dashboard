## GET - lấy tất cả chỉ định
**api** /api/lab-orders
- response
{
    "data": [
        {
            "id": 2,
            "recordId": 19,
            "healthPlanId": 3,
            "healthPlanName": "X-quang phổi",
            "room": null,
            "doctorPerformed": null,
            "doctorOrdered": null,
            "status": "CHO_THUC_HIEN",
            "statusPayment": null,
            "price": 200000.00,
            "orderDate": "2025-09-15T15:04:59",
            "expectedResultDate": null
        },
        {
            "id": 3,
            "recordId": 19,
            "healthPlanId": 3,
            "healthPlanName": "X-quang phổi",
            "room": null,
            "doctorPerformed": null,
            "doctorOrdered": null,
            "status": "CHO_THUC_HIEN",
            "statusPayment": null,
            "price": 200000.00,
            "orderDate": "2025-09-16T15:52:07",
            "expectedResultDate": null
        },
        {
            "id": 4,
            "recordId": 19,
            "healthPlanId": 9,
            "healthPlanName": "Chụp X-quang phổi",
            "room": null,
            "doctorPerformed": null,
            "doctorOrdered": null,
            "status": "CHO_THUC_HIEN",
            "statusPayment": null,
            "price": 150000.00,
            "orderDate": "2025-09-16T15:52:08",
            "expectedResultDate": null
        }
    ],
    "message": "Get all lab orders successfully"
}

## GET - lấy chỉ định chi tiết
**api** /api/lab-orders/30
response
{
    "data": {
        "id": "69",
        "code": "PK1759304689",
        "symptoms": "viêm họng, đau đầu",
        "clinicalExamination": null,
        "diagnosis": null,
        "treatmentPlan": null,
        "note": null,
        "total": 7000.00,
        "patientName": "Nguyen Van A",
        "date": "2025-10-01T14:44:50",
        "status": "DANG_KHAM",
        "labOrdersResponses": [
            {
                "id": 60,
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
                "orderDate": "2025-10-01T14:44:50",
                "expectedResultDate": null
            },
            {
                "id": 61,
                "recordId": null,
                "healthPlanId": 11,
                "healthPlanName": "Xét nghiệm công thức máu",
                "room": "Phòng khám Nội tổng quát - 101A",
                "doctorPerformed": "BS. NGUYEN VAN J",
                "doctorPerformedId": 13,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 120000.00,
                "orderDate": "2025-10-01T14:44:50",
                "expectedResultDate": null
            },
            {
                "id": 62,
                "recordId": null,
                "healthPlanId": 12,
                "healthPlanName": "Nội soi dạ dày",
                "room": "Phòng khám Ngoại chấn thương - 102A",
                "doctorPerformed": "BS. VU VAN I",
                "doctorPerformedId": 12,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 900000.00,
                "orderDate": "2025-10-01T14:44:50",
                "expectedResultDate": null
            },
            {
                "id": 63,
                "recordId": null,
                "healthPlanId": 13,
                "healthPlanName": "Chụp X-quang ngực",
                "room": "Phòng khám Nhi khoa - 103A",
                "doctorPerformed": "BS. NGO THI H",
                "doctorPerformedId": 11,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 150000.00,
                "orderDate": "2025-10-01T14:44:50",
                "expectedResultDate": null
            },
            {
                "id": 64,
                "recordId": null,
                "healthPlanId": 14,
                "healthPlanName": "Siêu âm ổ bụng tổng quát",
                "room": "Phòng khám Sản phụ khoa - 104A",
                "doctorPerformed": "BS. HOANG VAN G",
                "doctorPerformedId": 10,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 250000.00,
                "orderDate": "2025-10-01T14:44:50",
                "expectedResultDate": null
            },
            {
                "id": 66,
                "recordId": null,
                "healthPlanId": 2,
                "healthPlanName": "Xét nghiệm máu cơ bản",
                "room": "Phòng xét nghiệm  - 204A",
                "doctorPerformed": "BS. NGO THI Q",
                "doctorPerformedId": 20,
                "doctorOrdered": "tien",
                "status": "CHO_THUC_HIEN",
                "statusPayment": "DA_THANH_TOAN",
                "price": 2000.00,
                "orderDate": "2025-10-01T15:07:27",
                "expectedResultDate": null
            }
        ]
    },
    "message": "Get medical record by id successfully"
}

## POST - thêm chỉ định
**api** /api/lab-orders
request
{
	"recordId": 69,
    "healthPlanId": 2,
    "performingDoctor": 20,
    "diagnosis": "abcdxyzt"
}
