-- Script to check which tables have data in the database

PRINT '========================================';
PRINT 'Checking all tables in EVDataMarketplace';
PRINT '========================================';
PRINT '';

-- User table
DECLARE @UserCount INT;
SELECT @UserCount = COUNT(*) FROM [User];
PRINT 'User: ' + CAST(@UserCount AS VARCHAR(10)) + ' records';

-- DataProvider table
DECLARE @ProviderCount INT;
SELECT @ProviderCount = COUNT(*) FROM DataProvider;
PRINT 'DataProvider: ' + CAST(@ProviderCount AS VARCHAR(10)) + ' records';

-- DataConsumer table
DECLARE @ConsumerCount INT;
SELECT @ConsumerCount = COUNT(*) FROM DataConsumer;
PRINT 'DataConsumer: ' + CAST(@ConsumerCount AS VARCHAR(10)) + ' records';

-- Province table
DECLARE @ProvinceCount INT;
SELECT @ProvinceCount = COUNT(*) FROM Province;
PRINT 'Province: ' + CAST(@ProvinceCount AS VARCHAR(10)) + ' records';

-- District table
DECLARE @DistrictCount INT;
SELECT @DistrictCount = COUNT(*) FROM District;
PRINT 'District: ' + CAST(@DistrictCount AS VARCHAR(10)) + ' records';

-- Dataset table
DECLARE @DatasetCount INT;
SELECT @DatasetCount = COUNT(*) FROM Dataset;
PRINT 'Dataset: ' + CAST(@DatasetCount AS VARCHAR(10)) + ' records';

-- DatasetRecords table
DECLARE @DatasetRecordsCount INT;
SELECT @DatasetRecordsCount = COUNT(*) FROM DatasetRecords;
PRINT 'DatasetRecords: ' + CAST(@DatasetRecordsCount AS VARCHAR(10)) + ' records';

-- DatasetModeration table
DECLARE @ModerationCount INT;
SELECT @ModerationCount = COUNT(*) FROM DatasetModeration;
PRINT 'DatasetModeration: ' + CAST(@ModerationCount AS VARCHAR(10)) + ' records';

-- DataPackagePurchase table
DECLARE @DataPackageCount INT;
SELECT @DataPackageCount = COUNT(*) FROM DataPackagePurchase;
PRINT 'DataPackagePurchase: ' + CAST(@DataPackageCount AS VARCHAR(10)) + ' records';

-- OneTimePurchase table
DECLARE @OneTimeCount INT;
SELECT @OneTimeCount = COUNT(*) FROM OneTimePurchase;
PRINT 'OneTimePurchase: ' + CAST(@OneTimeCount AS VARCHAR(10)) + ' records';

-- SubscriptionPackagePurchase table
DECLARE @SubscriptionCount INT;
SELECT @SubscriptionCount = COUNT(*) FROM SubscriptionPackagePurchase;
PRINT 'SubscriptionPackagePurchase: ' + CAST(@SubscriptionCount AS VARCHAR(10)) + ' records';

-- Subscription table
DECLARE @SubsCount INT;
SELECT @SubsCount = COUNT(*) FROM Subscription;
PRINT 'Subscription: ' + CAST(@SubsCount AS VARCHAR(10)) + ' records';

-- APIPackagePurchase table
DECLARE @APIPackageCount INT;
SELECT @APIPackageCount = COUNT(*) FROM APIPackagePurchase;
PRINT 'APIPackagePurchase: ' + CAST(@APIPackageCount AS VARCHAR(10)) + ' records';

-- APIPackage table
DECLARE @APIPackCount INT;
SELECT @APIPackCount = COUNT(*) FROM APIPackage;
PRINT 'APIPackage: ' + CAST(@APIPackCount AS VARCHAR(10)) + ' records';

-- APIKey table
DECLARE @APIKeyCount INT;
SELECT @APIKeyCount = COUNT(*) FROM APIKey;
PRINT 'APIKey: ' + CAST(@APIKeyCount AS VARCHAR(10)) + ' records';

-- Payment table
DECLARE @PaymentCount INT;
SELECT @PaymentCount = COUNT(*) FROM Payment;
PRINT 'Payment: ' + CAST(@PaymentCount AS VARCHAR(10)) + ' records';

-- Payout table
DECLARE @PayoutCount INT;
SELECT @PayoutCount = COUNT(*) FROM Payout;
PRINT 'Payout: ' + CAST(@PayoutCount AS VARCHAR(10)) + ' records';

-- RevenueShare table
DECLARE @RevenueCount INT;
SELECT @RevenueCount = COUNT(*) FROM RevenueShare;
PRINT 'RevenueShare: ' + CAST(@RevenueCount AS VARCHAR(10)) + ' records';

