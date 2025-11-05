-- Create Test Subscriptions (Fixed)
USE EVDataMarketplace;
GO

PRINT '========================================';
PRINT 'Creating Test Subscriptions';
PRINT '========================================';
PRINT '';

-- Get consumer ID from DataConsumer table
DECLARE @consumer_id INT;
SELECT @consumer_id = dc.consumer_id 
FROM DataConsumer dc
INNER JOIN [User] u ON dc.user_id = u.user_id
WHERE u.email = 'consumer@test.com';

IF @consumer_id IS NULL
BEGIN
    PRINT 'ERROR: Consumer not found in DataConsumer table!';
    RETURN;
END

PRINT 'Consumer ID: ' + CAST(@consumer_id AS NVARCHAR);
PRINT '';

-- Create subscription for Hanoi (Dataset ID = 1, Province ID = 1)
IF NOT EXISTS (SELECT 1 FROM Subscription WHERE dataset_id = 1 AND consumer_id = @consumer_id)
BEGIN
    INSERT INTO Subscription (dataset_id, consumer_id, province_id, sub_start, sub_end, renewal_status, renewal_cycle, total_price, request_count)
    VALUES (1, @consumer_id, 1, GETDATE(), DATEADD(MONTH, 1, GETDATE()), 'Active', 'Monthly', 100000, 0);
    PRINT 'Created subscription for Hanoi (Dataset ID = 1, Province ID = 1)';
END
ELSE
BEGIN
    PRINT 'Subscription for Hanoi already exists';
END

-- Create subscription for HCM (Dataset ID = 2, Province ID = 2)
IF NOT EXISTS (SELECT 1 FROM Subscription WHERE dataset_id = 2 AND consumer_id = @consumer_id)
BEGIN
    INSERT INTO Subscription (dataset_id, consumer_id, province_id, sub_start, sub_end, renewal_status, renewal_cycle, total_price, request_count)
    VALUES (2, @consumer_id, 2, GETDATE(), DATEADD(MONTH, 1, GETDATE()), 'Active', 'Monthly', 120000, 0);
    PRINT 'Created subscription for HCM (Dataset ID = 2, Province ID = 2)';
END
ELSE
BEGIN
    PRINT 'Subscription for HCM already exists';
END

-- Create subscription for Danang (Dataset ID = 3, Province ID = 3)
IF NOT EXISTS (SELECT 1 FROM Subscription WHERE dataset_id = 3 AND consumer_id = @consumer_id)
BEGIN
    INSERT INTO Subscription (dataset_id, consumer_id, province_id, sub_start, sub_end, renewal_status, renewal_cycle, total_price, request_count)
    VALUES (3, @consumer_id, 3, GETDATE(), DATEADD(MONTH, 1, GETDATE()), 'Active', 'Monthly', 80000, 0);
    PRINT 'Created subscription for Danang (Dataset ID = 3, Province ID = 3)';
END
ELSE
BEGIN
    PRINT 'Subscription for Danang already exists';
END

PRINT '';
PRINT '========================================';
PRINT 'Current Subscriptions:';
PRINT '========================================';

SELECT 
    s.sub_id,
    s.dataset_id,
    d.name as dataset_name,
    s.consumer_id,
    dc.organization_name,
    u.email as consumer_email,
    s.province_id,
    p.name as province_name,
    s.renewal_status,
    s.sub_start,
    s.sub_end,
    s.total_price,
    s.request_count
FROM Subscription s
INNER JOIN DataConsumer dc ON s.consumer_id = dc.consumer_id
INNER JOIN [User] u ON dc.user_id = u.user_id
INNER JOIN Dataset d ON s.dataset_id = d.dataset_id
LEFT JOIN Province p ON s.province_id = p.province_id
WHERE s.consumer_id = @consumer_id;

PRINT '';
PRINT 'Subscriptions created successfully!';
GO

