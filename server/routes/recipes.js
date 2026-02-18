import { Router } from 'express'
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipeBySlug,
  listRecipes,
  updateRecipe,
} from '../controllers/recipeController.js'
import { adminAuthMiddleware } from '../middleware/adminAuth.js'

const router = Router()

router.post('/recipes', adminAuthMiddleware, createRecipe)
router.get('/recipes', listRecipes)
router.get('/recipes/slug/:slug', getRecipeBySlug)
router.get('/recipes/:id', getRecipeById)
router.patch('/recipes/:id', adminAuthMiddleware, updateRecipe)
router.delete('/recipes/:id', adminAuthMiddleware, deleteRecipe)

export default router

