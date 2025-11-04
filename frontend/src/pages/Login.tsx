import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      
      // Get user from localStorage to navigate based on role
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      toast.success(`Chào mừng trở lại, ${userData.fullName || 'User'}!`)
      
      if (userData.role === 'Admin' || userData.role === 'Moderator') {
        navigate('/admin/dashboard')
      } else if (userData.role === 'DataProvider') {
        navigate('/provider/dashboard')
      } else if (userData.role === 'DataConsumer') {
        navigate('/')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            EV Data Marketplace
          </h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-3">🧪 Tài khoản demo:</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => { setEmail('admin@test.com'); setPassword('Test123!') }}
              className="w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="text-xs font-semibold text-blue-900">Admin</div>
              <div className="text-xs text-blue-700">admin@test.com</div>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('moderator@test.com'); setPassword('Test123!') }}
              className="w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="text-xs font-semibold text-blue-900">Moderator</div>
              <div className="text-xs text-blue-700">moderator@test.com</div>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('provider@test.com'); setPassword('Test123!') }}
              className="w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="text-xs font-semibold text-blue-900">Provider</div>
              <div className="text-xs text-blue-700">provider@test.com</div>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('consumer@test.com'); setPassword('Test123!') }}
              className="w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="text-xs font-semibold text-blue-900">Consumer</div>
              <div className="text-xs text-blue-700">consumer@test.com</div>
            </button>
          </div>
          <div className="mt-2 text-xs text-blue-800 text-center">
            Tất cả dùng password: <code className="bg-blue-100 px-2 py-0.5 rounded">Test123!</code>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
