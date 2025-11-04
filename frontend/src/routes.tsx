import type { RouteObject } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
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
import ProviderDashboard from './pages/ProviderDashboard'
import ProviderEarnings from './pages/ProviderEarnings'
import ProviderDatasets from './pages/ProviderDatasets'
import SubscriptionPurchase from './pages/SubscriptionPurchase'
import APIPackagePurchase from './pages/APIPackagePurchase'
import Login from './pages/Login'

const routes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/catalog', element: <Catalog /> },
    { path: '/dataset/:id', element: <DatasetDetail /> },
    { path: '/buy-data', element: <DataPackagePurchase /> },
    { path: '/subscribe', element: <SubscriptionPurchase /> },
    { path: '/buy-api', element: <APIPackagePurchase /> },
    { path: '/checkout', element: <Checkout /> },
    { path: '/success', element: <Success /> },
    { path: '/payment-success', element: <PaymentSuccess /> },
    { path: '/payment-failed', element: <PaymentFailed /> },
    { path: '/my-purchases', element: <MyPurchases /> },
    { path: '/subscriptions/:subscriptionId/dashboard', element: <SubscriptionDashboard /> },
    { path: '/api-packages/:purchaseId/keys', element: <APIPackageKeys /> },
    { path: '/admin/dashboard', element: <AdminDashboard /> },
    { path: '/admin/pricing', element: <AdminPricing /> },
    { path: '/admin/payouts', element: <AdminPayouts /> },
    { path: '/moderation/review', element: <ModeratorReview /> },
    { path: '/provider/dashboard', element: <ProviderDashboard /> },
    { path: '/provider/new', element: <ProviderNew /> },
    { path: '/provider/datasets', element: <ProviderDatasets /> },
    { path: '/provider/earnings', element: <ProviderEarnings /> },
]

export default routes
