-- ============================================
-- INSERT Custom Subscription with Options
-- Tạo subscription với các tùy chọn linh hoạt
-- ============================================

USE [EVDataMarketplace];
GO

PRINT '';
PRINT '========================================';
PRINT 'CUSTOM SUBSCRIPTION CREATOR';
PRINT '========================================';
PRINT '';

-- ============================================
-- CONFIGURATION - Thay đổi các giá trị này
-- ============================================

DECLARE @UserId INT = 4;                      -- User ID của customer
DECLARE @ProvinceId INT = 1;                  -- 1=Hanoi, 2=HCMC, 3=Danang, etc.
DECLARE @DistrictId INT = NULL;               -- NULL = province level, hoặc ID của district
DECLARE @BillingCycle NVARCHAR(20) = 'Monthly';  -- 'Monthly', 'Quarterly', 'Yearly'

-- ============================================
-- AUTOMATIC CALCULATIONS
-- ============================================

DECLARE @ConsumerId INT;
DECLARE @Username NVARCHAR(255);
DECLARE @Email NVARCHAR(255);
DECLARE @MonthlyPrice DECIMAL(18,2) = 500000.00;  -- Base price 500k VND/month
DECLARE @TotalPaid DECIMAL(18,2);
DECLARE @StartDate DATETIME2 = GETDATE();
DECLARE @EndDate DATETIME2;
DECLARE @DurationMonths INT;

-- Calculate based on billing cycle
IF @BillingCycle = 'Monthly'
BEGIN
    SET @DurationMonths = 1;
    SET @TotalPaid = @MonthlyPrice;
END
ELSE IF @BillingCycle = 'Quarterly'
BEGIN
    SET @DurationMonths = 3;
    SET @TotalPaid = @MonthlyPrice * 3 * 0.95;  -- 5% discount
END
ELSE IF @BillingCycle = 'Yearly'
BEGIN
    SET @DurationMonths = 12;
    SET @TotalPaid = @MonthlyPrice * 12 * 0.85;  -- 15% discount
END
ELSE
BEGIN
    PRINT '❌ ERROR: Invalid billing cycle. Must be Monthly, Quarterly, or Yearly';
    RETURN;
END

SET @EndDate = DATEADD(MONTH, @DurationMonths, @StartDate);

-- ============================================
-- VALIDATION & DATA FETCH
-- ============================================

PRINT '🔍 Validating data...';
PRINT '';

-- Check user exists and is a consumer
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
    PRINT '📋 Available DataConsumers:';
    SELECT 
        u.user_id,
        u.username,
        u.email,
        u.role_id,
        c.consumer_id
    FROM [User] u
    INNER JOIN Consumer c ON u.user_id = c.user_id
    ORDER BY u.user_id;
    RETURN;
END

-- Check province exists
IF NOT EXISTS (SELECT 1 FROM Province WHERE province_id = @ProvinceId)
BEGIN
    PRINT '❌ ERROR: Province ID ' + CAST(@ProvinceId AS VARCHAR) + ' not found!';
    PRINT '';
    PRINT '📍 Available Provinces:';
    SELECT province_id, province_name FROM Province ORDER BY province_id;
    RETURN;
END

-- Check district exists (if specified)
IF @DistrictId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM District WHERE district_id = @DistrictId AND province_id = @ProvinceId)
BEGIN
    PRINT '❌ ERROR: District ID ' + CAST(@DistrictId AS VARCHAR) + ' not found in Province ID ' + CAST(@ProvinceId AS VARCHAR);
    PRINT '';
    PRINT '📍 Available Districts in this Province:';
    SELECT district_id, district_name FROM District WHERE province_id = @ProvinceId ORDER BY district_id;
    RETURN;
END

-- ============================================
-- DISPLAY CONFIGURATION
-- ============================================

PRINT '✅ Validation passed!';
PRINT '';
PRINT '📋 SUBSCRIPTION CONFIGURATION:';
PRINT '--------------------------------------------------------';
PRINT '👤 Customer:';
PRINT '   User ID: ' + CAST(@UserId AS VARCHAR);
PRINT '   Consumer ID: ' + CAST(@ConsumerId AS VARCHAR);
PRINT '   Username: ' + @Username;
PRINT '   Email: ' + @Email;
PRINT '';
PRINT '📍 Location:';

DECLARE @ProvinceName NVARCHAR(100);
DECLARE @DistrictName NVARCHAR(100) = NULL;

SELECT @ProvinceName = province_name FROM Province WHERE province_id = @ProvinceId;
PRINT '   Province: ' + @ProvinceName + ' (ID: ' + CAST(@ProvinceId AS VARCHAR) + ')';

