import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import RoleBasedRedirect from './components/RoleBasedRedirect'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import DatasetDetail from './pages/DatasetDetail'
import DataPackagePurchase from './pages/DataPackagePurchase'
import SubscriptionPurchase from './pages/SubscriptionPurchase'
import SubscriptionDashboard from './pages/SubscriptionDashboard'
import APIPackagePurchase from './pages/APIPackagePurchase'
import APIPackageKeys from './pages/APIPackageKeys'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import MyPurchases from './pages/MyPurchases'
import AdminPricing from './pages/AdminPricing'
import ProviderNew from './pages/ProviderNew'
import ProviderDatasets from './pages/ProviderDatasets'
import ProviderEarnings from './pages/ProviderEarnings'
import ModeratorReview from './pages/ModeratorReview'
import AdminPayouts from './pages/AdminPayouts'
import AdminDashboard from './pages/AdminDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <>
      <RoleBasedRedirect />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/dataset/:id" element={<DatasetDetail />} />
      
      {/* Consumer Routes */}
      <Route path="/buy-data" element={<DataPackagePurchase />} />
      <Route path="/subscribe" element={<SubscriptionPurchase />} />
      <Route path="/buy-api" element={<APIPackagePurchase />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/my-purchases" element={<MyPurchases />} />
      <Route path="/subscriptions/:subscriptionId/dashboard" element={<SubscriptionDashboard />} />
      <Route path="/api-packages/:purchaseId/keys" element={<APIPackageKeys />} />
      
      {/* Provider Routes */}
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/new" element={<ProviderNew />} />
      <Route path="/provider/datasets" element={<ProviderDatasets />} />
      <Route path="/provider/earnings" element={<ProviderEarnings />} />
      
      {/* Moderator Routes */}
      <Route path="/moderation/review" element={<ModeratorReview />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pricing" element={<AdminPricing />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
    </Routes>
    </>
  )
}



















