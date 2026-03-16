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
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    const fetchAnalytics = async () => {
        try {
            const session = getStoredAdminSession()
            const token = session ? session.token : ''
            const query = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
            const res = await fetch(`${apiBase}/api/analytics/stats${query}`, {
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
                avgTimePerUser: result.avgTimePerUser || 0,
                keywordStats: result.keywordStats || [],
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
        const interval = setInterval(fetchAnalytics, 15000)
        return () => clearInterval(interval)
    }, [apiBase, dateRange]) // Re-fetch when dateRange changes

    return { data, loading, error, dateRange, setDateRange, refresh: fetchAnalytics }
}

export default useAnalytics
