import mongoose from 'mongoose';

const customDemandSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: String,
  baseMillet: {
    type: String,
    enum: ['Ragi', 'Bajra', 'Jowar', 'Foxtail', 'Multi-Millet'],
    required: true,
  },
  proteinType: {
    type: String,
    enum: ['Whey', 'Pea', 'Soy', 'None'],
    default: 'None',
  },
  sweetener: {
    type: String,
    enum: ['Dates', 'Jaggery', 'Stevia', 'Honey'],
    required: true,
  },
  addIns: [String], // nuts, seeds, chocolate, etc.
  goal: {
    type: String,
    enum: ['Muscle Gain', 'Weight Management', 'Energy Boost', 'Healthy Snacking'],
  },
  customMessage: String,
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Contacted', 'Completed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('CustomDemand', customDemandSchema);
