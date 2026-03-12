import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductSlugFromCartItem } from '../utils/cartUtils'
import { getOptimizedImage } from '../utils/imageUtils'

const FREE_DELIVERY_MIN = 499

const ProceedButton = ({ onClose }) => {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => {
        onClose?.()
        navigate('/checkout')
      }}
      className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 hover:bg-emerald-700 hover:shadow-xl"
    >
      Proceed to Secure Payment
    </button>
  )
}

const getCouponDescription = (c) => {
  const min = c.minOrder && c.minOrder > 0 ? c.minOrder : 0
  const off =
    c.type === 'percentage'
      ? `upto ${c.value}% OFF`
      : `₹${c.value} off`
  if (min > 0) return `Shop for ₹${min} or more and get ${off}!`
  return `Get ${off}!`
}

const CartDrawer = ({
  open,
  onClose,
  cart,
  subtotal,
  deliveryFee,
  discountAmount,
  total,
  appliedCoupon,
  couponError,
  onApplyCoupon,
  onRemoveCoupon,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
  apiBase,
  cartLimitMessage = '',
}) => {
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const couponInputRef = useRef(null)
  const couponsSectionRef = useRef(null)
  const asideRef = useRef(null)

  const handleViewProduct = (item) => {
    const slug = getProductSlugFromCartItem(item) || item.slug || ''
    if (slug) {
      onClose?.()
      navigate(`/products/${slug}`)
    }
  }

  useEffect(() => {
    if (!open || !apiBase || cart.length === 0) {
      setAvailableCoupons([])
      return
    }
    let cancelled = false
    setCouponsLoading(true)
    fetch(`${apiBase}/api/coupons/available`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setAvailableCoupons(data)
      })
      .catch(() => {
        if (!cancelled) setAvailableCoupons([])
      })
      .finally(() => {
        if (!cancelled) setCouponsLoading(false)
      })
    return () => { cancelled = true }
  }, [open, apiBase, cart.length])

  useEffect(() => {
    if (!open) return

    const scrollY = window.scrollY || window.pageYOffset || 0
    const origBodyPosition = document.body.style.position
    const origBodyTop = document.body.style.top
    const origBodyWidth = document.body.style.width
    const origDocOverflow = document.documentElement.style.overflow

    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.position = origBodyPosition || ''
      document.body.style.top = origBodyTop || ''
      document.body.style.width = origBodyWidth || ''
      document.documentElement.style.overflow = origDocOverflow || ''
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const handleApply = async (e) => {
    e?.preventDefault()
    if (!couponInput.trim() || !onApplyCoupon) return
    setApplying(true)
    await onApplyCoupon(couponInput.trim())
    setApplying(false)
  }

  const handleApplyCouponByCode = async (code) => {
    if (!onApplyCoupon) return
    setApplying(true)
    await onApplyCoupon(code)
    setApplying(false)
  }

  const sub = Math.round(subtotal ?? 0)
  const moreForFreeDelivery =
    subtotal > 0 && subtotal < FREE_DELIVERY_MIN
      ? FREE_DELIVERY_MIN - sub
      : 0
  const cartItemCount = cart.reduce((sum, i) => sum + i.qty, 0)
  const freeDeliveryUnlocked = sub >= FREE_DELIVERY_MIN
  const progressPercent = Math.min(100, (sub / FREE_DELIVERY_MIN) * 100)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <button
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close cart"
        type="button"
      />
      <aside
        ref={asideRef}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#FDFBF7] shadow-2xl z-[210] transition-transform duration-500 ease-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-white px-6 py-5 shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-stone-900">
              Bag <span className="text-emerald-600">({cartItemCount})</span>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Your curated selection</p>
          </div>
          <button
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all hover:bg-red-50 hover:text-red-500"
            onClick={onClose}
            type="button"
            aria-label="Close cart"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar scroll-smooth touch-pan-y"
          data-lenis-prevent
        >
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-10 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-50 text-stone-200">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-stone-900">Hungry for some crunch?</p>
              <p className="mt-2 text-sm text-stone-500">Your cart is feeling a bit lonely. Let's find something delicious!</p>
              <button
                onClick={onClose}
                className="mt-8 rounded-full border border-stone-200 px-8 py-3 text-xs font-black uppercase tracking-widest text-stone-900 hover:bg-stone-900 hover:text-white transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="pb-10 pt-2">
              {/* Notifications / Alerts */}
              {cartLimitMessage ? (
                <div className="mx-6 mb-4 rounded-2xl bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900 border border-amber-100 flex gap-4 items-center">
                  <span className="shrink-0 text-xl">⚠️</span>
                  <p className="leading-tight">{cartLimitMessage}</p>
                </div>
              ) : null}

              {/* Free Delivery Goal */}
              <div className="mx-6 mb-6 rounded-2xl bg-white p-5 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">
                    {freeDeliveryUnlocked ? 'Shipping Unlocked' : 'Shipping goal'}
                  </p>
                  <p className="text-[10px] font-bold text-stone-400">
                    Free Shipping: ₹{FREE_DELIVERY_MIN}
                  </p>
                </div>

                <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-stone-50">
                  <div
                    className={`h-full transition-all duration-700 ease-out rounded-full ${freeDeliveryUnlocked ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-stone-300 to-stone-200'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {freeDeliveryUnlocked ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      You've got Free Delivery!
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-stone-600">
                      Add <span className="font-bold text-stone-900">₹{moreForFreeDelivery}</span> more for free shipping
                    </p>
                  )}
                  <p className="text-[10px] font-black uppercase text-stone-300">Fast Shipping</p>
                </div>
              </div>

              {/* Rewards Teaser */}
              {availableCoupons.length > 0 && !appliedCoupon && (
                <button
                  type="button"
                  onClick={() => couponsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="mx-6 mb-6 flex w-[calc(100%-3rem)] items-center justify-between rounded-2xl bg-stone-900 p-4 shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">✨</div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest text-white">{availableCoupons.length} Exclusive Offer{availableCoupons.length !== 1 ? 's' : ''}</p>
                      <p className="text-[10px] font-medium text-stone-400">Available just for you</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {/* Product List */}
              <div className="px-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Items in your bag</h3>
                </div>
                {cart.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleViewProduct(item)}
                      className="group flex gap-5 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-50 border border-stone-50">
                        {item.image ? (
                          <img src={getOptimizedImage(item.image)} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-stone-200">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-black text-stone-900 line-clamp-2 leading-tight">{item.name}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveItem?.(item)
                              }}
                              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-stone-50 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {item.size && <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">{item.size}</p>}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div
                            className="flex items-center rounded-lg bg-stone-50 p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-md font-bold text-stone-400 hover:bg-white hover:text-stone-900 transition-all disabled:opacity-30"
                              disabled={item.qty <= 1}
                              onClick={(e) => {
                                e.stopPropagation()
                                onDecreaseQty(item)
                              }}
                            >
                              −
                            </button>
                            <span className="min-w-[2rem] text-center text-xs font-black text-stone-950">{item.qty}</span>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-md font-bold text-stone-400 hover:bg-white hover:text-stone-900 transition-all"
                              onClick={(e) => {
                                e.stopPropagation()
                                onIncreaseQty(item)
                              }}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-black text-stone-900">₹{item.price * item.qty}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Coupon Section */}
              <div ref={couponsSectionRef} className="mt-10 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-1.5 w-8 rounded-full bg-stone-200" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Apply Coupon</h3>
                </div>

                {!appliedCoupon ? (
                  <form onSubmit={handleApply} className="group relative flex items-center">
                    <input
                      ref={couponInputRef}
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER PROMO CODE"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-xs font-bold tracking-widest placeholder:text-stone-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-50/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="absolute right-2 rounded-xl bg-stone-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-600 disabled:opacity-30 transition-all"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎉</span>
                      <div>
                        <p className="text-xs font-black text-emerald-800 tracking-widest">{appliedCoupon.code}</p>
                        <p className="text-[10px] font-medium text-emerald-600">Coupon Successfully Applied</p>
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
                {couponError ? <p className="mt-2 ml-4 text-[10px] font-bold text-red-500">{couponError}</p> : null}

                {/* Available Offers */}
                {couponsLoading ? (
                  <div className="mt-4 px-4 py-2 text-[10px] font-bold text-stone-400 animate-pulse tracking-widest uppercase">Fetching best offers...</div>
                ) : availableCoupons.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {availableCoupons.map((coupon) => {
                      const minOrder = coupon.minOrder || 0
                      const isApplicable = sub >= minOrder
                      const isApplied = appliedCoupon?.code === coupon.code
                      return (
                        <div
                          key={coupon.code}
                          onClick={() => {
                            if (isApplied) return
                            if (isApplicable && !applying) handleApplyCouponByCode(coupon.code)
                          }}
                          className={`relative overflow-hidden rounded-2xl border transition-all ${isApplied
                            ? 'border-emerald-500 bg-emerald-50 shadow-inner'
                            : isApplicable
                              ? 'cursor-pointer border-stone-100 bg-white hover:border-emerald-200 hover:shadow-md'
                              : 'cursor-not-allowed border-stone-50 bg-stone-50/10 grayscale opacity-50'
                            } p-4`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`mt-1 h-8 w-8 flex items-center justify-center rounded-lg ${isApplied ? 'bg-emerald-500 text-white' : 'bg-stone-50 text-stone-400'}`}>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-black uppercase tracking-widest ${isApplied ? 'text-emerald-700' : 'text-stone-900'}`}>
                                  {coupon.code}
                                </p>
                                <p className="mt-1 text-xs font-medium text-stone-500 leading-tight">
                                  {getCouponDescription(coupon)}
                                </p>
                                {!isApplicable && (
                                  <p className="mt-2 text-[10px] font-black text-amber-600">
                                    Add ₹{minOrder - sub} for this offer
                                  </p>
                                )}
                              </div>
                            </div>
                            {isApplicable && !isApplied && (
                              <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-colors hover:text-emerald-700">Apply</button>
                            )}
                          </div>
                          {isApplied && (
                            <div className="absolute top-0 right-0 py-1.5 px-3 bg-emerald-500 rounded-bl-xl text-[8px] font-black uppercase text-white tracking-widest">Active</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              {/* Final Invoice Card */}
              <div className="mt-12 px-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-1.5 w-8 rounded-full bg-stone-200" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Billing details</h3>
                </div>

                <div className="rounded-3xl border border-stone-100 bg-white p-6 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-stone-500">Order Subtotal</span>
                    <span className="font-bold text-stone-900">₹{Math.round(subtotal ?? 0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-emerald-600">Coupon Discount</span>
                      <span className="font-bold text-emerald-600 underline decoration-emerald-200 decoration-4 underline-offset-4">-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-stone-500">Service Fee & Shipping</span>
                    <span className="font-bold text-stone-900">
                      {deliveryFee === 0 && (subtotal ?? 0) > 0 ? (
                        <span className="text-emerald-600 uppercase text-[10px] font-black tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
                      ) : (
                        `₹${Math.round(deliveryFee ?? 0)}`
                      )}
                    </span>
                  </div>
                  <div className="h-px bg-stone-50" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-black text-stone-900">Estimated Total</span>
                    <span className="text-xl font-black text-stone-950 tracking-tight">₹{Math.round(total ?? 0)}</span>
                  </div>
                </div>

                <p className="mt-4 px-4 text-center text-[10px] font-medium text-stone-400">
                  Prices include GST. Final total calculated on checkout page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Footer */}
        {cart.length > 0 && (
          <div className="border-t border-stone-100 bg-white px-6 py-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
            <div className="mb-5 flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total to pay</p>
                {discountAmount > 0 && (
                  <div className="rounded-full bg-emerald-100 px-3 py-0.5 text-[8px] font-black uppercase text-emerald-700 tracking-widest animate-pulse">
                    You Saved ₹{Math.round(discountAmount)}
                  </div>
                )}
              </div>
              <p className="text-3xl font-black text-stone-950 tracking-tight">₹{Math.round(total ?? 0)}</p>
            </div>

            <ProceedButton onClose={onClose} />
          </div>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
