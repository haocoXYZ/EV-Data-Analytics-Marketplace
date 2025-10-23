// src/utils/roleHome.ts
import type { Role } from '../contexts/AuthContext'

// ✅ Export THEO TÊN và cả default để tránh nhầm cách import
export function roleHome(role: Role): string {
  switch (role) {
    case 'admin':    return '/admin/providers'
    case 'provider': return '/provider/dashboard'
    case 'consumer': return '/my-purchases' // hoặc '/catalog'
    default:         return '/'
  }
}

export default roleHome
