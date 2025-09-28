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
        "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaXNzIjoiVElFTi1ERVYtSkFWQSIsImF1ZCI6ImxvY2FsaG9zdDo4MDgwIiwiaWF0IjoxNzU5MDY1MzgzLCJleHAiOjE3NTkwNjg5ODMsInJvbGUiOiJCQUNfU0kifQ.MwjdWxFTaTlGagtjHyXGNiuqF0XkKJ_zALBQVYFa-PI",
        "userResponse": {
            "id": 2,
            "email": "bacsi@gmail.com",
            "phone": null,
            "name": null,
            "role": "BAC_SI",
            "status": true,
            "createdAt": "2025-09-09T14:19:34"
        }
    },
    "message": "Login successful"
}