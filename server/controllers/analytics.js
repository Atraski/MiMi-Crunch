import Analytics from '../models/Analytics.js'
import Order from '../models/Order.js'

export const recordVisit = async (req, res) => {
    try {
        const { visitorId, source, path, deviceType } = req.body

        if (!visitorId) {
            return res.status(400).json({ message: 'visitorId is required' })
        }

        let finalSource = 'direct'
        let extractedKeyword = null
        
        if (source && source !== 'direct' && source.trim() !== '') {
            const s = source.toLowerCase()
            const url = new URL(source.includes('http') ? source : `https://${source}`)
            
            // Try to get keyword from URL params (utm_term, q, etc)
            extractedKeyword = url.searchParams.get('utm_term') || 
                               url.searchParams.get('q') || 
                               url.searchParams.get('query')

            if (s.includes('google')) finalSource = 'google'
            else if (s.includes('instagram')) finalSource = 'instagram'
            else if (s.includes('facebook') || s.includes('fb.')) finalSource = 'facebook'
            else finalSource = 'other'
        }

        let visitor = await Analytics.findOne({ visitorId })

        if (visitor) {
            visitor.lastActive = Date.now()
            visitor.pageViews += 1
            if (finalSource !== 'direct' && visitor.source === 'direct') {
                visitor.source = finalSource
                visitor.referrerUrl = source
                visitor.keyword = extractedKeyword || visitor.keyword
            }
            await visitor.save()
        } else {
            visitor = new Analytics({ 
                visitorId, 
                source: finalSource, 
                referrerUrl: source,
                keyword: extractedKeyword,
                deviceType: deviceType || 'unknown'
            })
            await visitor.save()
        }

        res.status(200).json({ success: true, visitor })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const pingActivity = async (req, res) => {
    try {
        const { visitorId } = req.body
        if (!visitorId) return res.status(400).json({ message: 'visitorId required' })

        const visitor = await Analytics.findOne({ visitorId })
        if (visitor) {
            const now = Date.now()
            const lastActive = new Date(visitor.lastActive).getTime()
            const diffSeconds = Math.round((now - lastActive) / 1000)
            
            // Only count if diff is reasonable (less than 5 mins between pings)
            // This prevents huge time jumps if user reopens a tab after hours
            if (diffSeconds > 0 && diffSeconds < 300) {
                visitor.totalTimeSpent = (visitor.totalTimeSpent || 0) + diffSeconds
            }
            
            visitor.lastActive = now
            await visitor.save()
            return res.status(200).json({ success: true })
        }
        res.status(404).json({ message: 'Visitor not found' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const getStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Use provided dates or default to past 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // For daily traffic inclusive of the end day, set end to end of day
        end.setHours(23, 59, 59, 999);

        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
        const activeUsers = await Analytics.countDocuments({ lastActive: { $gte: twoMinutesAgo } })

        const sourceStats = await Analytics.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ])

        const keywordStats = await Analytics.aggregate([
            { $match: { 
                keyword: { $ne: null },
                createdAt: { $gte: start, $lte: end }
            } },
            { $group: { _id: '$keyword', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])

        // Calculate Average Session Duration for the period
        const avgDuration = await Analytics.aggregate([
            { $match: { 
                totalTimeSpent: { $gt: 0 },
                createdAt: { $gte: start, $lte: end }
            } },
            { $group: { _id: null, avgTime: { $avg: '$totalTimeSpent' } } }
        ])

        const dailyTrafficAgg = await Analytics.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    visitors: { $sum: 1 },
                    pageViews: { $sum: '$pageViews' }
                }
            },
            { $sort: { _id: 1 } }
        ])

        const dailySalesAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    sales: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                    totalItems: { $sum: { $reduce: { input: '$items', initialValue: 0, in: { $add: ['$$value', '$$this.qty'] } } } }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // Merge traffic and sales data by date
        const dateMap = {};
        dailyTrafficAgg.forEach(d => {
            dateMap[d._id] = { ...d, sales: 0, orders: 0, totalItems: 0 };
        });
        dailySalesAgg.forEach(s => {
            if (dateMap[s._id]) {
                dateMap[s._id].sales = s.sales;
                dateMap[s._id].orders = s.orders;
                dateMap[s._id].totalItems = s.totalItems;
            } else {
                dateMap[s._id] = { _id: s._id, visitors: 0, pageViews: 0, sales: s.sales, orders: s.orders, totalItems: s.totalItems };
            }
        });

        const dailyTraffic = Object.values(dateMap).sort((a, b) => a._id.localeCompare(b._id));

        res.status(200).json({
            activeUsers,
            sourceStats: sourceStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count
                return acc
            }, {}),
            keywordStats,
            avgTimePerUser: avgDuration[0]?.avgTime || 0,
            dailyTraffic
        })
    } catch (err) {
        console.error('getStats error:', err)
        res.status(500).json({ error: err.message })
    }
}
