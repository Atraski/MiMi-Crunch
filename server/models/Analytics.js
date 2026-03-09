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
}, { timestamps: true })

export default mongoose.model('Analytics', analyticsSchema)
