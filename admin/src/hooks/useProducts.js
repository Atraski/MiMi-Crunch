import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useProducts = (apiBase) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/products`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const fetchProductById = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${apiBase}/api/products/${id}`)
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },
    [apiBase],
  )

  const buildPayload = (form) => {
    const primaryVariant = form.variants?.[0]
    const primaryWeight = primaryVariant?.weight || ''
    const keywords = form.keywords
      ? form.keywords.split(',').map((item) => item.trim()).filter(Boolean)
      : []
    return {
      title: form.title,
      name: form.title,
      slug: form.slug,
      weight: primaryWeight,
      category: form.category,
      description: form.description,
      additionalInfo: form.additionalInfo,
      price: primaryVariant?.price ? Number(primaryVariant.price) : undefined,
      compareAtPrice: primaryVariant?.compareAtPrice
        ? Number(primaryVariant.compareAtPrice)
        : undefined,
      collection: form.collection,
      keywords,
      tags: form.tags
        ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      images: primaryVariant?.images || [],
      variants: form.variants || [],
      inventory: {
        lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : 5,
      },
      benefits: form.benefits ?? '',
      trust: form.trust ?? '',
      faqContent: form.faqContent ?? '',
      faqs: (form.faqs || []).filter((f) => f.question?.trim() && f.answer?.trim()),
      metaData: form.metaData ?? '',
      metaTitle: form.metaTitle ?? '',
      metaDescription: form.metaDescription ?? '',
      schemaMarkup: form.schemaMarkup ?? '',
    }
  }

  const createProduct = async (form) => {
    setError('')
    try {
      const payload = buildPayload(form)
      const res = await fetch(`${apiBase}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const message = data?.error || 'Failed to create product.'
        throw new Error(message)
      }
      await fetchProducts()
      return true
    } catch (err) {
      setError(err.message || 'Failed to create product.')
      return false
    }
  }

  const updateProduct = async (id, form) => {
    setError('')
    try {
      const payload = buildPayload(form)
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Update failed')
      }
      await fetchProducts()
      return true
    } catch (err) {
      setError(err.message || 'Failed to update product.')
      return false
    }
  }

  const updateStock = async (id, stock) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify({ inventory: { stock: Number(stock) } }),
      })
      if (!res.ok) {
        throw new Error('Update failed')
      }
      await fetchProducts()
    } catch (err) {
      setError('Failed to update inventory.')
    }
  }

  const deleteProduct = async (id) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) {
        throw new Error('Delete failed')
      }
      await fetchProducts()
    } catch (err) {
      setError('Failed to delete product.')
    }
  }

  const toggleActive = async (id, isActive) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) {
        throw new Error('Toggle failed')
      }
      await fetchProducts()
    } catch (err) {
      setError('Failed to update status.')
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    toggleActive,
  }
}

export default useProducts
