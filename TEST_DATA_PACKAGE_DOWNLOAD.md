# 🧪 Test Data Package Download - Hands-on Guide

## 🎯 Mục đích
Hướng dẫn chi tiết cách test chức năng download Data Package với dữ liệu hiện có trong database.

---

## 📊 Dữ liệu hiện có trong Database

### Users
```
ID 1: admin@test.com (Admin)
ID 2: moderator@test.com (Moderator)
ID 3: provider@test.com (DataProvider)
ID 4: consumer@test.com (DataConsumer) ← Use this account
```

### DataConsumer
```
Consumer ID: 1
User ID: 4
Email: consumer@test.com
Password: Test@123 (assumed)
Organization: EV Research Institute
```

### DataPackagePurchases
```
Purchase 1:
  - PurchaseId: 1
  - ConsumerId: 1
  - Province: Hà Nội (ID 1)
  - District: NULL (All districts)
  - Date Range: 2024-01-01 to 2024-03-31
  - Row Count: 400
  - Price: 4,000 VND
  - Status: Active ✅
  - Downloads: 1/5 (4 more downloads available)
  - Last Download: 2025-11-03 14:43:34

Purchase 2:
  - PurchaseId: 2
  - ConsumerId: 1
  - Province: Hà Nội (ID 1)
  - District: NULL
  - Date Range: NULL
  - Row Count: 402
  - Price: 4,020 VND
  - Status: Active ✅
  - Downloads: 0/5 (5 downloads available)

Purchase 3:
  - PurchaseId: 3
  - ConsumerId: 1
  - Province: Hà Nội (ID 1)
  - District: NULL
  - Row Count: 402
  - Price: 4,020 VND
  - Status: Pending ⏳
  - Downloads: 0/5 (Cannot download - not paid)

Purchase 4:
  - PurchaseId: 4
  - ConsumerId: 1
  - Province: Hồ Chí Minh (ID 2)
  - District: NULL
  - Row Count: 320
  - Price: 3,200 VND
  - Status: Pending ⏳
  - Downloads: 0/5 (Cannot download - not paid)
```

---

## 🧪 Test Scenarios

### ✅ Scenario 1: Download Active Purchase (Should Work)

**Test Purchase ID**: 1 or 2

#### Step 1: Login
```bash
# Frontend
URL: http://localhost:3000/login
Email: consumer@test.com
Password: Test@123
```

#### Step 2: Navigate to My Purchases
```bash
URL: http://localhost:3000/my-purchases
Expected: See 4 purchases listed
```

#### Step 3: Download Purchase #2 (Fresh - 0 downloads)
```
Actions:
  1. Click "Data Packages" tab
  2. Find Purchase ID 2 (Hà Nội, 402 rows, Active)
  3. Check "Downloads" column shows "0/5"
  4. Click "Download CSV" button
  5. Wait for browser download
  6. Check "Downloads" column updates to "1/5"

Expected Result:
  ✅ File downloaded: ev_charging_data_Hà Nội_20250104_HHMMSS.csv
  ✅ File size: ~50-100 KB (402 rows)
  ✅ Downloads counter: 0/5 → 1/5
  ✅ Alert: "✅ Data package downloaded successfully!"
```

#### Step 4: Verify CSV Content
```csv
# Open file in Excel or text editor
Expected Headers:
Transaction ID,Station Name,Location,District,Province,Charger Type,Power (kW),Start Time,End Time,Duration (minutes),Energy Consumed (kWh),Cost (VND),Vehicle Model,Battery Capacity (kWh),SOC Before (%),SOC After (%),Temperature (°C),Payment Method,User ID

Expected Data:
- Total rows: 402 (excluding header)
- Province: All rows should show "Hà Nội"
- Dates: Random dates (since no date range specified)
- Stations: Various (VinFast, EV Power Hub, etc.)
- Vehicles: VinFast VF8/VF9, Tesla, BYD, etc.
```

---

### ✅ Scenario 2: Test Download Limit

**Test Purchase ID**: 2 (currently 0/5)

```
Actions:
  1. Download Purchase #2 (1st time) → Success, 1/5
  2. Download Purchase #2 (2nd time) → Success, 2/5
  3. Download Purchase #2 (3rd time) → Success, 3/5
  4. Download Purchase #2 (4th time) → Success, 4/5
  5. Download Purchase #2 (5th time) → Success, 5/5
  6. Download Purchase #2 (6th time) → Button disabled ❌

Expected after 5th download:
  ✅ Downloads column shows "5/5" in RED text
  ✅ Download button is disabled
  ✅ Hover shows: "Download limit reached"
  ✅ Cannot download anymore
```

---

### ❌ Scenario 3: Download Pending Purchase (Should Fail)

**Test Purchase ID**: 3 or 4

