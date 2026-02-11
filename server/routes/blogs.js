import { Router } from 'express'
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogBySlug,
  listBlogs,
  updateBlog,
} from '../controllers/blogController.js'

const router = Router()

router.post('/blogs', createBlog)
router.get('/blogs', listBlogs)
router.get('/blogs/:id', getBlogById)
router.get('/blogs/slug/:slug', getBlogBySlug)
router.patch('/blogs/:id', updateBlog)
router.delete('/blogs/:id', deleteBlog)

export default router

