import { useEffect, useState } from 'react'
import { buildShiprocketCheckoutCartItems } from '../utils/shiprocketIds'

/**
 * Shiprocket Checkout (iframe / HeadlessCheckout) — loads UI assets then opens checkout with server token.
 */
export default function ShiprocketCheckoutButton({
  cart = [],
  products = [],
  apiBase = '',
  sellerDomain,
  redirectUrl,
  fallbackUrl = '/',
  className = '',
  children = 'Checkout with Shiprocket',
  disabled = false,
}) {
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const domain =
    sellerDomain ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHIPROCKET_SELLER_DOMAIN) ||
    'www.mimicrunch.com'

  const siteOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env?.VITE_SITE_URL || ''

  useEffect(() => {
    let linkEl
    let scriptEl
    let cancelled = false

    linkEl = document.createElement('link')
    linkEl.rel = 'stylesheet'
    linkEl.href = 'https://checkout-ui.shiprocket.com/assets/styles/shopify.css'
    document.head.appendChild(linkEl)

    scriptEl = document.createElement('script')
    scriptEl.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js'
    scriptEl.async = true
    scriptEl.onload = () => {
      if (!cancelled) setScriptLoaded(true)
    }
    scriptEl.onerror = () => {
      if (!cancelled) setScriptLoaded(false)
    }
    document.body.appendChild(scriptEl)

    return () => {
      cancelled = true
      try {
        linkEl?.remove()
      } catch {
        /* ignore */
      }
      try {
        scriptEl?.remove()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!scriptLoaded || typeof window === 'undefined') {
      window.alert?.('Checkout is still loading. Please try again in a moment.')
      return
    }
    const cartItems = buildShiprocketCheckoutCartItems(cart, products)
    if (cartItems.length === 0) {
      window.alert?.('Could not match cart items to catalog. Refresh and try again.')
      return
    }

    const base =
      apiBase ||
      (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

    setLoading(true)
    try {
      const res = await fetch(`${base}/api/shiprocket/access-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          redirectUrl:
            redirectUrl ||
            `${siteOrigin}/order-success`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) {
        const hint =
          typeof data.detail === 'object'
            ? JSON.stringify(data.detail).slice(0, 240)
            : typeof data.detail === 'string'
              ? data.detail.slice(0, 320)
              : ''
        throw new Error(
          [data.error || `HTTP ${res.status}`, hint && `Shiprocket: ${hint}`]
            .filter(Boolean)
            .join(' — '),
        )
      }

      let domainInput = document.getElementById('sellerDomain')
      if (!domainInput) {
        domainInput = document.createElement('input')
        domainInput.type = 'hidden'
        domainInput.id = 'sellerDomain'
        document.body.appendChild(domainInput)
      }
      domainInput.value = domain

      const HC = window.HeadlessCheckout
      if (!HC?.addToCart) {
        throw new Error('Shiprocket checkout script not ready')
      }
      HC.addToCart(e.nativeEvent, data.token, {
        fallbackUrl: fallbackUrl || '/',
      })
    } catch (err) {
      console.error('Shiprocket checkout error:', err)
      window.alert?.('Could not start Shiprocket checkout. Try again or use standard checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading || !scriptLoaded || cart.length === 0}
      className={className || 'w-full rounded-2xl border border-stone-300 bg-white py-3 text-sm font-bold text-stone-900 transition hover:bg-stone-50 disabled:opacity-50'}
    >
      {loading ? 'Opening checkout…' : scriptLoaded ? children : 'Loading checkout…'}
    </button>
  )
}
