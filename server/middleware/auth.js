import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'mimi-crunch-secret-change-in-production'

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
