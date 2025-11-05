-- ============================================
-- INSERT Sample Subscription for Customer UserID: 4
-- Tạo dữ liệu mẫu subscription purchase
-- ============================================

USE [EVDataMarketplace];
GO

PRINT '';
PRINT '========================================';
PRINT 'INSERTING SAMPLE SUBSCRIPTION FOR USER 4';
PRINT '========================================';
PRINT '';

-- Check if database exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EVDataMarketplace')
BEGIN
    PRINT '❌ ERROR: Database EVDataMarketplace does not exist!';
    RETURN;
END

-- Check if user exists and is a consumer
DECLARE @UserId INT = 4;
DECLARE @ConsumerId INT;
DECLARE @Username NVARCHAR(255);
DECLARE @Email NVARCHAR(255);

SELECT 
    @ConsumerId = c.consumer_id,
    @Username = u.full_name,
    @Email = u.email
FROM [User] u
    INNER JOIN DataConsumer c ON u.user_id = c.user_id
    WHERE u.user_id = @UserId;

IF @ConsumerId IS NULL
BEGIN
    PRINT '❌ ERROR: User ID ' + CAST(@UserId AS VARCHAR) + ' does not exist or is not a DataConsumer!';
    PRINT '';
    PRINT '📋 Available DataConsumers:';
    SELECT 
        u.user_id,
        u.full_name AS username,
        u.email,
        c.consumer_id
    FROM [User] u
    INNER JOIN DataConsumer c ON u.user_id = c.user_id;
    RETURN;
END

PRINT '✅ Found DataConsumer:';
PRINT '   User ID: ' + CAST(@UserId AS VARCHAR);
PRINT '   Consumer ID: ' + CAST(@ConsumerId AS VARCHAR);
PRINT '   Username: ' + @Username;
PRINT '   Email: ' + @Email;
PRINT '';

-- Get available provinces
PRINT '📍 Available Provinces:';
SELECT province_id, name AS province_name FROM Province;
PRINT '';

-- Use Hanoi (province_id = 1) as default
DECLARE @ProvinceId INT = 1;
DECLARE @ProvinceName NVARCHAR(100);

SELECT @ProvinceName = name FROM Province WHERE province_id = @ProvinceId;

IF @ProvinceName IS NULL
BEGIN
    PRINT '⚠️ WARNING: Province ID 1 not found, using first available province...';
    SELECT TOP 1 @ProvinceId = province_id, @ProvinceName = name FROM Province;
END

PRINT '✅ Selected Province: ' + @ProvinceName + ' (ID: ' + CAST(@ProvinceId AS VARCHAR) + ')';
PRINT '';

-- Get a district in that province (optional)
DECLARE @DistrictId INT = NULL;
DECLARE @DistrictName NVARCHAR(100) = NULL;

SELECT TOP 1 
    @DistrictId = district_id,
    @DistrictName = name
FROM District
WHERE province_id = @ProvinceId;

IF @DistrictId IS NOT NULL
BEGIN
    PRINT '✅ Selected District: ' + @DistrictName + ' (ID: ' + CAST(@DistrictId AS VARCHAR) + ')';
END
ELSE
BEGIN
    PRINT '📍 No district selected (province-level subscription)';
END
PRINT '';

-- Insert subscription purchase
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';
DECLARE @MonthlyPrice DECIMAL(18,2) = 500000.00; -- 500k VND
DECLARE @TotalPaid DECIMAL(18,2) = 500000.00;
DECLARE @StartDate DATETIME2 = GETDATE();
DECLARE @EndDate DATETIME2 = DATEADD(MONTH, 1, GETDATE());

PRINT '💳 Creating Subscription Purchase:';
PRINT '   Billing Cycle: ' + @BillingCycle;
PRINT '   Monthly Price: ' + CAST(@MonthlyPrice AS VARCHAR) + ' VND';
PRINT '   Total Paid: ' + CAST(@TotalPaid AS VARCHAR) + ' VND';
PRINT '   Start Date: ' + CONVERT(VARCHAR, @StartDate, 120);
PRINT '   End Date: ' + CONVERT(VARCHAR, @EndDate, 120);
PRINT '';

BEGIN TRY
    BEGIN TRANSACTION;

    -- Insert the subscription purchase
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
        @ConsumerId,           -- consumer_id
        @ProvinceId,           -- province_id
        @DistrictId,           -- district_id (nullable)
        @StartDate,            -- start_date
        @EndDate,              -- end_date
        @BillingCycle,         -- billing_cycle
        @MonthlyPrice,         -- monthly_price
        @TotalPaid,            -- total_paid
        GETDATE(),             -- purchase_date
        'Active',              -- status
        1,                     -- auto_renew (enabled)
        NULL,                  -- cancelled_at (not cancelled)
        0,                     -- dashboard_access_count
        NULL                   -- last_access_date
    );

    DECLARE @SubscriptionId INT = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    PRINT '✅✅✅ SUCCESS! ✅✅✅';
    PRINT '';
    PRINT '🎉 Subscription created successfully!';
    PRINT '   Subscription ID: ' + CAST(@SubscriptionId AS VARCHAR);
    PRINT '';
    
    -- Show the created subscription
    PRINT '📋 Subscription Details:';
    PRINT '--------------------------------------------------------';
    SELECT 
        spp.subscription_id,
        spp.consumer_id,
        u.full_name AS username,
        u.email,
        p.name AS province_name,
        d.name AS district_name,
        spp.billing_cycle,
        spp.monthly_price,
        spp.total_paid,
        spp.start_date,
        spp.end_date,
        spp.status,
        spp.auto_renew,
        spp.purchase_date
    FROM SubscriptionPackagePurchase spp
    INNER JOIN DataConsumer c ON spp.consumer_id = c.consumer_id
    INNER JOIN [User] u ON c.user_id = u.user_id
    INNER JOIN Province p ON spp.province_id = p.province_id
    LEFT JOIN District d ON spp.district_id = d.district_id
    WHERE spp.subscription_id = @SubscriptionId;

    PRINT '';
    PRINT '🎯 Next Steps:';
    PRINT '1. Login with User ID ' + CAST(@UserId AS VARCHAR) + ' (' + @Email + ')';
    PRINT '2. Navigate to "My Purchases" page';
    PRINT '3. You should see the subscription';
    PRINT '4. Click "Access Dashboard" to view analytics';
    PRINT '';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    PRINT '';
    PRINT '❌❌❌ ERROR! ❌❌❌';
    PRINT 'Error Message: ' + ERROR_MESSAGE();
    PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR);
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR);
    PRINT '';
END CATCH;

PRINT '========================================';
PRINT 'SCRIPT COMPLETED';
PRINT '========================================';

GO

