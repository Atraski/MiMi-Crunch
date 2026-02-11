import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import MapSelector from '../components/MapSelector'
import axios from 'axios'
import { useAuth } from '../context/AuthContext' // AuthContext ko import kiya

const Checkout = ({
  cart = [],
  subtotal = 0,
  deliveryFee = 0,
  discountAmount = 0,
  total = 0,
}) => {
  const navigate = useNavigate()
  const { user, token, loading } = useAuth() // Context se data uthaya
  
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

  // --- useEffect: Auto-fill Form from Context ---
  useEffect(() => {
    // Jaise hi user data load ho, form fill kar do
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ fullName: true, phone: true, email: true, addressLine1: true, city: true, state: true, pincode: true })
    
    if (!isValid) return
    setPlacing(true)
    
    try {
      const orderPayload = {
        userId: user?._id || null, 
        items: cart.map(item => ({
          productId: item.id || item._id, 
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image
        })),
        shippingAddress: form,
        subtotal,
        deliveryFee,
        discountAmount,
        total,
        paymentMethod: 'COD'
      }

      // Token header mein bhej rahe hain
      const response = await axios.post('/api/orders', orderPayload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (response.data.success) {
        navigate('/order-success', { state: { orderId: response.data.orderId } })
      }
    } catch (err) {
      console.error("Order placement error:", err)
      alert(err.response?.data?.error || "Failed to place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  // Refresh ke waqt loading state handle karo
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium text-stone-600">Loading your details...</p>
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
          <div className="lg:w-[55%]">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Delivery details</h2>
                  <p className="text-sm text-stone-500">Auto-filled from your profile.</p>
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
                  <input name="addressLine1" type="text" value={form.addressLine1} onChange={handleChange} onBlur={handleBlur} placeholder="House / flat no., building, street" className={inputClass('addressLine1')} />
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
          </div>

          <div className="mt-10 lg:mt-0 lg:w-[45%]">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold text-stone-900">Order summary</h2>
              <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 text-sm text-stone-900">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-lg border object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-stone-600">Qty: {item.qty} × ₹{item.price}</p>
                    </div>
                    <p className="font-semibold">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>₹{Math.round(subtotal)}</span></div>
                <div className="flex justify-between text-stone-600"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `₹${Math.round(deliveryFee)}`}</span></div>
                <div className="flex justify-between border-t pt-3 text-base font-bold text-stone-900"><span>Total</span><span>₹{Math.round(total)}</span></div>
              </div>

              <button type="submit" disabled={!isValid || placing} className="mt-6 w-full rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white disabled:opacity-50">
                {placing ? 'Placing order…' : 'Place order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Checkout