-- Update existing DataPackagePurchases to set default values for new fields
-- This ensures backward compatibility with purchases created before the download feature

-- Set default values for downloadCount, maxDownload
UPDATE DataPackagePurchases
SET 
    DownloadCount = 0,
    MaxDownload = 5,
    LastDownloadDate = NULL
WHERE 
    DownloadCount IS NULL 
    OR MaxDownload IS NULL;

-- Update existing SubscriptionPackagePurchases for new fields
UPDATE SubscriptionPackagePurchases
SET 
    DashboardAccessCount = 0,
    LastAccessDate = NULL,
    CancelledAt = NULL
WHERE 
    DashboardAccessCount IS NULL;

-- Verify the updates
SELECT 
    'DataPackagePurchases' AS TableName,
    COUNT(*) AS TotalRecords,
    SUM(CASE WHEN DownloadCount = 0 THEN 1 ELSE 0 END) AS RecordsWithZeroDownloads,
    SUM(CASE WHEN MaxDownload = 5 THEN 1 ELSE 0 END) AS RecordsWithMaxDownload5
FROM DataPackagePurchases;

SELECT 
    'SubscriptionPackagePurchases' AS TableName,
    COUNT(*) AS TotalRecords,
    SUM(CASE WHEN DashboardAccessCount = 0 THEN 1 ELSE 0 END) AS RecordsWithZeroAccess
FROM SubscriptionPackagePurchases;

PRINT 'Successfully updated existing purchases with default values!';

