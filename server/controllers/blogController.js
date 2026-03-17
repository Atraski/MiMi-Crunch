import Blog from '../models/Blog.js'

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      contentHtml,
      coverImage,
      tags,
      published,
      metaTitle,
      metaDescription,
    } = req.body || {}
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' })
    }
    const finalSlug = slug ? slugify(slug) : slugify(title)
    const now = new Date()
    const blog = await Blog.create({
      title,
      slug: finalSlug,
      excerpt,
      contentHtml,
      coverImage,
      tags: Array.isArray(tags) ? tags : [],
      published: Boolean(published),
      publishedAt: published ? now : undefined,
      metaTitle,
      metaDescription,
    })
    return res.status(201).json(blog)
  } catch (err) {
    console.error('Blog create error:', err)
    return res.status(500).json({ error: 'Failed to create blog.' })
  }
}

const listBlogs = async (req, res) => {
  try {
    const filter =
      req.query.published === 'true'
        ? { published: true }
        : {}
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .lean()
    return res.json(blogs)
  } catch (err) {
    console.error('Blog list error:', err)
    return res.status(500).json({ error: 'Failed to fetch blogs.' })
  }
}

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean()
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' })
    }
    return res.json(blog)
  } catch (err) {
    console.error('Blog fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch blog.' })
  }
}

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).lean()
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' })
    }
    return res.json(blog)
  } catch (err) {
    console.error('Blog slug fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch blog.' })
  }
}

const updateBlog = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (updates.slug) {
      updates.slug = slugify(updates.slug)
    }
    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = []
    }
    if (typeof updates.published === 'boolean') {
      if (!updates.published) {
        updates.publishedAt = undefined
      } else if (req.body.publishedAt === undefined) {
        updates.publishedAt = new Date()
      }
    }
    if (req.body.publishedAt !== undefined) {
      updates.publishedAt = req.body.publishedAt
        ? new Date(req.body.publishedAt)
        : undefined
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean()
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' })
    }
    return res.json(blog)
  } catch (err) {
    console.error('Blog update error:', err)
    return res.status(500).json({ error: 'Failed to update blog.' })
  }
}

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id).lean()
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' })
    }
    return res.json({ success: true })
  } catch (err) {
    console.error('Blog delete error:', err)
    return res.status(500).json({ error: 'Failed to delete blog.' })
  }
}

export {
  createBlog,
  listBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
}

