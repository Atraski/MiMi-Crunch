import { useState, useEffect } from 'react'
import { getStoredAdminSession } from '../utils/adminAuth.js'

const useAnalytics = (apiBase) => {
    const [data, setData] = useState({
        activeUsers: 0,
        sourceStats: {},
        dailyTraffic: [],
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchAnalytics = async () => {
        try {
            const session = getStoredAdminSession()
            const token = session ? session.token : ''
            const res = await fetch(`${apiBase}/api/analytics/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!res.ok) throw new Error('Failed to fetch analytics')
            const result = await res.json()
            setData({
                activeUsers: result.activeUsers || 0,
                sourceStats: result.sourceStats || {},
                dailyTraffic: result.dailyTraffic || [],
            })
            setError('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
        const interval = setInterval(fetchAnalytics, 10000) // Poll every 10s for live feel
        return () => clearInterval(interval)
    }, [apiBase])

    return { data, loading, error, refresh: fetchAnalytics }
}

export default useAnalytics
