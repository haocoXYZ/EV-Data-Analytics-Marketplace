-- ============================================
-- DEBUG: Tại sao Subscription Dashboard không có dữ liệu?
-- ============================================

USE [db_easycode_cm];
GO

SET NOCOUNT ON;

PRINT '';
PRINT '========================================';
PRINT 'SUBSCRIPTION DASHBOARD DEBUG';
PRINT '========================================';
PRINT '';

-- 1. Kiểm tra Province
PRINT '=== 1. PROVINCES (Hà Nội) ===';
SELECT province_id, name AS province_name
FROM Province
WHERE name = N'Hà Nội';
PRINT '';

-- 2. Kiểm tra Districts của Hà Nội
PRINT '=== 2. DISTRICTS (Hà Nội) - First 10 ===';
SELECT TOP 10 d.district_id, d.name AS district_name, d.type
FROM District d
INNER JOIN Province p ON d.province_id = p.province_id
WHERE p.name = N'Hà Nội'
ORDER BY d.district_id;
PRINT '';

-- 3. Kiểm tra Subscriptions
PRINT '=== 3. SUBSCRIPTIONS (Active) ===';
SELECT 
    s.subscription_id,
    s.consumer_id,
    s.province_id,
    s.district_id,
    p.name AS province_name,
    d.name AS district_name,
    s.status,
    CONVERT(VARCHAR, s.start_date, 120) AS start_date,
    CONVERT(VARCHAR, s.end_date, 120) AS end_date
FROM SubscriptionPackagePurchase s
LEFT JOIN Province p ON s.province_id = p.province_id
LEFT JOIN District d ON s.district_id = d.district_id
WHERE s.status = 'Active'
ORDER BY s.subscription_id;

IF @@ROWCOUNT = 0
BEGIN
    PRINT '⚠ KHÔNG CÓ Active subscription nào!';
    PRINT '';
    PRINT '📋 ALL Subscriptions:';
    SELECT 
        subscription_id,
        consumer_id,
        province_id,
        district_id,
        status
    FROM SubscriptionPackagePurchase
    ORDER BY subscription_id;
END
PRINT '';

-- 4. Kiểm tra DatasetRecords tổng số
PRINT '=== 4. DATASET RECORDS (Total) ===';
SELECT 
    COUNT(*) AS total_records,
    MIN(charging_timestamp) AS earliest_record,
    MAX(charging_timestamp) AS latest_record
FROM DatasetRecords;
PRINT '';

-- 5. Kiểm tra DatasetRecords theo Province
PRINT '=== 5. DATASET RECORDS BY PROVINCE ===';
SELECT 
    p.province_id,
    p.name AS province_name,
    COUNT(dr.RecordId) AS record_count
FROM Province p
LEFT JOIN DatasetRecords dr ON p.province_id = dr.province_id
WHERE p.name IN (N'Hà Nội', N'Hồ Chí Minh', N'Đà Nẵng')
GROUP BY p.province_id, p.name
ORDER BY record_count DESC;
PRINT '';

-- 6. Kiểm tra DatasetRecords theo District (Hà Nội)
PRINT '=== 6. DATASET RECORDS BY DISTRICT (Hà Nội) ===';
SELECT 
    d.district_id,
    d.name AS district_name,
    COUNT(dr.RecordId) AS record_count
FROM District d
LEFT JOIN DatasetRecords dr ON d.district_id = dr.district_id
WHERE d.province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội')
GROUP BY d.district_id, d.name
HAVING COUNT(dr.RecordId) > 0
ORDER BY record_count DESC;
PRINT '';

-- 7. Kiểm tra Dataset và ModerationStatus
PRINT '=== 7. DATASETS & MODERATION STATUS ===';
SELECT 
    dataset_id,
    dataset_name,
    moderation_status,
    status,
    row_count
FROM Dataset
ORDER BY dataset_id;
PRINT '';

-- 8. Kiểm tra Approved DatasetRecords
PRINT '=== 8. APPROVED DATASET RECORDS (by Province) ===';
SELECT 
    p.province_id,
    p.name AS province_name,
    COUNT(dr.RecordId) AS approved_record_count
