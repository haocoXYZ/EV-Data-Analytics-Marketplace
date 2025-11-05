-- ============================================
-- CHECK SubscriptionPackagePurchase Table Structure
-- Kiểm tra bảng có đủ cột chưa trước khi migration
-- ============================================

USE [EVDataMarketplace];
GO

PRINT '';
PRINT '========================================';
PRINT 'CHECKING SubscriptionPackagePurchase TABLE';
PRINT '========================================';
PRINT '';

-- Check if database exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EVDataMarketplace')
BEGIN
    PRINT '❌ ERROR: Database EVDataMarketplace does not exist!';
    PRINT '   Please run CREATE_NEW_DATABASE.sql first.';
    RETURN;
END

-- Check if table exists
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPackagePurchase]') AND type in (N'U'))
BEGIN
    PRINT '❌ ERROR: SubscriptionPackagePurchase table does not exist!';
    PRINT '   Please run CREATE_NEW_DATABASE.sql first.';
    RETURN;
END

PRINT '✓ Table SubscriptionPackagePurchase exists';
PRINT '';

-- Get current columns
PRINT '📋 Current columns in SubscriptionPackagePurchase table:';
PRINT '--------------------------------------------------------';
SELECT 
    COLUMN_NAME as [Column],
    DATA_TYPE as [Type],
    CASE 
        WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN DATA_TYPE + '(' + CAST(CHARACTER_MAXIMUM_LENGTH as VARCHAR) + ')'
        WHEN NUMERIC_PRECISION IS NOT NULL THEN DATA_TYPE + '(' + CAST(NUMERIC_PRECISION as VARCHAR) + ',' + CAST(NUMERIC_SCALE as VARCHAR) + ')'
        ELSE DATA_TYPE
    END as [Full Type],
    IS_NULLABLE as [Nullable],
    COLUMN_DEFAULT as [Default]
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SubscriptionPackagePurchase'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '========================================';
PRINT 'CHECKING REQUIRED COLUMNS';
PRINT '========================================';
PRINT '';

-- Required columns list
DECLARE @RequiredColumns TABLE (
    ColumnName NVARCHAR(100),
    DataType NVARCHAR(50),
    IsNullable VARCHAR(3)
);

INSERT INTO @RequiredColumns VALUES
    ('subscription_id', 'int', 'NO'),
    ('consumer_id', 'int', 'NO'),
    ('province_id', 'int', 'NO'),
    ('district_id', 'int', 'YES'),
    ('start_date', 'datetime2', 'NO'),
    ('end_date', 'datetime2', 'NO'),
    ('billing_cycle', 'nvarchar', 'NO'),
    ('monthly_price', 'decimal', 'NO'),
    ('total_paid', 'decimal', 'NO'),
    ('purchase_date', 'datetime2', 'NO'),
    ('status', 'nvarchar', 'NO'),
    ('auto_renew', 'bit', 'NO'),
    ('cancelled_at', 'datetime2', 'YES'),
    ('dashboard_access_count', 'int', 'NO'),
    ('last_access_date', 'datetime2', 'YES');

-- Check each required column
DECLARE @MissingColumns TABLE (ColumnName NVARCHAR(100));
DECLARE @ExistingCount INT = 0;
DECLARE @MissingCount INT = 0;

DECLARE @ColumnName NVARCHAR(100);
DECLARE @DataType NVARCHAR(50);
DECLARE @Exists BIT;

DECLARE col_cursor CURSOR FOR
SELECT ColumnName, DataType FROM @RequiredColumns;

OPEN col_cursor;
FETCH NEXT FROM col_cursor INTO @ColumnName, @DataType;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'SubscriptionPackagePurchase' 
        AND COLUMN_NAME = @ColumnName
    )
    BEGIN
        PRINT '✓ ' + @ColumnName + ' exists';
        SET @ExistingCount = @ExistingCount + 1;
    END
    ELSE
    BEGIN
        PRINT '❌ ' + @ColumnName + ' is MISSING';
        INSERT INTO @MissingColumns VALUES (@ColumnName);
        SET @MissingCount = @MissingCount + 1;
    END
    
    FETCH NEXT FROM col_cursor INTO @ColumnName, @DataType;
END

CLOSE col_cursor;
DEALLOCATE col_cursor;

PRINT '';
PRINT '========================================';
PRINT 'SUMMARY';
PRINT '========================================';
PRINT 'Total required columns: 15';
PRINT 'Existing columns: ' + CAST(@ExistingCount as VARCHAR);
PRINT 'Missing columns: ' + CAST(@MissingCount as VARCHAR);
PRINT '';

IF @MissingCount = 0
BEGIN
    PRINT '✅✅✅ ALL REQUIRED COLUMNS EXIST! ✅✅✅';
    PRINT 'Database is ready. No migration needed.';
END
ELSE
BEGIN
    PRINT '⚠️⚠️⚠️ MISSING COLUMNS DETECTED! ⚠️⚠️⚠️';
    PRINT '';
    PRINT 'Missing columns:';
    SELECT '  - ' + ColumnName as [Missing] FROM @MissingColumns;
    PRINT '';
    PRINT '👉 ACTION REQUIRED:';
    PRINT '   Run UPDATE_SUBSCRIPTION_TABLE.sql to add missing columns.';
END

PRINT '';
PRINT '========================================';
PRINT 'OLD/DEPRECATED COLUMNS CHECK';
PRINT '========================================';
PRINT '';

-- Check for old column that should be removed
IF EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'SubscriptionPackagePurchase' 
    AND COLUMN_NAME = 'duration_months'
)
BEGIN
    PRINT '⚠️ duration_months column exists (should be replaced by billing_cycle)';
    PRINT '   Run UPDATE_SUBSCRIPTION_TABLE.sql to migrate.';
END
ELSE
BEGIN
    PRINT '✓ No deprecated columns found';
END

PRINT '';
PRINT '========================================';
PRINT 'CHECK COMPLETED';
PRINT '========================================';

GO


