import BackButton from '../components/BackButton'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useAuth } from '../context/AuthContext'
import { getOptimizedImage } from '../utils/imageUtils'
import { getProductColor, getContrastColor } from '../utils/productColors'
import toast from 'react-hot-toast'

const API_BASE_FALLBACK = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

const ProductDetail = ({
  apiBase = API_BASE_FALLBACK,
  onAddToCart,
  onBuyNow,
  onIncreaseQty,
  onDecreaseQty,
  cart,
  products,
  cartLimitMessage = '',
}) => {
  // 1. SAARE HOOKS (TOP LEVEL)
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const productFromList = products.find((item) => item.slug === slug)
  const [fetchedProduct, setFetchedProduct] = useState(null)
  const [productLoading, setProductLoading] = useState(true)
  const product = fetchedProduct ?? productFromList
  const safeCart = cart ?? []

  // theme helpers
  const containerRef = useRef(null)
  const imageContainerRef = useRef(null)
  const [cartHover, setCartHover] = useState(false)
  const [buyHover, setBuyHover] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [buyClicked, setBuyClicked] = useState(false)
  const [faqOpenIndex, setFaqOpenIndex] = useState(-1)
  const hexToRGBA = (hex, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  // computed theme colors
  const brandColor = getProductColor(product?.slug, product?.name)
  const contrastColor = getContrastColor(brandColor)
  const hoverShadowColor = hexToRGBA(brandColor, 0.4)

  // States
  const [activeImage, setActiveImage] = useState(0)
  const [activeVariant, setActiveVariant] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState('')
  const [wishlistAdding, setWishlistAdding] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    content: '',
    authorName: '',
  })
  const [reviewProfileImageFile, setReviewProfileImageFile] = useState(null)
  const [reviewProductImageFile, setReviewProductImageFile] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [linkedRecipes, setLinkedRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(false)
  const reviewCarouselRef = useRef(null)

  // Effects – fetch fresh product by slug so admin updates show immediately
  useEffect(() => {
    if (!slug || !apiBase) {
      setProductLoading(false)
      setFetchedProduct(null)
      return
    }
    let cancelled = false
    setProductLoading(true)
    fetch(`${apiBase}/api/products/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data) => {
        if (cancelled || !data) return
        const item = data
        const derivedVariants = item.variants?.length
          ? item.variants.map((v) => ({
            ...v,
            weight: v.weight,
            price: v.price ?? item.price,
            stock: v.stock ?? 0,
            images: v.images || item.images || [],
          }))
          : []
        const firstVariant = derivedVariants[0]
        setFetchedProduct({
          _id: item._id,
          name: item.name,
          slug: item.slug,
          size: firstVariant?.weight || item.weight,
          desc: item.description,
          additionalInfo: item.additionalInfo,
          price: firstVariant?.price ?? item.price,
          collection: item.collection,
          tags: item.tags || [],
          image: firstVariant?.images?.[0] || item.images?.[0] || '',
          images: firstVariant?.images?.length ? firstVariant.images : item.images || [],
          variants: derivedVariants.length ? derivedVariants : null,
          benefits: item.benefits,
          trust: item.trust,
          faqContent: item.faqContent,
          faqs: item.faqs,
          metaData: item.metaData,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          schemaMarkup: item.schemaMarkup,
        })
      })
      .catch(() => {
        if (!cancelled) setFetchedProduct(null)
      })
      .finally(() => {
        if (!cancelled) setProductLoading(false)
      })
    return () => { cancelled = true }
  }, [slug, apiBase])

  useEffect(() => {
    setActiveVariant(0)
    setActiveImage(0)
    setIsZoomed(false)
  }, [slug])

  // Inject product schema markup (JSON-LD) into head for SEO
  useEffect(() => {
    const raw = product?.schemaMarkup?.trim()
    if (!raw) return
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(parsed)
    script.setAttribute('data-product-schema', product?.slug || '')
    document.head.appendChild(script)
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [product?.slug, product?.schemaMarkup])

  // SEO: Update Meta Title and Description
  useEffect(() => {
    if (!product) return

    // Save originals
    const originalTitle = document.title
    const metaDescEl = document.querySelector('meta[name="description"]')
    const originalDesc = metaDescEl ? metaDescEl.getAttribute('content') : ''

    // Apply Meta Title
    if (product.metaTitle) {
      document.title = product.metaTitle
    } else if (product.name) {
      document.title = `${product.name} | Mimi Crunch`
    }

    // Apply Meta Description
    if (product.metaDescription) {
      let el = metaDescEl
      if (!el) {
        el = document.createElement('meta')
        el.name = 'description'
        document.head.appendChild(el)
      }
      el.setAttribute('content', product.metaDescription)
    }

    return () => {
      document.title = originalTitle
      if (metaDescEl && originalDesc) {
        metaDescEl.setAttribute('content', originalDesc)
      }
    }
  }, [product?.metaTitle, product?.metaDescription, product?.name])

  useEffect(() => {
    if (!slug || !apiBase) return
    let cancelled = false
    setReviewsLoading(true)
    fetch(`${apiBase}/api/reviews?productSlug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setReviews(data)
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => { cancelled = true }
  }, [slug, apiBase])

  useEffect(() => {
    if (!product?.slug || !apiBase) return
    let cancelled = false
    const load = async () => {
      setRecipesLoading(true)
      try {
        const res = await fetch(
          `${apiBase}/api/recipes?productSlug=${encodeURIComponent(
            product.slug,
          )}&published=true`,
        )
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setLinkedRecipes(data)
        }
      } catch (err) {
        if (!cancelled) setLinkedRecipes([])
      } finally {
        if (!cancelled) setRecipesLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [product?.slug, apiBase])

  // animate entrance when slug changes
  useEffect(() => {
    window.scrollTo(0, 0)
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    }
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power1.out' },
      )
    })
    return () => ctx.revert()
  }, [slug])

  // animate glow when theme color updates
  useEffect(() => {
    if (!imageContainerRef.current) return
    const ctx = gsap.context(() => {
      gsap.to(imageContainerRef.current, {
        boxShadow: `0 0 20px ${hexToRGBA(brandColor, 0.27)}`,
        duration: 0.5,
        ease: 'power1.out',
      })
    })
    return () => ctx.revert()
  }, [brandColor])

  // Helpers
  const scrollReview = (dir) => {
    const el = reviewCarouselRef.current
    if (!el) return
    const cardWidth = el.querySelector('[data-review-card]')?.offsetWidth || 320
    el.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' })
  }

  // 2. CONDITIONAL RETURN (Hooks ke baad)
  if (productLoading && !product) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-2">
          <p className="text-stone-600">Loading product…</p>
        </div>
      </main>
    )
  }
  if (!product) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-2">
          <h1 className="text-2xl font-semibold text-stone-900">Product not found</h1>
          <p className="mt-2 text-stone-600">Please check the product link or go back.</p>
          <Link className="btn btn-primary mt-6" to="/products">Back to Products</Link>
        </div>
      </main>
    )
  }

  // 3. PRODUCT-DEPENDENT CALCULATIONS
  const variants = product.variants?.length ? product.variants : null
  const selectedVariant = variants ? variants[activeVariant] : null
  const images = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : []
  const mainImage = images[activeImage] || images[0]
  const displayPrice = selectedVariant?.price ?? product.price
  const displayWeight = selectedVariant?.weight ?? product.size
  const variantStock = selectedVariant?.stock ?? 0
  const isSoldOut = variantStock <= 0
  const currentCartId = `${product.slug}:${displayWeight || ''}`
  const cartItem = safeCart.find((entry) => entry.id === currentCartId)
  const qty = cartItem ? cartItem.qty : 0
  const hasMultipleImages = images.length > 1


  const handlePrevImage = () => {
    if (!hasMultipleImages) return
    setActiveImage((prev) => (prev - 1 + images.length) % images.length)
  }
  const handleNextImage = () => {
    if (!hasMultipleImages) return
    setActiveImage((prev) => (prev + 1) % images.length)
  }

  const uploadReviewImageToCloudinary = async (file) => {
    if (!file || !apiBase) return null
    const res = await fetch(`${apiBase}/api/reviews/upload-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (!res.ok) throw new Error('Upload signature failed')
    const { signature, timestamp, cloudName, apiKey } = await res.json()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('folder', 'reviews')
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData },
    )
    if (!uploadRes.ok) throw new Error('Image upload failed')
    const json = await uploadRes.json()
    return json.secure_url
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    const name = reviewForm.authorName.trim()
    const text = reviewForm.content.trim()
    const hasText = text.length > 0
    const hasProfile = !!reviewProfileImageFile
    const hasProduct = !!reviewProductImageFile
    if (!product?.slug) return
    if (!name) {
      toast.error('Please enter your name.');
      return;
    }
    if (!hasText && !hasProfile && !hasProduct) {
      toast.error('Please add a review text or upload a photo.');
      return;
    }
    setReviewError('')
    setReviewSubmitting(true)
    try {
      let profileImageUrl = null
      let productImageUrl = null
      if (reviewProfileImageFile) profileImageUrl = await uploadReviewImageToCloudinary(reviewProfileImageFile)
      if (reviewProductImageFile) productImageUrl = await uploadReviewImageToCloudinary(reviewProductImageFile)
      const res = await fetch(`${apiBase}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: product.slug,
          rating: Math.min(5, Math.max(1, Number(reviewForm.rating) || 5)),
          content: text || undefined,
          authorName: name,
          profileImage: profileImageUrl || undefined,
          productImage: productImageUrl || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit review')
      }
      setReviewForm({ rating: 5, content: '', authorName: '' })
      setReviewProfileImageFile(null)
      setReviewProductImageFile(null)
      toast.success('Thank you for your review! It has been posted.');
      const listRes = await fetch(`${apiBase}/api/reviews?productSlug=${encodeURIComponent(product.slug)}`)
      const list = await listRes.json()
      if (Array.isArray(list)) setReviews(list)
    } catch (err) {
      toast.error(err.message || 'Could not submit review. Please try again.');
    } finally {
      setReviewSubmitting(false)
    }
  }

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#FAF8F5] relative overflow-clip py-16 px-4 font-[Manrope]"
      style={{ transition: 'background-color 0.5s ease' }}
    >
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10 flex flex-col gap-12">
        <BackButton className="text-[#1B3B26]" />

        {/* 1. TOP SECTION: IMAGES & INFO */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start relative">
          {/* Left Column: Images */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:z-10">
            <div
              ref={imageContainerRef}
              className="relative flex h-[350px] sm:h-[500px] w-full items-center justify-center overflow-hidden rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.06)]"
              style={{
                boxShadow: `0 20px 50px ${hexToRGBA(brandColor, 0.15)}`,
                transition: 'box-shadow 0.5s ease',
              }}
            >
              {mainImage ? (
                <img
                  className={`max-h-[85%] max-w-[85%] object-contain drop-shadow-2xl transition-transform duration-700 ${isZoomed ? 'cursor-zoom-out scale-105' : 'cursor-zoom-in hover:scale-105'
                    }`}
                  src={getOptimizedImage(mainImage)}
                  alt={product.name}
                  loading="lazy"
                  onClick={() => setIsZoomed(true)}
                />
              ) : null}
              {hasMultipleImages ? (
                <>
                  <button
                    className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-[#1B3B26] shadow-lg transition hover:bg-white hover:scale-110"
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <span className="text-2xl leading-none">‹</span>
                  </button>
                  <button
                    className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-[#1B3B26] shadow-lg transition hover:bg-white hover:scale-110"
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <span className="text-2xl leading-none">›</span>
                  </button>
                </>
              ) : null}
            </div>
            {hasMultipleImages ? (
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    className={`h-16 sm:h-24 overflow-hidden rounded-2xl sm:rounded-[1.5rem] bg-white/50 backdrop-blur-md border-[2px] transition-all hover:-translate-y-1 hover:shadow-lg ${activeImage === index
                      ? 'border-[#1B3B26] shadow-md'
                      : 'border-white/60 hover:border-[#1B3B26]/30'
                      }`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                  >
                    <img
                      className="h-full w-full object-cover p-1.5 sm:p-2 mix-blend-multiply"
                      src={getOptimizedImage(img)}
                      alt={`${product.name} ${index + 1}`}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
            {isZoomed ? (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-xl p-4 transition-all"
                role="dialog"
                aria-modal="true"
                onClick={() => setIsZoomed(false)}
              >
                <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.05] blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.05] blur-[100px] pointer-events-none"></div>

                <button
                  className="absolute right-8 top-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl font-light text-[#1B3B26] shadow-xl transition-transform hover:scale-110"
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  aria-label="Close image"
                >
                  ×
                </button>
                <img
                  className="max-h-[90vh] w-full max-w-5xl object-contain drop-shadow-2xl"
                  src={getOptimizedImage(mainImage)}
                  alt={product.name}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            ) : null}
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col backdrop-blur-xl bg-white/60 border border-white/60 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.05)] rounded-[2.5rem] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl transform translate-x-32 -translate-y-32 pointer-events-none"></div>

            <div className="flex items-center gap-3 flex-wrap mb-4 relative z-10">
              <span className="bg-white/80 border border-[#1B3B26]/10 text-[#1B3B26] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
                {displayWeight}
              </span>
              {isSoldOut ? (
                <span className="rounded-full bg-red-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-700 shadow-sm border border-red-200">
                  Sold out
                </span>
              ) : variantStock <= 5 ? (
                <span className="rounded-full bg-orange-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700 shadow-sm border border-orange-200 animate-pulse">
                  Selling Fast
                </span>
              ) : null}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-[Fraunces] font-normal text-[#1B3B26] leading-tight mb-3 relative z-10">
              {product.name}
            </h1>

            {/* verified badge */}
            <span
              className="inline-flex items-center gap-1.5 w-fit rounded-full px-4 py-1.5 text-xs font-bold tracking-wide shadow-sm border relative z-10"
              style={{
                backgroundColor: hexToRGBA(brandColor, 0.08),
                color: brandColor,
                borderColor: hexToRGBA(brandColor, 0.15),
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Verified Superfood
            </span>

{/* Description moved to its own section below */}

            {product.metaData ? (
              <div
                className="mt-6 p-6 rounded-2xl bg-white/40 border border-white/60 text-[#4A5D4E] prose prose-stone max-w-none text-sm leading-relaxed relative z-10"
                dangerouslySetInnerHTML={{ __html: product.metaData }}
              />
            ) : null}

            <p className="mt-8 text-3xl font-[Fraunces] font-medium text-[#1B3B26] relative z-10">
              ₹{displayPrice}
            </p>

            {variants ? (
              <div className="mt-8 pt-6 border-t border-[#1B3B26]/10 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D4E] mb-3">
                  Select Weight
                </p>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant, index) => {
                    const vStock = variant.stock ?? 0
                    const vSoldOut = vStock <= 0
                    return (
                      <button
                        key={`${variant.weight}-${index}`}
                        className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeVariant === index
                          ? 'bg-[#1B3B26] text-[#F5B041] shadow-lg shadow-[#1B3B26]/20 border-transparent scale-105'
                          : vSoldOut
                            ? 'border-white bg-[#EAE6DF]/40 text-[#4A5D4E]/50 cursor-not-allowed border'
                            : 'border-white bg-white/60 text-[#1B3B26] border hover:bg-white hover:shadow-md'
                          }`}
                        type="button"
                        disabled={vSoldOut}
                        onClick={() => {
                          if (vSoldOut) return
                          setActiveVariant(index)
                          setActiveImage(0)
                        }}
                      >
                        {variant.weight}
                        {vSoldOut ? ' (Sold out)' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {product.tags?.length ? (
              <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-white/80 border border-[#1B3B26]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-10 relative z-10 flex flex-col gap-4">
              {cartLimitMessage ? (
                <p className="text-sm font-medium text-amber-800 bg-amber-100/80 backdrop-blur-sm border border-amber-200 px-5 py-3 rounded-2xl">
                  {cartLimitMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-4">
                {/* Row 1: Qty + Wishlist (Small screens) or All in one (Large screens) */}
                <div className="flex items-center gap-3">
                  {/* Qty Counter */}
                  <div className="flex h-14 items-center gap-4 rounded-2xl bg-white/80 border border-white px-2 shadow-sm">
                    <button
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#EAE6DF]/50 text-lg font-semibold text-[#1B3B26] transition hover:bg-[#EAE6DF] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => !isSoldOut && onDecreaseQty({ ...product, id: currentCartId, size: displayWeight, selectedVariant })}
                      type="button"
                      aria-label={`Decrease ${product.name} quantity`}
                      disabled={isSoldOut}
                    >
                      −
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-bold text-[#1B3B26]">
                      {qty}
                    </span>
                    <button
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#EAE6DF]/50 text-lg font-semibold text-[#1B3B26] transition hover:bg-[#EAE6DF] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => !isSoldOut && onIncreaseQty({ ...product, id: currentCartId, size: displayWeight, selectedVariant })}
                      type="button"
                      aria-label={`Increase ${product.name} quantity`}
                      disabled={isSoldOut}
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart - Full width on mobile row if needed, or flex-1 */}
                  <button
                    className={`flex-1 h-14 rounded-2xl px-4 text-[13px] sm:text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 active:scale-[0.98] ${addedToCart ? 'ring-2 ring-emerald-500' : ''}`}
                    style={{
                      backgroundColor: isSoldOut ? undefined : brandColor,
                      color: isSoldOut ? undefined : contrastColor,
                      filter: !isSoldOut ? 'brightness(1.05)' : undefined,
                      boxShadow: cartHover && !addedToCart ? `0 15px 30px -10px ${hoverShadowColor}` : 'none',
                      transform: cartHover && !addedToCart ? 'translateY(-2px)' : 'none',
                    }}
                    type="button"
                    disabled={isSoldOut}
                    onMouseEnter={() => setCartHover(true)}
                    onMouseLeave={() => setCartHover(false)}
                    onClick={(e) => {
                      if (isSoldOut) return
                      setAddedToCart(true)
                      const { clientX, clientY } = e;
                      onAddToCart({
                        ...product,
                        selectedVariant,
                        price: displayPrice,
                        size: displayWeight,
                        image: images[0],
                      }, { x: clientX, y: clientY })
                      setTimeout(() => setAddedToCart(false), 800)
                    }}
                  >
                    {isSoldOut ? 'Sold out' : addedToCart ? 'Added ✓' : 'Add to Cart'}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    className={`inline-flex h-14 w-14 items-center justify-center flex-shrink-0 rounded-2xl border bg-white/80 shadow-sm transition-all duration-300 disabled:opacity-50 ${wishlistError ? 'text-red-500 border-red-200' : 'text-[#4A5D4E] border-white hover:bg-white hover:text-[#1B3B26] hover:scale-105'}`}
                    type="button"
                    aria-label="Add to wishlist"
                    disabled={wishlistAdding}
                    onClick={async () => {
                      setWishlistError('')
                      if (!user) {
                        navigate(`/login?redirect=/products/${product.slug}`)
                        return
                      }
                      setWishlistAdding(true)
                      try {
                        const res = await fetch(`${apiBase}/api/users/${user._id}/wishlist`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                          },
                          body: JSON.stringify({ productId: product.slug }),
                        })
                        const data = await res.json()
                        if (res.status === 403) {
                          setWishlistError('Complete profile first.')
                          return
                        }
                        if (!res.ok) {
                          setWishlistError('Failed. Try again.')
                          return
                        }
                      } catch {
                        setWishlistError('Failed. Try again.')
                      } finally {
                        setWishlistAdding(false)
                      }
                    }}
                  >
                    <svg
                      className={wishlistAdding ? 'h-6 w-6 animate-pulse' : 'h-6 w-6'}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1Z" />
                    </svg>
                  </button>
                </div>

                {wishlistError ? (
                  <p className="mt-2 text-sm text-red-600 font-medium px-2">{wishlistError}</p>
                ) : null}

                {onBuyNow ? (
                  <div className="pt-0">
                    <button
                      className={`w-full h-14 rounded-2xl px-6 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#4A5D4E] border border-white/20 active:scale-[0.98] ${buyClicked ? 'scale-[0.98]' : ''}`}
                      style={{
                        backgroundColor: isSoldOut ? undefined : brandColor,
                        color: isSoldOut ? undefined : contrastColor,
                        backgroundImage: !isSoldOut ? 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0))' : 'none',
                        boxShadow: buyHover && !buyClicked ? `0 15px 30px -10px ${hoverShadowColor}` : 'none',
                        transform: buyHover && !buyClicked ? 'translateY(-2px)' : 'none',
                      }}
                      type="button"
                      disabled={isSoldOut || buyClicked}
                      onMouseEnter={() => setBuyHover(true)}
                      onMouseLeave={() => setBuyHover(false)}
                      onClick={() => {
                        if (isSoldOut) return
                        setBuyClicked(true)
                        onBuyNow({
                          ...product,
                          selectedVariant,
                          price: displayPrice,
                          size: displayWeight,
                          image: images[0],
                        })
                        setTimeout(() => setBuyClicked(false), 2000)
                      }}
                    >
                      {isSoldOut ? 'Sold out' : buyClicked ? 'Redirecting... ↻' : 'Buy it now'}
                    </button>
                  </div>
                ) : null}
              </div>

              <Link className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E] hover:text-[#1B3B26] transition-colors w-fit bg-white/50 border border-white px-4 py-2 rounded-xl" to="/products">
                <span className="text-sm leading-none">←</span> Back to Products
              </Link>
            </div>
          </div>
        </div>

        {/* 2. BENEFITS / TRUST */}
        {(product.benefits || product.trust) ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 pt-8">
            {product.benefits ? (
              <section className="backdrop-blur-xl bg-white/50 border border-white/60 shadow-sm rounded-[2.5rem] p-8 lg:p-10">
                <h2 className="text-3xl font-[Fraunces] font-medium text-[#1B3B26]">Benefits</h2>
                <div
                  className="mt-6 prose prose-stone max-w-none text-[#4A5D4E] prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.benefits }}
                />
              </section>
            ) : null}
            {product.trust ? (
              <section className="backdrop-blur-xl bg-[#1B3B26] text-white shadow-[0_20px_40px_-15px_rgba(27,59,38,0.2)] rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B041] opacity-10 rounded-full blur-3xl transform translate-x-32 -translate-y-32 pointer-events-none"></div>
                <h2 className="text-3xl font-[Fraunces] font-medium text-[#F5B041] relative z-10">Why trust us</h2>
                <div
                  className="mt-6 prose prose-invert max-w-none text-[#EAE6DF] prose-img:inline prose-img:align-middle prose-p:leading-relaxed relative z-10"
                  dangerouslySetInnerHTML={{ __html: product.trust }}
                />
              </section>
            ) : null}
          </div>
        ) : null}

                {/* NEW DESCRIPTION SECTION */}
        {product.desc ? (
          <section className="pt-12 pb-8">
            <div className="backdrop-blur-xl bg-white/50 border border-white/60 shadow-sm rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl transform -translate-x-32 -translate-y-32 pointer-events-none"></div>
              <h2 className="text-3xl lg:text-4xl font-[Fraunces] font-medium text-[#1B3B26] mb-6 relative z-10">About this product</h2>
              <div
                className="prose prose-stone max-w-none text-[#4A5D4E] prose-p:leading-relaxed text-lg relative z-10"
                dangerouslySetInnerHTML={{ __html: product.desc }}
              />
            </div>
          </section>
        ) : null}

{/* 5. FAQs SECTION */}
        {product.faqs?.length || product.faqContent ? (
          <section className="pt-20 pb-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">
              <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F5B041]">Knowledge Base</span>
                <h2 className="text-4xl lg:text-6xl font-[Fraunces] font-normal text-[#1B3B26] leading-[1.1]">Everything you need to know.</h2>
                <p className="text-[#4A5D4E] text-lg max-w-md">Common questions about {product.name} sourcing, nutrition, and usage.</p>
              </div>

              <div className="space-y-4">
                {product.faqs?.length ? (
                  product.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className={`overflow-hidden rounded-[2rem] border transition-all duration-300 ${faqOpenIndex === idx ? 'bg-white border-stone-200 shadow-lg' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}
                    >
                      <button
                        className="flex w-full items-center justify-between p-6 text-left"
                        onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? -1 : idx)}
                      >
                        <span className="text-base font-[Fraunces] font-medium text-[#1B3B26]">{faq.question}</span>
                        <span className={`text-2xl transition-transform duration-300 ${faqOpenIndex === idx ? 'rotate-45 text-[#F5B041]' : 'text-[#4A5D4E]'}`}>+</span>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${faqOpenIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="p-6 pt-0 text-sm leading-relaxed text-[#4A5D4E] border-t border-stone-50">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="backdrop-blur-xl bg-[#1B3B26] text-white shadow-xl rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B041] opacity-10 rounded-full blur-3xl transform translate-x-32 -translate-y-32 pointer-events-none"></div>
                    <div
                      className="relative z-10 prose prose-invert max-w-none text-[#EAE6DF] 
                                 prose-headings:font-[Fraunces] prose-headings:font-normal prose-headings:text-[#F5B041] 
                                 prose-p:text-lg prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.faqContent }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}
{/* 3. REVIEWS & RECIPES */}
        <section className="pt-8">
          <div className="mb-10 flex flex-col items-center text-center">
            <h2 className="text-4xl lg:text-5xl font-[Fraunces] font-medium text-[#1B3B26]">Reviews & testimonials</h2>
            <p className="mt-3 text-lg text-[#4A5D4E]">What others say about this product</p>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-10">
              <p className="text-[#4A5D4E] animate-pulse">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative">
              <div
                ref={reviewCarouselRef}
                className="flex gap-6 overflow-x-auto overflow-y-hidden pb-8 pt-4 px-4 -mx-4 scroll-smooth hide-scrollbar"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
              >
                {reviews.map((r) => {
                  const profileImg = r.profileImage || null
                  const productImg = r.productImage || r.imageUrl || null
                  const displayName = r.authorName || 'Anonymous'
                  return (
                    <article
                      key={r._id}
                      data-review-card
                      className="flex h-full min-w-[min(100%,340px)] max-w-[340px] flex-shrink-0 flex-col rounded-[2.5rem] border border-white/60 bg-white/60 backdrop-blur-md p-6 lg:p-8 shadow-[0_10px_30px_-15px_rgba(27,59,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(27,59,38,0.12)]"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-[#1B3B26]/10 bg-[#EAE6DF]">
                          {profileImg ? (
                            <img
                              src={profileImg}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-[Fraunces] font-bold text-[#1B3B26]">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-[Fraunces] font-medium text-[#1B3B26]">
                            {displayName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex text-[11px]" aria-label={`${r.rating} out of 5 stars`}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={star <= r.rating ? 'text-[#F5B041]' : 'text-[#EAE6DF] drop-shadow-sm'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]/60">
                              {formatReviewDate(r.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-1 flex-col">
                        <div className="relative">
                          <svg className="absolute -left-2 -top-2 h-8 w-8 text-[#1B3B26]/5" fill="currentColor" viewBox="0 0 32 32">
                            <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H7c0-1.7 1.3-3 3-3V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
                          </svg>
                          <p className="relative z-10 line-clamp-4 text-base italic leading-relaxed text-[#4A5D4E]">
                            {r.content || "Brilliant product, highly recommend!"}
                          </p>
                        </div>

                        {productImg ? (
                          <div className="mt-6 h-40 w-full overflow-hidden rounded-[1.5rem] border border-[#1B3B26]/5 bg-white shadow-inner">
                            <img
                              src={productImg}
                              alt="Review"
                              className="h-full w-full object-contain p-2"
                              loading="lazy"
                            />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>

              {reviews.length > 1 && (
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => scrollReview(-1)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1B3B26] shadow-md transition hover:scale-110 hover:bg-[#1B3B26] hover:text-[#F5B041]"
                    aria-label="Previous reviews"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => scrollReview(1)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1B3B26] shadow-md transition hover:scale-110 hover:bg-[#1B3B26] hover:text-[#F5B041]"
                    aria-label="Next reviews"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-[#1B3B26]/20 bg-white/40 py-16 px-6 text-center backdrop-blur-sm">
              <div className="mb-4 text-4xl">✨</div>
              <p className="text-lg font-medium text-[#1B3B26]">No reviews yet.</p>
              <p className="mt-1 text-sm text-[#4A5D4E]">Be the first to share your experience!</p>
            </div>
          )}

          {/* Review Form Section */}
          <div className="mt-16 mx-auto max-w-3xl">
            <section className="rounded-[2.5rem] border border-white/60 bg-white/60 backdrop-blur-xl p-8 lg:p-12 shadow-sm">
              <div className="mb-10 text-center">
                <h3 className="text-3xl font-[Fraunces] font-medium text-[#1B3B26]">Share your thoughts</h3>
                <p className="mt-2 text-[#4A5D4E]">Help others discover the best of Mimi Crunch</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D4E] ml-2">Your Name *</label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-white bg-white/80 p-4 text-sm focus:border-[#F5B041] focus:ring-4 focus:ring-[#F5B041]/10 transition-all outline-none"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={reviewForm.authorName}
                      onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D4E] ml-2">Rating</label>
                    <div className="flex gap-2 p-2 bg-white/50 rounded-2xl w-fit border border-white">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`text-2xl transition-transform hover:scale-125 ${s <= reviewForm.rating ? 'text-[#F5B041]' : 'text-stone-300'}`}
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D4E] ml-2">Review Content</label>
                  <textarea
                    rows="4"
                    className="w-full rounded-[2rem] border border-white bg-white/80 p-6 text-sm focus:border-[#F5B041] focus:ring-4 focus:ring-[#F5B041]/10 transition-all outline-none resize-none"
                    placeholder="Tell us what you love about this superfood..."
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D4E] ml-2">Your Photo (optional)</label>
                    <div className="relative group overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-white/40 p-4 transition hover:border-[#F5B041]">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) => setReviewProfileImageFile(e.target.files[0])}
                      />
                      <div className="flex items-center gap-3 text-stone-500 group-hover:text-[#F5B041]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">👤</div>
                        <span className="text-xs font-semibold">{reviewProfileImageFile ? reviewProfileImageFile.name : 'Upload Profile Photo'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5D4E] ml-2">Product Photo (optional)</label>
                    <div className="relative group overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-white/40 p-4 transition hover:border-[#F5B041]">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) => setReviewProductImageFile(e.target.files[0])}
                      />
                      <div className="flex items-center gap-3 text-stone-500 group-hover:text-[#F5B041]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">📸</div>
                        <span className="text-xs font-semibold">{reviewProductImageFile ? reviewProductImageFile.name : 'Upload Product Photo'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {reviewError && (
                  <p className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">{reviewError}</p>
                )
                }

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full flex items-center justify-center h-14 rounded-2xl bg-[#1B3B26] text-[#F5B041] text-sm font-bold uppercase tracking-widest shadow-xl transition-all hover:bg-[#2A5237] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                >
                  {reviewSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Submitting...
                    </span>
                  ) : "Post Review"}
                </button>
              </form>
            </section>
          </div>
        </section>

        {/* 4. LINKED RECIPES SECTION */}
        {linkedRecipes.length > 0 && (
          <section className="pt-20">
            <div className="mb-12 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-[Fraunces] font-medium text-[#1B3B26]">Cook with {product.name}</h2>
              <p className="mt-3 text-[#4A5D4E]">Delicious ways to include this superfood in your daily meals</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {linkedRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe.slug}`}
                  className="group flex flex-col rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {recipe.image && (
                      <img
                        src={getOptimizedImage(recipe.image)}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B26]/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex gap-2">
                      {recipe.labels?.slice(0, 2).map(label => (
                        <span key={label} className="rounded-lg bg-[#EAE6DF]/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1B3B26]">
                          {label}
                        </span>
                      ))}
                    </div>
                    <h3 className="line-clamp-2 text-xl font-[Fraunces] font-medium text-[#1B3B26] group-hover:text-[#F5B041] transition-colors leading-tight">
                      {recipe.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

              </div>
    </main>
  )
}

export default ProductDetail
