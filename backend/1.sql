Database

-- ===================== ROLE =====================
CREATE TABLE [User] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(50) DEFAULT 'Active'
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

-- =================== DATASET ===================
CREATE TABLE Dataset (
    dataset_id INT IDENTITY(1,1) PRIMARY KEY,
    provider_id INT,
    port_id INT,
    name VARCHAR(255),
    description NVARCHAR(MAX),
    category VARCHAR(150),
    price DECIMAL(18,2),
    access_type VARCHAR(50),
    data_format VARCHAR(50),
    data_size_mb DECIMAL(18,2),
    upload_date DATETIME,
    last_updated DATETIME,
    status VARCHAR(50),
    visibility VARCHAR(50),
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id),
    FOREIGN KEY (port_id) REFERENCES Port(port_id)
);

-- ====== ONETIMEPURCHASE, SUBSCRIPTION, API ======
CREATE TABLE OneTimePurchase (
    otp_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    consumer_id INT,
    purchase_date DATETIME,
    total_price DECIMAL(18,2),
    license_type VARCHAR(50),
    status VARCHAR(50),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

CREATE TABLE Subscription (
    sub_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    consumer_id INT,
    sub_start DATETIME,
    sub_end DATETIME,
    renewal_status VARCHAR(50),
    renewal_cycle VARCHAR(50),
    total_price DECIMAL(18,2),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

CREATE TABLE API (
    api_id INT IDENTITY(1,1) PRIMARY KEY,
    dataset_id INT,
    consumer_id INT,
    api_key VARCHAR(255),
    api_calls_limit INT,
    price_per_call DECIMAL(18,2),
    billing_period_start DATETIME,
    billing_period_end DATETIME,
    total_billed_amount DECIMAL(18,2),
    status VARCHAR(50),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

-- =================== PAYMENT ===================
CREATE TABLE Payment (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    consumer_id INT,
    amount DECIMAL(18,2),
    payment_date DATETIME,
    payment_method VARCHAR(100),
    payment_type VARCHAR(100),
    status VARCHAR(50),
    transaction_ref VARCHAR(100),
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
    access_date DATETIME,
    data_volume_mb DECIMAL(18,2),
    access_type VARCHAR(50),
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
    usage_date DATETIME,
    data_volume_mb DECIMAL(18,2),
    delivery_status VARCHAR(50),
    FOREIGN KEY (subscription_id) REFERENCES Subscription(sub_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

CREATE TABLE APIHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    api_id INT,
    payment_id INT,
    dataset_id INT,
    consumer_id INT,
    call_time DATETIME,
    endpoint VARCHAR(255),
    data_volume_mb DECIMAL(18,2),
    status VARCHAR(50),
    FOREIGN KEY (api_id) REFERENCES API(api_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id),
    FOREIGN KEY (consumer_id) REFERENCES DataConsumer(consumer_id)
);

-- ================ REVENUESHARE ================
CREATE TABLE RevenueShare (
    share_id INT IDENTITY(1,1) PRIMARY KEY,
    payment_id INT,
    provider_id INT,
    dataset_id INT,
    total_amount DECIMAL(18,2),
    provider_share DECIMAL(18,2),
    admin_share DECIMAL(18,2),
    calculated_date DATETIME DEFAULT GETDATE(),
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id),
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id),
    FOREIGN KEY (dataset_id) REFERENCES Dataset(dataset_id)
);

-- =================== PAYOUT ===================
CREATE TABLE Payout (
    payout_id INT IDENTITY(1,1) PRIMARY KEY,
    provider_id INT,
    month_year VARCHAR(7),
    total_due DECIMAL(18,2),
    payout_date DATETIME,
    payout_status VARCHAR(50) DEFAULT 'Pending',
    payment_method VARCHAR(100),
    notes NVARCHAR(MAX),
    FOREIGN KEY (provider_id) REFERENCES DataProvider(provider_id)
);
