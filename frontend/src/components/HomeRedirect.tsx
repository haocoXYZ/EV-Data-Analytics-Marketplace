import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { roleHome } from '../utils/roleHome'

export default function HomeRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to={roleHome(user.role)} replace />
  return <>{children}</>
}
