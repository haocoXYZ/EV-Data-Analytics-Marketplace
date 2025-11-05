-- ============================================
-- FIX: Ensure Subscription has matching data
-- ============================================

USE [db_easycode_cm];
GO

SET NOCOUNT ON;

PRINT '';
PRINT '========================================';
PRINT 'FIX SUBSCRIPTION DATA';
PRINT '========================================';
PRINT '';

-- Step 1: Verify we have the right IDs
DECLARE @HanoiProvinceId INT;
DECLARE @BaDinhDistrictId INT;
DECLARE @HoanKiemDistrictId INT;

SELECT @HanoiProvinceId = province_id FROM Province WHERE name = N'Hà Nội';
SELECT @BaDinhDistrictId = district_id FROM District WHERE name = N'Ba Đình' AND province_id = @HanoiProvinceId;
SELECT @HoanKiemDistrictId = district_id FROM District WHERE name = N'Hoàn Kiếm' AND province_id = @HanoiProvinceId;

PRINT '📍 Location IDs:';
PRINT '   Hà Nội Province ID: ' + CAST(ISNULL(@HanoiProvinceId, -1) AS VARCHAR);
PRINT '   Ba Đình District ID: ' + CAST(ISNULL(@BaDinhDistrictId, -1) AS VARCHAR);
PRINT '   Hoàn Kiếm District ID: ' + CAST(ISNULL(@HoanKiemDistrictId, -1) AS VARCHAR);
PRINT '';

IF @HanoiProvinceId IS NULL OR @BaDinhDistrictId IS NULL
BEGIN
    PRINT '❌ ERROR: Cannot find Hà Nội or Ba Đình in database!';
    RETURN;
END

-- Step 2: Check if we have DatasetRecords for these locations
DECLARE @RecordCount INT;
SELECT @RecordCount = COUNT(*)
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE dr.province_id = @HanoiProvinceId
  AND dr.district_id = @BaDinhDistrictId
  AND ds.moderation_status = 'Approved';

PRINT '📊 Current Data Status:';
PRINT '   Approved records for Ba Đình: ' + CAST(@RecordCount AS VARCHAR);
PRINT '';

IF @RecordCount = 0
BEGIN
    PRINT '❌ PROBLEM: No approved records for Ba Đình!';
    PRINT '';
    PRINT '🔧 CREATING SAMPLE DATA...';
    PRINT '';
    
    -- Get or create a dataset
    DECLARE @DatasetId INT;
    DECLARE @ProviderId INT;
    
    -- Get first provider
    SELECT TOP 1 @ProviderId = provider_id FROM DataProvider;
    
    IF @ProviderId IS NULL
    BEGIN
        PRINT '⚠ No provider found. Creating test provider...';
        
        -- Check if test user exists
        DECLARE @TestUserId INT;
        SELECT @TestUserId = user_id FROM [User] WHERE email = 'provider@test.com';
        
        IF @TestUserId IS NOT NULL
        BEGIN
            -- Check if provider profile exists
            IF NOT EXISTS (SELECT 1 FROM DataProvider WHERE user_id = @TestUserId)
            BEGIN
                INSERT INTO DataProvider (user_id, company_name, contact_email, contact_phone, province_id, created_at)
                VALUES (@TestUserId, N'Test Provider', 'provider@test.com', '+84123456789', @HanoiProvinceId, GETDATE());
                
                SET @ProviderId = SCOPE_IDENTITY();
                PRINT '✓ Created test provider (ID: ' + CAST(@ProviderId AS VARCHAR) + ')';
            END
            ELSE
            BEGIN
                SELECT @ProviderId = provider_id FROM DataProvider WHERE user_id = @TestUserId;
            END
        END
    END
    
    IF @ProviderId IS NULL
    BEGIN
        PRINT '❌ Cannot create provider. Please run DbSeeder first.';
        RETURN;
    END
    
    -- Get or create dataset
    SELECT TOP 1 @DatasetId = dataset_id 
    FROM Dataset 
    WHERE moderation_status = 'Approved' 
      AND status = 'Active'
    ORDER BY dataset_id;
    
    IF @DatasetId IS NULL
    BEGIN
        PRINT '⚠ No approved dataset found. Creating one...';
        
        INSERT INTO Dataset (
            provider_id, dataset_name, description, category, data_format,
            upload_date, moderation_status, status, visibility, row_count
        )
        VALUES (
            @ProviderId,
            N'Hà Nội EV Charging Data - 2024',
            N'Dữ liệu sạc xe điện tại Hà Nội',
            N'EV Charging',
            N'CSV',
            GETDATE(),
            'Approved',
            'Active',
            'Public',
            0
        );
        
        SET @DatasetId = SCOPE_IDENTITY();
        PRINT '✓ Created approved dataset (ID: ' + CAST(@DatasetId AS VARCHAR) + ')';
    END
    
    PRINT '✓ Using Dataset ID: ' + CAST(@DatasetId AS VARCHAR);
    PRINT '';
    PRINT '📝 Inserting 50 sample records for Ba Đình...';
    
    -- Insert sample records for Ba Đình
    DECLARE @i INT = 1;
    DECLARE @StartDate DATETIME2 = DATEADD(DAY, -45, GETDATE());
    
    WHILE @i <= 50
    BEGIN
        INSERT INTO DatasetRecords (
            DatasetId, province_id, district_id, station_id, station_name, station_address,
            station_operator, charging_timestamp, energy_kwh, voltage, current, power_kw,
            duration_minutes, charging_cost, vehicle_type, battery_capacity_kwh,
            soc_start, soc_end, created_at, data_source
        )
        VALUES (
            @DatasetId,
            @HanoiProvinceId,
            @BaDinhDistrictId,
            'STATION_HN_BD_' + RIGHT('00' + CAST(@i AS VARCHAR), 2),
            N'Trạm sạc Ba Đình ' + CAST((@i % 5) + 1 AS VARCHAR),
            N'Địa chỉ trạm ' + CAST(@i AS VARCHAR) + N', Quận Ba Đình, Hà Nội',
            N'VinFast',
            DATEADD(MINUTE, @i * 30, DATEADD(DAY, (@i % 40), @StartDate)),
            CAST(25.0 + (@i % 50) AS DECIMAL(18,4)),
            CAST(220.0 + (@i % 20) AS DECIMAL(10,2)),
            CAST(15.0 + (@i % 25) AS DECIMAL(10,2)),
            CAST(7.0 + (@i % 3) AS DECIMAL(10,2)),
            CAST(45 + (@i % 90) AS DECIMAL(10,2)),
            CAST(75000 + (@i % 100000) AS DECIMAL(18,2)),
            CASE (@i % 4) WHEN 0 THEN 'VF8' WHEN 1 THEN 'VF9' WHEN 2 THEN 'VFe34' ELSE 'Other EV' END,
            CAST(70.0 + (@i % 30) AS DECIMAL(10,2)),
            CAST(15 + (@i % 25) AS DECIMAL(5,2)),
            CAST(80 + (@i % 20) AS DECIMAL(5,2)),
            GETDATE(),
            N'Seeded Data'
        );
        
        SET @i = @i + 1;
    END
    
    -- Update row count in dataset
    UPDATE Dataset
    SET row_count = (SELECT COUNT(*) FROM DatasetRecords WHERE DatasetId = @DatasetId)
    WHERE dataset_id = @DatasetId;
    
    PRINT '✅ Inserted 50 records for Ba Đình!';
    PRINT '';
