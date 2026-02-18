const USER_CACHE_PREFIX = 'user:'
const USER_CACHE_TTL_SEC = 7 * 24 * 60 * 60 // 7 days, match JWT expiry

let redisClient = null

export const getRedisClient = () => redisClient

export const connectRedis = async () => {
  const url = process.env.REDIS_URL
  if (!url || url.trim() === '') {
    console.log('Redis: REDIS_URL not set, user cache disabled')
    return
  }
  try {
    const { default: Redis } = await import('ioredis')
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
    })
    redisClient.on('error', (err) => console.warn('Redis error:', err.message))
    redisClient.on('connect', () => console.log('Redis connected'))
    await redisClient.ping()
  } catch (err) {
    console.warn('Redis connect failed:', err.message, '- user cache disabled')
    redisClient = null
  }
}

export const getCachedUser = async (userId) => {
  if (!redisClient) return null
  try {
    const key = USER_CACHE_PREFIX + userId
    const raw = await redisClient.get(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const setCachedUser = async (userId, userObject) => {
  if (!redisClient) return
  try {
    const key = USER_CACHE_PREFIX + userId
    await redisClient.setex(key, USER_CACHE_TTL_SEC, JSON.stringify(userObject))
  } catch (err) {
    console.warn('Redis set user cache failed:', err.message)
  }
}

export const deleteCachedUser = async (userId) => {
  if (!redisClient) return
  try {
    await redisClient.del(USER_CACHE_PREFIX + userId)
  } catch {
    // ignore
  }
}

export const closeRedis = async () => {
  if (!redisClient) return
  try {
    await redisClient.quit()
  } catch {
    // ignore shutdown errors
  } finally {
    redisClient = null
  }
}
