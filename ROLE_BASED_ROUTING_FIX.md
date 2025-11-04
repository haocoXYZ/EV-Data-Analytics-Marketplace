# 🔐 Role-Based Routing Fix - Session Persistence

## 📋 Vấn đề đã giải quyết

**Trước đây:**
- Khi đăng nhập với role Admin, sau đó tắt server và khởi động lại
- Ứng dụng vẫn nhớ session (qua localStorage) nhưng redirect về trang Customer
- User không thể thao tác được vì đang ở sai trang với role của mình

**Nguyên nhân:**
- Ứng dụng lưu session trong localStorage nhưng không tự động redirect khi khởi động lại
- Không có logic kiểm tra role và redirect đến trang phù hợp khi app mount

## ✅ Giải pháp đã triển khai

### 1. **Component RoleBasedRedirect**

Tạo file: `frontend/src/components/RoleBasedRedirect.tsx`

Component này sẽ:
- Chạy mỗi khi app khởi động hoặc route thay đổi
- Kiểm tra role của user hiện tại
- Tự động redirect đến trang phù hợp với role

### 2. **Logic Redirect**

#### **Admin/Moderator:**
- Khi vào `/` → Redirect đến `/admin/dashboard`
- Khi vào trang không phải admin → Redirect đến `/admin/dashboard`
- Được phép truy cập: `/admin/*`, `/moderation/*`

#### **DataProvider:**
- Khi vào `/` → Redirect đến `/provider/dashboard`
- Khi vào trang không phải provider → Redirect đến `/provider/dashboard`
- Được phép truy cập: `/provider/*`

#### **DataConsumer:**
- Khi vào `/` → Giữ nguyên (hiển thị home page)
- Khi cố vào `/admin/*` hoặc `/provider/*` → Redirect đến `/catalog`
- Được phép truy cập: `/buy-data`, `/subscribe`, `/buy-api`, `/checkout`, `/my-purchases`, etc.

#### **Public paths** (tất cả role đều truy cập được):
- `/login`, `/register`
- `/catalog`, `/dataset/:id`

## 🔧 Cách hoạt động

### Flow khi khởi động lại server:

```
1. User đã đăng nhập → Session lưu trong localStorage
                      ↓
2. User refresh hoặc khởi động lại app
                      ↓
3. AuthContext đọc user từ localStorage
                      ↓
4. RoleBasedRedirect component được mount
                      ↓
5. Check user role và current path
                      ↓
6. Nếu path không phù hợp → Auto redirect đến trang đúng
```

### Ví dụ cụ thể:

**Scenario 1: Admin refresh trang**
```
User: Admin
Current path: / (home page)
Action: Redirect → /admin/dashboard
```

**Scenario 2: Admin cố vào trang Customer**
```
User: Admin
Current path: /buy-data
Action: Redirect → /admin/dashboard
```

**Scenario 3: Customer cố vào Admin**
```
User: DataConsumer
Current path: /admin/dashboard
Action: Redirect → /catalog
```

## 📝 Code Changes

### File đã thay đổi:

1. **frontend/src/components/RoleBasedRedirect.tsx** (NEW)
   - Component mới để xử lý role-based redirect

2. **frontend/src/App.tsx** (MODIFIED)
   - Import và thêm `<RoleBasedRedirect />` component
   - Component này được mount ngay từ đầu để kiểm tra mọi route change

## 🧪 Test Cases

### Test 1: Admin Session Persistence
```
1. Đăng nhập với admin@evdata.com
2. Tắt browser/server
3. Mở lại → Phải tự động vào /admin/dashboard
✅ PASS
```

### Test 2: Provider Session Persistence
```
1. Đăng nhập với provider account
2. Tắt browser/server
3. Mở lại → Phải tự động vào /provider/dashboard
✅ PASS
```

### Test 3: Role Protection
```
1. Đăng nhập với DataConsumer
2. Thử vào /admin/dashboard
3. Phải tự động redirect về /catalog
✅ PASS
```

### Test 4: Token Expiration
```
1. Đăng nhập
2. Đợi token hết hạn
3. Refresh → Token expired được clear, redirect về /login
✅ PASS (đã có trong AuthContext)
```

## 🚀 Deployment

Không cần setup thêm gì, chỉ cần:

```bash
# Frontend sẽ tự động hot-reload với code mới
cd frontend
npm run dev
```

## 📊 Session Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│           User Login Successfully                    │
│  (Save to localStorage: user, token, role, expires) │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│         User Closes Browser / Server Down           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              User Opens App Again                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│    AuthContext: Load from localStorage              │
│    - Check token expiration                         │
│    - If valid → setUser(userData)                   │
│    - If expired → clear localStorage                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│    RoleBasedRedirect: Check current path            │
│    - Get user.role                                  │
│    - Get location.pathname                          │
│    - Apply redirect rules                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│         User at Correct Page for Their Role         │
│    ✅ Admin → /admin/dashboard                      │
│    ✅ Provider → /provider/dashboard                │
│    ✅ Consumer → / or /catalog                      │
└─────────────────────────────────────────────────────┘
```

## 🔒 Security Notes

1. **localStorage Security**: 
   - Token được lưu trong localStorage (client-side)
   - Nên implement refresh token mechanism cho production
   - Nên thêm HTTP-only cookies cho sensitive data

2. **Token Expiration**:
   - Đã có logic check token expiration trong AuthContext
   - Token hết hạn sẽ tự động clear và redirect về login

3. **Route Protection**:
   - Frontend routing chỉ là UI protection
   - Backend vẫn phải validate token và role cho mọi API request
   - Đã implement trong `JwtAuthenticationHandler` (backend)

## 📚 Related Files

- `frontend/src/contexts/AuthContext.tsx` - Authentication context
- `frontend/src/components/RoleBasedRedirect.tsx` - Role-based redirect logic
- `frontend/src/App.tsx` - Main app component
- `backend/EVDataMarketplace.API/Middleware/JwtAuthenticationHandler.cs` - Backend auth

## ✨ Benefits

1. **Better UX**: User luôn vào đúng trang của mình sau khi refresh
2. **Role Protection**: Không cho phép access vào trang không thuộc role
3. **Session Persistence**: Giữ session khi refresh/restart
4. **Auto Recovery**: Tự động clear expired tokens

---

**Status**: ✅ Implemented & Tested
**Date**: November 4, 2025
**Version**: 1.0.0

