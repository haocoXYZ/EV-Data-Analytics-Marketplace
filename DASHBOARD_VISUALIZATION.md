# 📊 Subscription Dashboard - Visualization Guide

## 🎯 Overview

Subscription Dashboard đã được nâng cấp với **biểu đồ trực quan** (interactive charts) sử dụng thư viện **Recharts**. Dashboard hiển thị dữ liệu **thô (raw data)** thật sự từ các provider uploads, không phải mock data.

---

## 🔧 Technical Stack

### Frontend
- **React + TypeScript**
- **Recharts** - Thư viện charting cho React
- **TailwindCSS** - Styling

### Backend
- **ASP.NET Core Web API**
- **Entity Framework Core**
- **SQL Server** - Lưu trữ dữ liệu thô trong bảng `DatasetRecords`

---

## 📈 Dashboard Features

### 1. **KPI Cards** (Thống kê tổng quan)
- 📍 Total Charging Stations
- ⚡ Total Energy Consumed (kWh)
- ⏱️ Average Charging Duration (minutes)
- 📊 Total Charging Sessions

### 2. **Area Chart - Energy Consumption Over Time**
- Hiển thị xu hướng tiêu thụ năng lượng theo ngày
- Gradient fill màu xanh
- Dữ liệu: 30 ngày gần nhất
- Trục X: Ngày (MMM dd format)
- Trục Y: Energy (kWh)

### 3. **Pie Chart - Station Distribution by District**
- Phân bố số lượng trạm sạc theo quận/huyện
- Multi-color segments
- Label hiển thị phần trăm
- Interactive tooltips

### 4. **Bar Chart - Peak Charging Hours (24h)**
- Phân tích giờ cao điểm sạc xe
- 24 cột đại diện cho 24 giờ trong ngày (00:00 - 23:00)
- Màu gradient dựa trên số lượng sessions
- Rounded corners cho bars

---

## 🔄 Data Flow

```
Provider Uploads CSV
        ↓
CsvParserService validates & parses
        ↓
Saved to DatasetRecords table (raw data)
        ↓
Consumer purchases Subscription (by Province/District)
        ↓
Dashboard queries DatasetRecords
        ↓
Backend aggregates & formats data
        ↓
Frontend renders charts with Recharts
```

---

## 📡 API Endpoints

### 1. Get Dashboard Overview
```http
GET /api/subscription-packages/{subscriptionId}/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "subscriptionId": 1,
  "provinceName": "Hồ Chí Minh",
  "districtName": "Quận 1",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00",
    "endDate": "2024-02-01T00:00:00"
  },
  "totalStations": 15,
  "totalEnergyKwh": 12500.50,
  "averageChargingDuration": 45.5,
  "totalChargingSessions": 850
}
```

### 2. Get Energy Over Time Chart
```http
GET /api/subscription-packages/{subscriptionId}/charts/energy-over-time?days=30
Authorization: Bearer {token}
```

**Response:**
```json
[
  { "label": "Jan 01", "value": 450.25 },
  { "label": "Jan 02", "value": 520.80 },
  { "label": "Jan 03", "value": 380.50 }
]
```

### 3. Get Station Distribution Chart
```http
GET /api/subscription-packages/{subscriptionId}/charts/station-distribution
Authorization: Bearer {token}
```

**Response:**
```json
[
  { "label": "Quận 1", "value": 25 },
  { "label": "Quận 3", "value": 18 },
  { "label": "Quận 5", "value": 12 }
]
```

### 4. Get Peak Hours Chart
```http
GET /api/subscription-packages/{subscriptionId}/charts/peak-hours
Authorization: Bearer {token}
```

**Response:**
```json
[
  { "label": "00:00", "value": 5 },
  { "label": "01:00", "value": 2 },
  ...
  { "label": "23:00", "value": 8 }
]
```

---

## 🗄️ Database Schema

### DatasetRecords Table
Lưu trữ dữ liệu thô (raw data) từ provider uploads:

```sql
CREATE TABLE DatasetRecords (
    RecordId BIGINT PRIMARY KEY IDENTITY,
    DatasetId INT NOT NULL,
    ProvinceId INT NOT NULL,
    DistrictId INT NOT NULL,
    StationId NVARCHAR(100) NOT NULL,
    StationName NVARCHAR(255) NOT NULL,
    ChargingTimestamp DATETIME NOT NULL,
    EnergyKwh DECIMAL(18,4) NOT NULL,
    DurationMinutes DECIMAL(10,2),
    PowerKw DECIMAL(10,2),
    VehicleType NVARCHAR(100),
    DataSource NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE()
)
```

---

## 🚀 How to Use

### For Data Providers:
1. Login as Provider
2. Upload CSV file với format chuẩn
3. Dữ liệu được parse và lưu vào `DatasetRecords`
4. Admin approve dataset

### For Data Consumers:
1. Login as Consumer
2. Mua Subscription package (chọn Province/District)
3. Vào "My Purchases" → Tab "Subscriptions"
4. Click "View Dashboard" để xem biểu đồ
5. Dashboard hiển thị dữ liệu thật từ provider uploads

---

## 🎨 Customization

### Chart Colors
Được định nghĩa trong `SubscriptionDashboard.tsx`:
```typescript
const CHART_COLORS = [
  '#3B82F6',  // Blue
  '#10B981',  // Green
  '#F59E0B',  // Orange
  '#EF4444',  // Red
  '#8B5CF6',  // Purple
  '#EC4899',  // Pink
  '#06B6D4',  // Cyan
  '#84CC16'   // Lime
]
```

### Chart Styling
- Modern gradient fills
- Rounded corners
- Custom tooltips với shadow
- Responsive design (adapts to screen size)

---

## 📊 Data Aggregation Logic

### Backend Processing:
1. **Filter by Location**: Province + District (if specified)
2. **Filter by Status**: Only "Approved" datasets
3. **Filter by Date**: Last 30 days
4. **Grouping**:
   - Energy Over Time: GROUP BY Date
   - Station Distribution: GROUP BY District, COUNT DISTINCT StationId
   - Peak Hours: GROUP BY Hour (0-23)

---

## 🔐 Security

- Dashboard requires **active subscription**
- JWT Bearer token authentication
- Access count tracking (`DashboardAccessCount`)
- Last access date logging
- Consumer can only view their own subscriptions

---

## 🐛 Troubleshooting

### No data showing in charts?
1. Check if providers have uploaded data
2. Check if datasets are "Approved" by admin
3. Check date range (last 30 days)
4. Check subscription status (must be "Active")

### Charts not rendering?
1. Clear browser cache
2. Check browser console for errors
3. Ensure Recharts is installed: `npm install recharts`
4. Check responsive container dimensions

---

## 📝 Future Enhancements

- [ ] Export chart data to PDF/Excel
- [ ] Real-time updates with SignalR
- [ ] Date range picker for custom periods
- [ ] More chart types (Heatmap, Scatter plot)
- [ ] Comparison mode (multiple provinces)
- [ ] Predictive analytics with ML models

---

## 📞 Support

For technical support or questions:
- Email: support@evdatamarketplace.com
- Documentation: https://docs.evdatamarketplace.com


