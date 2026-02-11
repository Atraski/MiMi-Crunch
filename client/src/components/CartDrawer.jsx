import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FREE_DELIVERY_MIN = 499
const DELIVERY_FEE_AMOUNT = 49

const ProceedButton = ({ onClose }) => {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => {
        onClose?.()
        navigate('/checkout')
      }}
      className="w-full rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Proceed
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
}) => {
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const couponInputRef = useRef(null)
  const couponsSectionRef = useRef(null)

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

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-30">
      <button
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Close cart"
        type="button"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-bold uppercase tracking-wide text-stone-900">
            Your Cart ({cartItemCount})
          </h2>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-700"
            onClick={onClose}
            type="button"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="px-5 py-8">
              <p className="text-sm text-stone-600">Your cart is empty. Add products to see them here.</p>
            </div>
          ) : (
            <div className="space-y-0">
              <div className="bg-stone-900 px-4 py-2.5 text-center text-sm font-medium text-white">
                Delivery in 2–5 days
              </div>

              <div className="mx-4 mt-4 rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-800">
                  Free delivery on orders above ₹{FREE_DELIVERY_MIN}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {freeDeliveryUnlocked ? (
                    <span className="shrink-0 text-emerald-700" aria-label="Unlocked">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-700">₹{moreForFreeDelivery} to go</span>
                  )}
                </div>
              </div>

              {availableCoupons.length > 0 && (
                <button
                  type="button"
                  onClick={() => couponsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center justify-between rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">%</span>
                    {availableCoupons.length} coupon{availableCoupons.length !== 1 ? 's' : ''} available
                  </span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              <div className="space-y-4 px-5 py-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-stone-200" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-stone-900 line-clamp-2">{item.name}</p>
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item)}
                            className="shrink-0 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-red-600"
                            aria-label={`Remove ${item.name}`}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {item.size && <p className="mt-0.5 text-xs text-stone-500">{item.size}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-sm">
                          <button
                            type="button"
                            className="text-stone-600 hover:text-stone-900"
                            onClick={() => onDecreaseQty(item)}
                            aria-label={`Decrease ${item.name}`}
                          >
                            −
                          </button>
                          <span className="min-w-[1.25rem] text-center font-medium text-stone-800">{item.qty}</span>
                          <button
                            type="button"
                            className="text-stone-600 hover:text-stone-900"
                            onClick={() => onIncreaseQty(item)}
                            aria-label={`Increase ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-stone-900">₹{item.price * item.qty}</p>
                      </div>
                    </div>
                  </div>
                ))}

              <div ref={couponsSectionRef} className="border-t border-stone-200 pt-4 px-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">🎟️</span>
                  <h3 className="text-sm font-bold text-stone-900">Apply Coupon</h3>
                </div>
                <p className="mb-3 text-xs text-stone-500">Only one discount applicable at a time.</p>
                {!appliedCoupon ? (
                  <form onSubmit={handleApply} className="mb-4 flex gap-2">
                    <input
                      ref={couponInputRef}
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm placeholder:text-stone-400"
                      aria-label="Coupon code"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponInput.trim()}
                      className="shrink-0 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
                    >
                      {applying ? 'Apply…' : 'Apply'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
                    <span className="font-medium text-emerald-800">{appliedCoupon.code} applied</span>
                    <button type="button" onClick={onRemoveCoupon} className="font-semibold text-orange-600 hover:underline">
                      Remove
                    </button>
                  </div>
                )}
                {couponError ? <p className="mb-3 text-sm text-red-600">{couponError}</p> : null}

                {couponsLoading ? (
                  <p className="text-xs text-stone-500">Loading offers…</p>
                ) : availableCoupons.length > 0 ? (
                  <div className="space-y-2">
                    {availableCoupons.map((coupon) => {
                      const minOrder = coupon.minOrder || 0
                      const isApplicable = sub >= minOrder
                      const isApplied = appliedCoupon?.code === coupon.code
                      return (
                        <div
                          key={coupon.code}
                          className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm ${
                            isApplied
                              ? 'border-emerald-300 bg-emerald-50'
                              : isApplicable
                                ? 'cursor-pointer border-sky-200 bg-sky-50/80 hover:border-sky-300 hover:bg-sky-50'
                                : 'cursor-not-allowed border-stone-200 bg-stone-100 opacity-75'
                          }`}
                          onClick={() => {
                            if (isApplied) return
                            if (isApplicable && !applying) handleApplyCouponByCode(coupon.code)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && isApplicable && !isApplied) {
                              e.preventDefault()
                              handleApplyCouponByCode(coupon.code)
                            }
                          }}
                          role={isApplicable && !isApplied ? 'button' : undefined}
                          tabIndex={isApplicable && !isApplied ? 0 : -1}
                          aria-disabled={!isApplicable}
                        >
                          <span className="mt-0.5 shrink-0 text-base">🎟️</span>
                          <div className="min-w-0 flex-1">
                            <p className={isApplicable ? 'font-medium text-stone-900' : 'text-stone-600'}>
                              {getCouponDescription(coupon)}
                            </p>
                            {!isApplicable && minOrder > 0 && (
                              <p className="mt-1 text-xs text-stone-500">
                                Add ₹{minOrder - sub} more to use this offer
                              </p>
                            )}
                            {isApplied && (
                              <p className="mt-1 text-xs font-medium text-emerald-700">Applied</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              </div>

              <div className="mt-6 border-t border-stone-200 px-5 pb-4 pt-4">
                <h3 className="text-sm font-bold text-stone-900">Price details</h3>
                <p className="mb-3 text-xs text-stone-500">Prices are inclusive of all taxes.</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-700">
                    <span>Total MRP</span>
                    <span>₹{Math.round(subtotal ?? 0)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Coupon discount</span>
                      <span>-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}
                  {!appliedCoupon && discountAmount === 0 && (
                    <div className="flex justify-between text-stone-500">
                      <span>Coupon discount</span>
                      <button type="button" onClick={() => couponInputRef.current?.focus()} className="font-medium text-orange-600 hover:underline">
                        Apply coupon
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-700">
                    <span>Delivery charges</span>
                    <span>{deliveryFee === 0 && (subtotal ?? 0) > 0 ? 'Free' : `₹${Math.round(deliveryFee ?? 0)}`}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-stone-200 bg-stone-900 px-5 py-4 text-white">
            <p className="text-center text-xs font-medium text-stone-300">Unlock more discounts on Checkout</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-stone-400">Estimated total</p>
                <p className="text-xl font-bold">₹{Math.round(total ?? 0)}</p>
                {discountAmount > 0 && (
                  <p className="mt-1 text-sm font-semibold text-emerald-400">You saved ₹{Math.round(discountAmount)}!</p>
                )}
              </div>
              <div className="w-full sm:w-auto sm:min-w-[140px]">
                <ProceedButton onClose={onClose} />
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
