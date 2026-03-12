import Analytics from '../models/Analytics.js'

export const recordVisit = async (req, res) => {
    try {
        const { visitorId, source, path } = req.body

        if (!visitorId) {
            return res.status(400).json({ message: 'visitorId is required' })
        }

        let finalSource = 'direct'
        if (source && source !== 'direct' && source.trim() !== '') {
            const s = source.toLowerCase()
            if (s.includes('google')) finalSource = 'google'
            else if (s.includes('instagram')) finalSource = 'instagram'
            else if (s.includes('facebook') || s.includes('fb.')) finalSource = 'facebook'
            else finalSource = 'other'
        }

        let visitor = await Analytics.findOne({ visitorId })

        if (visitor) {
            visitor.lastActive = Date.now()
            visitor.pageViews += 1
            if (finalSource !== 'direct') {
                visitor.source = finalSource // Update source if coming from a tracked referral
            }
            await visitor.save()
        } else {
            visitor = new Analytics({ visitorId, source: finalSource })
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
            visitor.lastActive = Date.now()
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
        // Active users: lastActive within last 2 minutes
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
        const activeUsers = await Analytics.countDocuments({ lastActive: { $gte: twoMinutesAgo } })

        const sourceStats = await Analytics.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ])

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const dailyTraffic = await Analytics.aggregate([
            { $match: { firstVisit: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$firstVisit' } },
                    visitors: { $sum: 1 },
                    pageViews: { $sum: '$pageViews' }
                }
            },
            { $sort: { _id: 1 } }
        ])

        res.status(200).json({
            activeUsers,
            sourceStats: sourceStats.reduce((acc, curr) => {
                acc[curr._id] = curr.count
                return acc
            }, {}),
            dailyTraffic
        })
    } catch (err) {
        console.error('getStats error:', err)
        res.status(500).json({ error: err.message })
    }
}
