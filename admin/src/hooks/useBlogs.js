import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useBlogs = (apiBase) => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/blogs`)
      const data = await res.json()
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load blogs.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const createBlog = async (form) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        throw new Error('Create failed')
      }
      await fetchBlogs()
      return true
    } catch (err) {
      setError('Failed to create blog.')
      return false
    }
  }

  const fetchBlogById = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${apiBase}/api/blogs/${id}`)
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },
    [apiBase],
  )

  const updateBlog = async (id, form) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        throw new Error('Update failed')
      }
      await fetchBlogs()
      return true
    } catch (err) {
      setError('Failed to update blog.')
      return false
    }
  }

  const deleteBlog = async (id) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/blogs/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) {
        throw new Error('Delete failed')
      }
      await fetchBlogs()
    } catch (err) {
      setError('Failed to delete blog.')
    }
  }

  return {
    blogs,
    loading,
    error,
    fetchBlogs,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
  }
}

export default useBlogs

