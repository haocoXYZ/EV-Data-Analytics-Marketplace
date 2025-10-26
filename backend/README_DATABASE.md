# EV Data Analytics Marketplace - Database Schema

## Tổng quan
Database schema được thiết kế cho nền tảng chợ dữ liệu phân tích xe điện, hỗ trợ core flow của dự án.

## Core Flow được hỗ trợ

### B1: Admin cung cấp bảng giá
- **Bảng**: `PricingTier`
- Admin thiết lập các gói giá khác nhau (Basic, Standard, Premium)
- Mỗi tier có giá cho: OneTime purchase, API calls, Subscription theo region
- Tỷ lệ chia revenue giữa Provider và Admin

### B2: Data Provider cung cấp thông tin
- **Bảng**: `Dataset`, `DataProvider`
- Provider upload dataset lên hệ thống
- Dataset được link với PricingTier để xác định giá

### B3: Moderator kiểm duyệt
- **Bảng**: `DatasetModeration`
- Moderator review dataset
- Trạng thái: Pending → UnderReview → Approved/Rejected
- Lưu lại comments và lịch sử kiểm duyệt

### B4: Data Consumer tìm kiếm
- **Bảng**: `Dataset` với filter
- Consumer tìm kiếm theo: category, region, price, format
- Chỉ hiển thị dataset đã approved

### B5: Data Consumer mua data theo gói

#### Gói Data (OneTime Purchase)
- **Bảng**: `OneTimePurchase`
- Mua 1 lần, chọn khoảng thời gian cụ thể
- Tải về file CSV (giới hạn số lần download)
- Có license type: Research/Commercial

#### Gói API
- **Bảng**: `APIPackage`
- Mua số lượng API calls
- Mỗi request trừ 1 call
- Có API key để authenticate
- Track số lượt đã dùng

#### Gói Subscription
- **Bảng**: `Subscription`
- Không giới hạn request cho 1 khu vực (province)
- Theo chu kỳ: Monthly/Quarterly/Yearly
- Auto-renewal hoặc manual

### B6: Thanh toán (PayOS)
- **Bảng**: `Payment`
- Tích hợp PayOS
- Track: payment_type, reference_id, payos_order_id
- Status: Pending → Completed/Failed

### B7: Admin quản lý revenue và payout
- **Bảng**: `RevenueShare`, `Payout`
- Mỗi payment được tính revenue share tự động
- Admin tổng hợp theo tháng
- Trả tiền cho Provider qua Payout table

## Các bảng chính

### User Management
- `User`: Quản lý tất cả users (Admin, Moderator, Provider, Consumer)
- `DataProvider`: Thông tin bổ sung cho Provider
- `DataConsumer`: Thông tin bổ sung cho Consumer

### Dataset Management
- `Dataset`: Thông tin dataset
- `DatasetModeration`: Lịch sử kiểm duyệt
- `PricingTier`: Bảng giá

### Purchase Management
- `OneTimePurchase`: Gói mua 1 lần
- `Subscription`: Gói thuê bao theo region
- `APIPackage`: Gói API calls

### Payment & Revenue
- `Payment`: Giao dịch thanh toán (PayOS)
- `RevenueShare`: Chia revenue giữa Provider và Admin
- `Payout`: Trả tiền cho Provider hàng tháng

### History & Analytics
- `OneTimePurchaseHistory`: Lịch sử download
- `SubscriptionHistory`: Lịch sử sử dụng subscription
- `APIHistory`: Lịch sử API calls

### Location & Infrastructure
- `Province`, `Ward`: Địa điểm
- `Station`, `Pole`, `Port`: Hạ tầng trạm sạc
- `ChargingSession`: Dữ liệu charging

## Indexes khuyến nghị (sẽ implement sau)

```sql
-- User lookups
CREATE INDEX idx_user_email ON [User](email);
CREATE INDEX idx_user_role ON [User](role);

-- Dataset search
CREATE INDEX idx_dataset_status ON Dataset(status);
CREATE INDEX idx_dataset_category ON Dataset(category);
CREATE INDEX idx_dataset_provider ON Dataset(provider_id);

-- Payment tracking
CREATE INDEX idx_payment_consumer ON Payment(consumer_id);
CREATE INDEX idx_payment_status ON Payment(status);
CREATE INDEX idx_payment_date ON Payment(payment_date);

-- API performance
CREATE INDEX idx_api_key ON APIPackage(api_key);
CREATE INDEX idx_api_consumer ON APIPackage(consumer_id);
```

## Notes
- Tất cả datetime fields đều có DEFAULT GETDATE()
- VARCHAR sizes được tối ưu cho performance
- Foreign keys được thiết lập đầy đủ cho data integrity
- Status fields sử dụng VARCHAR để dễ extend sau này
