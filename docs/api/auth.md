## đăng nhập
**api** /api/auth/dashboard/login
- request
{
    "username":"bacsi@gmail.com",
    "password": "123456"
}

- response
{
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzOSIsImlzcyI6IlRJRU4tREVWLUpBVkEiLCJhdWQiOiJsb2NhbGhvc3Q6ODA4MCIsImlhdCI6MTc1OTc0MDI2NCwiZXhwIjoxNzU5Nzc2MjY0LCJyb2xlIjoiQkFDX1NJIn0.MsLgtmX5Ym-22QLgzV940crzmzzBKHCuF6Iwur0yc6o",
        "userResponse": {
            "id": 39,
            "email": "bacsi01@gmail.com",
            "role": "BAC_SI",
            "status": true,
            "createdAt": "2025-09-12T13:07:40",
            "doctor": {
                "id": 32,
                "fullName": "BS. LE THI CC",
                "phone": "0900000039",
                "address": "BẮC NINH",
                "birth": "1993-08-20",
                "gender": "NU",
                "profileImage": "https://i.pravatar.cc/150?img=39",
                "exp": 5,
                "position": "ThS. LE THI CC",
                "available": true
            }
        }
    },
    "message": "Login successful"
}