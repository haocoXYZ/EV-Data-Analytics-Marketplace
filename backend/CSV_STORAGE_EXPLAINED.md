# CSV File Storage & Database Structure

## 🗂️ File Storage Architecture

### Physical File Storage
```
EVDataMarketplace.API/
└── Uploads/
    └── datasets/
        ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890_charging_data_hanoi_q1.csv
        ├── b2c3d4e5-f6a7-8901-bcde-f12345678901_battery_performance_hcm.csv
        └── c3d4e5f6-a7b8-9012-cdef-123456789012_station_info_danang.csv
```

**Lưu ý:**
- File CSV được lưu trên **file system** (không lưu trong database)
- Mỗi file có tên unique: `{GUID}_{original_filename}.csv`
- Đường dẫn tương đối được lưu trong database

---

## 🗄️ Database Storage

### Dataset Table (Entity đã có)
```sql
CREATE TABLE Dataset (
    dataset_id INT PRIMARY KEY,
    provider_id INT,
    tier_id INT,
    name VARCHAR(255),                    -- "Dữ liệu sạc xe Hà Nội Q1/2025"
    description NVARCHAR(MAX),            -- Mô tả chi tiết
    category VARCHAR(150),                -- "Charging Session", "Battery Performance"
    data_format VARCHAR(50),              -- "CSV"
    data_size_mb DECIMAL(18,2),          -- 150.5 MB
    file_path NVARCHAR(500),             -- "Uploads/datasets/a1b2c3d4...csv"
    upload_date DATETIME,
    status VARCHAR(50),                   -- "Active", "Inactive"
    moderation_status VARCHAR(50),        -- "Pending", "Approved", "Rejected"
    visibility VARCHAR(50)                -- "Public", "Private"
)
```

**Quan trọng:**
- `file_path`: Lưu đường dẫn tương đối đến file CSV
- `data_size_mb`: Kích thước file (tự động tính khi upload)
- File thật nằm ở file system, DB chỉ lưu metadata + path

---

## 📤 Upload Flow (Provider)

### Step 1: Provider Upload CSV qua API

**Request:**
```http
POST /api/datasets
Authorization: Bearer {provider_token}
Content-Type: multipart/form-data

Form Data:
- name: "Dữ liệu sạc xe điện Hà Nội Q1/2025"
- description: "Dữ liệu chi tiết về các phiên sạc..."
- category: "Charging Session"
- tierId: 2
- dataFormat: "CSV"
- file: [charging_data_hanoi_q1.csv]  ← File CSV thật
```

### Step 2: Backend xử lý

```csharp
// 1. Validate file
if (file.Extension != ".csv") throw error;

// 2. Generate unique filename
var fileName = $"{Guid.NewGuid()}_{file.FileName}";
// → "a1b2c3d4-e5f6-7890-abcd-ef1234567890_charging_data_hanoi_q1.csv"

// 3. Save to file system
var filePath = "Uploads/datasets/{fileName}";
await file.CopyToAsync(fileStream);

// 4. Calculate size
var fileSizeMb = file.Length / (1024 * 1024); // → 150.5 MB

// 5. Save metadata to database
var dataset = new Dataset {
    Name = "Dữ liệu sạc xe điện Hà Nội Q1/2025",
    FilePath = filePath,  // ← Chỉ lưu path, không lưu file content
    DataSizeMb = fileSizeMb,
    Status = "Pending",
    ModerationStatus = "Pending"
};
context.Datasets.Add(dataset);
await context.SaveChangesAsync();
```

---

## 📥 Download Flow (Consumer)

### Step 1: Consumer mua dataset
```http
POST /api/purchases/onetime
{
  "datasetId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### Step 2: Complete payment
```http
POST /api/payments/{id}/complete
```

### Step 3: Download file
```http
GET /api/datasets/1/download
Authorization: Bearer {consumer_token}
```

**Backend xử lý:**
```csharp
// 1. Check purchase
var hasPurchase = await context.OneTimePurchases
    .AnyAsync(p => p.DatasetId == id
        && p.ConsumerId == consumerId
        && p.Status == "Completed"
        && p.DownloadCount < p.MaxDownload);

if (!hasPurchase) return Forbid();

// 2. Get file path from database
var dataset = await context.Datasets.FindAsync(id);
var filePath = dataset.FilePath; // "Uploads/datasets/a1b2c3d4...csv"

// 3. Read file from file system
var fullPath = Path.Combine(environment.ContentRootPath, filePath);
var stream = File.OpenRead(fullPath);

