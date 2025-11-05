# Test Backend
Write-Host "Waiting for backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "Testing health..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "http://localhost:5258/api/health" -UseBasicParsing
Write-Host "Health: $($health.StatusCode)" -ForegroundColor Green

Write-Host "Testing login..." -ForegroundColor Yellow
$body = '{"email":"admin@test.com","password":"Test123!"}'
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5258/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "LOGIN SUCCESS!" -ForegroundColor Green
    Write-Host "User: $($response.fullName)" -ForegroundColor Cyan
    Write-Host "Role: $($response.role)" -ForegroundColor Cyan
    Write-Host "Email: $($response.email)" -ForegroundColor Cyan
} catch {
    Write-Host "LOGIN FAILED: $_" -ForegroundColor Red
}

