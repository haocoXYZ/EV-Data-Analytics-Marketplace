import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from './DashboardLayout'
import ConsumerLayout from './ConsumerLayout'

interface SmartLayoutProps {
  children: React.ReactNode
}

export default function SmartLayout({ children }: SmartLayoutProps) {
  const { user } = useAuth()

  // If user is admin or provider, use dashboard layout
  if (user?.role === 'admin' || user?.role === 'provider') {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // Otherwise use consumer layout (including non-logged-in users)
  return <ConsumerLayout>{children}</ConsumerLayout>
}



