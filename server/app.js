import './config/env.js'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import errorHandler from './middleware/errorHandler.js'

// Route Imports
import healthRoutes from './routes/health.js'
import productRoutes from './routes/products.js'
import collectionRoutes from './routes/collections.js'
import blogRoutes from './routes/blogs.js'
import recipeRoutes from './routes/recipes.js'
import reviewRoutes from './routes/reviews.js'
import couponRoutes from './routes/coupons.js'
import uploadRoutes from './routes/uploads.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import orderRoutes from './routes/orders.js'
import shippingRoutes from './routes/shipping.js'
import shiprocketCheckoutRoutes from './routes/shiprocketCheckout.js'
import analyticsRoutes from './routes/analytics.js'
import customDemandRoutes from './routes/customDemands.js'
import seoRoutes from './routes/seo.js'
import otpRoutes from './routes/otpRoutes.js'

const app = express()
app.set('trust proxy', 1)

// Standard Middlewares
const allowedOriginsFromEnv = String(process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'https://www.mimicrunch.com',
  'https://mimicrunch.com',
  'https://mimicrunch.netlify.app',
  'https://mimicrunch-admin.netlify.app'
]

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...allowedOriginsFromEnv,
])

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl/postman) where origin can be undefined
      if (!origin) return callback(null, true)
      if (allowedOrigins.has(origin)) return callback(null, true)
      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(helmet())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 500),
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use(express.json({ limit: '1mb' }))

// API Routes Registration
app.use(healthRoutes)
app.use('/api', authRoutes)
app.use('/api', adminRoutes)
app.use('/api', userRoutes)
app.use('/api', productRoutes)
app.use('/api', collectionRoutes)
app.use('/api', blogRoutes)
app.use('/api', recipeRoutes)
app.use('/api', reviewRoutes)
app.use('/api', couponRoutes)
app.use('/api', uploadRoutes)
app.use('/api', analyticsRoutes)

// Order management (guest and registered users)
app.use('/api/orders', orderRoutes)
app.use('/api/shipping', shippingRoutes)
app.use('/api/shiprocket', shiprocketCheckoutRoutes)
app.use('/api/custom-demands', customDemandRoutes)
app.use('/api/otp', otpRoutes)
app.use(seoRoutes)

// Error handler (must be after all routes)
app.use(errorHandler)

export default app