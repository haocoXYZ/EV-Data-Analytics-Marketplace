-- =====================================================
-- CREATE NEW DATABASE SCRIPT
-- Purpose: Create fresh EVDataMarketplace database
-- with current scope tables only
-- =====================================================

USE [master]
GO

-- Drop database if exists
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'EVDataMarketplace')
BEGIN
    ALTER DATABASE [EVDataMarketplace] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [EVDataMarketplace];
    PRINT 'Dropped existing EVDataMarketplace database';
END
GO

-- Create new database
CREATE DATABASE [EVDataMarketplace]
GO

USE [EVDataMarketplace]
GO

PRINT '===== CREATING DATABASE TABLES =====';
PRINT '';

-- =====================================================
-- CORE TABLES
-- =====================================================

-- ----------------------------------------------------
-- User Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[User] (
    [user_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [email] NVARCHAR(150) NOT NULL UNIQUE,
    [password] NVARCHAR(255) NOT NULL,
    [full_name] NVARCHAR(150) NOT NULL,
    [role] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Active',
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    INDEX IX_User_Email (email),
    INDEX IX_User_Role (role)
);
PRINT '✓ Created User table';

-- ----------------------------------------------------
-- DataProvider Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[DataProvider] (
    [provider_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] INT NOT NULL,
    [company_name] NVARCHAR(200) NULL,
    [province_id] INT NULL,
    [contact_person] NVARCHAR(150) NULL,
    [contact_number] NVARCHAR(20) NULL,
    [website] NVARCHAR(255) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_DataProvider_User FOREIGN KEY ([user_id]) REFERENCES [User]([user_id])
);
PRINT '✓ Created DataProvider table';

-- ----------------------------------------------------
-- DataConsumer Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[DataConsumer] (
    [consumer_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] INT NOT NULL,
    [organization_name] NVARCHAR(150) NULL,
    [contact_person] NVARCHAR(150) NULL,
    [contact_number] NVARCHAR(20) NULL,
    [billing_email] NVARCHAR(150) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_DataConsumer_User FOREIGN KEY ([user_id]) REFERENCES [User]([user_id])
);
PRINT '✓ Created DataConsumer table';

-- =====================================================
-- LOCATION TABLES
-- =====================================================

-- ----------------------------------------------------
-- Province Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[Province] (
    [province_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(150) NOT NULL,
    [type] NVARCHAR(100) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE()
);
PRINT '✓ Created Province table';

-- ----------------------------------------------------
-- District Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[District] (
    [district_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [province_id] INT NOT NULL,
    [name] NVARCHAR(150) NOT NULL,
    [type] NVARCHAR(100) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_District_Province FOREIGN KEY ([province_id]) REFERENCES [Province]([province_id])
);
PRINT '✓ Created District table';

-- =====================================================
-- PRICING TABLE (NEW UNIFIED SYSTEM)
-- =====================================================

-- ----------------------------------------------------
-- SystemPricing Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[SystemPricing] (
    [pricing_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [package_type] NVARCHAR(50) NOT NULL,
    [price_per_row] DECIMAL(18,4) NULL,
    [subscription_monthly_base] DECIMAL(18,2) NULL,
    [api_price_per_call] DECIMAL(18,4) NULL,
    [provider_commission_percent] DECIMAL(5,2) NOT NULL DEFAULT 70,
    [admin_commission_percent] DECIMAL(5,2) NOT NULL DEFAULT 30,
    [is_active] BIT NOT NULL DEFAULT 1,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE()
);
PRINT '✓ Created SystemPricing table';

-- =====================================================
-- DATASET TABLES
-- =====================================================

-- ----------------------------------------------------
-- Dataset Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[Dataset] (
    [dataset_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [provider_id] INT NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX) NULL,
    [category] NVARCHAR(150) NULL,
    [row_count] INT NOT NULL DEFAULT 0,
    [upload_date] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [last_updated] DATETIME2(7) NULL,
    [status] NVARCHAR(50) NULL,
    [moderation_status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CONSTRAINT FK_Dataset_Provider FOREIGN KEY ([provider_id]) REFERENCES [DataProvider]([provider_id]),
    INDEX IX_Dataset_Status (status),
    INDEX IX_Dataset_Category (category),
    INDEX IX_Dataset_ModerationStatus (moderation_status)
);
PRINT '✓ Created Dataset table';

-- ----------------------------------------------------
-- DatasetRecords Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[DatasetRecords] (
    [RecordId] BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DatasetId] INT NOT NULL,
    [province_id] INT NOT NULL,
    [district_id] INT NOT NULL,
    [station_id] NVARCHAR(100) NOT NULL,
    [station_name] NVARCHAR(255) NOT NULL,
    [station_address] NVARCHAR(500) NULL,
    [station_operator] NVARCHAR(100) NULL,
    [charging_timestamp] DATETIME2(7) NOT NULL,
    [energy_kwh] DECIMAL(18,4) NOT NULL,
    [voltage] DECIMAL(10,2) NULL,
    [current] DECIMAL(10,2) NULL,
    [power_kw] DECIMAL(10,2) NULL,
    [duration_minutes] DECIMAL(10,2) NULL,
    [charging_cost] DECIMAL(18,2) NULL,
    [vehicle_type] NVARCHAR(100) NULL,
    [battery_capacity_kwh] DECIMAL(10,2) NULL,
    [soc_start] DECIMAL(5,2) NULL,
    [soc_end] DECIMAL(5,2) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [data_source] NVARCHAR(100) NULL,
    CONSTRAINT FK_DatasetRecords_Dataset FOREIGN KEY ([DatasetId]) REFERENCES [Dataset]([dataset_id]) ON DELETE CASCADE,
    CONSTRAINT FK_DatasetRecords_Province FOREIGN KEY ([province_id]) REFERENCES [Province]([province_id]),
    CONSTRAINT FK_DatasetRecords_District FOREIGN KEY ([district_id]) REFERENCES [District]([district_id]),
    INDEX IX_DatasetRecords_DatasetId ([DatasetId]),
    INDEX IX_DatasetRecords_Province_District ([province_id], [district_id]),
    INDEX IX_DatasetRecords_Timestamp ([charging_timestamp])
);
PRINT '✓ Created DatasetRecords table';

-- ----------------------------------------------------
-- DatasetModeration Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[DatasetModeration] (
    [moderation_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [dataset_id] INT NOT NULL,
    [moderator_user_id] INT NOT NULL,
    [review_date] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [moderation_status] NVARCHAR(50) NOT NULL,
    [comments] NVARCHAR(MAX) NULL,
    CONSTRAINT FK_DatasetModeration_Dataset FOREIGN KEY ([dataset_id]) REFERENCES [Dataset]([dataset_id]),
    CONSTRAINT FK_DatasetModeration_Moderator FOREIGN KEY ([moderator_user_id]) REFERENCES [User]([user_id])
);
PRINT '✓ Created DatasetModeration table';

-- =====================================================
-- PURCHASE TABLES (NEW SYSTEM)
-- =====================================================

-- ----------------------------------------------------
-- DataPackagePurchase Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[DataPackagePurchase] (
    [purchase_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [consumer_id] INT NOT NULL,
    [province_id] INT NOT NULL,
    [district_id] INT NULL,
    [start_date] DATETIME2(7) NULL,
    [end_date] DATETIME2(7) NULL,
    [row_count] INT NOT NULL,
    [price_per_row] DECIMAL(18,4) NOT NULL,
    [total_price] DECIMAL(18,2) NOT NULL,
    [purchase_date] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [download_count] INT NOT NULL DEFAULT 0,
    [max_download] INT NOT NULL DEFAULT 5,
    [last_download_date] DATETIME2(7) NULL,
    CONSTRAINT FK_DataPackagePurchase_Consumer FOREIGN KEY ([consumer_id]) REFERENCES [DataConsumer]([consumer_id]),
    CONSTRAINT FK_DataPackagePurchase_Province FOREIGN KEY ([province_id]) REFERENCES [Province]([province_id]),
    CONSTRAINT FK_DataPackagePurchase_District FOREIGN KEY ([district_id]) REFERENCES [District]([district_id])
);
PRINT '✓ Created DataPackagePurchase table';

-- ----------------------------------------------------
-- SubscriptionPackagePurchase Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[SubscriptionPackagePurchase] (
    [subscription_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [consumer_id] INT NOT NULL,
    [province_id] INT NOT NULL,
    [district_id] INT NULL,
    [monthly_price] DECIMAL(18,2) NOT NULL,
    [duration_months] INT NOT NULL,
    [total_paid] DECIMAL(18,2) NOT NULL,
    [start_date] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [end_date] DATETIME2(7) NOT NULL,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [auto_renew] BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_SubscriptionPackagePurchase_Consumer FOREIGN KEY ([consumer_id]) REFERENCES [DataConsumer]([consumer_id]),
    CONSTRAINT FK_SubscriptionPackagePurchase_Province FOREIGN KEY ([province_id]) REFERENCES [Province]([province_id]),
    CONSTRAINT FK_SubscriptionPackagePurchase_District FOREIGN KEY ([district_id]) REFERENCES [District]([district_id])
);
PRINT '✓ Created SubscriptionPackagePurchase table';

-- ----------------------------------------------------
-- APIPackagePurchase Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[APIPackagePurchase] (
    [api_purchase_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [consumer_id] INT NOT NULL,
    [province_id] INT NULL,
    [district_id] INT NULL,
    [api_calls_purchased] INT NOT NULL,
    [api_calls_used] INT NOT NULL DEFAULT 0,
    [price_per_call] DECIMAL(18,4) NOT NULL,
    [total_paid] DECIMAL(18,2) NOT NULL,
    [purchase_date] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [expiry_date] DATETIME2(7) NULL,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CONSTRAINT FK_APIPackagePurchase_Consumer FOREIGN KEY ([consumer_id]) REFERENCES [DataConsumer]([consumer_id]),
    CONSTRAINT FK_APIPackagePurchase_Province FOREIGN KEY ([province_id]) REFERENCES [Province]([province_id]),
    CONSTRAINT FK_APIPackagePurchase_District FOREIGN KEY ([district_id]) REFERENCES [District]([district_id])
);
PRINT '✓ Created APIPackagePurchase table';

-- ----------------------------------------------------
-- APIKey Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[APIKey] (
    [key_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [api_purchase_id] INT NOT NULL,
    [consumer_id] INT NOT NULL,
    [key_value] NVARCHAR(255) NOT NULL UNIQUE,
    [key_name] NVARCHAR(255) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [last_used_at] DATETIME2(7) NULL,
    [is_active] BIT NOT NULL DEFAULT 1,
    [revoked_at] DATETIME2(7) NULL,
    [revoked_reason] NVARCHAR(500) NULL,
    [requests_today] INT NOT NULL DEFAULT 0,
    [last_request_date] DATETIME2(7) NULL,
    CONSTRAINT FK_APIKey_APIPackagePurchase FOREIGN KEY ([api_purchase_id]) REFERENCES [APIPackagePurchase]([api_purchase_id]),
    CONSTRAINT FK_APIKey_Consumer FOREIGN KEY ([consumer_id]) REFERENCES [DataConsumer]([consumer_id]),
    INDEX IX_APIKey_KeyValue ([key_value])
);
PRINT '✓ Created APIKey table';

-- =====================================================
-- PAYMENT & REVENUE TABLES
-- =====================================================

-- ----------------------------------------------------
-- Payment Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[Payment] (
    [payment_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [consumer_id] INT NOT NULL,
    [payment_type] NVARCHAR(50) NOT NULL,
    [reference_id] INT NOT NULL,
    [amount] DECIMAL(18,2) NOT NULL,
    [payment_method] NVARCHAR(50) NULL,
    [payment_date] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [transaction_id] NVARCHAR(255) NULL,
    [completed_at] DATETIME2(7) NULL,
    CONSTRAINT FK_Payment_Consumer FOREIGN KEY ([consumer_id]) REFERENCES [DataConsumer]([consumer_id]),
    INDEX IX_Payment_Status (status),
    INDEX IX_Payment_Date (payment_date)
);
PRINT '✓ Created Payment table';

-- ----------------------------------------------------
-- RevenueShare Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[RevenueShare] (
    [revenue_share_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [payment_id] INT NOT NULL,
    [provider_id] INT NOT NULL,
    [total_amount] DECIMAL(18,2) NOT NULL,
    [provider_share] DECIMAL(18,2) NOT NULL,
    [admin_share] DECIMAL(18,2) NOT NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [is_paid_to_provider] BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_RevenueShare_Payment FOREIGN KEY ([payment_id]) REFERENCES [Payment]([payment_id]),
    CONSTRAINT FK_RevenueShare_Provider FOREIGN KEY ([provider_id]) REFERENCES [DataProvider]([provider_id])
);
PRINT '✓ Created RevenueShare table';

-- ----------------------------------------------------
-- Payout Table
-- ----------------------------------------------------
CREATE TABLE [dbo].[Payout] (
    [payout_id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [provider_id] INT NOT NULL,
    [month] NVARCHAR(20) NOT NULL,
    [total_due] DECIMAL(18,2) NOT NULL,
    [status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [processed_date] DATETIME2(7) NULL,
    [notes] NVARCHAR(500) NULL,
    CONSTRAINT FK_Payout_Provider FOREIGN KEY ([provider_id]) REFERENCES [DataProvider]([provider_id])
);
PRINT '✓ Created Payout table';

PRINT '';
PRINT '===== DATABASE TABLES CREATED =====';
PRINT '';

-- =====================================================
-- SEED DATA
-- =====================================================

PRINT '===== SEEDING DATA =====';
PRINT '';

-- ----------------------------------------------------
-- 1. SystemPricing
-- ----------------------------------------------------
PRINT '1. Seeding SystemPricing...';
INSERT INTO [dbo].[SystemPricing] (package_type, price_per_row, subscription_monthly_base, api_price_per_call, provider_commission_percent, admin_commission_percent, is_active, created_at)
VALUES
('DataPackage', 100.0000, NULL, NULL, 70.00, 30.00, 1, GETDATE()),
('Subscription', NULL, 500000.00, NULL, 70.00, 30.00, 1, GETDATE()),
('APIPackage', NULL, NULL, 50.0000, 70.00, 30.00, 1, GETDATE());
PRINT '   ✓ Inserted 3 pricing tiers';

-- ----------------------------------------------------
-- 2. Users
-- ----------------------------------------------------
PRINT '2. Seeding Users...';
-- Password: Test123! (hashed with BCrypt)
DECLARE @PasswordHash NVARCHAR(500) = '$2a$11$K3W9Z8L2xF1jY4vR6nT8wuH3yQ5pL7mN9jK2cX1dA8fE6rB4tG0hS';

INSERT INTO [dbo].[User] (email, [password], full_name, role, [status], created_at)
VALUES
('admin@test.com', @PasswordHash, 'Admin User', 'Admin', 'Active', GETDATE()),
('moderator@test.com', @PasswordHash, 'Moderator User', 'Moderator', 'Active', GETDATE()),
('provider@test.com', @PasswordHash, 'Test Provider', 'DataProvider', 'Active', GETDATE()),
('consumer@test.com', @PasswordHash, 'Test Consumer', 'DataConsumer', 'Active', GETDATE());

DECLARE @AdminId INT = (SELECT user_id FROM [User] WHERE email = 'admin@test.com');
DECLARE @ModeratorId INT = (SELECT user_id FROM [User] WHERE email = 'moderator@test.com');
DECLARE @ProviderId INT = (SELECT user_id FROM [User] WHERE email = 'provider@test.com');
DECLARE @ConsumerId INT = (SELECT user_id FROM [User] WHERE email = 'consumer@test.com');

PRINT '   ✓ Inserted 4 users';

-- ----------------------------------------------------
-- 3. Provinces
-- ----------------------------------------------------
PRINT '3. Seeding Provinces...';
INSERT INTO [dbo].[Province] (name, type, created_at)
VALUES
('Hà Nội', 'Thành phố trực thuộc TW', GETDATE()),
('Hồ Chí Minh', 'Thành phố trực thuộc TW', GETDATE()),
('Đà Nẵng', 'Thành phố trực thuộc TW', GETDATE()),
('Hải Phòng', 'Thành phố trực thuộc TW', GETDATE()),
('Cần Thơ', 'Thành phố trực thuộc TW', GETDATE());
PRINT '   ✓ Inserted 5 provinces';

-- ----------------------------------------------------
-- 4. Districts
-- ----------------------------------------------------
PRINT '4. Seeding Districts...';
INSERT INTO [dbo].[District] (province_id, name, type, created_at)
VALUES
(1, 'Ba Đình', 'Quận', GETDATE()),
(1, 'Hoàn Kiếm', 'Quận', GETDATE()),
(1, 'Đống Đa', 'Quận', GETDATE()),
(2, 'Quận 1', 'Quận', GETDATE()),
(2, 'Quận 2', 'Quận', GETDATE()),
(2, 'Quận 3', 'Quận', GETDATE()),
(3, 'Hải Châu', 'Quận', GETDATE()),
(3, 'Thanh Khê', 'Quận', GETDATE());
PRINT '   ✓ Inserted 8 districts';

-- ----------------------------------------------------
-- 5. DataProvider
-- ----------------------------------------------------
PRINT '5. Seeding DataProvider...';
INSERT INTO [dbo].[DataProvider] (user_id, company_name, province_id, contact_person, contact_number, website, created_at)
VALUES
(@ProviderId, 'VinFast Energy Solutions', 1, 'Nguyen Van A', '0901234567', 'https://vinfast.vn', GETDATE());

DECLARE @DataProviderId INT = SCOPE_IDENTITY();
PRINT '   ✓ Inserted 1 data provider';

-- ----------------------------------------------------
-- 6. DataConsumer
-- ----------------------------------------------------
PRINT '6. Seeding DataConsumer...';
INSERT INTO [dbo].[DataConsumer] (user_id, organization_name, contact_person, contact_number, billing_email, created_at)
VALUES
(@ConsumerId, 'EV Analytics Corp', 'Tran Thi B', '0912345678', 'billing@evanalytics.com', GETDATE());

DECLARE @DataConsumerId INT = SCOPE_IDENTITY();
PRINT '   ✓ Inserted 1 data consumer';

-- ----------------------------------------------------
-- 7. Dataset
-- ----------------------------------------------------
PRINT '7. Seeding Dataset...';
INSERT INTO [dbo].[Dataset] (provider_id, name, description, category, row_count, upload_date, status, moderation_status)
VALUES
(@DataProviderId, 'Hà Nội EV Charging Stations - January 2025',
 'Comprehensive charging station usage data for Hanoi in January 2025',
 'ChargingStation', 20, GETDATE(), 'Active', 'Approved');

DECLARE @DatasetId INT = SCOPE_IDENTITY();
PRINT '   ✓ Inserted 1 approved dataset';

-- ----------------------------------------------------
-- 8. DatasetRecords
-- ----------------------------------------------------
PRINT '8. Seeding DatasetRecords...';
INSERT INTO [dbo].[DatasetRecords] (
    DatasetId, province_id, district_id, station_id, station_name, station_address,
    station_operator, charging_timestamp, energy_kwh, voltage, [current], power_kw,
    duration_minutes, charging_cost, vehicle_type, battery_capacity_kwh,
    soc_start, soc_end, created_at, data_source
)
SELECT
    @DatasetId,
    1, -- Hà Nội
    ((n - 1) % 3) + 1, -- district_id (1, 2, 3)
    'ST' + RIGHT('000' + CAST(n AS VARCHAR), 3),
    'Charging Station ' + CAST(n AS VARCHAR),
    CAST(n * 100 AS VARCHAR) + ' Nguyen Trai, Hanoi',
    CASE WHEN n % 2 = 0 THEN 'VinFast' ELSE 'EVN' END,
    DATEADD(HOUR, n * 12, '2025-01-01 08:00:00'),
    35.0 + (n * 3.2),
    220.00,
    32.00,
    7.04,
    280.00 + (n * 15),
    140000.00 + (n * 8000),
    CASE WHEN n % 4 = 0 THEN 'Motorbike' ELSE 'Car' END,
    CASE WHEN n % 4 = 0 THEN 48.00 ELSE 65.00 END,
    18.00 + (n % 10),
    92.00 + (n % 8),
    GETDATE(),
    'Manual'
FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
    SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL
    SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL
    SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
) AS nums;

PRINT '   ✓ Inserted 20 dataset records';

PRINT '';
PRINT '===== DATA SEEDING COMPLETED =====';
PRINT '';

-- =====================================================
-- VERIFICATION
-- =====================================================

PRINT '===== VERIFICATION =====';
PRINT '';
PRINT 'Table record counts:';
SELECT 'Users' AS TableName, COUNT(*) AS RecordCount FROM [User]
UNION ALL SELECT 'DataProviders', COUNT(*) FROM DataProvider
UNION ALL SELECT 'DataConsumers', COUNT(*) FROM DataConsumer
UNION ALL SELECT 'SystemPricings', COUNT(*) FROM SystemPricing
UNION ALL SELECT 'Provinces', COUNT(*) FROM Province
UNION ALL SELECT 'Districts', COUNT(*) FROM District
UNION ALL SELECT 'Datasets', COUNT(*) FROM Dataset
UNION ALL SELECT 'DatasetRecords', COUNT(*) FROM DatasetRecords;

PRINT '';

-- Check approved dataset records
DECLARE @ApprovedCount INT;
SELECT @ApprovedCount = COUNT(*)
FROM DatasetRecords r
INNER JOIN Dataset d ON r.DatasetId = d.dataset_id
WHERE d.moderation_status = 'Approved';

PRINT 'Approved dataset records available: ' + CAST(@ApprovedCount AS VARCHAR);
PRINT '';

PRINT '╔════════════════════════════════════════════════╗';
PRINT '║     DATABASE CREATED SUCCESSFULLY!             ║';
PRINT '╚════════════════════════════════════════════════╝';
PRINT '';
PRINT 'Test Accounts (Password: Test123!):';
PRINT '  • admin@test.com       - Admin';
PRINT '  • moderator@test.com   - Moderator';
PRINT '  • provider@test.com    - DataProvider';
PRINT '  • consumer@test.com    - DataConsumer';
PRINT '';
PRINT 'Database: EVDataMarketplace';
PRINT 'Status: Ready for testing';
PRINT '';
PRINT 'Next steps:';
PRINT '  1. Update backend connection string if needed';
PRINT '  2. Test API with: GET /api/data-packages/preview?provinceId=1';
PRINT '  3. Login and test purchase flow';
PRINT '';

GO