END
ELSE
BEGIN
    PRINT '✅ Data already exists for Ba Đình!';
    PRINT '';
END

-- Step 3: Verify Active subscriptions have correct IDs
PRINT '🔍 Checking Active Subscriptions...';
PRINT '';

SELECT 
    s.subscription_id,
    s.province_id,
    s.district_id,
    p.name AS province_name,
    d.name AS district_name,
    s.status
FROM SubscriptionPackagePurchase s
LEFT JOIN Province p ON s.province_id = p.province_id
LEFT JOIN District d ON s.district_id = d.district_id
WHERE s.status = 'Active';

IF @@ROWCOUNT = 0
BEGIN
    PRINT '⚠ No active subscriptions found!';
    PRINT '';
    PRINT '💡 To create a subscription, run: INSERT_CUSTOM_SUBSCRIPTION.sql';
    PRINT '   Or use the API endpoint: POST /api/subscription-packages/purchase';
END
ELSE
BEGIN
    PRINT '';
    PRINT '✅ Active subscriptions found!';
END
PRINT '';

-- Step 4: Final verification - Test the dashboard query
PRINT '=== FINAL VERIFICATION ===';
PRINT 'Testing dashboard query for province_id=' + CAST(@HanoiProvinceId AS VARCHAR) + ', district_id=' + CAST(@BaDinhDistrictId AS VARCHAR);
PRINT '';

DECLARE @TestCount INT;
SELECT @TestCount = COUNT(*)
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE dr.province_id = @HanoiProvinceId
  AND dr.district_id = @BaDinhDistrictId
  AND ds.moderation_status = 'Approved'
  AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE());

PRINT 'Records matching query (last 30 days): ' + CAST(@TestCount AS VARCHAR);

IF @TestCount > 0
BEGIN
    PRINT '';
    PRINT '✅✅✅ SUCCESS! ✅✅✅';
    PRINT '';
    PRINT 'Dashboard should now show data!';
    PRINT '';
    PRINT '🎯 Sample Stats:';
    
    SELECT 
        COUNT(*) AS total_sessions,
        CAST(SUM(energy_kwh) AS DECIMAL(18,2)) AS total_energy_kwh,
        COUNT(DISTINCT station_id) AS unique_stations,
        CAST(AVG(ISNULL(duration_minutes, 0)) AS DECIMAL(10,1)) AS avg_duration_min
    FROM DatasetRecords dr
    INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
    WHERE dr.province_id = @HanoiProvinceId
      AND dr.district_id = @BaDinhDistrictId
      AND ds.moderation_status = 'Approved'
      AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE());
END
ELSE
BEGIN
    PRINT '';
    PRINT '❌ Still no data! Please check:';
    PRINT '   1. Subscription province_id and district_id';
    PRINT '   2. DatasetRecords have matching IDs';
    PRINT '   3. Dataset moderation_status = "Approved"';
    PRINT '   4. Records are within last 30 days';
END
PRINT '';

PRINT '========================================';
PRINT 'FIX COMPLETED';
PRINT '========================================';

GO

