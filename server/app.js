import './config/env.js'
import cors from 'cors'
import express from 'express'
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
import orderRoutes from './routes/orders.js' // <--- Naya Order Route Import

const app = express()

// Standard Middlewares
app.use(cors())
app.use(express.json()) // req.body parse karne ke liye zaroori hai

// API Routes Registration
app.use(healthRoutes)
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', productRoutes)
app.use('/api', collectionRoutes)
app.use('/api', blogRoutes)
app.use('/api', recipeRoutes)
app.use('/api', reviewRoutes)
app.use('/api', couponRoutes)
app.use('/api', uploadRoutes)

// Order Management (Guest aur Registered dono ke liye)
app.use('/api/orders', orderRoutes) // <--- Orders ka naya endpoint register ho gaya

// Error Handler (Hamesha saare routes ke baad aayega)
app.use(errorHandler)

export default app