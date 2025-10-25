/* ================== PROVIDER ================== */

// Trạng thái theo flow chuẩn
export type ProviderStatus = 'new' | 'pending' | 'kyc' | 'suspended'

export interface ProviderMessage {
  id: string
  type: 'rejection' | 'notice' // dùng 'rejection' để lưu lý do suspend
  content: string
  createdAt: string
}

export interface ProviderKyc {
  company: string
  legalName?: string
  businessRegNo?: string
  taxCode?: string
  address?: string
  representative?: string
  phone?: string
  bankName?: string
  bankAccount?: string
  documents?: { label: string; url?: string }[]
}

export interface Provider {
  id: string
  name: string
  email: string
  company: string
  datasets: number
  revenue: number // USD
  status: ProviderStatus
  createdAt: string
  kyc?: ProviderKyc
  messages?: ProviderMessage[] // lưu lý do/ghi chú admin gửi provider

  /**
   * Tùy chọn: override tỉ lệ nền tảng giữ lại cho provider này (0-100).
   * Nếu không đặt, hệ thống dùng cấu hình chung trong PricingConfig.commission.
   */
  platformPercentOverride?: number
}

/* ================== CUSTOMER ================== */

/* ----------------- Customer: 4 trạng thái + KYC cá nhân ----------------- */
export type CustomerStatus = 'new' | 'pending' | 'kyc' | 'suspended'

export interface CustomerMessage {
  id: string
  type: 'rejection' | 'notice'
  content: string
  createdAt: string
}

/** KYC cá nhân cho khách hàng (consumer) */
export interface CustomerKyc {
  fullName: string               // Họ tên theo giấy tờ
  dob?: string                   // YYYY-MM-DD (ISO)
  nationalId?: string            // CMND/CCCD/Hộ chiếu
  address?: string
  phone?: string
  bankName?: string
  bankAccount?: string
  selfieUrl?: string
  idFrontUrl?: string
  idBackUrl?: string
  documents?: { label: string; url?: string }[]
}

export interface Customer {
  id: string
  name: string
  email: string
  org?: string
  purchases: number
  spent: number // USD
  status: CustomerStatus
  createdAt: string
  kyc?: CustomerKyc
  messages?: CustomerMessage[]
}

// Giữ lại nếu nơi khác còn import
export interface ProviderApproval {
  id: string
  company: string
  contact: string
  email: string
  note?: string
  createdAt: string
}

/* ======= Bổ sung cho tab Bảo mật & Gửi thông báo (tuỳ chọn) ======= */

// Phiên đăng nhập (mock)
export interface ProviderSession {
  id: string
  device: string
  ip?: string
  ua?: string
  lastSeen?: string
}

// Log gửi thông báo (mock)
export interface ProviderNotifyLog {
  id: string
  channels: string[]   // ['email','fcm','zalo','inapp']
  title: string
  body: string
  createdAt: string
}

/* ================== PRICING (API / ONE-TIME / MONTHLY) ================== */

/** Các kỳ hạn hỗ trợ cho gói tháng */
export type MonthlyTerm = 1 | 3 | 6 | 9 | 12

/** Meta hiển thị cho từng gói (tiêu đề, mô tả, tính năng) */
export interface PlanMeta {
  /** Tiêu đề hiển thị, ví dụ: "API", "Gói mua 1 lần" */
  title: string
  /**
   * Mô tả ngắn dưới tiêu đề.
   * Với gói mua 1 lần có thể dùng placeholder {lookbackDays}.
   */
  description?: string
  /** Danh sách tính năng dạng bullet */
  features: string[]
}

/** Gói API trả theo request */
export interface PricingPlanApi {
  /** USD / request */
  pricePerRequest: number
  /** ghi chú thêm nếu cần */
  note?: string
  /** Nội dung hiển thị (tiêu đề/mô tả/tính năng) */
  meta: PlanMeta
}

/** Gói mua 1 lần (lịch sử từ X ngày trước tới hôm nay) */
export interface PricingPlanOneTime {
  /** USD cho 1 lần mua */
  priceUSD: number
  /** Lấy dữ liệu từ (today - lookbackDays) -> today */
  lookbackDays: number
  /** (Tuỳ chọn) USD cho mỗi ngày dữ liệu bổ sung trong phạm vi lookback */
  perDayUSD?: number            // 👈 thêm field này để FE đọc đúng giá
  /** Nội dung hiển thị (tiêu đề/mô tả/tính năng) */
  meta: PlanMeta
}

/** Một tùy chọn giá theo kỳ hạn cho gói tháng */
export interface PricingMonthlyOption {
  months: MonthlyTerm
  /** USD / khu vực / tháng cho kỳ hạn này */
  pricePerRegionPerMonthUSD: number
}

/** Cấu hình gói tháng */
export interface PricingPlanMonthly {
  options: PricingMonthlyOption[] // 1,3,6,9,12 tháng
  /** Nội dung hiển thị (tiêu đề/mô tả/tính năng) */
  meta: PlanMeta
}

/** Cấu hình hoa hồng chia sẻ doanh thu */
export interface CommissionConfig {
  /**
   * % nền tảng giữ lại (0-100).
   * Phần của provider = 100 - platformPercent.
   */
  platformPercent: number
}

/** Cấu hình giá toàn hệ thống (admin chỉnh trong trang Pricing) */
export interface PricingConfig {
  api: PricingPlanApi
  oneTime: PricingPlanOneTime
  monthly: PricingPlanMonthly
  commission: CommissionConfig
  updatedAt: string
}
