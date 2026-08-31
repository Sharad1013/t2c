import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loginUser as loginUserApi, getLoggedInUser, registerUser as registerApi } from '../api/auth'
import { loginInspector as loginInspectorApi, getLoggedInInspector } from '../api/inspector'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('t2c_token')
    const storedRole = localStorage.getItem('t2c_role')

    if (!token) {
      setUser(null)
      setRole(null)
      setLoading(false)
      return
    }

    try {
      if (storedRole === 'inspector') {
        const data = await getLoggedInInspector()
        const { password, ...safeInspector } = data.inspector || {}
        setUser(safeInspector)
        setRole('inspector')
      } else {
        const data = await getLoggedInUser()
        const { password, ...safeUser } = data.user || {}
        setUser(safeUser)
        setRole(safeUser?.role || 'user')
      }
    } catch {
      localStorage.removeItem('t2c_token')
      localStorage.removeItem('t2c_role')
      setUser(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email, password) => {
    try {
      const data = await loginUserApi({ email, password })
      localStorage.setItem('t2c_token', data.token)
      localStorage.setItem('t2c_role', data.role || 'user')
      await fetchUser()
      return { ...data, role: data.role || 'user' }
    } catch (userErr) {
      if (userErr.message !== 'No user found with the email.') {
        throw userErr
      }

      try {
        const data = await loginInspectorApi({ email, password })
        localStorage.setItem('t2c_token', data.token)
        localStorage.setItem('t2c_role', 'inspector')
        await fetchUser()
        return { ...data, role: 'inspector' }
      } catch (inspectorErr) {
        if (inspectorErr.message === 'No inspector found with this email.') {
          throw new Error('No account found with this email. Please sign up or check your email.')
        }
        throw inspectorErr
      }
    }
  }

  const register = async (userData) => {
    const data = await registerApi(userData)
    return data
  }

  const logout = () => {
    localStorage.removeItem('t2c_token')
    localStorage.removeItem('t2c_role')
    setUser(null)
    setRole(null)
  }

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const isInspector = role === 'inspector'
  const isAdmin = role === 'admin'

  return (
    <AuthContext.Provider
      value={{ user, role, loading, isInspector, isAdmin, login, register, logout, fetchUser, updateLocalUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
