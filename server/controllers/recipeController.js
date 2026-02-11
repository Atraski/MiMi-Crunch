import Recipe from '../models/Recipe.js'

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const createRecipe = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      contentHtml,
      coverImage,
      gallery,
      videoUrl,
      productSlug,
      tags,
      published,
    } = req.body || {}

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' })
    }

    const finalSlug = slug ? slugify(slug) : slugify(title)

    const recipe = await Recipe.create({
      title,
      slug: finalSlug,
      excerpt,
      contentHtml,
      coverImage,
      gallery: Array.isArray(gallery) ? gallery : [],
      videoUrl,
      productSlug,
      tags: Array.isArray(tags) ? tags : [],
      published: Boolean(published ?? true),
    })

    return res.status(201).json(recipe)
  } catch (err) {
    console.error('Recipe create error:', err)
    return res.status(500).json({ error: 'Failed to create recipe.' })
  }
}

const listRecipes = async (req, res) => {
  try {
    const filter = {}
    if (req.query.productSlug) {
      filter.productSlug = String(req.query.productSlug).trim()
    }
    if (req.query.published === 'true') {
      filter.published = true
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 }).lean()
    return res.json(recipes)
  } catch (err) {
    console.error('Recipe list error:', err)
    return res.status(500).json({ error: 'Failed to fetch recipes.' })
  }
}

const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean()
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' })
    }
    return res.json(recipe)
  } catch (err) {
    console.error('Recipe fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch recipe.' })
  }
}

const getRecipeBySlug = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).lean()
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' })
    }
    return res.json(recipe)
  } catch (err) {
    console.error('Recipe slug fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch recipe.' })
  }
}

const updateRecipe = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.slug) {
      updates.slug = slugify(updates.slug)
    }
    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = []
    }
    if (updates.gallery && !Array.isArray(updates.gallery)) {
      updates.gallery = []
    }

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean()

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' })
    }
    return res.json(recipe)
  } catch (err) {
    console.error('Recipe update error:', err)
    return res.status(500).json({ error: 'Failed to update recipe.' })
  }
}

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id).lean()
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' })
    }
    return res.json({ success: true })
  } catch (err) {
    console.error('Recipe delete error:', err)
    return res.status(500).json({ error: 'Failed to delete recipe.' })
  }
}

export { createRecipe, listRecipes, getRecipeById, getRecipeBySlug, updateRecipe, deleteRecipe }

