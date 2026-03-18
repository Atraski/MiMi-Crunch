import { useEffect, useMemo, useRef, useState } from 'react'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Header from './components/Header'
import MobileHeader from './components/MobileHeader'
import MobileNavbar from './components/MobileNavbar'
import Loader from './components/Loader'
import PageWrapper from './components/PageWrapper'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import FlyToCart from './components/FlyToCart'
import ProfileReminder from './components/ProfileReminder'
import CustomCursor from './components/CustomCursor'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import NewsPage from './pages/NewsPage'
import BuildYourOwnProtein from './pages/BuildYourOwnProtein'
import BlogDetail from './pages/BlogDetail'
import ProductDetail from './pages/ProductDetail'
import Products from './pages/Products'
import ProductsTest from './pages/ProductsTest'
import RecipesPage from './pages/RecipesPage'
import RecipeDetail from './pages/RecipeDetail'
import { products as fallbackProducts } from './data/homeData'
import ShippingReturns from './pages/ShippingReturns'
import PolicyPage from './pages/PolicyPage'
import TermsConditions from './pages/TermsConditions'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import Checkout from './pages/Checkout'
import Lenis from 'lenis'
import OrderSuccess from './pages/OrderSuccess'
import { getProductSlugFromCartItem, wouldExceedWeightLimit } from './utils/cartUtils'
import { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const hasTrackedInitialPageView = useRef(false)

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0)
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    }
    
    // Fallback for async content/layouts
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
    }, 10)
    
    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true
      return
    }

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [location.pathname, location.search, location.hash])

  // Analytics Tracking
  useEffect(() => {
    let visitorId = sessionStorage.getItem('mimi_visitor_id')
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('mimi_visitor_id', visitorId)
    }

    const recordVisit = async () => {
      try {
        const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        await fetch(`${API_BASE}/api/analytics/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            source: document.referrer || 'direct',
            path: window.location.pathname,
            deviceType
          })
        })
      } catch (err) { }
    }

    recordVisit()
  }, [location.pathname]) // Record view on every route change

  useEffect(() => {
    const visitorId = sessionStorage.getItem('mimi_visitor_id')
    if (!visitorId) return

    const sendPing = () => {
      fetch(`${API_BASE}/api/analytics/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
        keepalive: true // Important for cleanup pings
      }).catch(() => { })
    }

    const intervalId = setInterval(sendPing, 30000)
    
    // Also ping when user leaves or changes tab to capture last few seconds
    window.addEventListener('beforeunload', sendPing)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('beforeunload', sendPing)
      sendPing() // Final ping on component unmount
    }
  }, [])

  // Restore initial state from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('mimi_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (err) {
      console.error("Cart load error:", err)
      return []
    }
  })

  // Persist cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('mimi_cart', JSON.stringify(cart))
  }, [cart])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [cartLimitMessage, setCartLimitMessage] = useState('')
  const [products, setProducts] = useState(fallbackProducts)
  const [isProductsLoading, setIsProductsLoading] = useState(false)
  const [collections, setCollections] = useState([])
  const [blogs, setBlogs] = useState([])
  const [homeRecipes, setHomeRecipes] = useState([])
  const [flyingItem, setFlyingItem] = useState(null)
  const [flyingPos, setFlyingPos] = useState(null)
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const SCROLL_THRESHOLD = 10
    const tick = () => {
      const y = window.scrollY
      if (y <= 30) {
        setHeaderVisible(true)
      } else if (y > lastScrollY.current && y - lastScrollY.current > SCROLL_THRESHOLD) {
        setHeaderVisible(false)
      } else if (lastScrollY.current > y && lastScrollY.current - y > SCROLL_THRESHOLD) {
        setHeaderVisible(true)
      }
      lastScrollY.current = y
    }
    const onScroll = () => requestAnimationFrame(tick)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleCartCleared = () => {
      setCart([])
      localStorage.removeItem('mimi_cart')
    }

    window.addEventListener('mimi-cart-cleared', handleCartCleared)
    return () => window.removeEventListener('mimi-cart-cleared', handleCartCleared)
  }, [])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    
    // Make lenis accessible globally for programmatic scrolling
    window.lenis = lenis

    let rafId = 0
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      window.lenis = null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async (showLoading) => {
      if (showLoading) {
        setIsProductsLoading(true)
      }
      try {
        const res = await fetch(`${API_BASE}/api/products?active=true`)
        if (!res.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await res.json()
        const mapped = data.map((item) => {
          const derivedVariants =
            item.variants?.length
              ? item.variants.map((v) => ({
                ...v,
                weight: v.weight,
                price: v.price ?? item.price,
                stock: v.stock ?? 0,
                images: v.images || item.images || [],
              }))
              : item.weightOptions?.length
                ? item.weightOptions.map((weight) => ({
                  weight,
                  price: item.price,
                  images: item.images || [],
                  stock: 0,
                }))
                : []
          const firstVariant = derivedVariants[0]
          return {
            _id: item._id,
            name: item.name,
            slug: item.slug,
            size: firstVariant?.weight || item.weight,
            desc: item.description,
            price: firstVariant?.price ?? item.price,
            collection: item.collection,
            tags: item.tags || [],
            image: firstVariant?.images?.[0] || item.images?.[0] || '',
            images: firstVariant?.images?.length ? firstVariant.images : item.images || [],
            variants: derivedVariants,
            benefits: item.benefits,
            trust: item.trust,
            faqContent: item.faqContent,
            faqs: item.faqs,
          }
        })
        if (isMounted && mapped.length) {
          setProducts(mapped)
        }
      } catch (err) {
        if (isMounted) {
          setProducts(fallbackProducts)
        }
      } finally {
        if (showLoading) {
          setIsProductsLoading(false)
        }
      }
    }

    const loadCollections = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/collections`)
        if (!res.ok) {
          throw new Error('Failed to fetch collections')
        }
        const data = await res.json()
        if (isMounted && Array.isArray(data)) {
          setCollections(data)
        }
      } catch (err) {
        if (isMounted) {
          setCollections([])
        }
      }
    }

    const loadBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/blogs?published=true`)
        if (!res.ok) {
          throw new Error('Failed to fetch blogs')
        }
        const data = await res.json()
        if (isMounted && Array.isArray(data)) {
          setBlogs(data)
        }
      } catch (err) {
        if (isMounted) {
          setBlogs([])
        }
      }
    }

    const loadRecipes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/recipes?published=true`)
        if (!res.ok) {
          throw new Error('Failed to fetch recipes')
        }
        const data = await res.json()
        if (isMounted && Array.isArray(data)) {
          // Keep just a few for the homepage section
          setHomeRecipes(data.slice(0, 3))
        }
      } catch (err) {
        if (isMounted) {
          setHomeRecipes([])
        }
      }
    }

    loadProducts(true)
    loadCollections()
    loadBlogs()
    loadRecipes()

    const interval = setInterval(() => {
      loadProducts(false)
      loadCollections()
      loadBlogs()
      loadRecipes()
    }, 30000)

    const source = new EventSource(`${API_BASE}/api/products/stream`)
    source.addEventListener('products', () => {
      loadProducts(false)
      loadCollections()
      loadBlogs()
      loadRecipes()
    })
    source.onerror = () => {
      source.close()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts(false)
        loadCollections()
        loadBlogs()
        loadRecipes()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      clearInterval(interval)
      source.close()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const buildCartId = (product) => {
    const base = product.slug ?? product.id
    const weight = product.size ?? product.selectedVariant?.weight
    if (!base) {
      return ''
    }
    return weight ? `${base}:${weight}` : base
  }

  const [pendingCartUpdate, setPendingCartUpdate] = useState(null)

  const handleAddToCart = (product, startPos = null) => {
    setCartLimitMessage('')
    const slug = product.slug ?? product.id ?? ''
    const weightStr = product.size ?? product.selectedVariant?.weight ?? ''
    if (slug && wouldExceedWeightLimit(cart, slug, weightStr, 1)) {
      toast.error("Maximum purchase limit reached for this item.");
      return
    }

    // Trigger fly animation
    if (startPos) {
      setFlyingItem(product)
      setFlyingPos(startPos)
      setPendingCartUpdate(product)
    } else {
      // If no startPos (unlikely now), add immediately
      commitCartUpdate(product)
    }
  }

  const commitCartUpdate = (product) => {
    const id = buildCartId(product)
    const slug = product.slug ?? product.id ?? ''
    const weightStr = product.size ?? product.selectedVariant?.weight ?? ''

    setCart((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        if (wouldExceedWeightLimit(prev, slug, weightStr, 1)) return prev
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [...prev, { ...product, id, qty: 1 }]
    })
  }

  const handleDecreaseQty = (product) => {
    const id = buildCartId(product)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (!existing) {
        return prev
      }
      const nextQty = existing.qty - 1
      if (nextQty <= 0) {
        return prev.filter((item) => item.id !== id)
      }
      return prev.map((item) =>
        item.id === id ? { ...item, qty: nextQty } : item,
      )
    })
  }

  const handleIncreaseQty = (product) => {
    setCartLimitMessage('')
    const slug = getProductSlugFromCartItem(product) || (product.slug ?? product.id ?? '')
    const weightStr = product.size ?? product.selectedVariant?.weight ?? ''
    if (slug && wouldExceedWeightLimit(cart, slug, weightStr, 1)) {
      toast.error("Maximum purchase limit reached for this item.");
      return
    }
    const id = buildCartId(product)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        if (wouldExceedWeightLimit(prev, slug, weightStr, 1)) return prev
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [...prev, { ...product, id, qty: 1 }]
    })
  }

  const handleRemoveFromCart = (item) => {
    setCart((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleBuyNow = (product) => {
    setCartLimitMessage('')
    const id = buildCartId(product)
    // Buy Now = only this product, qty 1 (replace cart for instant checkout)
    setCart([{ ...product, id, qty: 1 }])
    setTimeout(() => navigate('/checkout'), 0)
  }

  const handleClearCart = () => {
    setCart([])
    localStorage.removeItem('mimi_cart')
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  )
  const DELIVERY_FEE = 49
  const deliveryFee = useMemo(
    () => (subtotal >= 499 || subtotal === 0 ? 0 : DELIVERY_FEE),
    [subtotal],
  )
  const discountAmount = useMemo(
    () => Math.min(appliedCoupon?.discount ?? 0, subtotal),
    [appliedCoupon?.discount, subtotal],
  )
  const total = useMemo(
    () => subtotal + deliveryFee - discountAmount,
    [subtotal, deliveryFee, discountAmount],
  )

  const handleApplyCoupon = async (code) => {
    setCouponError('')
    if (!code?.trim()) return
    try {
      const res = await fetch(`${API_BASE}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      })
      const data = await res.json()
      const isValid = data && (data.valid === true || data.valid === 'true')
      const discount = data?.discount
      const hasDiscount = discount != null && (typeof discount === 'number' ? true : Number(discount) >= 0)
      if (isValid && hasDiscount) {
        setAppliedCoupon({ code: data.code || code.trim(), discount: Number(discount) || 0 })
        setCouponError('')
        toast.success(`Coupon "${(data.code || code).toString().toUpperCase()}" applied!`)
      } else {
        setAppliedCoupon(null)
        setCouponError(data?.error || 'Invalid code.')
        toast.error(data?.error || 'Invalid coupon code.')
      }
    } catch {
      setCouponError('Could not apply code. Try again.')
      toast.error('Failed to apply coupon. Please try again.')
      setAppliedCoupon(null)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }



  const wishlistCount = user?.wishlist?.length || 0

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg md:bg-white transition-colors duration-500">
      <Toaster position="bottom-center" toastOptions={{ duration: 3000, style: { background: '#1c1917', color: '#fff', borderRadius: '12px' } }} />
      <CustomCursor />
      {isProductsLoading && <Loader />}
      {/* Desktop Header – hide on scroll down, show on scroll up */}
      <div
        className={`sticky top-0 z-[110] hidden md:block transition-transform duration-300 ease-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Header cartCount={cartCount} onCartToggle={() => setIsCartOpen(!isCartOpen)} products={products} />
      </div>

      {/* Mobile Header – hide on scroll down, show on scroll up */}
      <div
        className={`sticky top-0 z-[110] md:hidden transition-transform duration-300 ease-out ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <MobileHeader
          cartCount={cartCount}
          onCartToggle={() => setIsCartOpen(!isCartOpen)}
          wishlistCount={wishlistCount}
        />
      </div>

      <main className="flex-1 relative overflow-hidden bg-brand-bg pb-24 md:pb-0 m-0 p-0">
        <PageWrapper>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <Home products={products} collections={collections} blogs={blogs} recipes={homeRecipes} onAddToCart={handleAddToCart} />
              }
            />
            <Route
              path="/product"
              element={
                <Products
                  onAddToCart={handleAddToCart}
                  onIncreaseQty={handleIncreaseQty}
                  onDecreaseQty={handleDecreaseQty}
                  cart={cart}
                  products={products}
                  loading={isProductsLoading}
                  collections={collections}
                />
              }
            />
            <Route
              path="/products"
              element={
                <Products
                  onAddToCart={handleAddToCart}
                  onIncreaseQty={handleIncreaseQty}
                  onDecreaseQty={handleDecreaseQty}
                  cart={cart}
                  products={products}
                  loading={isProductsLoading}
                  collections={collections}
                />
              }
            />
            <Route
              path="/:collection"
              element={
                <Products
                  onAddToCart={handleAddToCart}
                  onIncreaseQty={handleIncreaseQty}
                  onDecreaseQty={handleDecreaseQty}
                  cart={cart}
                  products={products}
                  loading={isProductsLoading}
                  collections={collections}
                />
              }
            />
            <Route
              path="/product/:slug"
              element={
                <ProductDetail
                  apiBase={API_BASE}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onIncreaseQty={handleIncreaseQty}
                  onDecreaseQty={handleDecreaseQty}
                  cart={cart}
                  products={products}
                  cartLimitMessage={cartLimitMessage}
                />
              }
            />
            <Route
              path="/products/:slug"
              element={
                <ProductDetail
                  apiBase={API_BASE}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onIncreaseQty={handleIncreaseQty}
                  onDecreaseQty={handleDecreaseQty}
                  cart={cart}
                  products={products}
                  cartLimitMessage={cartLimitMessage}
                />
              }
            />
            <Route path="/products/test" element={<ProductsTest />} />
            <Route path="/build-your-protein" element={<PageWrapper><BuildYourOwnProtein /></PageWrapper>} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:slug" element={<RecipeDetail />} />
            <Route path="/about" element={<About recipes={homeRecipes} />} />
            <Route path="/blogs" element={<NewsPage blogs={blogs} />} />
            <Route
              path="/blogs/:slug"
              element={<BlogDetail blogs={blogs} />}
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping-returns" element={<ShippingReturns />} />
            <Route path="/privacy-policy" element={<PolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cart={cart}
                  products={products}
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  discountAmount={discountAmount}
                  total={total}
                  onOrderSuccess={handleClearCart}
                />
              }
            />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrapper>
      </main >
      <div className="hidden md:block">
        <Footer />
      </div>
      <CartDrawer
        open={isCartOpen}
        onClose={() => { setIsCartOpen(false); setCartLimitMessage('') }}
        cart={cart}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discountAmount={discountAmount}
        total={total}
        appliedCoupon={appliedCoupon}
        couponError={couponError}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onRemoveItem={handleRemoveFromCart}
        apiBase={API_BASE}
        cartLimitMessage={cartLimitMessage}
      />
      <MobileNavbar products={products} />

      {/* Global Animation Component */}
      {flyingItem && (
        <FlyToCart
          item={flyingItem}
          startPos={flyingPos}
          onComplete={() => {
            if (pendingCartUpdate) {
              commitCartUpdate(pendingCartUpdate)
            }
            setFlyingItem(null)
            setFlyingPos(null)
            setPendingCartUpdate(null)
          }}
        />
      )}

      {/* Profile Completion Reminder */}
      <ProfileReminder user={user} />
    </div >
  )
}

export default App
