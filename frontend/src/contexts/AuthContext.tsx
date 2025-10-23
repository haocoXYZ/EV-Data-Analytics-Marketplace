import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { isAccountBlocked } from '../api/admin'   // 👈 THÊM: kiểm tra email bị khóa

export type Role = 'admin' | 'provider' | 'consumer' | null

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

const SESSION_KEY = 'ev.auth.user'
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo state từ localStorage ngay lập tức để tránh nháy redirect sau F5
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  // Đồng bộ đa tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        try {
          setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null)
        } catch {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = (email: string, _password: string, role: Role) => {
    // ❗️Chặn đăng nhập nếu bị block
    if (isAccountBlocked(email)) {
      throw new Error('Tài khoản đã bị khóa bởi Admin')
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      role: role!,
      name: email.split('@')[0],
    }
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const switchRole = (role: Role) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, role: role! }
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const value = useMemo(() => ({ user, login, logout, switchRole }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
