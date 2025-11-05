@echo off
REM ============================================
REM Insert Sample Subscription Data - Windows Batch
REM Quick script to insert sample subscription for User ID 4
REM ============================================

echo.
echo ========================================
echo   EV DATA MARKETPLACE
echo   Insert Sample Subscription Data
echo ========================================
echo.

REM Configuration - Change these if needed
SET SERVER=localhost
SET DATABASE=EVDataMarketplace

echo Configuration:
echo   Server: %SERVER%
echo   Database: %DATABASE%
echo   User: 4
echo.

REM Check if sqlcmd is available
where sqlcmd >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: sqlcmd not found!
    echo.
    echo Please install SQL Server Command Line Tools:
    echo https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility
    echo.
    pause
    exit /b 1
)

echo Step 1: Testing database connection...
echo ----------------------------------------
sqlcmd -S %SERVER% -d %DATABASE% -Q "SELECT 'Connection OK' as Status" -W -s","
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Cannot connect to database!
    echo.
    echo Please check:
    echo   1. SQL Server is running
    echo   2. Database 'EVDataMarketplace' exists
    echo   3. You have permissions to access it
    echo.
    pause
    exit /b 1
)
echo.

echo Step 2: Checking database structure...
echo ----------------------------------------
sqlcmd -S %SERVER% -d %DATABASE% -i "QUICK_CHECK.sql" -o "check_result.txt"
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Database check failed
    echo See check_result.txt for details
    echo.
)
echo.

echo Step 3: Inserting sample subscription...
echo ----------------------------------------
sqlcmd -S %SERVER% -d %DATABASE% -i "INSERT_SAMPLE_SUBSCRIPTION.sql"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to insert subscription!
    echo.
    echo Please check the error messages above.
    echo You may need to run UPDATE_SUBSCRIPTION_TABLE.sql first.
    echo.
    pause
    exit /b 1
)
echo.

echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Sample subscription has been created for User ID 4.
echo.
echo Next steps:
echo   1. Start backend: cd ..\EVDataMarketplace.API ^&^& dotnet run
echo   2. Start frontend: cd ..\..\frontend ^&^& npm run dev
echo   3. Login and check "My Purchases"
echo.
pause


