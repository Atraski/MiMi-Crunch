import mongoose from 'mongoose';

const ORDER_SEQ_START = 100000;

const orderCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: ORDER_SEQ_START },
}, { _id: true });

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

/**
 * Get next order sequence (100000, 100001, ...) atomically.
 */
export const getNextOrderSequence = async () => {
  await OrderCounter.findOneAndUpdate(
    { _id: 'order' },
    { $setOnInsert: { seq: ORDER_SEQ_START - 1 } },
    { upsert: true }
  );
  const doc = await OrderCounter.findByIdAndUpdate(
    'order',
    { $inc: { seq: 1 } },
    { new: true }
  );
  return doc.seq;
};

export default OrderCounter;
