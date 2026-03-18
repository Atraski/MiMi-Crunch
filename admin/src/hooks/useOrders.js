import { useCallback, useState } from 'react'
import { getAdminAuthHeaders } from '../utils/adminAuth.js'

const useOrders = (apiBase) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/orders/admin/all`, {
        headers: getAdminAuthHeaders(),
      })
      if (!res.ok) {
        throw new Error('Fetch failed')
      }
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  const replaceOrderInState = useCallback((updatedOrder) => {
    if (!updatedOrder?._id) return
    setOrders((prev) => prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
  }, [])

  const updateOrderStatus = useCallback(
    async (orderId, status) => {
      setError('')
      try {
        const res = await fetch(`${apiBase}/api/orders/admin/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
          body: JSON.stringify({ status }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update order status.')
        }
        if (data.order) replaceOrderInState(data.order)
        return { success: true, data }
      } catch (err) {
        setError(err.message || 'Failed to update order status.')
        return { success: false, error: err.message || 'Failed to update order status.' }
      }
    },
    [apiBase, replaceOrderInState],
  )

  const syncOrderToShiprocket = useCallback(
    async (orderId) => {
      setError('')
      try {
        const res = await fetch(`${apiBase}/api/orders/${orderId}/sync`, {
          method: 'POST',
          headers: getAdminAuthHeaders(),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.error || data.details || 'Failed to sync shipping.')
        }
        if (data.order) replaceOrderInState(data.order)
        return { success: true, data }
      } catch (err) {
        setError(err.message || 'Failed to sync shipping.')
        return { success: false, error: err.message || 'Failed to sync shipping.' }
      }
    },
    [apiBase, replaceOrderInState],
  )

  const requestPickup = useCallback(
    async (orderId) => {
      setError('')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000)
      try {
        const res = await fetch(`${apiBase}/api/orders/${orderId}/pickup`, {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            res.status === 504
              ? 'Pickup request is taking too long. Try again or request pickup from Shiprocket dashboard.'
              : (data.error || data.details || 'Failed to request pickup.')
          throw new Error(msg)
        }
        if (data.order) replaceOrderInState(data.order)
        return { success: true, data }
      } catch (err) {
        clearTimeout(timeoutId)
        const message =
          err.name === 'AbortError'
            ? 'Pickup request timed out. Try again or request pickup from Shiprocket dashboard.'
            : err.message || 'Failed to request pickup.'
        setError(message)
        return { success: false, error: message }
      }
    },
    [apiBase, replaceOrderInState],
  )

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    syncOrderToShiprocket,
    requestPickup,
  }
}

export default useOrders
