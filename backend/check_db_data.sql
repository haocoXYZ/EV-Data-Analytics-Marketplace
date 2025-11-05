-- Kiểm tra data trong database
USE db_easycode_cm;

-- 1. Kiểm tra Provinces
SELECT 'Provinces' AS TableName, COUNT(*) AS RecordCount FROM Province;
SELECT * FROM Province WHERE name = N'Hà Nội';

-- 2. Kiểm tra Districts của Hà Nội
SELECT 'Districts (Hà Nội)' AS TableName, COUNT(*) AS RecordCount 
FROM District d
INNER JOIN Province p ON d.province_id = p.province_id
WHERE p.name = N'Hà Nội';

SELECT d.district_id, d.name, d.type, p.name AS province_name
FROM District d
INNER JOIN Province p ON d.province_id = p.province_id
WHERE p.name = N'Hà Nội'
ORDER BY d.district_id;

-- 3. Kiểm tra Subscriptions
SELECT 'Subscriptions' AS TableName, COUNT(*) AS RecordCount FROM SubscriptionPackagePurchase;

SELECT s.subscription_id, s.consumer_id, s.province_id, s.district_id, s.status,
       p.name AS province_name, d.name AS district_name
FROM SubscriptionPackagePurchase s
LEFT JOIN Province p ON s.province_id = p.province_id
LEFT JOIN District d ON s.district_id = d.district_id;

-- 4. Kiểm tra DatasetRecords
SELECT 'DatasetRecords (Total)' AS TableName, COUNT(*) AS RecordCount FROM DatasetRecords;

-- 5. Kiểm tra DatasetRecords cho Hà Nội
SELECT 'DatasetRecords (Hà Nội)' AS Info, COUNT(*) AS RecordCount
FROM DatasetRecords dr
WHERE dr.province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội');

-- 6. Kiểm tra DatasetRecords theo từng district của Hà Nội
SELECT d.district_id, d.name AS district_name, COUNT(dr.record_id) AS record_count
FROM District d
LEFT JOIN DatasetRecords dr ON d.district_id = dr.district_id
WHERE d.province_id = (SELECT province_id FROM Province WHERE name = N'Hà Nội')
GROUP BY d.district_id, d.name
ORDER BY d.district_id;

-- 7. Kiểm tra một vài records mẫu cho Ba Đình
SELECT TOP 5 
    dr.record_id, 
    dr.station_name, 
    dr.charging_timestamp, 
    dr.energy_kwh,
    dr.province_id,
    dr.district_id,
    p.name AS province_name,
    d.name AS district_name
FROM DatasetRecords dr
LEFT JOIN Province p ON dr.province_id = p.province_id
LEFT JOIN District d ON dr.district_id = d.district_id
WHERE d.name = N'Ba Đình'
ORDER BY dr.charging_timestamp DESC;

