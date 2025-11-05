-- ============================================
-- TEST Database Connection
-- Kiểm tra kết nối và cấu trúc database
-- ============================================

PRINT '';
PRINT '========================================';
PRINT '🔌 TESTING DATABASE CONNECTION';
PRINT '========================================';
PRINT '';

-- Test 1: Check current database
PRINT '1️⃣ Current Database:';
SELECT DB_NAME() AS [Current Database];
PRINT '';

-- Test 2: Check if EVDataMarketplace exists
PRINT '2️⃣ Checking EVDataMarketplace database:';
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'EVDataMarketplace')
    PRINT '   ✅ Database EXISTS';
ELSE
    PRINT '   ❌ Database NOT FOUND';
PRINT '';

-- Switch to EVDataMarketplace
USE [EVDataMarketplace];
GO

-- Test 3: Check tables
PRINT '3️⃣ Checking Required Tables:';
PRINT '--------------------------------------------------------';

DECLARE @Tables TABLE (TableName NVARCHAR(100), Exists BIT);

INSERT INTO @Tables VALUES 
    ('User', 0),
    ('Consumer', 0),
    ('Province', 0),
    ('District', 0),
    ('SubscriptionPackagePurchase', 0);

UPDATE @Tables 
SET Exists = 1
WHERE TableName IN (
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
);

SELECT 
    CASE WHEN Exists = 1 THEN '✅' ELSE '❌' END + ' ' + TableName AS [Table Status]
FROM @Tables;

PRINT '';

-- Test 4: Count records in each table
PRINT '4️⃣ Record Counts:';
PRINT '--------------------------------------------------------';

DECLARE @UserCount INT = 0;
DECLARE @ConsumerCount INT = 0;
DECLARE @ProvinceCount INT = 0;
DECLARE @DistrictCount INT = 0;
DECLARE @SubscriptionCount INT = 0;

IF OBJECT_ID('dbo.[User]', 'U') IS NOT NULL
    SELECT @UserCount = COUNT(*) FROM [User];

IF OBJECT_ID('dbo.Consumer', 'U') IS NOT NULL
    SELECT @ConsumerCount = COUNT(*) FROM Consumer;

IF OBJECT_ID('dbo.Province', 'U') IS NOT NULL
    SELECT @ProvinceCount = COUNT(*) FROM Province;

IF OBJECT_ID('dbo.District', 'U') IS NOT NULL
    SELECT @DistrictCount = COUNT(*) FROM District;

IF OBJECT_ID('dbo.SubscriptionPackagePurchase', 'U') IS NOT NULL
    SELECT @SubscriptionCount = COUNT(*) FROM SubscriptionPackagePurchase;

PRINT '   Users: ' + CAST(@UserCount AS VARCHAR);
PRINT '   Consumers: ' + CAST(@ConsumerCount AS VARCHAR);
PRINT '   Provinces: ' + CAST(@ProvinceCount AS VARCHAR);
PRINT '   Districts: ' + CAST(@DistrictCount AS VARCHAR);
PRINT '   Subscriptions: ' + CAST(@SubscriptionCount AS VARCHAR);
PRINT '';

-- Test 5: Check User ID 4
PRINT '5️⃣ Checking User ID 4:';
PRINT '--------------------------------------------------------';

IF EXISTS (SELECT 1 FROM [User] WHERE user_id = 4)
BEGIN
    SELECT 
        u.user_id,
        u.username,
        u.email,
        u.role_id,
        r.role_name,
        c.consumer_id
    FROM [User] u
    LEFT JOIN Role r ON u.role_id = r.role_id
    LEFT JOIN Consumer c ON u.user_id = c.user_id
    WHERE u.user_id = 4;
    
    IF EXISTS (SELECT 1 FROM Consumer WHERE user_id = 4)
        PRINT '   ✅ User 4 is a DataConsumer';
    ELSE
        PRINT '   ⚠️ User 4 exists but is NOT a DataConsumer';
END
ELSE
BEGIN
    PRINT '   ❌ User ID 4 NOT FOUND';
    PRINT '';
    PRINT '   📋 Available DataConsumers:';
    SELECT TOP 5
        u.user_id,
        u.username,
        u.email,
        c.consumer_id
    FROM [User] u
    INNER JOIN Consumer c ON u.user_id = c.user_id
    ORDER BY u.user_id;
END

PRINT '';

-- Test 6: Check SubscriptionPackagePurchase columns
PRINT '6️⃣ SubscriptionPackagePurchase Columns:';
PRINT '--------------------------------------------------------';

IF OBJECT_ID('dbo.SubscriptionPackagePurchase', 'U') IS NOT NULL
BEGIN
    DECLARE @RequiredCols TABLE (ColName NVARCHAR(100));
    INSERT INTO @RequiredCols VALUES 
        ('subscription_id'),
        ('consumer_id'),
        ('province_id'),
        ('district_id'),
        ('billing_cycle'),
        ('monthly_price'),
        ('total_paid'),
        ('start_date'),
        ('end_date'),
        ('status'),
        ('purchase_date'),
        ('auto_renew'),
        ('cancelled_at'),
        ('dashboard_access_count'),
        ('last_access_date');
    
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'SubscriptionPackagePurchase' 
                AND COLUMN_NAME = rc.ColName
            ) THEN '✅' 
            ELSE '❌' 
        END + ' ' + rc.ColName AS [Column Status]
    FROM @RequiredCols rc;
END
ELSE
BEGIN
    PRINT '   ❌ Table does not exist!';
END

PRINT '';

-- Test 7: Summary
PRINT '========================================';
PRINT '📊 CONNECTION TEST SUMMARY';
PRINT '========================================';
PRINT '';

DECLARE @AllGood BIT = 1;

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EVDataMarketplace')
BEGIN
    PRINT '❌ Database does not exist';
    SET @AllGood = 0;
END

IF OBJECT_ID('dbo.SubscriptionPackagePurchase', 'U') IS NULL
BEGIN
    PRINT '❌ SubscriptionPackagePurchase table missing';
    SET @AllGood = 0;
END

IF NOT EXISTS (SELECT 1 FROM [User] WHERE user_id = 4)
BEGIN
    PRINT '⚠️ User ID 4 not found';
    SET @AllGood = 0;
END

IF NOT EXISTS (SELECT 1 FROM Consumer WHERE user_id = 4)
BEGIN
    PRINT '⚠️ User ID 4 is not a DataConsumer';
    SET @AllGood = 0;
END

IF @AllGood = 1
BEGIN
    PRINT '✅✅✅ ALL CHECKS PASSED! ✅✅✅';
    PRINT '';
    PRINT '🎉 Database is ready!';
    PRINT '📝 You can now run INSERT_SAMPLE_SUBSCRIPTION.sql';
END
ELSE
BEGIN
    PRINT '⚠️⚠️⚠️ ISSUES DETECTED! ⚠️⚠️⚠️';
    PRINT '';
    PRINT '📋 Action Items:';
    PRINT '   1. Ensure database EVDataMarketplace exists';
    PRINT '   2. Run QUICK_CHECK.sql to verify structure';
    PRINT '   3. Verify User ID 4 exists and is a DataConsumer';
    PRINT '   4. Run UPDATE_SUBSCRIPTION_TABLE.sql if needed';
END

PRINT '';
PRINT '========================================';
PRINT 'TEST COMPLETED';
PRINT '========================================';

GO


