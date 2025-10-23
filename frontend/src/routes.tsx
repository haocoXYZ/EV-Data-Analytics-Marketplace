import { Navigate, type RouteObject } from 'react-router-dom'

// Public pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import DatasetDetail from './pages/DatasetDetail'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import MyPurchases from './pages/MyPurchases'
import Login from './pages/Login'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import AdminPricing from './pages/AdminPricing'
import AdminPayouts from './pages/AdminPayouts'
import ModeratorReview from './pages/ModeratorReview'
import AdminWallets from './pages/AdminWallets'           // ✅ wallets page

// Provider pages
import ProviderDashboard from './pages/ProviderDashboard'
import ProviderNew from './pages/ProviderNew'
import ProviderDatasets from './pages/ProviderDatasets'
import ProviderEarnings from './pages/ProviderEarnings'
import ProviderWallet from './pages/ProviderWallet'

// Management pages
import AdminProviders from './pages/AdminProviders'
import AdminCustomers from './pages/AdminCustomers'

// Guards
import RoleGuard from './components/RoleGuard'
import GuestOnly from './components/GuestOnly'
import HomeRedirect from './components/HomeRedirect'

const routes: RouteObject[] = [
  // Public (Home & Login có guard dành cho khách)
  { path: '/', element: <HomeRedirect><Home /></HomeRedirect> },
  { path: '/login', element: <GuestOnly><Login /></GuestOnly> },

  { path: '/catalog', element: <Catalog /> },
  { path: '/dataset/:id', element: <DatasetDetail /> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/success', element: <Success /> },
  { path: '/my-purchases', element: <MyPurchases /> },

  // Admin
  { path: '/admin/dashboard', element: <RoleGuard allow={['admin']}><AdminDashboard /></RoleGuard> },
  { path: '/admin/pricing',   element: <RoleGuard allow={['admin']}><AdminPricing /></RoleGuard> },
  { path: '/admin/payouts',   element: <RoleGuard allow={['admin']}><AdminPayouts /></RoleGuard> },
  { path: '/admin/wallets',   element: <RoleGuard allow={['admin']}><AdminWallets /></RoleGuard> }, // ✅ mới (fix 404)
  // Cho phép cả hai đường dẫn cho trang Moderator (tránh lạc link)
  { path: '/moderator/review',        element: <RoleGuard allow={['admin']}><ModeratorReview /></RoleGuard> },
  { path: '/admin/moderator/review',  element: <RoleGuard allow={['admin']}><ModeratorReview /></RoleGuard> },

  // Admin management
  { path: '/admin/providers', element: <RoleGuard allow={['admin']}><AdminProviders /></RoleGuard> },
  { path: '/admin/customers', element: <RoleGuard allow={['admin']}><AdminCustomers /></RoleGuard> },

  // Provider
  { path: '/provider/dashboard', element: <RoleGuard allow={['provider']}><ProviderDashboard /></RoleGuard> },
  { path: '/provider/new',       element: <RoleGuard allow={['provider']}><ProviderNew /></RoleGuard> },
  { path: '/provider/datasets',  element: <RoleGuard allow={['provider']}><ProviderDatasets /></RoleGuard> },
  { path: '/provider/earnings',  element: <RoleGuard allow={['provider']}><ProviderEarnings /></RoleGuard> },
  { path: '/provider/wallet',    element: <RoleGuard allow={['provider']}><ProviderWallet /></RoleGuard> },

  // Redirects
  { path: '/provider', element: <RoleGuard allow={['provider']}><Navigate to="/provider/dashboard" replace /></RoleGuard> },
  { path: '/admin',    element: <RoleGuard allow={['admin']}><Navigate to="/admin/dashboard" replace /></RoleGuard> },

  // 404
  { path: '*', element: <div className="p-8"><h1 className="text-2xl font-bold">404 - Not found</h1></div> },
]

export default routes
