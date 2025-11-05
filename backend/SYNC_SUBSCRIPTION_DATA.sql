-- ================================================
-- SYNC SUBSCRIPTION DATA TO SubscriptionPackagePurchase
-- ================================================
-- This script copies active subscriptions from Subscription table
-- to SubscriptionPackagePurchase table for API compatibility

USE EVDataMarketplace;
GO

PRINT '========================================';
PRINT '🔄 SYNCING SUBSCRIPTION DATA';
PRINT '========================================';
PRINT '';

-- Check existing data in SubscriptionPackagePurchase
PRINT '1️⃣ Current SubscriptionPackagePurchase records:';
SELECT subscription_id, consumer_id, province_id, district_id, status, start_date, end_date
FROM SubscriptionPackagePurchase;
PRINT '';

-- Check Subscription records to sync
PRINT '2️⃣ Active Subscriptions to sync:';
SELECT sub_id, consumer_id, dataset_id, province_id, renewal_status, sub_start, sub_end
FROM Subscription
WHERE renewal_status = 'Active';
PRINT '';

-- Clear old test data from SubscriptionPackagePurchase
PRINT '3️⃣ Clearing old test data...';
DELETE FROM SubscriptionPackagePurchase 
WHERE consumer_id = 1;
PRINT 'Deleted ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' records';
PRINT '';

-- Insert subscriptions from Subscription table to SubscriptionPackagePurchase
PRINT '4️⃣ Inserting active subscriptions...';

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
SELECT 
    s.consumer_id,
    s.province_id,
    NULL as district_id,  -- We're subscribing to whole province
    s.sub_start as start_date,
    s.sub_end as end_date,
    'Monthly' as billing_cycle,
    -- Price based on province
    CASE 
        WHEN s.province_id = 1 THEN 100000.00  -- Hanoi
        WHEN s.province_id = 2 THEN 120000.00  -- HCM
        WHEN s.province_id = 3 THEN 80000.00   -- Da Nang
        ELSE 100000.00
    END as monthly_price,
    CASE 
        WHEN s.province_id = 1 THEN 100000.00
        WHEN s.province_id = 2 THEN 120000.00
        WHEN s.province_id = 3 THEN 80000.00
        ELSE 100000.00
    END as total_paid,
    s.sub_start as purchase_date,
    'Active' as status,
    1 as auto_renew,
    NULL as cancelled_at,
    0 as dashboard_access_count,
    NULL as last_access_date
FROM Subscription s
WHERE s.renewal_status = 'Active'
  AND s.consumer_id = 1;

PRINT 'Inserted ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' subscriptions';
PRINT '';

-- Verify the sync
PRINT '5️⃣ Verification - SubscriptionPackagePurchase after sync:';
SELECT 
    spp.subscription_id,
    spp.consumer_id,
    spp.province_id,
    p.name as province_name,
    spp.monthly_price,
    spp.status,
    spp.start_date,
    spp.end_date,
    spp.billing_cycle
FROM SubscriptionPackagePurchase spp
LEFT JOIN Province p ON spp.province_id = p.province_id
WHERE spp.consumer_id = 1
ORDER BY spp.subscription_id;
PRINT '';

PRINT '========================================';
PRINT '✅ SYNC COMPLETED';
PRINT '========================================';
PRINT '';
PRINT '📝 Next Steps:';
PRINT '1. Test API: GET /api/purchases/my-purchases';
PRINT '2. Should return 3 active subscriptions';
PRINT '3. Use subscription_id from response for dashboard';
PRINT '';

