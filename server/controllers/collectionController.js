import Collection from '../models/Collection.js'

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const createCollection = async (req, res) => {
  try {
    const { title, slug, description, image, productSlugs } = req.body || {}
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' })
    }
    const finalSlug = slug ? slugify(slug) : slugify(title)
    const collection = await Collection.create({
      title,
      slug: finalSlug,
      description,
      image,
      productSlugs: Array.isArray(productSlugs) ? productSlugs : [],
    })
    return res.status(201).json(collection)
  } catch (err) {
    console.error('Collection create error:', err)
    return res.status(500).json({ error: 'Failed to create collection.' })
  }
}

const listCollections = async (_req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 }).lean()
    return res.json(collections)
  } catch (err) {
    console.error('Collection list error:', err)
    return res.status(500).json({ error: 'Failed to fetch collections.' })
  }
}

const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).lean()
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found.' })
    }
    return res.json(collection)
  } catch (err) {
    console.error('Collection fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch collection.' })
  }
}

const getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      slug: req.params.slug,
    }).lean()
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found.' })
    }
    return res.json(collection)
  } catch (err) {
    console.error('Collection slug fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch collection.' })
  }
}

const updateCollection = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.slug) {
      updates.slug = slugify(updates.slug)
    }
    if (updates.productSlugs && !Array.isArray(updates.productSlugs)) {
      updates.productSlugs = []
    }
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    ).lean()
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found.' })
    }
    return res.json(collection)
  } catch (err) {
    console.error('Collection update error:', err)
    return res.status(500).json({ error: 'Failed to update collection.' })
  }
}

const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id).lean()
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found.' })
    }
    return res.json({ success: true })
  } catch (err) {
    console.error('Collection delete error:', err)
    return res.status(500).json({ error: 'Failed to delete collection.' })
  }
}

export {
  createCollection,
  listCollections,
  getCollectionById,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
}

