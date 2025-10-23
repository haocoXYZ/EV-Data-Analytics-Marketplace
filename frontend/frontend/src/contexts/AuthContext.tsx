import React, { createContext, useContext, useState, useEffect } from 'react'

type Role = 'admin' | 'provider' | 'consumer' | null

interface User {
  id: string
  email: string
  role: Role
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (email: string, password: string, role: Role) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      role: role!,
      name: email.split('@')[0]
    }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const switchRole = (role: Role) => {
    if (user) {
      const updatedUser = { ...user, role: role! }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
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
