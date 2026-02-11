import Collection from '../models/Collection.js'
import Product from '../models/Product.js'
import seedProductsIfEmpty from '../utils/seedProducts.js'

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
    // Ensure products are seeded so we can infer collections if needed.
    await seedProductsIfEmpty()
    let collections = await Collection.find().sort({ createdAt: -1 }).lean()

    // If no explicit collections exist yet, seed them from existing products.
    if (!collections.length) {
      const products = await Product.find({
        collection: { $exists: true, $ne: '' },
      })
        .sort({ createdAt: 1 })
        .lean()

      const byCollection = new Map()
      for (const product of products) {
        const raw = (product.collection || '').trim()
        if (!raw) continue
        const slug = slugify(raw)
        if (!byCollection.has(slug)) {
          byCollection.set(slug, {
            title: formatCollectionTitle(raw),
            slug,
            description: '',
            image: '',
            productSlugs: [],
          })
        }
        const entry = byCollection.get(slug)
        if (product.slug && !entry.productSlugs.includes(product.slug)) {
          entry.productSlugs.push(product.slug)
        }
      }

      const seed = [...byCollection.values()]
      if (seed.length) {
        await Collection.insertMany(seed)
        collections = await Collection.find().sort({ createdAt: -1 }).lean()
      }
    }

    return res.json(collections)
  } catch (err) {
    console.error('Collection list error:', err)
    return res.status(500).json({ error: 'Failed to fetch collections.' })
  }
}

const formatCollectionTitle = (value = '') =>
  value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')

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

