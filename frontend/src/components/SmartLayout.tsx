import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from './AdminLayout'
import ProviderLayout from './ProviderLayout'
import ConsumerLayout from './ConsumerLayout'

interface SmartLayoutProps {
  children: React.ReactNode
}

export default function SmartLayout({ children }: SmartLayoutProps) {
  const { user } = useAuth()

  // Admin layout - Full access (cũng dùng cho Moderator)
  if (user?.role === 'Admin' || user?.role === 'Moderator') {
    return <AdminLayout>{children}</AdminLayout>
  }

  // Provider layout - Provider access
  if (user?.role === 'DataProvider') {
    return <ProviderLayout>{children}</ProviderLayout>
  }

  // Consumer layout (including non-logged-in users)
  return <ConsumerLayout>{children}</ConsumerLayout>
}



