# 🔍 Moderator Data Preview & Quality Check

## 📋 Vấn đề:
Moderator cần kiểm tra chất lượng data trước khi approve, nhưng không có cách nào xem được nội dung CSV file.

---

## ✅ Đã fix:
Thêm 2 API endpoints để Moderator có thể preview và download data:

### 1. **GET `/api/moderation/{id}/preview`** - Xem sample data
**Purpose:** Xem mẫu data (10 records đầu tiên) để kiểm tra nhanh chất lượng

**Request:**
```http
GET /api/moderation/4/preview?sampleSize=10
Authorization: Bearer {token}
```

**Response:**
```json
{
  "datasetId": 4,
  "datasetName": "Hành vi lái xe điện miền Bắc",
  "totalRecords": 5000,
  "sampleSize": 10,
  "sampleRecords": [
    "timestamp,vehicle_id,location,energy_kwh",
    "2025-01-15 08:30:00,EV001,Hà Nội,45.2",
    "2025-01-15 08:35:00,EV001,Hà Nội,45.8",
    ...
  ],
  "hasFile": true,
  "filePath": "/Uploads/datasets/..."
}
```

### 2. **GET `/api/moderation/{id}/download`** - Download full file
**Purpose:** Download toàn bộ CSV file để kiểm tra chi tiết

**Request:**
```http
GET /api/moderation/4/download
Authorization: Bearer {token}
```

**Response:**
- Download file CSV đầy đủ
- Content-Type: `text/csv` hoặc `application/octet-stream`

---

## 🎯 Cách sử dụng:

### **Option 1: Preview trong Swagger (Nhanh)**
1. Vào Swagger: http://localhost:5258/swagger
2. Tìm `GET /api/Moderation/{id}/preview`
3. Nhập dataset ID (ví dụ: 4)
4. Click "Execute"
5. Xem sample data trong response

### **Option 2: Download full file (Chi tiết)**
1. Vào Swagger: http://localhost:5258/swagger
2. Tìm `GET /api/Moderation/{id}/download`
3. Nhập dataset ID
4. Click "Execute"
5. Download file để mở bằng Excel/CSV viewer
6. Kiểm tra data quality (headers, data types, values)

---

## 📊 Sample Response Example:

### Preview Response:
```json
{
  "datasetId": 4,
  "datasetName": "Hành vi lái xe điện miền Bắc",
  "totalRecords": 25000,
  "sampleSize": 10,
  "sampleRecords": [
    "timestamp,vehicle_id,location,latitude,longitude,distance_km,energy_kwh,speed_kmh",
    "2025-01-15 08:30:00,EV001,Hà Nội,21.0285,105.8542,0,45.2,0",
    "2025-01-15 08:35:00,EV001,Hà Nội,21.0300,105.8560,2.5,45.8,45",
    "2025-01-15 08:40:00,EV001,Hà Nội,21.0320,105.8580,3.0,46.2,50",
    ...
  ],
  "hasFile": true,
  "filePath": "/Uploads/datasets/abc123.csv"
}
```

---

## ✅ Kiểm tra chất lượng data:

Sau khi preview hoặc download, Moderator cần kiểm tra:

1. **Format đúng:** Headers hợp lý không?
2. **Data types:** Số, text, date format đúng chưa?
3. **Data quality:**
   - Có missing values không?
   - Có null/empty fields không?
   - Có duplicate records không?
4. **Consistency:**
   - All fields have values?
   - Values make sense? (ví dụ: energy không âm)
5. **Completeness:**
   - Data phù hợp với description không?
   - Category đúng không?

---

## 🔄 Flow kiểm duyệt:

1. **Moderator login** → Thấy dashboard với pending datasets
2. **Click vào dataset** → Xem metadata (name, description, size, provider, tier)
3. **Click "Preview Data"** → Xem sample 10 records đầu tiên
4. **Nếu cần chi tiết hơn** → Click "Download Full File"
5. **Mở file trong Excel/CSV viewer** → Kiểm tra chất lượng data
6. **Quyết định approve/reject:**
   - ✅ Approve nếu data quality tốt
   - ❌ Reject nếu có vấn đề (thiếu data, format sai, values không hợp lý)
7. **Nhập comments** → Lý do approve/reject
8. **Submit** → Dataset được approve/reject

---

**URLs:**
- Preview: http://localhost:5258/api/moderation/4/preview
- Download: http://localhost:5258/api/moderation/4/download