```
Actions:
  1. Find Purchase #3 (Status: Pending)
  2. Check Download button

Expected:
  ❌ Button is disabled (grayed out)
  ❌ Tooltip: "Payment not completed" or similar
  ❌ Cannot click to download
```

---

### 🔐 Scenario 4: API Direct Test (Using Postman/curl)

#### Test 1: Valid Download Request
```bash
# Get JWT token first
curl -X POST http://localhost:5292/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@test.com",
    "password": "Test@123"
  }'

# Response: { "token": "eyJhbGciOiJ..." }

# Download Purchase #2
curl -X GET http://localhost:5292/api/purchases/download/2 \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -o test_download.csv

# Expected: CSV file downloaded
```

#### Test 2: Download Limit Reached
```bash
# After 5 downloads, try 6th time
curl -X GET http://localhost:5292/api/purchases/download/2 \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Expected Response: 400 Bad Request
{
  "message": "Download limit reached (5/5)"
}
```

#### Test 3: Inactive Purchase
```bash
curl -X GET http://localhost:5292/api/purchases/download/3 \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Expected Response: 400 Bad Request
{
  "message": "This purchase is not active"
}
```

#### Test 4: Unauthorized Access (No Token)
```bash
curl -X GET http://localhost:5292/api/purchases/download/2

# Expected Response: 401 Unauthorized
```

#### Test 5: Wrong Purchase ID
```bash
curl -X GET http://localhost:5292/api/purchases/download/9999 \
  -H "Authorization: Bearer {YOUR_TOKEN}"

# Expected Response: 404 Not Found
{
  "message": "Purchase not found or you don't have permission to download this data"
}
```

---

## 📊 Database Verification

### Before Download (Purchase #2)
```sql
SELECT 
  PurchaseId,
  ConsumerId,
  RowCount,
  Status,
  DownloadCount,
  MaxDownload,
  LastDownloadDate
FROM DataPackagePurchase
WHERE PurchaseId = 2;

-- Result:
-- PurchaseId: 2
-- ConsumerId: 1
-- RowCount: 402
-- Status: Active
-- DownloadCount: 0
-- MaxDownload: 5
-- LastDownloadDate: NULL
```

### After 1st Download
```sql
-- Run same query again
SELECT * FROM DataPackagePurchase WHERE PurchaseId = 2;

-- Result:
-- DownloadCount: 1  ← Increased
-- LastDownloadDate: 2025-11-04 07:30:45  ← Updated
```

---

## 🎨 Frontend UI Expectations

### My Purchases Page Layout
```
┌─────────────────────────────────────────────────────────┐
│  My Purchases                                           │
├─────────────────────────────────────────────────────────┤
│  [Data Packages] [Subscriptions] [API Packages]         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📦 Data Packages                                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Date       │ Location     │ Rows │ Price │ Status  │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ 2025-11-03 │ Hà Nội       │ 400  │ 4,000 │ Active  │ │
│  │            │ All districts│      │       │ 1/5 🔵  │ │
│  │            │              │      │ [Download CSV]  │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ 2025-11-03 │ Hà Nội       │ 402  │ 4,020 │ Active  │ │
│  │            │ All districts│      │       │ 0/5 🟢  │ │
│  │            │              │      │ [Download CSV]  │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ 2025-11-03 │ Hà Nội       │ 402  │ 4,020 │ Pending │ │
│  │            │ All districts│      │       │ 0/5 ⚪  │ │
│  │            │              │      │ [Download CSV]🚫│ │
│  ├────────────────────────────────────────────────────┤ │
│  │ 2025-11-05 │ HCM          │ 320  │ 3,200 │ Pending │ │
│  │            │ All districts│      │       │ 0/5 ⚪  │ │
│  │            │              │      │ [Download CSV]🚫│ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

Legend:
🔵 = Has downloads, more available
🟢 = Fresh, ready to download
🔴 = Limit reached (5/5)
⚪ = Inactive/Pending
🚫 = Button disabled
```

### Button States
```css
/* Active - Can Download */
.download-btn[enabled] {
  background: #10b981;  /* Green */
  cursor: pointer;
  opacity: 1;
}

/* Disabled - Limit Reached or Inactive */
.download-btn[disabled] {
  background: #9ca3af;  /* Gray */
  cursor: not-allowed;
  opacity: 0.5;
}

/* Download Count - Normal */
.download-count {
  color: #3b82f6;  /* Blue */
}

/* Download Count - Limit Reached */
.download-count.limit-reached {
  color: #ef4444;  /* Red */
  font-weight: bold;
}
```

---

## 📱 Testing Checklist

### Pre-requisites
- [ ] Backend running on http://localhost:5292
- [ ] Frontend running on http://localhost:3000
- [ ] Database has test data (consumer@test.com exists)
- [ ] At least 1 Active purchase exists

