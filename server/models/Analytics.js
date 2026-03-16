import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema({
    visitorId: { type: String, required: true, unique: true },
    source: {
        type: String,
        enum: ['google', 'facebook', 'instagram', 'direct', 'other'],
        default: 'direct'
    },
    firstVisit: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    pageViews: { type: Number, default: 1 },
    totalTimeSpent: { type: Number, default: 0 }, // in seconds
    referrerUrl: { type: String },
    keyword: { type: String },
    deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet', 'unknown'], default: 'unknown' }
}, { timestamps: true })

export default mongoose.model('Analytics', analyticsSchema)
