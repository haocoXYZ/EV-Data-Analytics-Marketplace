import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { roleHome } from '../utils/roleHome'

export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (user) return <Navigate to={roleHome(user.role)} replace state={{ from: loc }} />
  return <>{children}</>
}
