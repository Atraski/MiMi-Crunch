import { useCallback, useState } from 'react'

const useReviews = (apiBase) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = useCallback(async () => {
    if (!apiBase) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/reviews?all=true`)
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load reviews.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const updateReview = useCallback(
    async (id, payload) => {
      if (!apiBase) return false
      setError('')
      try {
        const res = await fetch(`${apiBase}/api/reviews/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Update failed')
        const updated = await res.json()
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? updated : r)),
        )
        return true
      } catch (err) {
        setError(err.message || 'Failed to update review.')
        return false
      }
    },
    [apiBase],
  )

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    updateReview,
  }
}

export default useReviews
