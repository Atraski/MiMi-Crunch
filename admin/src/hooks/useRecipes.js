import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useRecipes = (apiBase) => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchRecipes = useCallback(async () => {
    if (!apiBase) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/recipes`)
      const data = await res.json()
      setRecipes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load recipes.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const fetchRecipeById = useCallback(
    async (id) => {
      if (!apiBase) return null
      try {
        const res = await fetch(`${apiBase}/api/recipes/${id}`)
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },
    [apiBase],
  )

  const createRecipe = async (form) => {
    if (!apiBase) return false
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Create failed')
      await fetchRecipes()
      return true
    } catch (err) {
      setError('Failed to create recipe.')
      return false
    }
  }

  const updateRecipe = async (id, form) => {
    if (!apiBase) return false
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Update failed')
      await fetchRecipes()
      return true
    } catch (err) {
      setError('Failed to update recipe.')
      return false
    }
  }

  const deleteRecipe = async (id) => {
    if (!apiBase) return
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/recipes/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchRecipes()
    } catch (err) {
      setError('Failed to delete recipe.')
    }
  }

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  }
}

export default useRecipes

