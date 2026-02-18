import { Router } from 'express'
import { adminAuthMiddleware, signAdminToken } from '../middleware/adminAuth.js'

const router = Router()

const ADMIN_LOGIN_ID = process.env.ADMIN_LOGIN_ID || 'mimi-admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Mimi@1234'

router.post('/admin/login', (req, res) => {
  const { loginId, password } = req.body || {}
  if (!loginId || !password) {
    return res.status(400).json({ error: 'Login ID and password are required.' })
  }

  const isValid =
    String(loginId).trim() === ADMIN_LOGIN_ID &&
    String(password) === ADMIN_PASSWORD

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid admin credentials.' })
  }

  const token = signAdminToken(ADMIN_LOGIN_ID)
  const expiresAt = Date.now() + 60 * 60 * 1000

  return res.json({
    success: true,
    token,
    expiresAt,
    loginId: ADMIN_LOGIN_ID,
  })
})

router.get('/admin/me', adminAuthMiddleware, (req, res) => {
  return res.json({
    success: true,
    loginId: req.admin?.loginId || ADMIN_LOGIN_ID,
  })
})

export default router
