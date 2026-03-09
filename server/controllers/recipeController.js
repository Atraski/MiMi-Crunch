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
      time,
      tags,
      source,
      approvalStatus,
      submittedBy,
      submitterEmail,
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
      time: time || undefined,
      tags: Array.isArray(tags) ? tags : [],
      source: source === 'community' ? 'community' : 'official',
      approvalStatus: approvalStatus === 'pending' || approvalStatus === 'rejected'
        ? approvalStatus
        : 'approved',
      submittedBy: submittedBy || undefined,
      submitterEmail: submitterEmail || undefined,
      published: Boolean(published ?? true),
    })

    return res.status(201).json(recipe)
  } catch (err) {
    console.error('Recipe create error:', err)
    return res.status(500).json({ error: 'Failed to create recipe.' })
  }
}

const submitRecipeForApproval = async (req, res) => {
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
      time,
      tags,
      submittedBy,
      submitterEmail,
    } = req.body || {}

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' })
    }

    const finalSlug = slug ? slugify(slug) : slugify(`${title}-${Date.now()}`)

    const recipe = await Recipe.create({
      title,
      slug: finalSlug,
      excerpt,
      contentHtml,
      coverImage,
      gallery: Array.isArray(gallery) ? gallery : [],
      videoUrl,
      productSlug,
      time: time || undefined,
      tags: Array.isArray(tags) ? tags : [],
      source: 'community',
      approvalStatus: 'pending',
      submittedBy: submittedBy || undefined,
      submitterEmail: submitterEmail || undefined,
      published: false,
    })

    return res.status(201).json({
      success: true,
      message: 'Recipe submitted for approval.',
      recipeId: recipe._id,
    })
  } catch (err) {
    console.error('Recipe submission error:', err)
    return res.status(500).json({ error: 'Failed to submit recipe.' })
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
    if (req.query.source === 'official' || req.query.source === 'community') {
      filter.source = req.query.source
    }
    if (
      req.query.approvalStatus === 'approved' ||
      req.query.approvalStatus === 'pending' ||
      req.query.approvalStatus === 'rejected'
    ) {
      filter.approvalStatus = req.query.approvalStatus
    }
    if (req.query.published === 'true' && !req.query.approvalStatus) {
      filter.approvalStatus = 'approved'
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
    const recipe = await Recipe.findOne({
      slug: req.params.slug,
      published: true,
      approvalStatus: 'approved',
    }).lean()
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
    if (updates.source && !['official', 'community'].includes(updates.source)) {
      delete updates.source
    }
    if (
      updates.approvalStatus &&
      !['approved', 'pending', 'rejected'].includes(updates.approvalStatus)
    ) {
      delete updates.approvalStatus
    }
    if (updates.approvalStatus === 'approved' && updates.published == null) {
      updates.published = true
    }
    if (
      (updates.approvalStatus === 'pending' || updates.approvalStatus === 'rejected') &&
      updates.published == null
    ) {
      updates.published = false
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

export {
  createRecipe,
  submitRecipeForApproval,
  listRecipes,
  getRecipeById,
  getRecipeBySlug,
  updateRecipe,
  deleteRecipe,
}

