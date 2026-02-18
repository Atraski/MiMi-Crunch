import jwt from 'jsonwebtoken'

const ADMIN_JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== 'production'
    ? 'mimi-admin-secret-change-in-production'
    : '')

if (!ADMIN_JWT_SECRET) {
  throw new Error('Missing ADMIN_JWT_SECRET or JWT_SECRET in environment.')
}

export const adminAuthMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required.' })
  }
  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET)
    if (payload?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only.' })
    }
    req.admin = { loginId: payload.loginId || 'admin' }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin token.' })
  }
}

export const signAdminToken = (loginId) =>
  jwt.sign(
    {
      loginId,
      role: 'admin',
    },
    ADMIN_JWT_SECRET,
    { expiresIn: '1h' },
  )
