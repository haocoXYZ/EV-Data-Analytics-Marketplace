import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading || !user) return

    const currentPath = location.pathname
    
    // Define role-based allowed paths
    const adminPaths = ['/admin']
    const providerPaths = ['/provider']
    const consumerPaths = ['/buy-data', '/subscribe', '/buy-api', '/checkout', '/my-purchases', '/subscriptions', '/api-packages']
    const publicPaths = ['/login', '/register', '/dataset']

    // Role-based routing logic
    const role = user.role

    // Special handling for home page "/"
    if (currentPath === '/') {
      if (role === 'Admin') {
        navigate('/admin/dashboard', { replace: true })
        return
      } else if (role === 'Moderator') {
        navigate('/admin/moderation', { replace: true })
        return
      } else if (role === 'DataProvider') {
        navigate('/provider/dashboard', { replace: true })
        return
      }
      // DataConsumer can stay on home or go to catalog
      return
    }

    // Check if current path is public
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))
    if (isPublicPath) return

    // Admin/Moderator check
    if (role === 'Admin' || role === 'Moderator') {
      const isAdminPath = adminPaths.some(path => currentPath.startsWith(path))
      if (!isAdminPath) {
        // Redirect Admin to admin dashboard if on wrong page
        navigate('/admin/dashboard', { replace: true })
      }
      return
    }

    // DataProvider check
    if (role === 'DataProvider') {
      const isProviderPath = providerPaths.some(path => currentPath.startsWith(path))
      if (!isProviderPath) {
        // Redirect Provider to provider dashboard if on wrong page
        navigate('/provider/dashboard', { replace: true })
      }
      return
    }

    // DataConsumer check
    if (role === 'DataConsumer') {
      const isConsumerPath = consumerPaths.some(path => currentPath.startsWith(path))
      const isAdminPath = adminPaths.some(path => currentPath.startsWith(path))
      const isProviderPath = providerPaths.some(path => currentPath.startsWith(path))
      
      if (isAdminPath || isProviderPath) {
        // Redirect Consumer away from admin/provider pages
        navigate('/', { replace: true })
      }
      return
    }

  }, [user, loading, location.pathname, navigate])

  return null
}

export default RoleBasedRedirect

