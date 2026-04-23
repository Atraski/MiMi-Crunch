import './config/env.js'
import app from './app.js'
import connectDB from './config/db.js'
import mongoose from 'mongoose'
import { closeRedis, connectRedis } from './config/redis.js'
import { initWhatsApp } from './utils/whatsappClient.js'

const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mimi-crunch'

// Start HTTP server first so client gets a response instead of connection refused.
// DB/Redis connect in background; auth and data routes will fail until DB is up.
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// WhatsApp client start karo — QR code terminal mein dikhega
initWhatsApp()

connectDB(MONGODB_URI)
  .then(() => connectRedis())
  .then(() => console.log('MongoDB and Redis connected'))
  .catch((err) => {
    console.error('MongoDB/Redis connection error:', err.message)
    if (err.message && err.message.includes('whitelist')) {
      console.error(
        '\n→ Fix: In MongoDB Atlas go to Network Access and add your current IP (or 0.0.0.0/0 for dev).\n',
      )
    }
    // Don't exit – server stays up; fix DB and restart to use auth/data
  })

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`)
  server.close(async () => {
    try {
      await closeRedis()
      await mongoose.connection.close()
      console.log('HTTP server, Redis, and MongoDB connections closed.')
      process.exit(0)
    } catch (err) {
      console.error('Graceful shutdown failed:', err.message)
      process.exit(1)
    }
  })
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
