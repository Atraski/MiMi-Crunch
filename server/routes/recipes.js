import { Router } from 'express'
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipeBySlug,
  listRecipes,
  updateRecipe,
} from '../controllers/recipeController.js'

const router = Router()

router.post('/recipes', createRecipe)
router.get('/recipes', listRecipes)
router.get('/recipes/slug/:slug', getRecipeBySlug)
router.get('/recipes/:id', getRecipeById)
router.patch('/recipes/:id', updateRecipe)
router.delete('/recipes/:id', deleteRecipe)

export default router

