import './config/env.js'
import app from './app.js'
import connectDB from './config/db.js'
import { connectRedis } from './config/redis.js'

const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mimi-crunch'

// Start HTTP server first so client gets a response instead of connection refused.
// DB/Redis connect in background; auth and data routes will fail until DB is up.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

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