### Happy Path Tests
- [ ] Login as consumer@test.com
- [ ] Navigate to /my-purchases
- [ ] See 4 purchases listed
- [ ] Click "Data Packages" tab
- [ ] Find Purchase #2 (Active, 0/5 downloads)
- [ ] Click "Download CSV" button
- [ ] File downloads successfully
- [ ] File name format correct
- [ ] CSV has 402 rows + 1 header
- [ ] Downloads count updates to 1/5
- [ ] Success alert shows
- [ ] Can download again (up to 5 times)

### Edge Cases
- [ ] Download limit reached → Button disabled
- [ ] Downloads counter shows 5/5 in red
- [ ] Pending purchase → Button disabled from start
- [ ] Logout and login → Downloads count persists
- [ ] Multiple browser tabs → Count syncs after reload

### API Tests
- [ ] No token → 401 Unauthorized
- [ ] Invalid token → 401 Unauthorized
- [ ] Wrong purchaseId → 404 Not Found
- [ ] Inactive purchase → 400 Bad Request
- [ ] Limit reached → 400 Bad Request
- [ ] Valid request → CSV file returned

### Database Tests
- [ ] DownloadCount increments correctly
- [ ] LastDownloadDate updates on each download
- [ ] Status must be "Active" to download
- [ ] MaxDownload enforced (5 by default)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Purchase not found"
```
Symptom: 404 error when trying to download
Cause: PurchaseId doesn't exist or belongs to different user
Solution: Check database - ensure purchase belongs to current user
```

### Issue 2: Button always disabled
```
Symptom: Cannot click download button even for Active purchase
Cause: Frontend not receiving correct data from API
Solution: 
  1. Open browser console
  2. Check API response from /api/purchases/my-data-packages
  3. Verify status field is "Active"
  4. Check downloadCount vs maxDownload
```

### Issue 3: Download count not updating
```
Symptom: Downloads always show 0/5 even after download
Cause: Frontend not reloading data after download
Solution: 
  - Check handleDownload function calls fetchDataPackages()
  - Verify API response includes updated downloadCount
```

### Issue 4: CSV file empty or corrupted
```
Symptom: Downloaded file is 0 bytes or cannot open
Cause: Backend CSV generation error
Solution:
  1. Check backend logs for exceptions
  2. Verify purchase.RowCount is valid number
  3. Test GenerateMockCSVData() method directly
```

### Issue 5: 401 Unauthorized
```
Symptom: Cannot download, gets 401 error
Cause: JWT token expired or invalid
Solution:
  - Logout and login again
  - Check token in localStorage
  - Verify token includes DataConsumer role
```

---

## 🎯 Success Criteria

### All tests pass when:
1. ✅ Can login as consumer@test.com
2. ✅ Can see all 4 purchases
3. ✅ Can download Active purchases
4. ✅ CSV file has correct row count
5. ✅ Download counter increments correctly
6. ✅ Download button disables at limit (5/5)
7. ✅ Pending purchases cannot be downloaded
8. ✅ Cannot download other users' purchases
9. ✅ Database tracks downloads correctly
10. ✅ All API validations work

---

## 📞 Quick Test Commands

### Full Test Suite (Bash)
```bash
#!/bin/bash

echo "🧪 Testing Data Package Download..."

# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5292/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@test.com","password":"Test@123"}' \
  | jq -r '.token')

echo "✅ Logged in, token: ${TOKEN:0:20}..."

# 2. Get purchases
curl -s http://localhost:5292/api/purchases/my-data-packages \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | {id: .purchaseId, status: .status, downloads: "\(.downloadCount)/\(.maxDownload)"}'

# 3. Download Purchase #2
echo "⬇️  Downloading Purchase #2..."
curl -X GET http://localhost:5292/api/purchases/download/2 \
  -H "Authorization: Bearer $TOKEN" \
  -o test_download_$(date +%s).csv

echo "✅ Download complete! Check file."

# 4. Check updated count
echo "📊 Updated download count:"
curl -s http://localhost:5292/api/purchases/my-data-packages \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | select(.purchaseId == 2) | {downloadCount, lastDownloadDate}'
```

---

## 📚 Reference

### Relevant Files
- Controller: `backend/EVDataMarketplace.API/Controllers/PurchasesController.cs`
- Frontend: `frontend/src/pages/MyPurchases.tsx`
- API Client: `frontend/src/api/purchases.ts`
- Types: `frontend/src/types/index.ts`

### Endpoints Used
- `POST /api/auth/login` - Get JWT token
- `GET /api/purchases/my-data-packages` - List purchases
- `GET /api/purchases/download/{id}` - Download CSV

### Database Tables
- `User` - Authentication
- `DataConsumer` - Consumer profile
- `DataPackagePurchase` - Purchase records
- `Province` - Location data

---

**Ready to test? Start with Scenario 1! 🚀**

