import type { RouteObject } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import DatasetDetail from './pages/DatasetDetail'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import MyPurchases from './pages/MyPurchases'
import AdminPricing from './pages/AdminPricing'
import ProviderNew from './pages/ProviderNew'
import ModeratorReview from './pages/ModeratorReview'
import AdminPayouts from './pages/AdminPayouts'
import AdminDashboard from './pages/AdminDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import Login from './pages/Login'

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/catalog', element: <Catalog /> },
  { path: '/dataset/:id', element: <DatasetDetail /> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/success', element: <Success /> },
  { path: '/my-purchases', element: <MyPurchases /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/pricing', element: <AdminPricing /> },
  { path: '/admin/payouts', element: <AdminPayouts /> },
  { path: '/moderator/review', element: <ModeratorReview /> },
  { path: '/provider/dashboard', element: <ProviderDashboard /> },
  { path: '/provider/new', element: <ProviderNew /> },
  { path: '/provider/datasets', element: <div className="p-8"><h1 className="text-2xl font-bold">My Datasets</h1></div> },
  { path: '/provider/earnings', element: <div className="p-8"><h1 className="text-2xl font-bold">Earnings</h1></div> },
]

export default routes
