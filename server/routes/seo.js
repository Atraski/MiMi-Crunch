import express from 'express'
import Product from '../models/Product.js'
import Blog from '../models/Blog.js'
import Recipe from '../models/Recipe.js'

const router = express.Router()

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://mimicrunch.com' // Replace with actual production URL if different
    
    const products = await Product.find({ isActive: true }).select('slug updatedAt').lean()
    const blogs = await Blog.find({ published: true }).select('slug updatedAt').lean()
    const recipes = await Recipe.find({ published: true }).select('slug updatedAt').lean()

    const staticPages = [
      '',
      '/products',
      '/blogs',
      '/recipes',
      '/about',
      '/contact',
      '/build-your-protein'
    ]

    let xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    // Static Pages
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
    })

    // Products
    products.forEach(p => {
      xml += `
  <url>
    <loc>${baseUrl}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    })

    // Blogs
    blogs.forEach(b => {
      xml += `
  <url>
    <loc>${baseUrl}/blogs/${b.slug}</loc>
    <lastmod>${b.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    // Recipes
    recipes.forEach(r => {
      xml += `
  <url>
    <loc>${baseUrl}/recipes/${r.slug}</loc>
    <lastmod>${r.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    })

    xml += '\n</urlset>'

    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (err) {
    console.error('Sitemap error:', err)
    res.status(500).end()
  }
})

export default router
