import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useCustomers = (apiBase) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/admin/users`, {
        headers: getAdminAuthHeaders()
      })
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const deleteCustomer = async (id) => {
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) {
        throw new Error('Delete failed')
      }
      await fetchCustomers()
      return true
    } catch (err) {
      setError('Failed to delete customer.')
      return false
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    deleteCustomer,
  }
}

export default useCustomers
