## PUT - cập nhật thông tin bệnh nhân
**api** /api/patients
request
{
  "id": 49,
  "phone": 1111111111,
  "email": "tuan@gmail.com",
  "fullName": "Pham ngoc Tuan",
  "address": "PHU DIEN HUU HOA THANH TRI TP.HN",
  "cccd": "001204020080",
  "birth": "2030-08-15",
  "gender": "NAM",
  "bloodType": "O",
  "weight": 60.5,
  "height": 176.2,
  "profileImage": "https://example.com/images/patient123.jpg"
}
## GET - lấy tất cả bệnh nhân
**api** /patients?keyword=ma
response
{
    "data": [
        {
            "id": 41,
            "code": "BN1758266333921",
            "bloodType": "AB",
            "weight": 80.40,
            "height": 175.00,
            "registrationDate": "2025-09-19T14:18:54",
            "fullName": "Mạnh sĩ gái",
            "phone": "0000000000",
            "address": "Đông anh Hà nội",
            "cccd": "0123456781",
            "birth": "2004-01-01",
            "gender": "NAM",
            "profileImage": null,
            "relationship": null,
            "email": null
        },
        {
            "id": 42,
            "code": "BN1758266415490",
            "bloodType": "A",
            "weight": 20.00,
            "height": 100.00,
            "registrationDate": "2025-09-19T14:20:15",
            "fullName": "Con ông mạnh",
            "phone": null,
            "address": "Hà Nội",
            "cccd": "001204020078",
            "birth": "2034-02-02",
            "gender": "NAM",
            "profileImage": null,
            "relationship": null,
            "email": null
        },
        {
            "id": 43,
            "code": "BN1758266516565",
            "bloodType": "O",
            "weight": 60.00,
            "height": 175.00,
            "registrationDate": "2025-09-19T14:21:57",
            "fullName": "Vợ ông mạnh",
            "phone": "0000000001",
            "address": "Phú sĩ nhật bản",
            "cccd": "001204020011",
            "birth": "2004-09-09",
            "gender": "NU",
            "profileImage": null,
            "relationship": null,
            "email": null
        },
        {
            "id": 46,
            "code": "BN1758266925988",
            "bloodType": "B",
            "weight": 66.00,
            "height": 180.00,
            "registrationDate": "2025-09-19T14:28:46",
            "fullName": "Em ông Mạnh",
            "phone": "0000000098",
            "address": "hà nội",
            "cccd": "001204200124",
            "birth": "2004-11-11",
            "gender": "NU",
            "profileImage": null,
            "relationship": null,
            "email": null
        }
    ],
    "message": "Find patient successfully"
}