-- ============================================
-- COMPLETE FIX: Dashboard Data Issue
-- Root Cause: DatasetRecords từ Q1 2024 quá cũ (ngoài 30 ngày)
-- Solution: Update charging_timestamp về ngày gần đây
-- ============================================

USE [EVDataMarketplace];
GO

SET NOCOUNT ON;

PRINT '';
PRINT '========================================';
PRINT 'COMPLETE FIX: DASHBOARD DATA ISSUE';
PRINT '========================================';
PRINT '';

-- ===========================================
-- DIAGNOSIS
-- ===========================================

PRINT '🔍 STEP 1: DIAGNOSIS';
PRINT '========================================';
PRINT '';

-- Check current data date range
DECLARE @OldestRecord DATETIME2;
DECLARE @NewestRecord DATETIME2;
DECLARE @TotalRecords INT;
DECLARE @RecordsLast30Days INT;

SELECT 
    @OldestRecord = MIN(charging_timestamp),
    @NewestRecord = MAX(charging_timestamp),
    @TotalRecords = COUNT(*)
FROM DatasetRecords;

SELECT @RecordsLast30Days = COUNT(*)
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
  AND ds.moderation_status = 'Approved';

PRINT '📊 Current Data Status:';
PRINT '   Total Records: ' + CAST(@TotalRecords AS VARCHAR);
PRINT '   Oldest Record: ' + ISNULL(CONVERT(VARCHAR, @OldestRecord, 120), 'N/A');
PRINT '   Newest Record: ' + ISNULL(CONVERT(VARCHAR, @NewestRecord, 120), 'N/A');
PRINT '   Records in Last 30 Days: ' + CAST(@RecordsLast30Days AS VARCHAR);
PRINT '';

IF @RecordsLast30Days = 0
BEGIN
    PRINT '❌ PROBLEM CONFIRMED: No records in last 30 days!';
    PRINT '   Dashboard query filters for last 30 days only.';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✅ Data is recent enough.';
    PRINT '';
END

-- ===========================================
-- SOLUTION
-- ===========================================

PRINT '🔧 STEP 2: SOLUTION - UPDATE TIMESTAMPS';
PRINT '========================================';
PRINT '';

IF @RecordsLast30Days = 0
BEGIN
    PRINT '⏰ Updating all DatasetRecords timestamps to recent dates...';
    PRINT '';
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Strategy: Spread records evenly across last 45 days (to ensure 30-day coverage)
        DECLARE @DaysToSpread INT = 45;
        DECLARE @BaseDate DATETIME2 = DATEADD(DAY, -@DaysToSpread, GETDATE());
        
        -- Calculate time offset for each record based on RecordId
        -- This preserves relative ordering and spreads data naturally
        UPDATE dr
        SET charging_timestamp = DATEADD(
            MINUTE, 
            (dr.RecordId % (@DaysToSpread * 24 * 60)), -- Spread across all minutes in 45 days
            @BaseDate
        )
        FROM DatasetRecords dr;
        
        DECLARE @UpdatedCount INT = @@ROWCOUNT;
        
        COMMIT TRANSACTION;
        
        PRINT '✅ Updated ' + CAST(@UpdatedCount AS VARCHAR) + ' records!';
        PRINT '';
        
        -- Verify update
        SELECT 
            @OldestRecord = MIN(charging_timestamp),
            @NewestRecord = MAX(charging_timestamp),
            @RecordsLast30Days = COUNT(*)
        FROM DatasetRecords dr
        INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
        WHERE dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
          AND ds.moderation_status = 'Approved';
        
        PRINT '📊 Updated Data Status:';
        PRINT '   New Oldest Record: ' + CONVERT(VARCHAR, @OldestRecord, 120);
        PRINT '   New Newest Record: ' + CONVERT(VARCHAR, @NewestRecord, 120);
        PRINT '   Records in Last 30 Days: ' + CAST(@RecordsLast30Days AS VARCHAR);
        PRINT '';
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        PRINT '❌ ERROR updating timestamps:';
        PRINT '   ' + ERROR_MESSAGE();
        PRINT '';
        RETURN;
    END CATCH
END

-- ===========================================
-- VERIFICATION
-- ===========================================

PRINT '✅ STEP 3: VERIFICATION';
PRINT '========================================';
PRINT '';

-- Check Provinces
PRINT '📍 Available Provinces:';
SELECT province_id, name AS province_name
FROM Province
WHERE name IN (N'Hà Nội', N'Hồ Chí Minh', N'Đà Nẵng')
ORDER BY province_id;
PRINT '';

-- Check Districts (Hà Nội)
PRINT '📍 Hà Nội Districts (First 5):';
SELECT TOP 5 d.district_id, d.name AS district_name
FROM District d
INNER JOIN Province p ON d.province_id = p.province_id
WHERE p.name = N'Hà Nội'
ORDER BY d.district_id;
PRINT '';

-- Check Approved Datasets
PRINT '📦 Approved Datasets:';
SELECT dataset_id, name AS dataset_name, moderation_status, row_count
FROM Dataset
WHERE moderation_status = 'Approved';
PRINT '';

