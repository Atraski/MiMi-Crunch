import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://mimicrunch-33how.ondigitalocean.app'
const TOKEN_KEY = 'mimi_auth_token'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY))

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
      setTokenState(newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setTokenState(null)
      setUser(null)
    }
  }, [])

  const fetchUser = useCallback(async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!res.ok) {
        setToken(null)
        return
      }
      const data = await res.json()
      setUser(data)
    } catch {
      setToken(null)
    }
  }, [setToken])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setUser(data)
        if (!cancelled && !data) setToken(null)
      })
      .catch(() => {
        if (!cancelled) setToken(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token, setToken])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }
    if (data.needsVerification) {
      return data
    }
    setToken(data.token)
    setUser(data.user)
    return data
  }, [setToken])

  const signup = useCallback(async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name ? name.trim() : '',
        email: email.trim(),
        password,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed')
    }
    if (data.needsVerification) {
      return data
    }
    setToken(data.token)
    setUser(data.user)
    return data
  }, [setToken])

  const verifyEmail = useCallback(async (userId, code) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code: String(code).trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed')
    }
    setToken(data.token)
    setUser(data.user)
    if (data.isNewUser && (!data.user.name || !data.user.address)) {
      sessionStorage.setItem('show_profile_reminder', 'true');
    }
    return data
  }, [setToken])

  const resendOtp = useCallback(async (userId) => {
    const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to resend code')
    }
    return data
  }, [])

  const sendEmailLoginOtp = useCallback(async (email) => {
    const res = await fetch(`${API_BASE}/api/auth/send-email-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(email).trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send OTP')
    }
    return data
  }, [])

  const verifyEmailLoginOtp = useCallback(async (email, code) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-email-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(email).trim(), code: String(code).trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Invalid or expired OTP')
    }
    setToken(data.token)
    setUser(data.user)
    if (data.isNewUser && (!data.user.name || !data.user.address)) {
      sessionStorage.setItem('show_profile_reminder', 'true');
    }
    return data
  }, [setToken])

  const logout = useCallback(() => {
    setToken(null)
  }, [setToken])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    verifyEmail,
    resendOtp,
    sendEmailLoginOtp,
    verifyEmailLoginOtp,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
