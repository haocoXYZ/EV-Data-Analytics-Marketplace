import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from './AdminLayout'
import ModeratorLayout from './ModeratorLayout'
import ProviderLayout from './ProviderLayout'
import ConsumerLayout from './ConsumerLayout'

interface SmartLayoutProps {
  children: React.ReactNode
}

export default function SmartLayout({ children }: SmartLayoutProps) {
  const { user } = useAuth()

  // Admin layout - Full access
  if (user?.role === 'Admin') {
    return <AdminLayout>{children}</AdminLayout>
  }

  // Moderator layout - Only moderation access
  if (user?.role === 'Moderator') {
    return <ModeratorLayout>{children}</ModeratorLayout>
  }

  // Provider layout - Provider access
  if (user?.role === 'DataProvider') {
    return <ProviderLayout>{children}</ProviderLayout>
  }

  // Consumer layout (including non-logged-in users)
  return <ConsumerLayout>{children}</ConsumerLayout>
}



