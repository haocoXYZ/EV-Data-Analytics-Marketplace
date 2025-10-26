import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

type Role = 'admin' | 'provider' | 'consumer' | null

interface User {
  id: number
  email: string
  role: Role
  name: string
  token: string
  expiresAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Map backend roles to frontend roles
const mapRole = (backendRole: string): Role => {
  const role = backendRole.toLowerCase()
  if (role === 'admin' || role === 'moderator') return 'admin'
  if (role === 'dataprovider') return 'provider'
  if (role === 'dataconsumer') return 'consumer'
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Check if token is expired
        if (new Date(userData.expiresAt) > new Date()) {
          setUser(userData)
        } else {
          localStorage.removeItem('user')
        }
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.auth.login(email, password)
      
      const newUser: User = {
        id: response.userId,
        email: response.email,
        role: mapRole(response.role),
        name: response.fullName,
        token: response.token,
        expiresAt: response.expiresAt
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
