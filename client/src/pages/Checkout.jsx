import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import MapSelector from '../components/MapSelector'
import PhoneOTPVerify from '../components/PhoneOTPVerify'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  getProductSlugFromCartItem,
  getCartWeightKgForProduct,
  getCartTotalShippingWeightKg,
  parseWeightToKg,
  MAX_WEIGHT_PER_PRODUCT_KG,
} from '../utils/cartUtils'
import { getOptimizedImage } from '../utils/imageUtils'
import { load } from '@cashfreepayments/cashfree-js'
import toast from 'react-hot-toast'
import { buildMetaContentsFromCart, trackMetaEvent } from '../utils/metaPixel'

const getCouponDescription = (c) => {
  const min = c.minOrder && c.minOrder > 0 ? c.minOrder : 0
  const off = c.type === 'percentage' ? `upto ${c.value}% OFF` : `₹${c.value} off`
  if (min > 0) return `Shop for ₹${min} or more and get ${off}!`
  return `Get ${off}!`
}

const Checkout = ({
  cart = [],
  products = [],
  subtotal = 0,
  deliveryFee = 0,
  onDeliveryFeeChange = () => {},
  discountAmount = 0,
  total = 0,
  onOrderSuccess,
  onAddToCart,
  appliedCoupon = null,
  couponError = '',
  onApplyCoupon,
  onRemoveCoupon,
  apiBase = '',
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
  const [shippingQuoteLoading, setShippingQuoteLoading] = useState(false)
  const [shippingQuoteHint, setShippingQuoteHint] = useState('')

  const shipWeightKg = useMemo(() => getCartTotalShippingWeightKg(cart), [cart])
  const apiOrigin = useMemo(
    () =>
      apiBase ||
      (import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'),
    [apiBase],
  )

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const hasTrackedInitiateCheckout = useMemo(
    () => `init_checkout_${cart.map((item) => `${item.id}:${item.qty}`).join('|')}`,
    [cart],
  )

  useEffect(() => {
    if (!cart.length) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(hasTrackedInitiateCheckout)) return
    trackMetaEvent('InitiateCheckout', {
      content_type: 'product',
      contents: buildMetaContentsFromCart(cart),
      num_items: cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
      value: Number(total) || 0,
      currency: 'INR',
    })
    sessionStorage.setItem(hasTrackedInitiateCheckout, '1')
  }, [cart, total, hasTrackedInitiateCheckout])

  // Fetch available coupons on mount
  useEffect(() => {
    if (!apiBase || cart.length === 0) return
    let cancelled = false
    setCouponsLoading(true)
    fetch(`${apiBase}/api/coupons/available`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled && Array.isArray(data)) setAvailableCoupons(data) })
      .catch(() => { if (!cancelled) setAvailableCoupons([]) })
      .finally(() => { if (!cancelled) setCouponsLoading(false) })
    return () => { cancelled = true }
  }, [apiBase, cart.length])

  const handleApplyCouponInput = async (e) => {
    e?.preventDefault()
    if (!couponInput.trim() || !onApplyCoupon) return
    setApplying(true)
    await onApplyCoupon(couponInput.trim())
    setApplying(false)
    setCouponInput('')
  }

  const handleApplyCouponByCode = async (code) => {
    if (!onApplyCoupon) return
    setApplying(true)
    await onApplyCoupon(code)
    setApplying(false)
  }

  // OTP phone verification state
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verifiedPhone, setVerifiedPhone] = useState('')

  // Online payment default (COD disabled)
  const [paymentMethod, setPaymentMethod] = useState('ONLINE')

  // --- Dynamic Recommendations Logic ---
  const [recommendations, setRecommendations] = useState([])
  useEffect(() => {
    if (!products || products.length === 0) return
    // Cart products ke slugs find karo
    const cartSlugs = new Set(cart.map(item => getProductSlugFromCartItem(item)))
    // Catalog se wo products lo jo cart mein nahi hain
    const available = products.filter(p => !cartSlugs.has(p.slug))
    // Shuffle karke randomly 4 pick karo
    const shuffled = [...available].sort(() => 0.5 - Math.random())
    setRecommendations(shuffled.slice(0, 4))
  }, [products, cart.length]) // jab products load honge ya cart size change hogi

  // --- Out of stock & weight limit validation (using latest products) ---
  const { outOfStockItemIds, overLimitProductSlugs, canPlaceOrder } = useMemo(() => {
    const outIds = new Set()
    const overSlugs = new Set()
    const productBySlug = new Map((products || []).map((p) => [p.slug, p]))
    for (const item of cart) {
      const slug = getProductSlugFromCartItem(item)
      const product = productBySlug.get(slug)
      const weightStr = item.size || item.weight || ''
      const weightKg = parseWeightToKg(weightStr)
      const totalWeightForProduct = getCartWeightKgForProduct(cart, slug)
      if (totalWeightForProduct > MAX_WEIGHT_PER_PRODUCT_KG) overSlugs.add(slug)
      const wNorm = (w) => (w || '').trim().toLowerCase()
      const variant = product?.variants?.find((v) => wNorm(v.weight) === wNorm(weightStr))
      const stock = variant?.stock ?? 0
      if (stock < (item.qty || 0)) outIds.add(item.id)
    }
    const canPlace = outIds.size === 0 && overSlugs.size === 0
    return {
      outOfStockItemIds: outIds,
      overLimitProductSlugs: overSlugs,
      canPlaceOrder: canPlace,
    }
  }, [cart, products])

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
  const required = ['fullName', 'addressLine1', 'city', 'state', 'pincode']
  const errors = {}
  if (!form.fullName?.trim()) errors.fullName = 'Name is required'
  if (!phoneVerified) errors.phone = 'Phone verification required'
  if (!form.addressLine1?.trim()) errors.addressLine1 = 'Address is required'
  if (!form.city?.trim()) errors.city = 'City is required'
  if (!form.state?.trim()) errors.state = 'State is required'
  if (!form.pincode?.trim()) errors.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode'

  const isValid = required.every((key) => form[key]?.trim()) && !errors.pincode && phoneVerified

  const pinTrim = form.pincode?.trim() ?? ''

  useEffect(() => {
    if (!onDeliveryFeeChange) return
    if (!/^\d{6}$/.test(pinTrim)) {
      onDeliveryFeeChange(0)
      setShippingQuoteHint('')
      setShippingQuoteLoading(false)
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setShippingQuoteLoading(true)
      try {
        const q = new URLSearchParams({
          delivery_postcode: pinTrim,
          weight: String(shipWeightKg),
          cod: '0',
        })
        const res = await fetch(`${apiOrigin}/api/shipping/quote?${q}`)
        const data = await res.json()
        if (cancelled) return
        if (data.ok && typeof data.deliveryFee === 'number') {
          onDeliveryFeeChange(Math.round(data.deliveryFee))
          setShippingQuoteHint(data.courierName ? `Shiprocket · ${data.courierName}` : '')
        } else {
          onDeliveryFeeChange(0)
          setShippingQuoteHint(
            data.configured === false
              ? 'Add warehouse pincode on server for live rates.'
              : typeof data.error === 'string'
                ? data.error
                : 'Could not get shipping for this pincode.',
          )
        }
      } catch {
        if (!cancelled) {
          onDeliveryFeeChange(0)
          setShippingQuoteHint('Could not load shipping. Try again.')
        }
      } finally {
        if (!cancelled) setShippingQuoteLoading(false)
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [pinTrim, shipWeightKg, apiOrigin, onDeliveryFeeChange])

  // --- Submit Order Logic (Step 2 Implementation) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, phone: true, email: true, addressLine1: true, city: true, state: true, pincode: true });
    
    if (!phoneVerified) {
      toast.error('Phone verify karo pehle order place karne ke liye.');
      return;
    }
    if (!isValid) {
      const missing = required.filter(k => !form[k]?.trim());
      const labelMap = { fullName: 'Full Name', addressLine1: 'Address', city: 'City', state: 'State', pincode: 'Pincode' };
      toast.error(`Please provide your ${labelMap[missing[0]] || 'delivery details'}.`);
      return;
    }
    if (!canPlaceOrder) {
      toast.error('Some items in your cart are currently unavailable.');
      return;
    }
    setPlacing(true);
    const toastId = toast.loading("Processing your order...");
    console.log("Starting order placement...", { paymentMethod, total });

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productId: item._id || item.productId || item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
          weight: item.size || item.weight,
        })),
        shippingAddress: form,
        subtotal,
        deliveryFee,
        discountAmount,
        total,
        paymentMethod: paymentMethod,
        phoneVerified,
        verifiedPhone: verifiedPhone || form.phone,
      }

      const response = await fetch(`${apiOrigin}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      console.log("Order response:", data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

        if (data.paymentRequired && data.sessionId) {
          toast.success("Order initiated. Redirecting to payment...", { id: toastId });
          // Localhost = always sandbox so real money is never deducted
          const isLocalhost =
            typeof window !== "undefined" &&
            /localhost|127\.0\.0\.1/.test(window.location.origin || "");
          const cfMode =
            !isLocalhost &&
            (import.meta.env.VITE_CASHFREE_MODE === "production" || import.meta.env.PROD)
              ? "production"
              : "sandbox";
          try {
            const cashfree = await load({ mode: cfMode });
            await cashfree.checkout({
              paymentSessionId: data.sessionId,
              redirectTarget: "_self",
            });
          } catch (cfErr) {
            console.error("Cashfree Checkout Error:", cfErr);
            const msg =
              cfErr?.message?.includes("session") ||
              cfErr?.message?.includes("invalid")
                ? "Payment session expired or invalid. Please try again."
                : cfErr?.message && cfErr.message.length < 80
                  ? cfErr.message
                  : "Could not load payment gateway. Please try again.";
            toast.error(msg, { id: toastId });
            setPlacing(false);
          }
          return;
        }

        toast.success("Order placed successfully!", { id: toastId });
        if (onOrderSuccess) onOrderSuccess();
        navigate('/order-success', {
          state: { orderId: data.orderId, totalAmount: total }
        });
    } catch (err) {
      console.error("Order placement error:", err);
      toast.error(err.message || "Failed to place order. Please try again.", { id: toastId });
    } finally {
      setPlacing(false);
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
      <main className="min-h-[60vh] px-2 py-16 text-center">
        <BackButton className="mb-6 mx-auto" />
        <h1 className="text-2xl font-semibold text-stone-900">Your cart is empty</h1>
        <Link to="/products" className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white">
          Shop products
        </Link>
      </main>
    )
  }

  const inputClass = (name) =>
    `w-full rounded-xl border px-4 py-3 text-sm transition placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 ${touched[name] && errors[name] ? 'border-red-300 bg-red-50/50' : 'border-stone-200 bg-white'
    }`

  return (
    <main className="min-h-[60vh] bg-stone-50/50 px-2 py-10 md:py-16">
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
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Email (optional)</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputClass('email')} />
                  </div>
                </div>

                {/* Phone OTP Verification */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    Phone number *{' '}
                    {phoneVerified && (
                      <span className="ml-1 text-xs font-bold text-emerald-600">Verified ✅</span>
                    )}
                  </label>
                  <PhoneOTPVerify
                    apiBase={apiOrigin}
                    onVerified={(phone) => {
                      setPhoneVerified(true)
                      setVerifiedPhone(phone)
                      setForm((prev) => ({ ...prev, phone }))
                    }}
                  />
                  {touched.phone && !phoneVerified && (
                    <p className="mt-1 text-xs text-red-600">Phone verification required to place order</p>
                  )}
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
                <label className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl cursor-not-allowed bg-stone-50 opacity-60">
                  <input type="radio" disabled checked={paymentMethod === 'COD'} className="accent-stone-900 h-4 w-4" />
                  <div className="flex-1 text-stone-400">
                    <p className="text-sm font-bold">Cash on Delivery (COD)</p>
                    <p className="text-xs italic">Currently Unavailable</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 bg-white hover:border-stone-400'}`}>
                  <input type="radio" checked={paymentMethod === 'ONLINE'} onChange={() => setPaymentMethod('ONLINE')} className="accent-stone-900 h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">Online Payment / Cards</p>
                    <p className="text-xs text-stone-500">Pay via UPI, Cards, Netbanking etc.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Summary & Action */}
          <div className="mt-10 lg:mt-0 lg:w-[45%]">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold text-stone-900 border-b pb-4">Order summary</h2>
              {(outOfStockItemIds.size > 0 || overLimitProductSlugs.size > 0) && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  {outOfStockItemIds.size > 0 && (
                    <p className="font-medium">Some items in your cart are out of stock. Remove them to place the order.</p>
                  )}
                  {overLimitProductSlugs.size > 0 && (
                    <p className="font-medium mt-1">Some products exceed the maximum allowed per product. Reduce quantity to continue.</p>
                  )}
                </div>
              )}
              <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => {
                  const isOutOfStock = outOfStockItemIds.has(item.id)
                  return (
                    <div key={item.id} className={`flex gap-4 text-sm ${isOutOfStock ? 'text-red-700 opacity-90' : 'text-stone-900'}`}>
                      <img src={getOptimizedImage(item.image)} alt="" className="h-14 w-14 rounded-lg border object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-stone-500">Qty: {item.qty} × ₹{item.price}</p>
                        {isOutOfStock && <p className="text-xs font-semibold text-red-600 mt-1">Out of stock — remove to continue</p>}
                      </div>
                      <p className="font-bold">₹{item.price * item.qty}</p>
                    </div>
                  )
                })}
              </div>

              {/* Coupon Section */}
              <div className="mt-5 border-t pt-5">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">Apply Coupon</p>

                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCouponInput} className="relative flex items-center">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER PROMO CODE"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold tracking-widest placeholder:text-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="absolute right-2 rounded-lg bg-stone-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 disabled:opacity-30 transition-all"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <div>
                        <p className="text-xs font-black tracking-widest text-emerald-800">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-600">Coupon Applied! Saving ₹{Math.round(discountAmount)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {!appliedCoupon && couponError && (
                  <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500">{couponError}</p>
                )}

                {/* Available Offers */}
                {couponsLoading ? (
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 animate-pulse">Fetching offers...</p>
                ) : availableCoupons.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {availableCoupons.filter(c => c.code !== 'FREESHIP').map((coupon) => {
                      const minOrder = coupon.minOrder || 0
                      const isApplicable = Math.round(subtotal) >= minOrder
                      const isApplied = appliedCoupon?.code === coupon.code
                      return (
                        <div
                          key={coupon.code}
                          onClick={() => {
                            if (isApplied || !isApplicable || applying) return
                            handleApplyCouponByCode(coupon.code)
                          }}
                          className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                            isApplied
                              ? 'border-emerald-400 bg-emerald-50'
                              : isApplicable
                              ? 'cursor-pointer border-stone-100 bg-white hover:border-emerald-200 hover:shadow-sm'
                              : 'cursor-not-allowed border-stone-100 bg-stone-50 opacity-50 grayscale'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className={`text-xs font-black uppercase tracking-widest ${isApplied ? 'text-emerald-700' : 'text-stone-900'}`}>
                                {coupon.code}
                              </p>
                              <p className="mt-0.5 text-[10px] text-stone-500">{getCouponDescription(coupon)}</p>
                              {!isApplicable && (
                                <p className="mt-1 text-[10px] font-bold text-amber-600">Add ₹{minOrder - Math.round(subtotal)} more for this offer</p>
                              )}
                            </div>
                            {isApplicable && !isApplied && (
                              <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600">Tap to Apply</span>
                            )}
                            {isApplied && (
                              <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">Active</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 space-y-3 border-t pt-5 text-sm">
                <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>₹{Math.round(subtotal)}</span></div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery (Shiprocket)</span>
                  <span className="text-right font-medium text-stone-800">
                    {shippingQuoteLoading
                      ? 'Calculating…'
                      : deliveryFee === 0
                        ? <span className="text-emerald-600 font-bold">Free</span>
                        : `₹${Math.round(deliveryFee)}`}
                  </span>
                </div>
                {shippingQuoteHint ? (
                  <p className="text-[10px] leading-snug text-stone-500">{shippingQuoteHint}</p>
                ) : null}
                {discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>Coupon Discount</span><span>-₹{Math.round(discountAmount)}</span></div>}
                <div className="flex justify-between border-t border-stone-100 pt-4 text-xl font-black text-stone-900"><span>Total</span><span>₹{Math.round(total)}</span></div>
              </div>

              <button
                type="submit"
                disabled={placing || !canPlaceOrder || !phoneVerified}
                className="mt-8 w-full rounded-xl bg-stone-900 py-4 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:bg-stone-400"
              >
                {placing
                  ? 'Processing Order...'
                  : !phoneVerified
                  ? 'Pehle Phone Verify Karo 📱'
                  : paymentMethod === 'COD'
                  ? 'Confirm Order (COD)'
                  : 'Pay Now & Confirm'}
              </button>
              {!phoneVerified && !placing && (
                <p className="mt-2 text-xs text-amber-600 text-center font-medium">
                  Phone verify karna zaroori hai order place karne ke liye
                </p>
              )}
              {!canPlaceOrder && (outOfStockItemIds.size > 0 || overLimitProductSlugs.size > 0) && (
                <p className="mt-2 text-xs text-red-600 text-center">Fix cart issues above to place order.</p>
              )}
              <p className="mt-4 text-center text-[10px] text-stone-400">By placing order, you agree to our Terms and Conditions.</p>
            </div>
          </div>
        </form>

        {/* You May Also Like Section */}
        {recommendations.length > 0 && (
          <section className="mt-20 border-t border-stone-200 pt-20">
            <div className="mb-12 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5B041]">Don't Miss Out</span>
              <h2 className="mt-3 text-3xl font-[Fraunces] font-medium text-[#1B3B26] md:text-5xl">You may also like</h2>
              <p className="mt-2 text-stone-500">Perfect additions to your superfood collection.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((p) => (
                <div
                  key={p._id}
                  className="group flex flex-col rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm transition hover:-translate-y-2 hover:shadow-xl p-4"
                >
                  <Link to={`/products/${p.slug}`} className="relative aspect-square overflow-hidden rounded-[2rem] bg-stone-100">
                    <img
                      src={getOptimizedImage(p.image)}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 to-transparent" />
                  </Link>

                  <div className="mt-5 flex-1 px-1">
                    <div className="flex items-center justify-between gap-2">
                       <h3 className="line-clamp-1 text-base font-[Fraunces] font-medium text-[#1B3B26]">
                        {p.name}
                      </h3>
                      <span className="shrink-0 text-sm font-black text-[#1B3B26]">₹{p.price}</span>
                    </div>
                    {p.size && (
                      <p className="text-[10px] font-bold text-stone-400 mt-1">{p.size}</p>
                    )}
                    
                    <button
                      type="button"
                      onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect()
                         const pos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
                         onAddToCart?.(p, pos)
                         toast.success(`${p.name} added to cart!`, {
                           position: 'bottom-right',
                         })
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B3B26] py-3 text-[10px] font-black uppercase tracking-widest text-[#F5B041] transition-all hover:bg-[#2A5237] active:scale-95"
                    >
                      <span>+</span> Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default Checkout