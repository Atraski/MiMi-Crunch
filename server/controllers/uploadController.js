import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

const createUploadSignature = (req, res) => {
  if (!isCloudinaryConfigured) {
    return res.status(500).json({ error: 'Cloudinary not configured.' })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const { folder, public_id } = req.body || {}
  const paramsToSign = { timestamp }
  if (folder) {
    paramsToSign.folder = folder
  }
  if (public_id) {
    paramsToSign.public_id = public_id
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  )

  return res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}

export { createUploadSignature }
