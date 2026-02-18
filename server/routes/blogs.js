import { Router } from 'express'
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  listBlogs,
  updateBlog,
} from '../controllers/blogController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/blogs', adminAuthMiddleware, createBlog)
router.get('/blogs', listBlogs)
router.get('/blogs/:id', getBlogById)
router.get('/blogs/slug/:slug', getBlogBySlug)
router.patch('/blogs/:id', adminAuthMiddleware, updateBlog)
router.delete('/blogs/:id', adminAuthMiddleware, deleteBlog)

export default router

