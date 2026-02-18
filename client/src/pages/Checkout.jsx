import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import MapSelector from '../components/MapSelector'
import axios from 'axios'
import { useAuth } from '../context/AuthContext' 

const Checkout = ({
  cart = [],
  subtotal = 0,
  deliveryFee = 0,
  discountAmount = 0,
  total = 0,
  onOrderSuccess,
}) => {
  const navigate = useNavigate()
  const { user, token, loading } = useAuth() 
  
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })
  
  const [touched, setTouched] = useState({})
  const [placing, setPlacing] = useState(false)
  const [showMap, setShowMap] = useState(false)
  
  // COD default payment method rakha hai
  const [paymentMethod, setPaymentMethod] = useState('COD') 

  // --- useEffect: Auto-fill Form from Context ---
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        addressLine1: user.address?.addressLine1 || prev.addressLine1,
        city: user.address?.city || prev.city,
        state: user.address?.state || prev.state,
        pincode: user.address?.pincode || prev.pincode,
      }))
    }
  }, [user])

  const handleLocationConfirm = async (coords) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      )
      const data = await response.json()
      
      if (data.address) {
        setForm((prev) => ({
          ...prev,
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          pincode: data.address.postcode?.replace(/\s/g, '') || '',
          addressLine2: data.display_name.split(',').slice(0, 2).join(','),
        }))
      }
      setShowMap(false)
    } catch (error) {
      console.error("Geocoding failed", error)
      setShowMap(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  // Validation Logic
  const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
  const errors = {}
  if (!form.fullName?.trim()) errors.fullName = 'Name is required'
  if (!form.phone?.trim()) errors.phone = 'Phone is required'
  if (!form.addressLine1?.trim()) errors.addressLine1 = 'Address is required'
  if (!form.city?.trim()) errors.city = 'City is required'
  if (!form.state?.trim()) errors.state = 'State is required'
  if (!form.pincode?.trim()) errors.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode'

  const isValid = required.every((key) => form[key]?.trim()) && !errors.pincode

  // --- Submit Order Logic (Step 2 Implementation) ---
  const handleSubmit = async (e) => {
  e.preventDefault()
  setTouched({ fullName: true, phone: true, email: true, addressLine1: true, city: true, state: true, pincode: true })
  
  if (!isValid) return
  setPlacing(true)
  
  try {
    const orderPayload = {
      items: cart.map(item => ({
        // FIX: productId key ko explicitly define karo
        productId: item._id || item.productId || item.id, 
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image,
        // Ensure weight exact match ho DB variant se
        weight: item.size || item.weight 
      })),
      shippingAddress: form,
      subtotal,
      deliveryFee,
      discountAmount,
      total,
      paymentMethod: paymentMethod 
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/orders`, 
      orderPayload, 
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    if (response.data.success) {
      if (onOrderSuccess) onOrderSuccess(); 
      navigate('/order-success', { 
        state: { orderId: response.data.orderId, totalAmount: total } 
      });
    }
  } catch (err) {
    console.error("Order placement error:", err)
    alert(err.response?.data?.error || "Failed to place order. Please try again.")
  } finally {
    setPlacing(false)
  }
}

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-stone-600 animate-pulse">Loading your details...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-[60vh] px-4 py-16 text-center">
          <BackButton className="mb-6 mx-auto" />
          <h1 className="text-2xl font-semibold text-stone-900">Your cart is empty</h1>
          <Link to="/products" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white">
            Shop products
          </Link>
      </main>
    )
  }

  const inputClass = (name) =>
    `w-full rounded-xl border px-4 py-3 text-sm transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 ${
      touched[name] && errors[name] ? 'border-red-300 bg-red-50/50' : 'border-stone-200 bg-white'
    }`

  return (
    <main className="min-h-[60vh] bg-stone-50/50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <BackButton className="mb-8" />
        <h1 className="text-3xl font-bold text-stone-900 md:text-4xl">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-10 lg:flex lg:gap-12">
          {/* Left: Shipping Form */}
          <div className="lg:w-[55%]">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Delivery details</h2>
                  <p className="text-sm text-stone-500">Confirm where you want your crunch!</p>
                </div>
                <button type="button" onClick={() => setShowMap(!showMap)} className="text-xs font-bold text-stone-900 underline">
                  {showMap ? "Hide Map" : "Select on Map"}
                </button>
              </div>

              {showMap && (
                <div className="mt-4">
                  <MapSelector onLocationSelect={handleLocationConfirm} onClose={() => setShowMap(false)} />
                </div>
              )}

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Full name *</label>
                  <input name="fullName" type="text" value={form.fullName} onChange={handleChange} onBlur={handleBlur} className={inputClass('fullName')} />
                  {touched.fullName && errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone number *</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur} className={inputClass('phone')} />
                    {touched.phone && errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Email (optional)</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputClass('email')} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Address *</label>
                  <input name="addressLine1" type="text" value={form.addressLine1} onChange={handleChange} onBlur={handleBlur} placeholder="House no., Building, Area" className={inputClass('addressLine1')} />
                  {touched.addressLine1 && errors.addressLine1 && <p className="mt-1 text-xs text-red-600">{errors.addressLine1}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div><label className="mb-1.5 block text-sm font-medium text-stone-700">City *</label><input name="city" type="text" value={form.city} onChange={handleChange} className={inputClass('city')} /></div>
                  <div><label className="mb-1.5 block text-sm font-medium text-stone-700">State *</label><input name="state" type="text" value={form.state} onChange={handleChange} className={inputClass('state')} /></div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Pincode *</label>
                    <input name="pincode" type="text" maxLength={6} value={form.pincode} onChange={handleChange} onBlur={handleBlur} className={inputClass('pincode')} />
                    {touched.pincode && errors.pincode && <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection UI */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">Payment method</h2>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 p-4 border border-stone-900 rounded-xl cursor-pointer bg-stone-50">
                  <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-stone-900 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Cash on Delivery (COD)</p>
                    <p className="text-xs text-stone-500">Pay when you receive the order.</p>
                  </div>
                </label>
                <div className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl opacity-50 cursor-not-allowed">
                  <input type="radio" disabled className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Online Payment / Cards</p>
                    <p className="text-xs text-stone-500">Coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary & Action */}
          <div className="mt-10 lg:mt-0 lg:w-[45%]">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold text-stone-900 border-b pb-4">Order summary</h2>
              <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 text-sm text-stone-900">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-lg border object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-stone-500">Qty: {item.qty} × ₹{item.price}</p>
                    </div>
                    <p className="font-bold">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t pt-6 text-sm">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>₹{Math.round(subtotal)}</span></div>
                <div className="flex justify-between text-stone-600"><span>Delivery Charges</span><span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">Free</span> : `₹${Math.round(deliveryFee)}`}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{Math.round(discountAmount)}</span></div>}
                <div className="flex justify-between border-t border-stone-100 pt-4 text-xl font-black text-stone-900"><span>Total</span><span>₹{Math.round(total)}</span></div>
              </div>

              <button 
                type="submit" 
                disabled={!isValid || placing} 
                className="mt-8 w-full rounded-xl bg-stone-900 py-4 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:bg-stone-400"
              >
                {placing ? 'Processing Order...' : `Confirm Order (COD)`}
              </button>
              <p className="mt-4 text-center text-[10px] text-stone-400">By placing order, you agree to our Terms and Conditions.</p>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Checkout