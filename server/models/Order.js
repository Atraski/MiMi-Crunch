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
  totalAmount: Number,
  status: { type: String, default: 'Pending' }, // Pending, Shipped, Delivered
  paymentStatus: { type: String, default: 'COD' } 
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;