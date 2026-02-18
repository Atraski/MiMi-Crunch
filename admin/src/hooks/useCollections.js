import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useCollections = (apiBase) => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/collections`)
      const data = await res.json()
      setCollections(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load collections.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const fetchCollectionById = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${apiBase}/api/collections/${id}`)
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },
    [apiBase],
  )

  const createCollection = async (form) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        throw new Error('Create failed')
      }
      await fetchCollections()
      return true
    } catch (err) {
      setError('Failed to create collection.')
      return false
    }
  }

  const updateCollection = async (id, form) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/collections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        throw new Error('Update failed')
      }
      await fetchCollections()
      return true
    } catch (err) {
      setError('Failed to update collection.')
      return false
    }
  }

  const deleteCollection = async (id) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/collections/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) {
        throw new Error('Delete failed')
      }
      await fetchCollections()
    } catch (err) {
      setError('Failed to delete collection.')
    }
  }

  return {
    collections,
    loading,
    error,
    fetchCollections,
    fetchCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
  }
}

export default useCollections

