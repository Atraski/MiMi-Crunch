import BackButton from '../components/BackButton'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getOptimizedImage } from '../utils/imageUtils'

const API_BASE_FALLBACK = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const ProductDetail = ({
  apiBase = API_BASE_FALLBACK,
  onAddToCart,
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
      setReviewError('Name is required.')
      return
    }
    if (!hasText && !hasProfile && !hasProduct) {
      setReviewError('Please add at least one: your photo, product photo, or text review.')
      return
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
      const listRes = await fetch(`${apiBase}/api/reviews?productSlug=${encodeURIComponent(product.slug)}`)
      const list = await listRes.json()
      if (Array.isArray(list)) setReviews(list)
    } catch (err) {
      setReviewError(err.message || 'Could not submit review. Try again.')
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
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-2 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-3xl bg-transparent">
            {mainImage ? (
              <img
                className={`max-h-full max-w-full object-contain ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
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
                  className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm transition hover:bg-white"
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm transition hover:bg-white"
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
          {hasMultipleImages ? (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  className={`h-20 overflow-hidden rounded-2xl border ${
                    activeImage === index
                      ? 'border-stone-900'
                      : 'border-stone-200'
                  }`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    className="h-full w-full object-cover"
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              role="dialog"
              aria-modal="true"
              onClick={() => setIsZoomed(false)}
            >
              <button
                className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl font-semibold text-stone-700"
                type="button"
                onClick={() => setIsZoomed(false)}
                aria-label="Close image"
              >
                ×
              </button>
              <img
                className="max-h-[90vh] w-full max-w-5xl object-contain"
                src={getOptimizedImage(mainImage)}
                alt={product.name}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          ) : null}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="pill">{displayWeight}</p>
            {isSoldOut && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                Sold out
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900">
            {product.name}
          </h1>
          <p className="mt-3 text-stone-600">{product.desc}</p>
          <p className="mt-4 text-lg font-semibold text-stone-900">
            ₹{displayPrice}
          </p>
          {variants ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Weight
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((variant, index) => {
                  const vStock = variant.stock ?? 0
                  const vSoldOut = vStock <= 0
                  return (
                    <button
                      key={`${variant.weight}-${index}`}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                        activeVariant === index
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : vSoldOut
                            ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'border-stone-200 bg-white text-stone-700'
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
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {cartLimitMessage ? (
              <p className="text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-xl">
                {cartLimitMessage}
              </p>
            ) : null}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-4 rounded-full border border-stone-200 px-4 py-2">
                <button
                  className="text-lg font-semibold text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => !isSoldOut && onDecreaseQty({ ...product, id: currentCartId, size: displayWeight, selectedVariant })}
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                  disabled={isSoldOut}
                >
                  −
                </button>
                <span className="min-w-[24px] text-center text-sm font-semibold text-stone-800">
                  {qty}
                </span>
                <button
                  className="text-lg font-semibold text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => !isSoldOut && onIncreaseQty({ ...product, id: currentCartId, size: displayWeight, selectedVariant })}
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                  disabled={isSoldOut}
                >
                  +
                </button>
              </div>
              <button
                className="flex-1 rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                type="button"
                disabled={isSoldOut}
                onClick={() =>
                  !isSoldOut &&
                  onAddToCart({
                    ...product,
                    selectedVariant,
                    price: displayPrice,
                    size: displayWeight,
                    image: images[0],
                  })
                }
              >
                {isSoldOut ? 'Sold out' : 'Add to Cart'}
              </button>
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 text-stone-600 disabled:opacity-50"
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
                      setWishlistError('Complete your profile first to add to wishlist.')
                      return
                    }
                    if (!res.ok) {
                      setWishlistError('Failed to add. Try again.')
                      return
                    }
                  } catch {
                    setWishlistError('Failed to add. Try again.')
                  } finally {
                    setWishlistAdding(false)
                  }
                }}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1Z" />
                </svg>
              </button>
              {wishlistError ? (
                <p className="mt-2 text-sm text-red-600">{wishlistError}</p>
              ) : null}
            </div>
            <button
              className="w-full rounded-full bg-emerald-900 px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-50"
              type="button"
            >
              Buy it now
            </button>
          </div>

          <Link className="mt-6 block text-sm font-semibold text-brand-900" to="/products">
            ← Back to Products
          </Link>
        </div>
      </div>

      {(product.benefits || product.trust || product.faqContent || (product.faqs?.length > 0)) ? (
        <div className="w-full px-4 pt-12 pb-12 space-y-12 md:px-6 lg:px-8">
          {product.benefits ? (
            <section>
              <h2 className="text-xl font-semibold text-stone-900">Benefits</h2>
              <div className="mt-3 whitespace-pre-line text-stone-700">
                {product.benefits}
              </div>
            </section>
          ) : null}
          {product.trust ? (
            <section>
              <h2 className="text-xl font-semibold text-stone-900">Why trust us</h2>
              <div
                className="mt-3 prose prose-stone max-w-none text-sm prose-p:text-stone-700 prose-img:inline prose-img:align-middle"
                dangerouslySetInnerHTML={{ __html: product.trust }}
              />
            </section>
          ) : null}
          {(product.faqContent || (product.faqs?.length > 0)) ? (
            <section>
              <h2 className="text-xl font-semibold text-stone-900">FAQ</h2>
              {product.faqContent ? (
                <div
                  className="mt-3 prose prose-stone max-w-none text-sm prose-headings:font-semibold prose-headings:text-stone-900 prose-p:text-stone-700"
                  dangerouslySetInnerHTML={{ __html: product.faqContent }}
                />
              ) : (
                <dl className="mt-3 space-y-4">
                  {product.faqs.map((faq, idx) => (
                    <div key={idx}>
                      <dt className="font-semibold text-stone-900">{faq.question}</dt>
                      <dd className="mt-1 text-stone-600">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ) : null}
        </div>
      ) : null}

      <section className="w-full px-4 pt-16 pb-20 md:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-stone-900">Reviews &amp; testimonials</h2>
        <p className="mt-1 text-sm text-stone-500">What others say about this product</p>

        {reviewsLoading ? (
          <p className="mt-6 text-sm text-stone-500">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <div className="mt-6">
            <div
              ref={reviewCarouselRef}
              className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth scrollbar-thin"
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
                    className={`flex h-full min-w-[min(100%,320px)] max-w-[320px] flex-shrink-0 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm`}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                        {profileImg ? (
                          <img
                            src={profileImg}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-stone-400">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {displayName}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= r.rating ? 'text-amber-500' : 'text-stone-300'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          {r.isPinned ? (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                              Pinned
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <time className="mt-1.5 block text-xs text-stone-500" dateTime={r.createdAt}>
                      {formatReviewDate(r.createdAt)}
                    </time>
                    {r.content ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-700 line-clamp-4">
                        {r.content}
                      </p>
                    ) : null}
                    {productImg ? (
                      <div className="mt-3">
                        <img
                          src={productImg}
                          alt="Product"
                          className="h-24 w-full rounded-xl border border-stone-200 object-cover"
                        />
                      </div>
                    ) : null}
                    {r.replyText ? (
                      <div className="mt-4 rounded-xl border-l-2 border-stone-300 bg-stone-50 p-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          Response
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-stone-700">{r.replyText}</p>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
            {reviews.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollReview(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50"
                  aria-label="Previous review"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scrollReview(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50"
                  aria-label="Next review"
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-stone-500">No reviews yet.</p>
        )}

        {linkedRecipes.length ? (
          <div className="mt-12 border-t border-stone-200 pt-10">
            <h3 className="text-base font-semibold text-stone-900">
              Recipes using this product
            </h3>
            {recipesLoading ? (
              <p className="mt-3 text-sm text-stone-600">Loading recipes...</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {linkedRecipes.map((recipe) => (
                  <Link
                    key={recipe._id}
                    to={`/recipes/${recipe.slug}`}
                    className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-3 text-left hover:border-stone-300 hover:shadow-sm"
                  >
                    {recipe.coverImage ? (
                      <img
                        src={recipe.coverImage}
                        alt={recipe.title}
                        className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-amber-100" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900">
                        {recipe.title}
                      </p>
                      {recipe.excerpt ? (
                        <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                          {recipe.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50/50 p-6">
          <h3 className="text-base font-semibold text-stone-900">Write a review</h3>
          <p className="mt-1 text-sm text-stone-500">Share your experience with this product</p>
          <form onSubmit={handleSubmitReview} className="mt-5 max-w-xl space-y-4">
            <p className="text-xs text-stone-500">
              Name is required. Add at least one: your photo, product photo, or text review.
            </p>
            <div>
              <label htmlFor="review-name" className="block text-xs font-medium text-stone-600">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-name"
                type="text"
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
                placeholder="Your name"
                value={reviewForm.authorName}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, authorName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600">Rating</label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-2xl leading-none ${reviewForm.rating >= star ? 'text-amber-500' : 'text-stone-300'}`}
                    onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="review-content" className="block text-xs font-medium text-stone-600">
                Text review (optional)
              </label>
              <textarea
                id="review-content"
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
                rows={4}
                placeholder="Share your experience with this product..."
                value={reviewForm.content}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, content: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-stone-600">
                  Your photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-stone-600 file:mr-2 file:rounded-lg file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700"
                  onChange={(e) => setReviewProfileImageFile(e.target.files?.[0] || null)}
                />
                {reviewProfileImageFile ? (
                  <p className="mt-1 text-xs text-stone-500">{reviewProfileImageFile.name}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600">
                  Product photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-stone-600 file:mr-2 file:rounded-lg file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700"
                  onChange={(e) => setReviewProductImageFile(e.target.files?.[0] || null)}
                />
                {reviewProductImageFile ? (
                  <p className="mt-1 text-xs text-stone-500">{reviewProductImageFile.name}</p>
                ) : null}
              </div>
            </div>
            {reviewError ? (
              <p className="text-sm text-red-600">{reviewError}</p>
            ) : null}
            <button
              type="submit"
              disabled={
                reviewSubmitting ||
                !reviewForm.authorName.trim() ||
                (!reviewForm.content.trim() && !reviewProfileImageFile && !reviewProductImageFile)
              }
              className="rounded-full bg-stone-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default ProductDetail
