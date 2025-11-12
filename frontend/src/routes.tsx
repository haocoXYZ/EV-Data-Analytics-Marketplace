import type { RouteObject } from 'react-router-dom'
import Home from './pages/Home'
import DatasetDetail from './pages/DatasetDetail'
import DataPackagePurchase from './pages/DataPackagePurchase'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import MyPurchases from './pages/MyPurchases'
import SubscriptionDashboard from './pages/SubscriptionDashboard'
import APIPackageKeys from './pages/APIPackageKeys'
import AdminPricing from './pages/AdminPricing'
import ProviderNew from './pages/ProviderNew'
import ModeratorReview from './pages/ModeratorReview'
import AdminPayouts from './pages/AdminPayouts'
import AdminDashboard from './pages/AdminDashboard'
import AdminProviders from './pages/AdminProviders'
import ProviderDashboard from './pages/ProviderDashboard'
import ProviderEarnings from './pages/ProviderEarnings'
import Login from './pages/Login'

const routes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/dataset/:id', element: <DatasetDetail /> },
    { path: '/buy-data', element: <DataPackagePurchase /> },
    { path: '/checkout', element: <Checkout /> },
    { path: '/success', element: <Success /> },
    { path: '/payment-success', element: <PaymentSuccess /> },
    { path: '/payment-failed', element: <PaymentFailed /> },
    { path: '/my-purchases', element: <MyPurchases /> },
    { path: '/subscriptions/:subscriptionId/dashboard', element: <SubscriptionDashboard /> },
    { path: '/api-packages/:purchaseId/keys', element: <APIPackageKeys /> },
    { path: '/admin/dashboard', element: <AdminDashboard /> },
    { path: '/admin/providers', element: <AdminProviders /> },
    { path: '/admin/pricing', element: <AdminPricing /> },
    { path: '/admin/payouts', element: <AdminPayouts /> },
    { path: '/admin/moderation', element: <ModeratorReview /> },
    { path: '/provider/dashboard', element: <ProviderDashboard /> },
    { path: '/provider/new', element: <ProviderNew /> },
    { path: '/provider/datasets', element: <div className="p-8"><h1 className="text-2xl font-bold">My Datasets</h1></div> },
    { path: '/provider/earnings', element: <ProviderEarnings /> },
]

export default routes