-- SystemPricing table
DECLARE @PricingCount INT;
SELECT @PricingCount = COUNT(*) FROM SystemPricing;
PRINT 'SystemPricing: ' + CAST(@PricingCount AS VARCHAR(10)) + ' records';

PRINT '';
PRINT '========================================';
PRINT 'Detailed view of tables with data:';
PRINT '========================================';
PRINT '';

-- Show sample data from User
IF @UserCount > 0
BEGIN
    PRINT '--- User (sample) ---';
    SELECT TOP 5 * FROM [User] ORDER BY created_at DESC;
    PRINT '';
END

-- Show sample data from DataProvider
IF @ProviderCount > 0
BEGIN
    PRINT '--- DataProvider (sample) ---';
    SELECT TOP 5 * FROM DataProvider ORDER BY created_at DESC;
    PRINT '';
END

-- Show sample data from DataConsumer
IF @ConsumerCount > 0
BEGIN
    PRINT '--- DataConsumer (sample) ---';
    SELECT TOP 5 * FROM DataConsumer ORDER BY created_at DESC;
    PRINT '';
END

-- Show sample data from Province
IF @ProvinceCount > 0
BEGIN
    PRINT '--- Province ---';
    SELECT * FROM Province;
    PRINT '';
END

-- Show sample data from District
IF @DistrictCount > 0
BEGIN
    PRINT '--- District (sample top 10) ---';
    SELECT TOP 10 * FROM District;
    PRINT '';
END

-- Show sample data from Dataset
IF @DatasetCount > 0
BEGIN
    PRINT '--- Dataset ---';
    SELECT * FROM Dataset ORDER BY upload_date DESC;
    PRINT '';
END

-- Show sample data from DatasetRecords
IF @DatasetRecordsCount > 0
BEGIN
    PRINT '--- DatasetRecords (sample) ---';
    SELECT TOP 5 * FROM DatasetRecords;
    PRINT '';
END

-- Show sample data from DatasetModeration
IF @ModerationCount > 0
BEGIN
    PRINT '--- DatasetModeration ---';
    SELECT * FROM DatasetModeration;
    PRINT '';
END

-- Show sample data from DataPackagePurchase
IF @DataPackageCount > 0
BEGIN
    PRINT '--- DataPackagePurchase ---';
    SELECT * FROM DataPackagePurchase;
    PRINT '';
END

-- Show sample data from OneTimePurchase
IF @OneTimeCount > 0
BEGIN
    PRINT '--- OneTimePurchase ---';
    SELECT * FROM OneTimePurchase;
    PRINT '';
END

-- Show sample data from SubscriptionPackagePurchase
IF @SubscriptionCount > 0
BEGIN
    PRINT '--- SubscriptionPackagePurchase ---';
    SELECT * FROM SubscriptionPackagePurchase;
    PRINT '';
END

-- Show sample data from Subscription
IF @SubsCount > 0
BEGIN
    PRINT '--- Subscription ---';
    SELECT * FROM Subscription;
    PRINT '';
END

-- Show sample data from APIPackagePurchase
IF @APIPackageCount > 0
BEGIN
    PRINT '--- APIPackagePurchase ---';
    SELECT * FROM APIPackagePurchase;
    PRINT '';
END

-- Show sample data from APIPackage
IF @APIPackCount > 0
BEGIN
    PRINT '--- APIPackage ---';
    SELECT * FROM APIPackage;
    PRINT '';
END

-- Show sample data from APIKey
IF @APIKeyCount > 0
BEGIN
    PRINT '--- APIKey ---';
    SELECT * FROM APIKey ORDER BY created_at DESC;
    PRINT '';
END

-- Show sample data from Payment
IF @PaymentCount > 0
BEGIN
    PRINT '--- Payment (sample) ---';
    SELECT TOP 10 * FROM Payment ORDER BY payment_date DESC;
    PRINT '';
END

-- Show sample data from Payout
IF @PayoutCount > 0
BEGIN
    PRINT '--- Payout ---';
    SELECT * FROM Payout;
    PRINT '';
END

-- Show sample data from RevenueShare
IF @RevenueCount > 0
BEGIN
    PRINT '--- RevenueShare ---';
    SELECT * FROM RevenueShare;
    PRINT '';
END

-- Show sample data from SystemPricing
IF @PricingCount > 0
BEGIN
    PRINT '--- SystemPricing ---';
    SELECT * FROM SystemPricing;
    PRINT '';
END

PRINT '========================================';
PRINT 'Check completed!';
PRINT '========================================';
