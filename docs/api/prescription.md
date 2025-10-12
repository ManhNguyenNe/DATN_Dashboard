# API Documentation - Prescription & Medicine Controllers

## Base URLs
```
/api/prescriptions
/api/medicines
```

---

# PRESCRIPTION APIs

## 1. Lấy danh sách đơn thuốc theo Medical Record ID

### Endpoint
```
GET /api/prescriptions/medical-record/{id}
```

### Description
Lấy thông tin tất cả các đơn thuốc của một phiếu khám cụ thể.

### Path Parameters
| Parameter | Type    | Required | Description                    |
|-----------|---------|----------|--------------------------------|
| id        | Integer | Yes      | ID của phiếu khám (Medical Record) |

### Request
```
GET /api/prescriptions/medical-record/1
```

### Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
    "data": {
        "id": 1,
        "code": "DT1760099651",
        "generalInstructions": "ăn uống đầy đủ chất, ngủ sớm, thể dục đều đặn",
        "doctorCreated": "tien",
        "prescriptionDate": "2025-10-10T19:34:12",
        "detailResponses": [
            {
                "id": 2,
                "medicineResponse": {
                    "id": 2,
                    "name": "Amoxicillin",
                    "concentration": "500mg",
                    "dosageForm": "Viên nang",
                    "description": "",
                    "unit": "Vỉ"
                },
                "usageInstructions": "Uống 2 viên sau ăn",
                "quantity": 2
            },
            {
                "id": 1,
                "medicineResponse": {
                    "id": 3,
                    "name": "Cefuroxime",
                    "concentration": "250mg",
                    "dosageForm": "Viên nén",
                    "description": "",
                    "unit": "Vỉ"
                },
                "usageInstructions": "Uống 2 viên sau ăn",
                "quantity": 1
            }
        ]
    },
    "message": "Fetch prescriptions successfully"
}
```

---

## 2. Tạo đơn thuốc mới

### Endpoint
```
POST /api/prescriptions
```

### Description
Tạo một đơn thuốc mới cho phiếu khám.

### Request
**Request Body:**
```json
{
  "medicalRecordId": 1,
  "generalInstructions": "Uống thuốc sau bữa ăn, tránh đồ cay nóng"
}
```

**Request Body Schema:**
| Field               | Type    | Required | Description                           |
|---------------------|---------|----------|---------------------------------------|
| id                  | Integer | No       | ID đơn thuốc (không cần khi tạo mới)  |
| medicalRecordId     | Integer | Yes      | ID của phiếu khám                     |
| generalInstructions | String  | No       | Hướng dẫn chung cho đơn thuốc         |

### Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "data": {
    "id": 1,
    "code": "DT20231001001",
    "generalInstructions": "Uống thuốc sau bữa ăn, tránh đồ cay nóng",
    "doctorCreated": "BS. Nguyễn Văn A",
    "prescriptionDate": "2023-10-01T14:30:00",
    "detailResponses": []
  },
  "message": "Create prescription successfully"
}
```

---

## 3. Cập nhật đơn thuốc

### Endpoint
```
PUT /api/prescriptions
```

### Description
Cập nhật thông tin đơn thuốc đã tồn tại.

### Request
**Request Body:**
```json
{
  "id": 1,
  "medicalRecordId": 1,
  "generalInstructions": "Uống thuốc sau bữa ăn, tránh đồ cay nóng. Nghỉ ngơi đầy đủ"
}
```

**Request Body Schema:**
| Field               | Type    | Required | Description                    |
|---------------------|---------|----------|--------------------------------|
| id                  | Integer | Yes      | ID của đơn thuốc cần cập nhật  |
| medicalRecordId     | Integer | Yes      | ID của phiếu khám              |
| generalInstructions | String  | No       | Hướng dẫn chung cho đơn thuốc  |

### Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "data": {
    "id": 1,
    "code": "DT20231001001",
    "generalInstructions": "Uống thuốc sau bữa ăn, tránh đồ cay nóng. Nghỉ ngơi đầy đủ",
    "doctorCreated": "BS. Nguyễn Văn A",
    "prescriptionDate": "2023-10-01T14:30:00",
    "detailResponses": [
      {
        "id": 1,
        "medicineResponse": {
          "id": 1,
          "name": "Paracetamol",
          "concentration": "500mg",
          "dosageForm": "Viên nén",
          "description": "Thuốc giảm đau, hạ sốt",
          "unit": "Viên"
        },
        "usageInstructions": "Uống 1 viên x 3 lần/ngày",
        "quantity": 30
      }
    ]
  },
  "message": "Update prescription successfully"
}
```

---

## 4. Thêm chi tiết thuốc vào đơn

### Endpoint
```
POST /api/prescriptions/details
```

### Description
Thêm một loại thuốc vào đơn thuốc.

### Request
**Request Body:**
```json
{
  "prescriptionId": 1,
  "medicineId": 1,
  "usageInstructions": "Uống 1 viên x 3 lần/ngày",
  "quantity": 30
}
```

**Request Body Schema:**
| Field             | Type    | Required | Description                           |
|-------------------|---------|----------|---------------------------------------|
| id                | Integer | No       | ID chi tiết (không cần khi tạo mới)   |
| prescriptionId    | Integer | Yes      | ID của đơn thuốc                      |
| medicineId        | Integer | Yes      | ID của thuốc                          |
| usageInstructions | String  | No       | Hướng dẫn sử dụng thuốc               |
| quantity          | Integer | Yes      | Số lượng thuốc                        |

### Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "data": {
    "id": 1,
    "medicineResponse": {
      "id": 1,
      "name": "Paracetamol",
      "concentration": "500mg",
      "dosageForm": "Viên nén",
      "description": "Thuốc giảm đau, hạ sốt",
      "unit": "Viên"
    },
    "usageInstructions": "Uống 1 viên x 3 lần/ngày",
    "quantity": 30
  },
  "message": "Create prescription detail successfully"
}
```

---

## 5. Cập nhật chi tiết thuốc

### Endpoint
```
PUT /api/prescriptions/details
```

### Description
Cập nhật thông tin chi tiết thuốc trong đơn thuốc.

### Request
**Request Body:**
```json
{
  "id": 1,
  "prescriptionId": 1,
  "medicineId": 1,
  "usageInstructions": "Uống 2 viên x 3 lần/ngày",
  "quantity": 60
}
```

**Request Body Schema:**
| Field             | Type    | Required | Description                      |
|-------------------|---------|----------|----------------------------------|
| id                | Integer | Yes      | ID chi tiết cần cập nhật         |
| prescriptionId    | Integer | Yes      | ID của đơn thuốc                 |
| medicineId        | Integer | Yes      | ID của thuốc                     |
| usageInstructions | String  | No       | Hướng dẫn sử dụng thuốc          |
| quantity          | Integer | Yes      | Số lượng thuốc                   |

### Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "data": {
    "id": 1,
    "medicineResponse": {
      "id": 1,
      "name": "Paracetamol",
      "concentration": "500mg",
      "dosageForm": "Viên nén",
      "description": "Thuốc giảm đau, hạ sốt",
      "unit": "Viên"
    },
    "usageInstructions": "Uống 2 viên x 3 lần/ngày",
    "quantity": 60
  },
  "message": "Update prescription detail successfully"
}
```

---

## 6. Xóa chi tiết thuốc

### Endpoint
```
DELETE /api/prescriptions/details/{id}
```

### Description
Xóa một loại thuốc khỏi đơn thuốc.

### Path Parameters
| Parameter | Type    | Required | Description                  |
|-----------|---------|----------|------------------------------|
| id        | Integer | Yes      | ID của chi tiết thuốc cần xóa |

### Request
```
DELETE /api/prescriptions/details/1
```

### Response
**Status Code:** `204 No Content`

**Response Body:** Empty

---

# MEDICINE APIs

## 1. Lấy danh sách thuốc

### Endpoint
```
GET /api/medicines
```

### Description
Lấy danh sách tất cả thuốc có thể tìm kiếm theo từ khóa.

### Query Parameters
| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| keyword   | String | No       | Từ khóa tìm kiếm (tên thuốc)   |

### Request
```
GET /api/medicines
GET /api/medicines?keyword=paracetamol
```

### Response
**Status Code:** `200 OK`

**Response Body:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Paracetamol",
      "concentration": "500mg",
      "dosageForm": "Viên nén",
      "description": "Thuốc giảm đau, hạ sốt",
      "unit": "Viên"
    },
    {
      "id": 2,
      "name": "Amoxicillin",
      "concentration": "250mg",
      "dosageForm": "Viên nang",
      "description": "Kháng sinh",
      "unit": "Viên"
    },
    {
      "id": 3,
      "name": "Paracetamol",
      "concentration": "125mg",
      "dosageForm": "Siro",
      "description": "Thuốc giảm đau, hạ sốt cho trẻ em",
      "unit": "ml"
    }
  ],
  "message": "Fetch medicines successfully"
}
```

**Response Body với keyword:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Paracetamol",
      "concentration": "500mg",
      "dosageForm": "Viên nén",
      "description": "Thuốc giảm đau, hạ sốt",
      "unit": "Viên"
    },
    {
      "id": 3,
      "name": "Paracetamol",
      "concentration": "125mg",
      "dosageForm": "Siro",
      "description": "Thuốc giảm đau, hạ sốt cho trẻ em",
      "unit": "ml"
    }
  ],
  "message": "Fetch medicines successfully"
}
```

---

# DATA MODELS

## ApiResponse<T>
| Field   | Type   | Description     |
|---------|--------|-----------------|
| data    | T      | Dữ liệu response |
| message | String | Thông báo       |

## PrescriptionResponse
| Field               | Type                   | Description                    |
|---------------------|------------------------|--------------------------------|
| id                  | Integer                | ID đơn thuốc                   |
| code                | String                 | Mã đơn thuốc                   |
| generalInstructions | String                 | Hướng dẫn chung                |
| doctorCreated       | String                 | Tên bác sĩ kê đơn              |
| prescriptionDate    | LocalDateTime          | Ngày kê đơn                    |
| detailResponses     | List<PreDetailResponse>| Danh sách chi tiết thuốc       |

## PreDetailResponse
| Field             | Type             | Description              |
|-------------------|------------------|--------------------------|
| id                | Integer          | ID chi tiết thuốc        |
| medicineResponse  | MedicineResponse | Thông tin thuốc          |
| usageInstructions | String           | Hướng dẫn sử dụng        |
| quantity          | Integer          | Số lượng                 |

## MedicineResponse
| Field        | Type    | Description        |
|--------------|---------|-------------------|
| id           | Integer | ID thuốc          |
| name         | String  | Tên thuốc         |
| concentration| String  | Nồng độ/Hàm lượng |
| dosageForm   | String  | Dạng bào chế      |
| description  | String  | Mô tả             |
| unit         | String  | Đơn vị tính       |

---

# ERROR RESPONSES

### 400 Bad Request
```json
{
  "data": null,
  "message": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "data": null,
  "message": "Prescription not found"
}
```

### 500 Internal Server Error
```json
{
  "data": null,
  "message": "Internal server error"
}
```

---

# NOTES

1. Tất cả response (trừ DELETE) được wrap trong ApiResponse với structure: `{data, message}`
2. DELETE /api/prescriptions/details/{id} trả về 204 No Content không có body
3. Định dạng ngày giờ sử dụng ISO 8601 format (yyyy-MM-dd'T'HH:mm:ss)
4. Mã đơn thuốc (code) được tự động sinh khi tạo đơn thuốc mới
5. Tìm kiếm thuốc theo keyword sẽ tìm trong tên thuốc (không phân biệt hoa thường)
6. Các trường có kiểu String hỗ trợ tiếng Việt có dấu
