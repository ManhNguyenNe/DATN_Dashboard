## GET lay chi tiet dich vu kham
**api** localhost:8080/api/services/8
response
{
    "id": 8,
    "code": "DV005",
    "name": "Siêu âm ổ bụng",
    "price": 1234.0,
    "description": "Siêu âm kiểm tra ổ bụng tổng quát",
    "doctorsAssigned": [
        {
            "id": 16,
            "fullName": "BS. PHAM THI M",
            "position": "ThS. PHAM THI M",
            "available": true,
            "shift": "CHIEU"
        }
    ]
}


## GET lấy tất cả dịch vụ
**api** /api/services?keyword=máu
response
[
    {
        "id": 2,
        "code": "DV-XN-MAU",
        "name": "Xét nghiệm máu cơ bản",
        "price": 2000.0,
        "description": "Xét nghiệm máu cơ bản",
        "roomNumber": "204A",
        "roomName": "Phòng xét nghiệm "
    },
    {
        "id": 11,
        "code": "DV-XN-CBC",
        "name": "Xét nghiệm công thức máu",
        "price": 120000.0,
        "description": "CBC, lấy máu tĩnh mạch",
        "roomNumber": "101A",
        "roomName": "Phòng khám Nội tổng quát"
    }
]