IF @DistrictId IS NOT NULL
BEGIN
    SELECT @DistrictName = district_name FROM District WHERE district_id = @DistrictId;
    PRINT '   District: ' + @DistrictName + ' (ID: ' + CAST(@DistrictId AS VARCHAR) + ')';
END
ELSE
BEGIN
    PRINT '   District: (Province-level subscription)';
END

PRINT '';
PRINT '💰 Pricing:';
PRINT '   Billing Cycle: ' + @BillingCycle;
PRINT '   Duration: ' + CAST(@DurationMonths AS VARCHAR) + ' month(s)';
PRINT '   Monthly Price: ' + FORMAT(@MonthlyPrice, 'N0') + ' VND';
PRINT '   Total Paid: ' + FORMAT(@TotalPaid, 'N0') + ' VND';

IF @BillingCycle = 'Quarterly'
    PRINT '   Discount: 5% (saved ' + FORMAT(@MonthlyPrice * 3 - @TotalPaid, 'N0') + ' VND)';
ELSE IF @BillingCycle = 'Yearly'
    PRINT '   Discount: 15% (saved ' + FORMAT(@MonthlyPrice * 12 - @TotalPaid, 'N0') + ' VND)';

PRINT '';
PRINT '📅 Period:';
PRINT '   Start Date: ' + CONVERT(VARCHAR, @StartDate, 120);
PRINT '   End Date: ' + CONVERT(VARCHAR, @EndDate, 120);
PRINT '';

-- ============================================
-- INSERT DATA
-- ============================================

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
        1,                  -- auto_renew enabled
        NULL,               -- not cancelled
        0,                  -- no access yet
        NULL                -- never accessed
    );

    DECLARE @SubscriptionId INT = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    PRINT '========================================';
    PRINT '✅✅✅ SUCCESS! ✅✅✅';
    PRINT '========================================';
    PRINT '';
    PRINT '🎉 Subscription ID: ' + CAST(@SubscriptionId AS VARCHAR);
    PRINT '';
    
    -- Display created subscription
    PRINT '📄 CREATED SUBSCRIPTION:';
    PRINT '--------------------------------------------------------';
    
    SELECT 
        spp.subscription_id as [ID],
        u.username as [Username],
        u.email as [Email],
        p.province_name as [Province],
        ISNULL(d.district_name, '(Province-level)') as [District],
        spp.billing_cycle as [Billing],
        FORMAT(spp.monthly_price, 'N0') + ' VND' as [Monthly Price],
        FORMAT(spp.total_paid, 'N0') + ' VND' as [Total Paid],
        CONVERT(VARCHAR, spp.start_date, 120) as [Start],
        CONVERT(VARCHAR, spp.end_date, 120) as [End],
        spp.status as [Status],
        CASE WHEN spp.auto_renew = 1 THEN 'Yes' ELSE 'No' END as [Auto Renew]
    FROM SubscriptionPackagePurchase spp
    INNER JOIN Consumer c ON spp.consumer_id = c.consumer_id
    INNER JOIN [User] u ON c.user_id = u.user_id
    INNER JOIN Province p ON spp.province_id = p.province_id
    LEFT JOIN District d ON spp.district_id = d.district_id
    WHERE spp.subscription_id = @SubscriptionId;

    PRINT '';
    PRINT '🎯 NEXT STEPS:';
    PRINT '1. Login with: ' + @Email;
    PRINT '2. Go to: "My Purchases" or "Dashboard"';
    PRINT '3. Access dashboard with Subscription ID: ' + CAST(@SubscriptionId AS VARCHAR);
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
    PRINT '========================================';
    PRINT '❌❌❌ ERROR! ❌❌❌';
    PRINT '========================================';
    PRINT 'Message: ' + ERROR_MESSAGE();
    PRINT 'Number: ' + CAST(ERROR_NUMBER() AS VARCHAR);
    PRINT 'Line: ' + CAST(ERROR_LINE() AS VARCHAR);
    PRINT 'Procedure: ' + ISNULL(ERROR_PROCEDURE(), 'N/A');
    PRINT '';
    PRINT '💡 Common issues:';
    PRINT '   - Check if SubscriptionPackagePurchase table has all required columns';
    PRINT '   - Run QUICK_CHECK.sql to verify database structure';
    PRINT '   - Ensure Province and District IDs are valid';
    PRINT '';
END CATCH;

PRINT '========================================';
PRINT 'SCRIPT COMPLETED';
PRINT '========================================';

GO


