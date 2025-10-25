import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Tự khai báo để không phụ thuộc export bên AuthContext
type AllowedRole = 'admin' | 'provider' | 'consumer'

interface Props {
  allow: AllowedRole[]          // các role được phép
  children: React.ReactNode     // nội dung trang được bảo vệ
}

/**
 * RoleGuard: chặn truy cập nếu:
 *  - chưa đăng nhập -> chuyển đến /login (giữ lại trang gốc để quay lại)
 *  - đã đăng nhập nhưng không có quyền -> đưa về trang chủ
 */
export default function RoleGuard({ allow, children }: Props) {
  const { user } = useAuth()
  const location = useLocation()

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Đã đăng nhập nhưng không có role phù hợp
  if (!allow.includes((user.role || 'consumer') as AllowedRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
