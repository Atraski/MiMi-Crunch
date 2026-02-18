import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useCoupons = (apiBase) => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/coupons`, {
        headers: getAdminAuthHeaders(),
      })
      const data = await res.json()
      setCoupons(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load coupons.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const fetchCouponById = useCallback(
    async (id) => {
      try {
        const res = await fetch(`${apiBase}/api/coupons/${id}`, {
          headers: getAdminAuthHeaders(),
        })
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    },
    [apiBase],
  )

  const createCoupon = async (form) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Create failed')
      }
      await fetchCoupons()
      return true
    } catch (err) {
      setError(err.message || 'Failed to create coupon.')
      return false
    }
  }

  const updateCoupon = async (id, form) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Update failed')
      }
      await fetchCoupons()
      return true
    } catch (err) {
      setError(err.message || 'Failed to update coupon.')
      return false
    }
  }

  const deleteCoupon = async (id) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchCoupons()
    } catch (err) {
      setError('Failed to delete coupon.')
    }
  }

  return {
    coupons,
    loading,
    error,
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  }
}

export default useCoupons
