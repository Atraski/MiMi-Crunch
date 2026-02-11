import Product from '../models/Product.js'
import productEvents from '../utils/productEvents.js'
import seedProductsIfEmpty from '../utils/seedProducts.js'

/**
 * Naya Function: Order hone par stock minus karne ke liye
 * Ye function orderController se call hoga.
 */
const updateStock = async (items) => {
  try {
    const stockUpdates = items.map((item) => {
      return Product.findByIdAndUpdate(
        item.productId,
        { $inc: { "inventory.stock": -item.qty } },
        { new: true }
      );
    });

    await Promise.all(stockUpdates);
    
    // SSE trigger karega taaki frontend pe stock live update ho jaye
    productEvents.emit('updated'); 
    return { success: true };
  } catch (err) {
    console.error('Stock update error:', err);
    throw new Error('Failed to update product inventory.');
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      title,
      slug,
      weight,
      weightOptions,
      selectorCount,
      ctaPrimary,
      ctaSecondary,
      category,
      description,
      additionalInfo,
      price,
      compareAtPrice,
      collection,
      keywords,
      tags,
      images,
      variants,
      inventory,
      faqs,
      isActive,
    } = req.body || {}
    
    const primaryVariant =
      Array.isArray(variants) && variants.length ? variants[0] : null
      
    const product = await Product.create({
      name: name || title,
      title: title || name,
      slug,
      weight: weight || primaryVariant?.weight,
      weightOptions,
      selectorCount,
      ctaPrimary,
      ctaSecondary,
      category,
      description,
      additionalInfo,
      price: price ?? primaryVariant?.price,
      compareAtPrice: compareAtPrice ?? primaryVariant?.compareAtPrice,
      collection,
      keywords,
      tags,
      images: images?.length ? images : primaryVariant?.images,
      variants,
      inventory,
      faqs,
      isActive,
    })
    
    productEvents.emit('updated')
    return res.status(201).json(product)
  } catch (err) {
    console.error('Product create error:', err)
    return res.status(500).json({ error: 'Failed to create product.' })
  }
}

const listProducts = async (req, res) => {
  try {
    await seedProductsIfEmpty()
    const filter =
      req.query.active === 'true'
        ? {
            $or: [{ isActive: { $exists: false } }, { isActive: true }],
          }
        : {}
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()
    return res.json(products)
  } catch (err) {
    console.error('Product list error:', err)
    return res.status(500).json({ error: 'Failed to fetch products.' })
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }
    return res.json(product)
  } catch (err) {
    console.error('Product fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch product.' })
  }
}

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }
    return res.json(product)
  } catch (err) {
    console.error('Product slug fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch product.' })
  }
}

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }
    productEvents.emit('updated')
    return res.json(product)
  } catch (err) {
    console.error('Product update error:', err)
    return res.status(500).json({ error: 'Failed to update product.' })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).lean()
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }
    productEvents.emit('updated')
    return res.json({ success: true })
  } catch (err) {
    console.error('Product delete error:', err)
    return res.status(500).json({ error: 'Failed to delete product.' })
  }
}

const streamProducts = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (payload) => {
    res.write(`event: products\n`)
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  send({ type: 'connected', ts: Date.now() })

  const onUpdate = () => send({ type: 'updated', ts: Date.now() })
  productEvents.on('updated', onUpdate)

  const pingInterval = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`)
  }, 25000)

  req.on('close', () => {
    clearInterval(pingInterval)
    productEvents.off('updated', onUpdate)
    res.end()
  })
}

export {
  createProduct,
  listProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  streamProducts,
  updateStock, // Isko export karna zaroori tha
}