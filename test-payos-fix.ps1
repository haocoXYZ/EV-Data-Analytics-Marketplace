# Test PayOS Payment Fix
# This script helps verify the PayOS integration is working correctly

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   PayOS Payment Integration - Verification Test" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if backend is running
Write-Host "[1/5] Checking Backend Status..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5258/health" -Method Get -TimeoutSec 3
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
    Write-Host "     Status: $($backendHealth.status)" -ForegroundColor Gray
    Write-Host "     Time: $($backendHealth.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "     Please start backend: cd backend\EVDataMarketplace.API && dotnet run" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Check PayOS configuration
Write-Host "[2/5] Checking PayOS Configuration..." -ForegroundColor Yellow
$appsettings = Get-Content "backend\EVDataMarketplace.API\appsettings.json" | ConvertFrom-Json
if ($appsettings.PayOS) {
    Write-Host "  ✅ PayOS config found" -ForegroundColor Green
    Write-Host "     ClientId: $($appsettings.PayOS.ClientId.Substring(0,8))..." -ForegroundColor Gray
    Write-Host "     ReturnUrl: $($appsettings.PayOS.ReturnUrl)" -ForegroundColor Gray
} else {
    Write-Host "  ❌ PayOS config missing!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Check PayOS package
Write-Host "[3/5] Checking PayOS NuGet Package..." -ForegroundColor Yellow
$csproj = Get-Content "backend\EVDataMarketplace.API\EVDataMarketplace.API.csproj"
if ($csproj -match 'PackageReference.*payOS.*Version="([^"]+)"') {
    Write-Host "  ✅ PayOS package installed" -ForegroundColor Green
    Write-Host "     Version: $($matches[1])" -ForegroundColor Gray
} else {
    Write-Host "  ❌ PayOS package not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Check frontend files
Write-Host "[4/5] Verifying Frontend Fixes..." -ForegroundColor Yellow
$checkoutFile = Get-Content "frontend\src\pages\Checkout.tsx" -Raw
$apiFile = Get-Content "frontend\src\pages\APIPackagePurchase.tsx" -Raw
$subFile = Get-Content "frontend\src\pages\SubscriptionPurchase.tsx" -Raw

$allFixed = $true

# Check Checkout.tsx
if ($checkoutFile -match "'DataPackage'") {
    Write-Host "  ✅ Checkout.tsx: DataPackage ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ Checkout.tsx: Still using 'OneTimePurchase'" -ForegroundColor Red
    $allFixed = $false
}

if ($checkoutFile -match "'SubscriptionPackage'") {
    Write-Host "  ✅ Checkout.tsx: SubscriptionPackage ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ Checkout.tsx: Still using 'Subscription'" -ForegroundColor Red
    $allFixed = $false
}

# Check APIPackagePurchase.tsx
if ($apiFile -match "paymentsApi\.create\(") {
    Write-Host "  ✅ APIPackagePurchase.tsx: paymentsApi.create() ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ APIPackagePurchase.tsx: Still using createPayment()" -ForegroundColor Red
    $allFixed = $false
}

# Check SubscriptionPurchase.tsx
if ($subFile -match "paymentsApi\.create\(") {
    Write-Host "  ✅ SubscriptionPurchase.tsx: paymentsApi.create() ✓" -ForegroundColor Green
} else {
    Write-Host "  ❌ SubscriptionPurchase.tsx: Still using createPayment()" -ForegroundColor Red
    $allFixed = $false
}

if (-not $allFixed) {
    Write-Host ""
    Write-Host "  ⚠️  Some fixes are missing! Please review PAYOS_PAYMENT_FIX.md" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 5. Test API endpoint
Write-Host "[5/5] Testing Payment API Endpoint..." -ForegroundColor Yellow
Write-Host "  ℹ️  This requires authentication, so we'll just check endpoint exists" -ForegroundColor Gray

try {
    # Try without auth - should return 401 Unauthorized (not 404!)
    Invoke-RestMethod -Uri "http://localhost:5258/api/payments/create" -Method Post -ContentType "application/json" -Body '{}' -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ✅ Payment endpoint exists (401 Unauthorized - expected)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ Payment endpoint exists (400 Bad Request - expected)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  ❌ Payment endpoint not found (404)!" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "  ⚠️  Unexpected response: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   ✅ ALL CHECKS PASSED!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  2. Login as Consumer (consumer1@example.com / Consumer123!)" -ForegroundColor White
Write-Host "  3. Test payment flow:" -ForegroundColor White
Write-Host "     - Data Package: Catalog → Data Package → Purchase" -ForegroundColor White
Write-Host "     - API Package: Catalog → API Package → Purchase" -ForegroundColor White
Write-Host "     - Subscription: Catalog → Subscription → Purchase" -ForegroundColor White
Write-Host ""
Write-Host "  ℹ️  Check PAYOS_PAYMENT_FIX.md for detailed testing guide" -ForegroundColor Cyan
Write-Host ""

