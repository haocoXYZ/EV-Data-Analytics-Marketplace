-- =============================================
-- EV DATA ANALYTICS MARKETPLACE DATABASE SCHEMA
-- Version: 1.0
-- Description: Database cho nen tang cho du lieu phan tich xe dien
-- =============================================

-- ===================== ROLE =====================
CREATE TABLE [User] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Admin, Moderator, DataProvider, DataConsumer
    created_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(50) DEFAULT 'Active' -- Active, Inactive, Suspended
);

CREATE TABLE DataProvider (
    provider_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_website VARCHAR(255),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(20),
    address NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](user_id)
);

CREATE TABLE DataConsumer (
    consumer_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    organization_name VARCHAR(150),
    contact_person VARCHAR(150),
    contact_number VARCHAR(20),
    billing_email VARCHAR(150),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](user_id)
);

-- ============== STATION, POLE, PORT ==============
CREATE TABLE Station (
    station_id INT IDENTITY(1,1) PRIMARY KEY,
    ward_id INT,
    provider_id INT,
    station_name VARCHAR(150),
    address NVARCHAR(255),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    total_poles INT,
    total_ports INT,
    status VARCHAR(50),
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id)
);

CREATE TABLE Pole (
    pole_id INT IDENTITY(1,1) PRIMARY KEY,
    station_id INT,
    status VARCHAR(50),
    total_ports INT,
    power_rating_kW DECIMAL(10,2),
    FOREIGN KEY (station_id) REFERENCES Station(station_id)
);

CREATE TABLE Port (
    port_id INT IDENTITY(1,1) PRIMARY KEY,
    pole_id INT,
    connector_type VARCHAR(100),
    power_kW DECIMAL(10,2),
    status VARCHAR(50),
    vehicle_type VARCHAR(100),
    FOREIGN KEY (pole_id) REFERENCES Pole(pole_id)
);

-- =============== CHARGINGSESSION ===============
CREATE TABLE ChargingSession (
    session_id INT IDENTITY(1,1) PRIMARY KEY,
    port_id INT,
    vehicle_type VARCHAR(100),
    start_time DATETIME,
    end_time DATETIME,
    total_energy_kWh DECIMAL(10,2),
    charging_duration_min INT,
    occupied_duration_min INT,
    FOREIGN KEY (port_id) REFERENCES Port(port_id)
);

-- =================== LOCATION ===================
CREATE TABLE Province (
    province_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(150)
);

CREATE TABLE Ward (
    ward_id INT IDENTITY(1,1) PRIMARY KEY,
    province_id INT,
    name VARCHAR(150),
    FOREIGN KEY (province_id) REFERENCES Province(province_id)
);

-- =============== PRICING TIER ===============
-- B1: Admin cung cap bang gia cho cac muc thong tin khac nhau
CREATE TABLE PricingTier (
    tier_id INT IDENTITY(1,1) PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL, -- Basic, Standard, Premium
    description NVARCHAR(MAX),
    base_price_per_mb DECIMAL(18,2), -- Gia co ban theo MB
    api_price_per_call DECIMAL(18,2), -- Gia moi lan goi API
    subscription_price_per_region DECIMAL(18,2), -- Gia thue bao theo khu vuc
    provider_commission_percent DECIMAL(5,2), -- % chia cho provider (VD: 70%)
    admin_commission_percent DECIMAL(5,2), -- % giu lai cho admin (VD: 30%)
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- =================== DATASET ===================
CREATE TABLE Dataset (
    dataset_id INT IDENTITY(1,1) PRIMARY KEY,
    provider_id INT,
    port_id INT,
    tier_id INT, -- Lien ket voi bang gia
    name VARCHAR(255),
    description NVARCHAR(MAX),
    category VARCHAR(150),
    data_format VARCHAR(50),
    data_size_mb DECIMAL(18,2),
    upload_date DATETIME,
    last_updated DATETIME,
    status VARCHAR(50), -- Pending, Approved, Rejected, Active, Inactive
    visibility VARCHAR(50), -- Public, Private
    moderation_status VARCHAR(50) DEFAULT 'Pending', -- Pending, UnderReview, Approved, Rejected
    file_path NVARCHAR(500), -- Duong dan luu file CSV
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id),
    FOREIGN KEY (port_id) REFERENCES Port(port_id),
    FOREIGN KEY (tier_id) REFERENCES PricingTier(tier_id)
);

-- ============ DATASET MODERATION ============
-- B3: Moderator kiem duyet va dang tai thong tin
CREATE TABLE DatasetModeration (
    moderation_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    moderator_user_id INT, -- User co role Moderator/Admin
    review_date DATETIME DEFAULT GETDATE(),
    moderation_status VARCHAR(50), -- Approved, Rejected, NeedRevision
    comments NVARCHAR(MAX),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (moderator_user_id) REFERENCES [User](user_id)
);

-- ====== ONETIMEPURCHASE, SUBSCRIPTION, API ======
-- B5: Data Consumer chon va mua data theo goi

