-- ============================================
-- RUN ALL SETUP SCRIPTS
-- Tự động chạy tất cả: Check → Update (nếu cần) → Insert Sample Data
-- ============================================

PRINT '';
PRINT '╔══════════════════════════════════════════════════════╗';
PRINT '║   EV DATA MARKETPLACE - SUBSCRIPTION SETUP          ║';
PRINT '║   Automated Setup & Sample Data Insertion           ║';
PRINT '╚══════════════════════════════════════════════════════╝';
PRINT '';

-- Use database
USE [EVDataMarketplace];
GO

PRINT '========================================';
PRINT 'STEP 1: CONNECTION TEST';
PRINT '========================================';
PRINT '';

-- Quick connection check
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EVDataMarketplace')
BEGIN
    PRINT '❌ FATAL ERROR: Database EVDataMarketplace not found!';
    PRINT 'Please create the database first using CREATE_NEW_DATABASE.sql';
    RETURN;
END

PRINT '✅ Database connection OK';
PRINT '';

PRINT '========================================';
PRINT 'STEP 2: TABLE STRUCTURE CHECK';
PRINT '========================================';
PRINT '';

-- Check if table exists
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND type in (N'U'))
BEGIN
    PRINT '❌ FATAL ERROR: SubscriptionPackagePurchase table not found!';
    PRINT 'Please run CREATE_NEW_DATABASE.sql first';
    RETURN;
END

PRINT '✅ Table exists';
PRINT '';

-- Check required columns
DECLARE @MissingCount INT = 0;
DECLARE @RequiredColumns TABLE (ColName NVARCHAR(100));

INSERT INTO @RequiredColumns VALUES 
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

SELECT @MissingCount = COUNT(*)
FROM @RequiredColumns rc
WHERE NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'SubscriptionPackagePurchase' 
    AND COLUMN_NAME = rc.ColName
);

IF @MissingCount > 0
BEGIN
    PRINT '⚠️ WARNING: Missing ' + CAST(@MissingCount AS VARCHAR) + ' columns!';
    PRINT 'Please run UPDATE_SUBSCRIPTION_TABLE.sql first';
    PRINT '';
    
    -- Show missing columns
    SELECT '❌ ' + rc.ColName AS [Missing Columns]
    FROM @RequiredColumns rc
    WHERE NOT EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'SubscriptionPackagePurchase' 
        AND COLUMN_NAME = rc.ColName
    );
    
    RETURN;
END

PRINT '✅ All required columns exist';
PRINT '';

PRINT '========================================';
PRINT 'STEP 3: USER VALIDATION';
PRINT '========================================';
PRINT '';

-- Configuration
DECLARE @UserId INT = 4;
DECLARE @ConsumerId INT;
DECLARE @Username NVARCHAR(255);
DECLARE @Email NVARCHAR(255);

-- Check user exists and is consumer
SELECT 
    @ConsumerId = c.consumer_id,
    @Username = u.username,
    @Email = u.email
FROM [User] u
INNER JOIN Consumer c ON u.user_id = c.user_id
WHERE u.user_id = @UserId;

IF @ConsumerId IS NULL
BEGIN
    PRINT '❌ ERROR: User ID ' + CAST(@UserId AS VARCHAR) + ' not found or not a DataConsumer!';
    PRINT '';
    PRINT 'Available DataConsumers:';
    SELECT TOP 10
        u.user_id,
        u.username,
        u.email,
        c.consumer_id
    FROM [User] u
    INNER JOIN Consumer c ON u.user_id = c.user_id
    ORDER BY u.user_id;
    RETURN;
END

PRINT '✅ User validated:';
PRINT '   User ID: ' + CAST(@UserId AS VARCHAR);
PRINT '   Username: ' + @Username;
PRINT '   Email: ' + @Email;
PRINT '   Consumer ID: ' + CAST(@ConsumerId AS VARCHAR);
PRINT '';

PRINT '========================================';
PRINT 'STEP 4: LOCATION SETUP';
PRINT '========================================';
PRINT '';

-- Get default province (Hanoi)
DECLARE @ProvinceId INT = 1;
DECLARE @DistrictId INT = NULL;
DECLARE @ProvinceName NVARCHAR(100);

SELECT @ProvinceName = province_name FROM Province WHERE province_id = @ProvinceId;

IF @ProvinceName IS NULL
BEGIN
    PRINT '⚠️ Province ID 1 not found, using first available...';
    SELECT TOP 1 @ProvinceId = province_id, @ProvinceName = province_name FROM Province;
END

PRINT '✅ Location configured:';
PRINT '   Province: ' + @ProvinceName + ' (ID: ' + CAST(@ProvinceId AS VARCHAR) + ')';
PRINT '   District: Province-level (no district specified)';
PRINT '';

