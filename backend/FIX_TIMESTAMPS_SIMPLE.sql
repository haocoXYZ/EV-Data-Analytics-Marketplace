-- Simple script to fix timestamps
USE EVDataMarketplace;
GO

-- Check current data
PRINT 'Before Update:';
SELECT 
    COUNT(*) as total_records,
    MIN(charging_timestamp) as oldest_date,
    MAX(charging_timestamp) as newest_date
FROM DatasetRecords;
GO

-- Update timestamps to recent dates (last 45 days)
DECLARE @today DATETIME2 = GETDATE();
DECLARE @daysAgo INT = 45;

UPDATE DatasetRecords
SET charging_timestamp = DATEADD(DAY, -(@daysAgo - DATEDIFF(DAY, '2024-01-01', charging_timestamp) % @daysAgo), @today),
    created_at = DATEADD(DAY, -(@daysAgo - DATEDIFF(DAY, '2024-01-01', created_at) % @daysAgo), @today);

PRINT '';
PRINT 'Updated all records!';
PRINT '';

-- Check after update
PRINT 'After Update:';
SELECT 
    COUNT(*) as total_records,
    MIN(charging_timestamp) as oldest_date,
    MAX(charging_timestamp) as newest_date
FROM DatasetRecords;
GO

-- Check records in last 30 days
PRINT '';
PRINT 'Records in Last 30 Days:';
SELECT COUNT(*) as recent_records
FROM DatasetRecords
WHERE charging_timestamp >= DATEADD(DAY, -30, GETDATE());
GO

-- Check by province
PRINT '';
PRINT 'Records by Province (Last 30 Days):';
SELECT 
    p.province_id,
    p.name as province_name,
    COUNT(dr.RecordId) as record_count,
    MIN(dr.charging_timestamp) as oldest_date,
    MAX(dr.charging_timestamp) as newest_date
FROM DatasetRecords dr
INNER JOIN District d ON dr.district_id = d.district_id
INNER JOIN Province p ON d.province_id = p.province_id
WHERE dr.charging_timestamp >= DATEADD(DAY, -30, GETDATE())
GROUP BY p.province_id, p.name
ORDER BY p.province_id;
GO

PRINT '';
PRINT '✅ Timestamp fix completed!';

