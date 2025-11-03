import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/dataset/:id" element={<DatasetDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
      <Route path="/my-purchases" element={<MyPurchases />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pricing" element={<AdminPricing />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
      <Route path="/moderation/review" element={<ModeratorReview />} />
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/new" element={<ProviderNew />} />
    </Routes>
  )
}



