PRINT '========================================';
PRINT 'STEP 5: SUBSCRIPTION CREATION';
PRINT '========================================';
PRINT '';

-- Configuration
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';
DECLARE @MonthlyPrice DECIMAL(18,2) = 500000.00;
DECLARE @TotalPaid DECIMAL(18,2) = 500000.00;
DECLARE @StartDate DATETIME2 = GETDATE();
DECLARE @EndDate DATETIME2 = DATEADD(MONTH, 1, GETDATE());

PRINT '💳 Subscription details:';
PRINT '   Billing Cycle: ' + @BillingCycle;
PRINT '   Monthly Price: ' + FORMAT(@MonthlyPrice, 'N0') + ' VND';
PRINT '   Total Paid: ' + FORMAT(@TotalPaid, 'N0') + ' VND';
PRINT '   Duration: 1 month';
PRINT '   Start: ' + CONVERT(VARCHAR, @StartDate, 120);
PRINT '   End: ' + CONVERT(VARCHAR, @EndDate, 120);
PRINT '';

-- Insert subscription
BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO SubscriptionPackagePurchase (
        consumer_id,
        province_id,
        district_id,
        start_date,
        end_date,
        billing_cycle,
        monthly_price,
        total_paid,
        purchase_date,
        status,
        auto_renew,
        cancelled_at,
        dashboard_access_count,
        last_access_date
    )
    VALUES (
        @ConsumerId,
        @ProvinceId,
        @DistrictId,
        @StartDate,
        @EndDate,
        @BillingCycle,
        @MonthlyPrice,
        @TotalPaid,
        GETDATE(),
        'Active',
        1,
        NULL,
        0,
        NULL
    );

    DECLARE @SubscriptionId INT = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    PRINT '✅ Subscription created successfully!';
    PRINT '';
    PRINT '╔══════════════════════════════════════════════════════╗';
    PRINT '║               🎉 SUCCESS! 🎉                        ║';
    PRINT '╚══════════════════════════════════════════════════════╝';
    PRINT '';
    PRINT '📋 SUBSCRIPTION DETAILS:';
    PRINT '--------------------------------------------------------';
    
    SELECT 
        spp.subscription_id AS [Subscription ID],
        u.username AS [Username],
        u.email AS [Email],
        p.province_name AS [Province],
        spp.billing_cycle AS [Billing Cycle],
        FORMAT(spp.total_paid, 'N0') + ' VND' AS [Total Paid],
        CONVERT(VARCHAR, spp.start_date, 120) AS [Start Date],
        CONVERT(VARCHAR, spp.end_date, 120) AS [End Date],
        spp.status AS [Status],
        CASE WHEN spp.auto_renew = 1 THEN 'Enabled' ELSE 'Disabled' END AS [Auto Renew]
    FROM SubscriptionPackagePurchase spp
    INNER JOIN Consumer c ON spp.consumer_id = c.consumer_id
    INNER JOIN [User] u ON c.user_id = u.user_id
    INNER JOIN Province p ON spp.province_id = p.province_id
    WHERE spp.subscription_id = @SubscriptionId;

    PRINT '';
    PRINT '🎯 NEXT STEPS:';
    PRINT '--------------------------------------------------------';
    PRINT '1. ✅ Database is ready';
    PRINT '2. ✅ Sample subscription created';
    PRINT '3. 🚀 Start backend: cd backend/EVDataMarketplace.API && dotnet run';
    PRINT '4. 🚀 Start frontend: cd frontend && npm run dev';
    PRINT '5. 🔐 Login with: ' + @Email;
    PRINT '6. 📊 Go to "My Purchases" to see subscription';
    PRINT '7. 📈 Click "Access Dashboard" to view analytics';
    PRINT '';
    PRINT '🔗 API Endpoints:';
    PRINT '   GET /api/purchases/my-subscriptions';
    PRINT '   GET /api/subscription-packages/' + CAST(@SubscriptionId AS VARCHAR) + '/dashboard';
    PRINT '';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    PRINT '';
    PRINT '╔══════════════════════════════════════════════════════╗';
    PRINT '║               ❌ ERROR! ❌                          ║';
    PRINT '╚══════════════════════════════════════════════════════╝';
    PRINT '';
    PRINT 'Error Details:';
    PRINT '   Message: ' + ERROR_MESSAGE();
    PRINT '   Number: ' + CAST(ERROR_NUMBER() AS VARCHAR);
    PRINT '   Line: ' + CAST(ERROR_LINE() AS VARCHAR);
    PRINT '';
    PRINT '💡 Troubleshooting:';
    PRINT '   - Run QUICK_CHECK.sql to verify database structure';
    PRINT '   - Check if all required columns exist';
    PRINT '   - Verify foreign key constraints';
    PRINT '';
END CATCH;

PRINT '========================================';
PRINT 'SETUP COMPLETED';
PRINT '========================================';

GO


