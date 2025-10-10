## GET - lấy tất cả chỉ định của bác sĩ 
**api** /api/lab-orders/doctor/me?keyword&date&status
- Status có CHO_THUC_HIEN, DANG_THUC_HIEN, HOAN_THANH, HUY_BO - mặc định lúc tìm kiếm sẽ là chờ thực hiện
- ngày mặc định là ngày hôm nay
- keyword để nhập từ khóa

response
{
    "data": [
        {
            "id": 81,
            "recordId": 70,
            "healthPlanId": 2,
            "healthPlanName": "Xét nghiệm máu cơ bản",
            "room": "Phòng xét nghiệm  - 204A",
            "doctorPerformed": "ThS. LE THI CC",
            "doctorPerformedId": null,
            "doctorOrdered": "PGS. Phạm Tiến",
            "status": "CHO_THUC_HIEN",
            "statusPayment": null,
            "price": 2000.00,
            "orderDate": "2025-10-02T19:20:13",
            "diagnosis": "sakldfj",
            "expectedResultDate": null,
            "serviceParent": null
        },
        {
            "id": 82,
            "recordId": 71,
            "healthPlanId": 2,
            "healthPlanName": "Xét nghiệm máu cơ bản",
            "room": "Phòng xét nghiệm  - 204A",
            "doctorPerformed": "ThS. LE THI CC",
            "doctorPerformedId": null,
            "doctorOrdered": "PGS. Phạm Tiến",
            "status": "CHO_THUC_HIEN",
            "statusPayment": null,
            "price": 2000.00,
            "orderDate": "2025-10-02T21:08:34",
            "diagnosis": null,
            "expectedResultDate": null,
            "serviceParent": null
        }
    ],
    "message": "Get all lab orders of doctor successfully"
}


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
        "id": 135,
        "code": "XN1759559228428",
        "recordId": 84,
        "healthPlanId": 14,
        "healthPlanName": "Siêu âm ổ bụng tổng quát",
        "room": "Phòng khám Sản phụ khoa - 104A",
        "doctorPerformed": "ThS. LE THI CC",
        "doctorPerformedId": null,
        "doctorOrdered": "PGS. Phạm Tiến",
        "status": "HOAN_THANH",
        "statusPayment": null,
        "price": 2345.00,
        "orderDate": "2025-10-04T13:27:08",
        "diagnosis": null,
        "expectedResultDate": null,
        "serviceParent": null,
        "labResultResponse": {
            "id": 16,
            "date": "2025-10-04T13:38:23",
            "status": "HOAN_THANH",
            "resultDetails": "qư",
            "note": "qew",
            "explanation": "eqw"
        }
    },
    "message": "Get lab order by id successfully"
}
## PUT - cap nhat trang thai
**api** /api/lab-orders/status
request
{
    "id": 123,
    "status": "DANG_THUC_HIEN"
}

## POST - thêm chỉ định
**api** /api/lab-orders
request
{
	"recordId": 69,
    "healthPlanId": 2,
    "performingDoctorId": 20,
    "diagnosis": "abcdxyzt"
}
## PUT - cập nhật chỉ định
**api** /api/lab-orders
request
{
    "id": 74,
    "performingDoctorId": 21
}

## DELETE - xoas theo yeu cau
**api**/api/lab-orders
request
{
    "ids": [161, 162],
    "medicalRecordId": 90
}