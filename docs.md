Khi lễ tân bấm vào nút tích xác nhận ở đặt lịch thì sẽ chuyển sang phiếu khám và điền thông tin vào phiếu khám 
Đây là api để lấy bệnh nhân liên kết với tài khoản 
thông tin ở phiếu khám sẽ được điền (tt bệnh nhân lấy qua patientId ở đăẹt lịch) - hiển thị thêm 1 trường để chọn danh sách bệnh nhân liên kết là api ở dưới
/patients?phone=0395527082
{
    "data": {
        "patients": [
            {
                "id": 5,
                "code": "BN1757508991380",
                "bloodType": "A",
                "weight": 65.50,
                "height": 170.20,
                "registrationDate": "2025-09-10T19:56:32",
                "fullName": "Nguyen Van A",
                "address": "123 Đường ABC, Quận 1, TP.HCM",
                "cccd": "012345678901",
                "birth": "1995-08-15",
                "gender": "NAM",
                "profileImage": "https://example.com/images/patient123.jpg",
                "relationship": "CHU TAI KHOAN"
            },
            {
                "id": 6,
                "code": "BN1757509031888",
                "bloodType": "B",
                "weight": 60.50,
                "height": 176.20,
                "registrationDate": "2025-09-10T19:57:13",
                "fullName": "Nguyen Van B",
                "address": "ha noi",
                "cccd": "012345678901",
                "birth": "1994-08-15",
                "gender": "NU",
                "profileImage": "https://example.com/images/patient123.jpg",
                "relationship": "ME"
            },
            {
                "id": 7,
                "code": "BN1757509934308",
                "bloodType": "O",
                "weight": 60.50,
                "height": 176.20,
                "registrationDate": "2025-09-10T20:12:14",
                "fullName": "Pham ngoc C",
                "address": "123 Đường ABC, Quận 1, TP.HN",
                "cccd": "012345678901",
                "birth": "1994-08-15",
                "gender": "NU",
                "profileImage": "https://example.com/images/patient123.jpg",
                "relationship": "CON"
            },
            {
                "id": 8,
                "code": "BN1757510034808",
                "bloodType": "O",
                "weight": 60.50,
                "height": 176.20,
                "registrationDate": "2025-09-10T20:13:55",
                "fullName": "Pham ngoc CDEF",
                "address": "123 Đường ABC, Quận 1, TP.HN",
                "cccd": "012345678901",
                "birth": "1994-08-15",
                "gender": "NU",
                "profileImage": "https://example.com/images/patient123.jpg",
                "relationship": "VO"
            }
        ],
        "ownerId": 1
    },
    "message": "Find patient successfully"
}
