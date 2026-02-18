const SESSION_KEY = 'mimi_admin_session'

export const getStoredAdminSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const isAdminSessionValid = (session = getStoredAdminSession()) => {
  if (!session?.token || !session?.expiresAt) return false
  return Number(session.expiresAt) > Date.now()
}

export const saveAdminSession = ({ loginId, token, expiresAt }) => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      loginId,
      token,
      expiresAt,
    }),
  )
  return expiresAt
}

export const clearAdminSession = () => {
  localStorage.removeItem(SESSION_KEY)
}

export const getAdminToken = () => {
  const session = getStoredAdminSession()
  if (!isAdminSessionValid(session)) return ''
  return session.token || ''
}

export const getAdminAuthHeaders = () => {
  const token = getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
