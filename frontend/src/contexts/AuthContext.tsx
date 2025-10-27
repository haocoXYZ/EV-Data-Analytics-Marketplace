import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { User, LoginRequest, RegisterRequest } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isProvider: boolean
  isConsumer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // Check if token is expired
        const expiresAt = new Date(userData.expiresAt)
        if (expiresAt > new Date()) {
          setUser(userData)
        } else {
          // Token expired, clear storage
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      
      const userData: User = {
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
        token: response.token,
        expiresAt: response.expiresAt,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Navigation will be handled by Login component
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data)
      
      const userData: User = {
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
        token: response.token,
        expiresAt: response.expiresAt,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Navigation will be handled by Register component
    } catch (error: any) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Navigation to /login will be handled by component calling logout
  }

  // Helper computed values
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'Admin' || user?.role === 'Moderator'
  const isProvider = user?.role === 'DataProvider'
  const isConsumer = user?.role === 'DataConsumer'

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isProvider,
    isConsumer,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
