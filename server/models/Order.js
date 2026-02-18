import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Case 1 mein null
  items: [{
    productId: String,
    name: String,
    qty: Number,
    price: Number
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    city: String,
    pincode: String
  },
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  shipmentId: { type: String, default: '' },
  totalAmount: Number,
  paymentMethod: { type: String, default: 'COD' },
  status: { type: String, default: 'Pending' }, // Pending, Shipped, Delivered
  paymentStatus: { type: String, default: 'COD' },
  shippingPartner: {
    partner: { type: String, default: '' },
    synced: { type: Boolean, default: false },
    syncedAt: Date,
    shiprocketOrderId: String,
    shipmentId: String,
    awbCode: String,
    courierName: String,
    pickupRequested: { type: Boolean, default: false },
    pickupRequestedAt: Date,
    pickupStatus: String,
    pickupToken: String,
    lastError: String
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;