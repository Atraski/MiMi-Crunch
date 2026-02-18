import { useEffect, useMemo, useState } from 'react'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import Header from './components/Header'
import { Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import NewsPage from './pages/NewsPage'
import BlogDetail from './pages/BlogDetail'
import ProductDetail from './pages/ProductDetail'
import Products from './pages/Products'
import ProductsTest from './pages/ProductsTest'
import RecipesPage from './pages/RecipesPage'
import RecipeDetail from './pages/RecipeDetail'
import { products as fallbackProducts } from './data/homeData'
import ShippingReturns from './pages/ShippingReturns'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import Checkout from './pages/Checkout'
import Lenis from 'lenis'
import OrderSuccess from './pages/OrderSuccess'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function App() {

  // Initial state ko localStorage se uthao
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('mimi_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (err) {
      console.error("Cart load error:", err)
      return []
    }
  })

  // Jab bhi cart change ho, usey localStorage mein save karo
  useEffect(() => {
    localStorage.setItem('mimi_cart', JSON.stringify(cart))
  }, [cart])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [products, setProducts] = useState(fallbackProducts)
  const [isProductsLoading, setIsProductsLoading] = useState(false)
  const [collections, setCollections] = useState([])
  const [blogs, setBlogs] = useState([])
  const [homeRecipes, setHomeRecipes] = useState([])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    let rafId = 0
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
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
              ? item.variants
              : item.weightOptions?.length
              ? item.weightOptions.map((weight) => ({
                  weight,
                  price: item.price,
                  images: item.images || [],
                }))
              : []
          const firstVariant = derivedVariants[0]
          return {
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

  const handleAddToCart = (product) => {
    const id = buildCartId(product)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
        return prev.map((item) =>
          item.id === id
            ? { ...item, qty: item.qty + 1 }
            : item,
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
    const id = buildCartId(product)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id)
      if (existing) {
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

  // App.js mein ye naya function add karein
const handleClearCart = () => {
  setCart([]); // State khali karne ke liye
  localStorage.removeItem('mimi_cart'); // LocalStorage saaf karne ke liye
};

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
      if (data.valid && data.discount != null) {
        setAppliedCoupon({ code: data.code, discount: data.discount })
        setCouponError('')
      } else {
        setAppliedCoupon(null)
        setCouponError(data.error || 'Invalid code.')
      }
    } catch {
      setCouponError('Could not apply code. Try again.')
      setAppliedCoupon(null)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }

  

  return (
    <div className="bg-brand-50 text-stone-900">
      <Header
        cartCount={cartCount}
        onCartToggle={() => setIsCartOpen((prev) => !prev)}
        products={products}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home products={products} blogs={blogs} recipes={homeRecipes} />
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
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
              cart={cart}
              products={products}
            />
          }
        />
        <Route
          path="/products/:slug"
          element={
            <ProductDetail
              apiBase={API_BASE}
              onAddToCart={handleAddToCart}
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
              cart={cart}
              products={products}
            />
          }
        />
        <Route path="/products/test" element={<ProductsTest />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:slug" element={<RecipeDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<NewsPage blogs={blogs} />} />
        <Route
          path="/news/:slug"
          element={<BlogDetail blogs={blogs} />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping-returns" element={<ShippingReturns />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
      <Footer />
      <CartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
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
      />
    </div>
  )
}

export default App
