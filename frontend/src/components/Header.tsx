import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EV Charging Data</h1>
              <p className="text-xs text-gray-500">Analytics Marketplace</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/catalog" className="text-gray-700 hover:text-blue-600 font-medium">
              Catalog
            </Link>
            {!user && (
              <Link to="/buy-data" className="text-blue-600 hover:text-blue-700 font-semibold">
                Buy Data
              </Link>
            )}
            {user && (
              <>
                {user.role === 'DataConsumer' && (
                  <>
                    <Link to="/buy-data" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Buy Data
                    </Link>
                    <Link to="/my-purchases" className="text-gray-700 hover:text-blue-600 font-medium">
                      My Purchases
                    </Link>
                  </>
                )}
                {user.role === 'DataProvider' && (
                  <>
                    <Link to="/provider/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                      Dashboard
                    </Link>
                    <Link to="/provider/new" className="text-gray-700 hover:text-blue-600 font-medium">
                      Upload
                    </Link>
                  </>
                )}
                {user.role === 'Moderator' && (
                  <Link to="/moderator/review" className="text-gray-700 hover:text-blue-600 font-medium">
                    Review
                  </Link>
                )}
                {user.role === 'Admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                      Dashboard
                    </Link>
                    <Link to="/admin/pricing" className="text-gray-700 hover:text-blue-600 font-medium">
                      Pricing
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
