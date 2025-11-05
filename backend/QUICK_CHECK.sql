-- Quick check: Does SubscriptionPackagePurchase table have all required columns?

USE [EVDataMarketplace];

PRINT '🔍 Quick Check: SubscriptionPackagePurchase Table';
PRINT '================================================';
PRINT '';

-- Show all columns
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SubscriptionPackagePurchase'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '📝 Required columns checklist:';
PRINT '-------------------------------';

-- Check each required column
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'subscription_id') THEN '✓' ELSE '❌' 
    END + ' subscription_id' as Status
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'consumer_id') THEN '✓' ELSE '❌' END + ' consumer_id'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'province_id') THEN '✓' ELSE '❌' END + ' province_id'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'district_id') THEN '✓' ELSE '❌' END + ' district_id'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'start_date') THEN '✓' ELSE '❌' END + ' start_date'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'end_date') THEN '✓' ELSE '❌' END + ' end_date'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'billing_cycle') THEN '✓' ELSE '❌' END + ' billing_cycle'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'monthly_price') THEN '✓' ELSE '❌' END + ' monthly_price'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'total_paid') THEN '✓' ELSE '❌' END + ' total_paid'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'purchase_date') THEN '✓' ELSE '❌' END + ' purchase_date'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'status') THEN '✓' ELSE '❌' END + ' status'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'auto_renew') THEN '✓' ELSE '❌' END + ' auto_renew'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'cancelled_at') THEN '✓' ELSE '❌' END + ' cancelled_at'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'dashboard_access_count') THEN '✓' ELSE '❌' END + ' dashboard_access_count'
UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SubscriptionPackagePurchase' AND COLUMN_NAME = 'last_access_date') THEN '✓' ELSE '❌' END + ' last_access_date';

PRINT '';
PRINT '================================================';


