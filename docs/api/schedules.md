## GET - lấy danh sách lịch có lọc theo nhiều tiêu chí
**API** /api/schedules/available
params
- startDate
- endDate
- shift
- departmentId
- doctorId

response
{
    "data": [
        {
            "date": "2025-09-15",
            "dateName": "MONDAY",
            "totalSlot": 1,
            "doctors": [
                {
                    "id": 10,
                    "fullName": "BS. HOANG VAN G",
                    "position": "PGS.TS. HOANG VAN G",
                    "available": true,
                    "shift": "SANG"
                }
            ]
        },
        {
            "date": "2025-09-16",
            "dateName": "TUESDAY",
            "totalSlot": 1,
            "doctors": [
                {
                    "id": 10,
                    "fullName": "BS. HOANG VAN G",
                    "position": "PGS.TS. HOANG VAN G",
                    "available": true,
                    "shift": "SANG"
                }
            ]
        }
    ],
    "message": "get available slots success"
}

**Đây là lịch làm của mỗi bác sĩ (riêng cho từng bác sĩ xem lịch làm của mình)** 
- Ở quản lí lịch làm việc sẽ chia ra 2 tab riêng là lịch làm việc và quản lí lịch nghỉ phép
- Đối với bác sĩ riêng (thì id bác sĩ sẽ được lấy từ thông tin sau khi đã đăng nhập)
- Hiển thị từ thứ 2 -> chủ nhật về lịch làm bác sĩ 
+ Nếu available là false -> nghỉ phép ngược lại -> đi làm 
+ Về ô hiển thị lịch làm thì thì cột dọc sẽ có 3 ô là sáng chiều và tối và bác sĩ sẽ biểu thị ở đấy
- lưu ý là không re-render lại tất cả giao diện mà chỉ thay đổi về nội dung thôi (tạo cảm giác mượt mà tránh khó chịu)


## POST - thêm lịch làm cố định
**api** /api/schedules
{
	"doctorId": 1,
    "day": "T5",
    "startTime": "07:00",
    "endTime": "08:00"
}


## GET - lấy danh sách lịch nghỉ của mình (bác sĩ)
**api** /api/schedules/leave/me?date&status=DA_DUYET
response
{
    "data": [
        {
            "id": 9,
            "doctorName": "BS. LE THI CC",
            "startTime": "07:00:00",
            "endTime": "12:00:00",
            "date": "2025-10-09",
            "submitDate": "2025-10-07",
            "reason": "mưa gió lớn, đường ngập lụt",
            "leaveStatus": "DA_DUYET",
            "userApprover": null
        },
        {
            "id": 1,
            "doctorName": "BS. LE THI CC",
            "startTime": "07:00:00",
            "endTime": "12:00:00",
            "date": "2025-09-15",
            "submitDate": null,
            "reason": "nghỉ chơi với vợ",
            "leaveStatus": "CHO_DUYET",
            "userApprover": null
        },
        {
            "id": 2,
            "doctorName": "BS. LE THI CC",
            "startTime": "12:00:00",
            "endTime": "17:00:00",
            "date": "2025-10-07",
            "submitDate": null,
            "reason": "đi đón con",
            "leaveStatus": "DA_DUYET",
            "userApprover": null
        }
    ],
    "message": "get my leaves success"
}
- Sẽ có bộ lọc để lọc ngày và trạng thái
- Lưu ý ban đầu vào thì không lọc gì cả

## POST - thêm lịch nghỉ
**api** /api/schedules/leave
request 
{
	"doctorId": null,
    "day": "2025-10-09",
    "shifts": ["SANG", "CHIEU"],
    "reason": "mưa gió lớn, đường ngập lụt"
}
- sẽ được tích chọn ca làm sáng, chiều tối

## PUT - cập nhật lich nghỉ
**api** /api/schedules/leave
{
	"id": 10,
    "day": "2025-11-11",
    "leaveStatus": "CHO_DUYET",
    "shifts": ["CHIEU"],
    "reason": "mưa gió lớn, đường ngập lụt 2"
}

## Delete - xóa lịch nghỉ
**api** /api/schedules/leave
{
    "id": 10
}
