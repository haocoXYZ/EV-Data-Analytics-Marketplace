import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
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
import ModeratorReview from './pages/ModeratorReview'
import AdminPayouts from './pages/AdminPayouts'
import AdminDashboard from './pages/AdminDashboard'
import AdminProviders from './pages/AdminProviders'
import ProviderDashboard from './pages/ProviderDashboard'
import ProviderEarnings from './pages/ProviderEarnings'
import ProviderPricing from './pages/ProviderPricing'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dataset/:id" element={<DatasetDetail />} />
      <Route path="/buy-data" element={<DataPackagePurchase />} />
      <Route path="/buy-subscription" element={<SubscriptionPurchase />} />
      <Route path="/buy-api" element={<APIPackagePurchase />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/my-purchases" element={<MyPurchases />} />
      <Route path="/subscriptions/:subscriptionId/dashboard" element={<SubscriptionDashboard />} />
      <Route path="/api-packages/:purchaseId/keys" element={<APIPackageKeys />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/providers" element={<AdminProviders />} />
      <Route path="/admin/pricing" element={<AdminPricing />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
      <Route path="/admin/moderation" element={<ModeratorReview />} />
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/new" element={<ProviderNew />} />
      <Route path="/provider/earnings" element={<ProviderEarnings />} />
      <Route path="/provider/pricing" element={<ProviderPricing />} />
    </Routes>
  )
}

























