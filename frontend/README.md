# EV Data Analytics Marketplace - Frontend Demo

Sàn giao dịch dữ liệu xe điện Việt Nam - Demo UI cho thuyết trình

## 🚀 Bắt đầu nhanh

```bash
npm install
npm run dev
```

Mở trình duyệt: http://localhost:5173

## 📋 Flow demo B1→B7

### B1: Admin Pricing
- Truy cập: `/admin/pricing`
- Xem bảng giá 3 gói: File, API, Subscription
- Chính sách chia sẻ doanh thu 70/30

### B2: Provider Onboarding  
- Truy cập: `/provider/new`
- Nhà cung cấp đăng ký dataset mới
- Upload CSV mẫu, chọn gói hỗ trợ

### B3: Moderator Review
- Truy cập: `/moderator/review`
- Kiểm duyệt dataset từ Provider
- Approve/Reject với checklist

### B4: Data Consumer - Catalog
- Truy cập: `/catalog`
- Tìm kiếm & lọc dataset
- Xem thông tin chi tiết

### B5: Data Consumer - Chọn gói & mua
- Click vào dataset → `/dataset/:id`
- Chọn 1 trong 3 gói:
  - **File**: Chọn số ngày dữ liệu
  - **API**: Chọn số lượt request
  - **Subscription**: Chọn khu vực
- Tính giá tự động

### B6: Checkout & Thanh toán
- Truy cập: `/checkout`
- Form thông tin: email, công ty, mục đích
- Mock thanh toán (giả lập)
- → Success page với API key hoặc download link

### B7: Admin Payouts
- Truy cập: `/admin/payouts`
- Xem doanh thu theo Provider
- Phân chia 70% Provider / 30% Platform
- Danh sách giao dịch gần đây

## 🎨 Tech Stack

- **React 19** + **TypeScript**
- **Vite 5** (build tool)
- **React Router 7** (routing)
- **Tailwind CSS** (styling)

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # NavBar + Footer
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Catalog.tsx         # Danh mục dataset
│   │   ├── DatasetDetail.tsx   # Chi tiết + chọn gói
│   │   ├── Checkout.tsx        # Thanh toán
│   │   ├── Success.tsx         # Xác nhận đơn hàng
│   │   ├── AdminPricing.tsx    # B1: Bảng giá
│   │   ├── ProviderNew.tsx     # B2: Đăng ký Provider
│   │   ├── ModeratorReview.tsx # B3: Kiểm duyệt
│   │   └── AdminPayouts.tsx    # B7: Thanh toán Provider
│   ├── data/
│   │   ├── datasets.json       # 10 EV datasets mẫu
│   │   └── pricing.json        # Cấu trúc giá 3 gói
│   ├── main.tsx
│   ├── routes.tsx
│   └── index.css
├── index.html
├── vite.config.mts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## 🎯 Kịch bản thuyết trình (3-4 phút)

1. **Giới thiệu** (30s)
   - Mở Home page, giới thiệu marketplace
   - 3 lợi ích chính: Chất lượng, Real-time API, Linh hoạt

2. **Admin Pricing** (30s)
   - Hiển thị bảng giá cho Provider
   - Giải thích mô hình 70/30

3. **Provider Flow** (45s)
   - Provider đăng ký dataset mới
   - Moderator kiểm duyệt → Approve
   - Dataset xuất hiện trong Catalog

4. **Consumer Flow** (90s)
   - Tìm kiếm dataset trong Catalog
   - Mở chi tiết dataset
   - Chọn gói (VD: API 1000 requests)
   - Checkout → Xác nhận → Success
   - Nhận API key ngay lập tức

5. **Admin Dashboard** (30s)
   - Xem doanh thu theo Provider
   - Phân chia lợi nhuận tự động
   - Xuất báo cáo

## 💡 Mock Data

- **10 datasets** đa dạng: charging, battery, fleet, infrastructure...
- **3 packages**: File ($49 + $2/day), API ($0.02/req), Subscription ($199/region)
- **Orders** lưu trong localStorage để demo flow hoàn chỉnh

## 🎨 UI/UX Highlights

- **Responsive design** (desktop/tablet/mobile)
- **Gradient hero section** với CTA rõ ràng
- **Interactive filters** (search, category, region)
- **Dynamic pricing calculator**
- **Loading states** & **form validation**
- **Toast notifications** (mock)

## 🔧 Scripts

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📦 Deploy

Deploy nhanh lên **Netlify** hoặc **Vercel**:

```bash
npm run build
# Upload dist/ folder hoặc kết nối Git repo
```

## ⚠️ Lưu ý

- Đây là **frontend demo** không có backend
- Dữ liệu mock, thanh toán giả lập
- LocalStorage để lưu đơn hàng demo
- Không có validation backend
- Chỉ để thuyết trình/prototype

## 🎓 Dành cho người mới

Nếu đây là lần đầu bạn làm dự án React:

1. **Học cách điều hướng**: Xem `src/routes.tsx`
2. **Hiểu component structure**: Xem `src/components/Layout.tsx`
3. **State management cơ bản**: Xem `useState` trong các page
4. **Tailwind classes**: Xem các class trong JSX
5. **Mock data loading**: Xem `import ... from '../data/...'`

## 📞 Hỗ trợ

Nếu gặp lỗi:
- Xóa `node_modules` và chạy lại `npm install`
- Kiểm tra Node version (cần >= 20.x)
- Check browser console (F12)

---

**Chúc bạn thuyết trình thành công! 🎉**