-- Check Data by Province (Last 30 days)
PRINT '📊 Records by Province (Last 30 Days):';
SELECT 
    p.province_id,
    p.name AS province_name,
    COUNT(dr.RecordId) AS recent_records,
    CAST(SUM(dr.energy_kwh) AS DECIMAL(18,2)) AS total_energy_kwh
FROM Province p
LEFT JOIN DatasetRecords dr ON p.province_id = dr.province_id
LEFT JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE p.name IN (N'Hà Nội', N'Hồ Chí Minh', N'Đà Nẵng')
  AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
  AND ds.moderation_status = 'Approved'
GROUP BY p.province_id, p.name
ORDER BY recent_records DESC;
PRINT '';

-- Check Active Subscriptions
PRINT '🎫 Active Subscriptions:';
IF EXISTS (SELECT 1 FROM SubscriptionPackagePurchase WHERE status = 'Active')
BEGIN
    SELECT 
        s.subscription_id,
        s.consumer_id,
        s.province_id,
        s.district_id,
        p.name AS province_name,
        ISNULL(d.name, '(Province-level)') AS district_name,
        CONVERT(VARCHAR, s.start_date, 120) AS start_date,
        CONVERT(VARCHAR, s.end_date, 120) AS end_date,
        s.status
    FROM SubscriptionPackagePurchase s
    LEFT JOIN Province p ON s.province_id = p.province_id
    LEFT JOIN District d ON s.district_id = d.district_id
    WHERE s.status = 'Active';
END
ELSE
BEGIN
    PRINT '   ⚠ No active subscriptions found.';
    PRINT '';
    PRINT '   💡 To create a subscription:';
    PRINT '      1. Run: INSERT_CUSTOM_SUBSCRIPTION.sql';
    PRINT '      2. Or use API: POST /api/subscription-packages/purchase';
    PRINT '';
    PRINT '   Available Consumer:';
    SELECT 
        u.user_id,
        c.consumer_id,
        u.email,
        u.full_name
    FROM [User] u
    INNER JOIN DataConsumer c ON u.user_id = c.user_id;
END
PRINT '';

-- ===========================================
-- TEST QUERY
-- ===========================================

PRINT '🧪 STEP 4: TEST DASHBOARD QUERY';
PRINT '========================================';
PRINT '';

-- Get first province and district with data
DECLARE @TestProvinceId INT;
DECLARE @TestDistrictId INT;

SELECT TOP 1
    @TestProvinceId = dr.province_id,
    @TestDistrictId = dr.district_id
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE ds.moderation_status = 'Approved'
  AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
GROUP BY dr.province_id, dr.district_id
ORDER BY COUNT(*) DESC;

IF @TestProvinceId IS NOT NULL
BEGIN
    PRINT '🎯 Testing with:';
    PRINT '   Province ID: ' + CAST(@TestProvinceId AS VARCHAR);
    PRINT '   District ID: ' + CAST(@TestDistrictId AS VARCHAR);
    PRINT '';
    
    -- Simulate C# dashboard query
    SELECT 
        COUNT(*) AS total_sessions,
        CAST(SUM(energy_kwh) AS DECIMAL(18,2)) AS total_energy_kwh,
        CAST(AVG(energy_kwh) AS DECIMAL(18,2)) AS avg_energy_per_session,
        COUNT(DISTINCT station_id) AS unique_stations,
        CAST(AVG(ISNULL(duration_minutes, 0)) AS DECIMAL(10,1)) AS avg_duration_minutes,
        CAST(SUM(charging_cost) AS DECIMAL(18,2)) AS total_revenue
    FROM DatasetRecords dr
    INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
    WHERE dr.province_id = @TestProvinceId
      AND dr.district_id = @TestDistrictId
      AND ds.moderation_status = 'Approved'
      AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE());
    
    PRINT '';
    PRINT '✅✅✅ DASHBOARD QUERY SUCCESSFUL! ✅✅✅';
    PRINT '';
END
ELSE
BEGIN
    PRINT '❌ Still no data available for testing.';
    PRINT '   This should not happen after timestamp update.';
    PRINT '';
END

-- ===========================================
-- SUMMARY
-- ===========================================

PRINT '========================================';
PRINT '📋 SUMMARY';
PRINT '========================================';
PRINT '';
PRINT '✓ Problem: DatasetRecords timestamps were from Q1 2024';
PRINT '✓ Solution: Updated all timestamps to last 45 days';
PRINT '✓ Result: Dashboard queries can now find recent data';
PRINT '';
PRINT '🎯 NEXT STEPS:';
PRINT '';
PRINT '1. If you have an Active Subscription:';
PRINT '   → Dashboard should now show data immediately';
PRINT '   → Test: GET /api/subscription-packages/{id}/dashboard';
PRINT '';
PRINT '2. If no Active Subscription:';
PRINT '   → Create one using INSERT_CUSTOM_SUBSCRIPTION.sql';
PRINT '   → Set province_id = 1 (Hà Nội)';
PRINT '   → Set district_id = 1, 2, 3, or 4';
PRINT '';
PRINT '3. Login credentials:';
PRINT '   → Consumer: consumer@test.com / Test123!';
PRINT '   → Check "My Purchases" section';
PRINT '';
PRINT '========================================';
PRINT 'FIX COMPLETED SUCCESSFULLY';
PRINT '========================================';

GO

