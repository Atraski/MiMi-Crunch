/**
 * Cloudinary transformation string for 1:1 square, AI crop, optimized delivery.
 * w_1000,h_1000 = 1000px square
 * c_fill = fill crop to cover dimensions
 * g_auto = AI-powered gravity (keeps main subject in frame)
 * q_auto = automatic quality
 * f_auto = automatic format (WebP/AVIF when supported)
 */
const CLOUDINARY_TRANSFORM = 'w_1000,h_1000,c_fill,g_auto,q_auto,f_auto'

/**
 * Takes a Cloudinary image URL and inserts optimization parameters for 1:1
 * square output with AI gravity, right after the /upload/ segment.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @param {string} [url] - Full Cloudinary URL (e.g. from MongoDB)
 * @returns {string} - URL with transformations, or original if not Cloudinary
 */
export function getOptimizedImage(url) {
  if (!url || typeof url !== 'string') return null
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${CLOUDINARY_TRANSFORM}/`)
}
