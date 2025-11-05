-- ============================================
-- Update SubscriptionPackagePurchase Table
-- Add missing columns for the new subscription system
-- ============================================

USE [EVDataMarketplace];
GO

PRINT 'Starting SubscriptionPackagePurchase table update...';

-- Check if table exists
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND type in (N'U'))
BEGIN
    PRINT 'ERROR: SubscriptionPackagePurchase table does not exist!';
    RETURN;
END

-- Add billing_cycle column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND name = 'billing_cycle')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPackagePurchase]
    ADD [billing_cycle] NVARCHAR(50) NOT NULL DEFAULT 'Monthly';
    PRINT '✓ Added billing_cycle column';
END
ELSE
BEGIN
    PRINT '  billing_cycle column already exists';
END

-- Add purchase_date column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND name = 'purchase_date')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPackagePurchase]
    ADD [purchase_date] DATETIME2(7) NOT NULL DEFAULT GETDATE();
    PRINT '✓ Added purchase_date column';
END
ELSE
BEGIN
    PRINT '  purchase_date column already exists';
END

-- Add cancelled_at column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND name = 'cancelled_at')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPackagePurchase]
    ADD [cancelled_at] DATETIME2(7) NULL;
    PRINT '✓ Added cancelled_at column';
END
ELSE
BEGIN
    PRINT '  cancelled_at column already exists';
END

-- Add dashboard_access_count column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND name = 'dashboard_access_count')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPackagePurchase]
    ADD [dashboard_access_count] INT NOT NULL DEFAULT 0;
    PRINT '✓ Added dashboard_access_count column';
END
ELSE
BEGIN
    PRINT '  dashboard_access_count column already exists';
END

-- Add last_access_date column if not exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND name = 'last_access_date')
BEGIN
    ALTER TABLE [dbo].[SubscriptionPackagePurchase]
    ADD [last_access_date] DATETIME2(7) NULL;
    PRINT '✓ Added last_access_date column';
END
ELSE
BEGIN
    PRINT '  last_access_date column already exists';
END

-- Remove duration_months column if it exists (replaced by billing_cycle)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND name = 'duration_months')
BEGIN
    -- First, make sure billing_cycle has proper values based on duration_months
    UPDATE [dbo].[SubscriptionPackagePurchase]
    SET [billing_cycle] = CASE 
        WHEN [duration_months] = 1 THEN 'Monthly'
        WHEN [duration_months] = 3 THEN 'Quarterly'
        WHEN [duration_months] >= 12 THEN 'Yearly'
        ELSE 'Monthly'
    END
    WHERE [billing_cycle] = 'Monthly';
    
    -- Now drop the column
    ALTER TABLE [dbo].[SubscriptionPackagePurchase]
    DROP COLUMN [duration_months];
    PRINT '✓ Removed duration_months column (replaced by billing_cycle)';
END
ELSE
BEGIN
    PRINT '  duration_months column already removed';
END

PRINT '';
PRINT '✓✓✓ SubscriptionPackagePurchase table update completed successfully! ✓✓✓';
PRINT '';

-- Show current table structure
PRINT 'Current SubscriptionPackagePurchase table structure:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SubscriptionPackagePurchase'
ORDER BY ORDINAL_POSITION;

GO


