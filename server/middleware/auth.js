import jwt from 'jsonwebtoken'

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== 'production'
    ? 'mimi-crunch-secret-change-in-production'
    : '')

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment.')
}

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.auth = { userId: payload.userId }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}
