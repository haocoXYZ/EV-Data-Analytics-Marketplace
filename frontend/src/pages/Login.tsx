import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import usersData from '../data/users.json'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Find user by email and password
    const user = usersData.users.find(
      u => u.email === email && u.password === password
    )
    
    if (!user) {
      setError('Email hoặc mật khẩu không đúng!')
      return
    }
    
    // Login with role from database
    login(email, password, user.roleName as any)
    
    // Navigate based on roleId
    if (user.roleId === 1) {
      // Admin
      navigate('/admin/dashboard')
    } else if (user.roleId === 2) {
      // Provider
      navigate('/provider/dashboard')
    } else if (user.roleId === 3) {
      // Consumer
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EV Data Marketplace</h1>
          <p className="text-blue-100">Đăng nhập vào hệ thống</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>💡 Tài khoản demo:</strong><br/>
              <div className="mt-2 space-y-1">
                <div>Admin: admin@evdata.vn / admin123</div>
                <div>Provider: provider@evdata.vn / provider123</div>
                <div>Consumer: consumer@evdata.vn / consumer123</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản? <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Đăng ký ngay</a>
          </div>
        </div>

        {/* Quick Fill Buttons */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm mb-3">Điền nhanh:</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => { setEmail('admin@evdata.vn'); setPassword('admin123'); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('provider@evdata.vn'); setPassword('provider123'); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm transition-colors"
            >
              Provider
            </button>
            <button
              type="button"
              onClick={() => { setEmail('consumer@evdata.vn'); setPassword('consumer123'); }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm transition-colors"
            >
              Consumer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