FROM Province p
LEFT JOIN DatasetRecords dr ON p.province_id = dr.province_id
LEFT JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE ds.moderation_status = 'Approved'
GROUP BY p.province_id, p.name
HAVING COUNT(dr.RecordId) > 0
ORDER BY approved_record_count DESC;
PRINT '';

-- 9. TEST QUERY - Giống y hệt logic trong C# code
PRINT '=== 9. TEST QUERY - Simulating C# Dashboard Query ===';
PRINT 'Assuming Active Subscription: province_id=1, district_id=1 (Ba Đình)';
PRINT '';

DECLARE @TestProvinceId INT = 1;  -- Hà Nội
DECLARE @TestDistrictId INT = 1;  -- Ba Đình
DECLARE @ThirtyDaysAgo DATETIME2 = DATEADD(DAY, -30, GETDATE());

PRINT 'Query parameters:';
PRINT '  Province ID: ' + CAST(@TestProvinceId AS VARCHAR);
PRINT '  District ID: ' + CAST(@TestDistrictId AS VARCHAR);
PRINT '  Date Range: Last 30 days (>= ' + CONVERT(VARCHAR, @ThirtyDaysAgo, 120) + ')';
PRINT '';

SELECT 
    COUNT(*) AS matching_records,
    SUM(energy_kwh) AS total_energy_kwh,
    COUNT(DISTINCT station_id) AS unique_stations,
    AVG(ISNULL(duration_minutes, 0)) AS avg_duration_minutes
FROM DatasetRecords dr
INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
WHERE dr.province_id = @TestProvinceId
  AND dr.district_id = @TestDistrictId
  AND ds.moderation_status = 'Approved'
  AND dr.charging_timestamp >= @ThirtyDaysAgo;

IF (SELECT COUNT(*) FROM DatasetRecords dr
    INNER JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
    WHERE dr.province_id = @TestProvinceId
      AND dr.district_id = @TestDistrictId
      AND ds.moderation_status = 'Approved'
      AND dr.charging_timestamp >= @ThirtyDaysAgo) = 0
BEGIN
    PRINT '';
    PRINT '❌ PROBLEM FOUND: No records match the query!';
    PRINT '';
    PRINT '🔍 Debugging:';
    
    -- Check records for this province (without district filter)
    PRINT '   Records for province ' + CAST(@TestProvinceId AS VARCHAR) + ': ' + 
        CAST((SELECT COUNT(*) FROM DatasetRecords WHERE province_id = @TestProvinceId) AS VARCHAR);
    
    -- Check records for this district
    PRINT '   Records for district ' + CAST(@TestDistrictId AS VARCHAR) + ': ' + 
        CAST((SELECT COUNT(*) FROM DatasetRecords WHERE district_id = @TestDistrictId) AS VARCHAR);
    
    -- Check approved datasets
    PRINT '   Approved datasets: ' + 
        CAST((SELECT COUNT(*) FROM Dataset WHERE moderation_status = 'Approved') AS VARCHAR);
    
    -- Check recent records (last 30 days)
    PRINT '   Records in last 30 days: ' + 
        CAST((SELECT COUNT(*) FROM DatasetRecords WHERE charging_timestamp >= @ThirtyDaysAgo) AS VARCHAR);
    
    PRINT '';
    PRINT '💡 Possible causes:';
    PRINT '   1. District ID mismatch between Subscription and DatasetRecords';
    PRINT '   2. No records within 30-day window';
    PRINT '   3. Dataset not approved';
    PRINT '   4. Province/District ID in subscription is wrong';
END
ELSE
BEGIN
    PRINT '';
    PRINT '✅ Query returned data! Dashboard should work.';
END
PRINT '';

-- 10. Sample DatasetRecords (first 3)
PRINT '=== 10. SAMPLE DATASET RECORDS (First 3) ===';
SELECT TOP 3
    dr.RecordId,
    dr.station_name,
    dr.province_id,
    dr.district_id,
    dr.charging_timestamp,
    dr.energy_kwh,
    ds.moderation_status
FROM DatasetRecords dr
LEFT JOIN Dataset ds ON dr.DatasetId = ds.dataset_id
ORDER BY dr.charging_timestamp DESC;
PRINT '';

PRINT '========================================';
PRINT 'DEBUG COMPLETED';
PRINT '========================================';

GO

