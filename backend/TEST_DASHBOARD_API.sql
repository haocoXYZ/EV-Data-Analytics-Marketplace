-- Test Dashboard Data for API
USE EVDataMarketplace;
GO

PRINT '========================================';
PRINT '🧪 DASHBOARD API DATA TEST';
PRINT '========================================';
PRINT '';

-- 1. Check Active Subscriptions
PRINT '1️⃣ Active Subscriptions:';
SELECT 
    s.sub_id,
    s.consumer_id,
    u.email,
    s.province_id,
    p.name as province_name,
    s.renewal_status,
    s.sub_start,
    s.sub_end
FROM Subscription s
INNER JOIN [User] u ON s.consumer_id = u.user_id
LEFT JOIN Province p ON s.province_id = p.province_id
WHERE s.renewal_status = 'Active'
AND s.sub_end >= GETDATE();
PRINT '';

-- 2. Check Available Data for Subscription ID = 4 (Hanoi)
PRINT '2️⃣ Available Data for Subscription ID = 4 (Hanoi):';
DECLARE @subscription_id INT = 4;
DECLARE @province_id INT;

SELECT @province_id = province_id
FROM Subscription
WHERE sub_id = @subscription_id;

PRINT 'Subscription ID: ' + CAST(@subscription_id AS NVARCHAR);
PRINT 'Province ID: ' + CAST(ISNULL(@province_id, 0) AS NVARCHAR);
PRINT '';

-- 3. Total Records Available
PRINT '3️⃣ Total Records Available (Last 30 Days):';
SELECT COUNT(*) as total_records
FROM DatasetRecords dr
INNER JOIN District d ON dr.district_id = d.district_id
WHERE d.province_id = @province_id
AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE());
PRINT '';

-- 4. Sample Records
PRINT '4️⃣ Sample Records (First 10):';
SELECT TOP 10
    dr.RecordId,
    dr.charging_timestamp,
    p.name as province_name,
    d.name as district_name,
    dr.station_name,
    dr.energy_kwh,
    dr.power_kw,
    dr.charging_cost
FROM DatasetRecords dr
INNER JOIN District d ON dr.district_id = d.district_id
INNER JOIN Province p ON d.province_id = p.province_id
WHERE p.province_id = @province_id
AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
ORDER BY dr.charging_timestamp DESC;
PRINT '';

-- 5. Energy Statistics
PRINT '5️⃣ Energy Statistics:';
SELECT 
    COUNT(*) as total_records,
    SUM(energy_kwh) as total_energy_kwh,
    AVG(energy_kwh) as avg_energy_kwh,
    MAX(energy_kwh) as max_energy_kwh,
    MIN(energy_kwh) as min_energy_kwh
FROM DatasetRecords dr
INNER JOIN District d ON dr.district_id = d.district_id
WHERE d.province_id = @province_id
AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE());
PRINT '';

-- 6. Records by Date (Last 7 Days)
PRINT '6️⃣ Records by Date (Last 7 Days):';
SELECT 
    CAST(dr.charging_timestamp AS DATE) as date,
    COUNT(*) as record_count,
    SUM(dr.energy_kwh) as total_energy_kwh,
    AVG(dr.energy_kwh) as avg_energy_kwh
FROM DatasetRecords dr
INNER JOIN District d ON dr.district_id = d.district_id
WHERE d.province_id = @province_id
AND dr.charging_timestamp >= DATEADD(DAY, -7, GETDATE())
GROUP BY CAST(dr.charging_timestamp AS DATE)
ORDER BY date DESC;
PRINT '';

-- 7. Top Charging Stations
PRINT '7️⃣ Top 5 Charging Stations:';
SELECT TOP 5
    dr.station_name,
    COUNT(*) as total_charges,
    SUM(dr.energy_kwh) as total_energy_kwh,
    AVG(dr.energy_kwh) as avg_energy_kwh
FROM DatasetRecords dr
INNER JOIN District d ON dr.district_id = d.district_id
WHERE d.province_id = @province_id
AND dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
GROUP BY dr.station_name
ORDER BY total_energy_kwh DESC;
PRINT '';

PRINT '========================================';
PRINT '✅ TEST COMPLETED';
PRINT '========================================';
PRINT '';
PRINT '📋 Next Steps:';
PRINT '1. Test API: GET /api/subscription-packages/1/dashboard';
PRINT '2. Login as: consumer@test.com / Test123!';
PRINT '3. Check "My Purchases" section';
PRINT '';