// 4. Increment download count
purchase.DownloadCount++;
await context.SaveChangesAsync();

// 5. Return file
return File(stream, "application/octet-stream", "charging_data.csv");
```

---

## 🔍 Entities Liên Quan

### 1. **Dataset** (Main entity - ĐÃ CÓ)
```csharp
public class Dataset {
    public int DatasetId { get; set; }
    public string Name { get; set; }
    public string FilePath { get; set; }      // ← Path to CSV
    public decimal DataSizeMb { get; set; }   // ← File size
    public string Category { get; set; }      // ← Data type
    // ... other fields
}
```

### 2. **OneTimePurchase** (Track downloads - ĐÃ CÓ)
```csharp
public class OneTimePurchase {
    public int OtpId { get; set; }
    public int DatasetId { get; set; }
    public int ConsumerId { get; set; }
    public int DownloadCount { get; set; }    // ← Số lần đã tải
    public int MaxDownload { get; set; }      // ← Giới hạn (default 3)
    public string Status { get; set; }        // ← "Completed" mới được tải
}
```

### 3. **ChargingSession** (Optional - ĐÃ CÓ trong DB)
```csharp
// Nếu muốn lưu RAW DATA vào DB (không khuyến khích cho big data)
public class ChargingSession {
    public int SessionId { get; set; }
    public int PortId { get; set; }
    public string VehicleType { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal TotalEnergyKWh { get; set; }
    // ...
}
```

**Lưu ý:**
- ChargingSession entity đã có trong DB schema
- Nhưng KHÔNG dùng để lưu data từ CSV
- Chỉ dùng cho internal tracking (nếu cần)

---

## 💡 Tại sao không lưu CSV content vào DB?

### ❌ Bad Practice: Lưu file content vào DB
```sql
CREATE TABLE Dataset (
    dataset_id INT,
    csv_content VARBINARY(MAX)  -- ❌ Không nên!
)
```

**Lý do:**
- ❌ Database size quá lớn (100MB+ per file)
- ❌ Slow query performance
- ❌ Backup/restore khó khăn
- ❌ Không scale được

### ✅ Best Practice: Lưu file path
```sql
CREATE TABLE Dataset (
    dataset_id INT,
    file_path NVARCHAR(500)  -- ✅ Chỉ lưu path
)
```

**Lợi ích:**
- ✅ Database nhẹ, chỉ lưu metadata
- ✅ File system handle large files tốt hơn
- ✅ Dễ backup/restore
- ✅ Có thể dùng CDN/S3 sau này

---

## 📋 Sample CSV Templates

### Charging Session CSV
```csv
session_id,station_id,port_id,vehicle_type,start_time,end_time,total_energy_kWh,charging_duration_min
1,101,1001,VF8,2025-01-15 08:30:00,2025-01-15 09:45:00,45.5,75
2,101,1002,VF9,2025-01-15 09:00:00,2025-01-15 10:30:00,60.2,90
```

### Battery Performance CSV
```csv
vehicle_id,battery_type,soh_percent,soc_percent,charge_cycles,temperature,timestamp
VF001,LFP,95.5,80.0,150,35.2,2025-01-15 08:30:00
VF002,NMC,92.3,65.5,280,38.1,2025-01-15 08:31:00
```

### Station Info CSV
```csv
station_id,station_name,address,latitude,longitude,total_poles,total_ports,status
101,VinFast Charging Hà Nội,123 Láng Hạ,21.0285,105.8542,5,10,Active
102,EVN Charging TP.HCM,456 Nguyễn Huệ,10.7769,106.7009,8,16,Active
```

---

## 🎯 Summary

| Aspect | Storage Location | Entity |
|--------|-----------------|--------|
| **CSV File** | File System (`Uploads/datasets/`) | N/A |
| **File Path** | Database (`Dataset.FilePath`) | `Dataset` |
| **File Size** | Database (`Dataset.DataSizeMb`) | `Dataset` |
| **Metadata** | Database (name, description, category) | `Dataset` |
| **Purchase Info** | Database | `OneTimePurchase` |
| **Download Count** | Database | `OneTimePurchase.DownloadCount` |

**Kết luận:**
- ✅ CSV file → File system
- ✅ Metadata + Path → Database
- ✅ Entity `Dataset` đã có đầy đủ
- ✅ Entity `ChargingSession` có nhưng không dùng để lưu CSV data