-- Goi data: Mua 1 lan vao khoang thoi gian cu the, tai ve qua file (CSV)
CREATE TABLE OneTimePurchase (
    otp_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    consumer_id INT,
    purchase_date DATETIME DEFAULT GETDATE(),
    start_date DATETIME, -- Thoi gian bat dau cua data
    end_date DATETIME, -- Thoi gian ket thuc cua data
    total_price DECIMAL(18,2),
    license_type VARCHAR(50), -- Research, Commercial
    download_count INT DEFAULT 0, -- So lan da tai
    max_download INT DEFAULT 3, -- Gioi han so lan tai
    status VARCHAR(50), -- Pending, Completed, Expired
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

-- Goi thue bao: So lan request khong gioi han cho mot khu vuc nhat dinh
CREATE TABLE Subscription (
    sub_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    consumer_id INT,
    province_id INT, -- Khu vuc duoc phep truy cap (tinh/thanh)
    sub_start DATETIME,
    sub_end DATETIME,
    renewal_status VARCHAR(50), -- Active, Cancelled, Expired
    renewal_cycle VARCHAR(50), -- Monthly, Quarterly, Yearly
    total_price DECIMAL(18,2),
    request_count INT DEFAULT 0, -- Dem so lan request (khong gioi han nhung de thong ke)
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id),
    FOREIGN KEY (province_id) REFERENCES Province(province_id)
);

-- Goi API: So lan tra phi = so luot request API
CREATE TABLE APIPackage (
    api_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    consumer_id INT,
    api_key VARCHAR(255) UNIQUE, -- API key de xac thuc
    api_calls_purchased INT, -- So luot goi da mua
    api_calls_used INT DEFAULT 0, -- So luot da su dung
    price_per_call DECIMAL(18,2),
    purchase_date DATETIME DEFAULT GETDATE(),
    expiry_date DATETIME, -- Ngay het han (neu co)
    total_paid DECIMAL(18,2),
    status VARCHAR(50), -- Active, Exhausted, Expired
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

-- =================== PAYMENT ===================
-- B6: Data Consumer thanh toan va su dung (PayOS integration)
CREATE TABLE Payment (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    consumer_id INT,
    amount DECIMAL(18,2),
    payment_date DATETIME DEFAULT GETDATE(),
    payment_method VARCHAR(100), -- PayOS, BankTransfer, etc.
    payment_type VARCHAR(100), -- OneTimePurchase, Subscription, APIPackage
    reference_id INT, -- ID cua otp_id, sub_id, hoac api_id
    status VARCHAR(50), -- Pending, Completed, Failed, Refunded
    transaction_ref VARCHAR(100), -- Ma giao dich tu PayOS
    payos_order_id VARCHAR(100), -- Order ID tu PayOS
    notes NVARCHAR(MAX),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

-- =================== HISTORY ===================
CREATE TABLE OneTimePurchaseHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    otp_id INT,
    payment_id INT,
    dataset_id INT,
    consumer_id INT,
    access_date DATETIME DEFAULT GETDATE(),
    data_volume_mb DECIMAL(18,2),
    download_url NVARCHAR(500), -- URL tai file CSV
    access_type VARCHAR(50), -- Download
    FOREIGN KEY (otp_id) REFERENCES OneTimePurchase(otp_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

CREATE TABLE SubscriptionHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    subscription_id INT,
    payment_id INT,
    dataset_id INT,
    consumer_id INT,
    usage_date DATETIME DEFAULT GETDATE(),
    province_id INT, -- Khu vuc duoc truy cap
    data_volume_mb DECIMAL(18,2),
    delivery_status VARCHAR(50), -- Success, Failed
    FOREIGN KEY (subscription_id) REFERENCES Subscription(sub_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id),
    FOREIGN KEY (province_id) REFERENCES Province(province_id)
);

CREATE TABLE APIHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    api_id INT,
    payment_id INT,
    dataset_id INT,
    consumer_id INT,
    call_time DATETIME DEFAULT GETDATE(),
    endpoint VARCHAR(255),
    request_params NVARCHAR(MAX), -- Tham so request (JSON)
    response_size_mb DECIMAL(18,2),
    status VARCHAR(50), -- Success, Failed, RateLimited
    FOREIGN KEY (api_id) REFERENCES APIPackage(api_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

-- ================ REVENUESHARE ================
-- B7: Admin quan ly thanh toan va tra tien cho Data Provider moi thang
CREATE TABLE RevenueShare (
    share_id INT IDENTITY(1,1) PRIMARY KEY,
    payment_id INT,
    provider_id INT,
    dataset_id INT,
    total_amount DECIMAL(18,2), -- Tong tien tu giao dich
    provider_share DECIMAL(18,2), -- Phan provider nhan (VD: 70%)
    admin_share DECIMAL(18,2), -- Phan admin giu lai (VD: 30%)
    calculated_date DATETIME DEFAULT GETDATE(),
    payout_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Paid
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id)
);

-- =================== PAYOUT ===================
-- B7: Tra tien cho Provider hang thang
CREATE TABLE Payout (
    payout_id INT IDENTITY(1,1) PRIMARY KEY,
    provider_id INT,
    month_year VARCHAR(7), -- Format: 2025-01, 2025-02
    total_due DECIMAL(18,2), -- Tong tien can tra
    payout_date DATETIME,
    payout_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Failed
    payment_method VARCHAR(100), -- BankTransfer, PayOS, etc.
    bank_account VARCHAR(100), -- So tai khoan ngan hang
    transaction_ref VARCHAR(100), -- Ma giao dich
    notes NVARCHAR(MAX),
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id)
);
