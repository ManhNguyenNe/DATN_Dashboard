# ME - lấy thông tin
**api** /api/users/me
response
{
    "data": {
        "id": 2,
        "email": "bacsi@gmail.com",
        "role": "BAC_SI",
        "status": true,
        "createdAt": "2025-09-09T14:19:34",
        "doctor": {
            "id": 1,
            "fullName": "tien",
            "phone": "",
            "address": "",
            "birth": "2004-11-11",
            "profileImage": "",
            "exp": 12,
            "position": "PGS. Phạm Tiến",
            "available": true
        }
    },
    "message": "Get info successfully"
} 
**đây là response khi role là bác sĩ**
{
    "data": {
        "id": 3,
        "email": "letan@gmail.com",
        "role": "LE_TAN",
        "status": true,
        "createdAt": "2025-09-09T14:21:07"
    },
    "message": "Get info successfully"
}

**Đây là response khi role là lễ tân"**