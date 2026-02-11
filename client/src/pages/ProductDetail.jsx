import BackButton from '../components/BackButton'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE_FALLBACK = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const ProductDetail = ({
  apiBase = API_BASE_FALLBACK,
  onAddToCart,
  onIncreaseQty,
  onDecreaseQty,
  cart,
  products,
}) => {
  // 1. SAARE HOOKS (TOP LEVEL)
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const product = products.find((item) => item.slug === slug)
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
  const [reviewImageFile, setReviewImageFile] = useState(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [linkedRecipes, setLinkedRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(false)
  const reviewCarouselRef = useRef(null)

  // Effects
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
  if (!product) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-4">
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

  const uploadReviewImage = async () => {
    if (!reviewImageFile || !apiBase) return null
    const res = await fetch(`${apiBase}/api/uploads/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'reviews' }),
    })
    if (!res.ok) throw new Error('Upload signature failed')
    const { signature, timestamp, cloudName, apiKey } = await res.json()
    const formData = new FormData()
    formData.append('file', reviewImageFile)
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
    if (!product?.slug || !reviewForm.content.trim()) return
    setReviewError('')
    setReviewSubmitting(true)
    try {
      let imageUrl = null
      if (reviewImageFile) imageUrl = await uploadReviewImage()
      const res = await fetch(`${apiBase}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: product.slug,
          rating: Math.min(5, Math.max(1, Number(reviewForm.rating) || 5)),
          content: reviewForm.content.trim(),
          authorName: reviewForm.authorName.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      setReviewForm({ rating: 5, content: '', authorName: '' })
      setReviewImageFile(null)
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
      <div className="mx-auto max-w-6xl px-4">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-3xl bg-transparent">
            {mainImage ? (
              <img
                className={`max-h-full max-w-full object-contain ${
                  isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                src={mainImage}
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
                    src={img}
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
                src={mainImage}
                alt={product.name}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          ) : null}
        </div>
        <div>
          <p className="pill">{displayWeight}</p>
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
                {variants.map((variant, index) => (
                  <button
                    key={`${variant.weight}-${index}`}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                      activeVariant === index
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                    type="button"
                    onClick={() => {
                      setActiveVariant(index)
                      setActiveImage(0)
                    }}
                  >
                    {variant.weight}
                  </button>
                ))}
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
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-4 rounded-full border border-stone-200 px-4 py-2">
                <button
                  className="text-lg font-semibold text-stone-700"
                  onClick={() => onDecreaseQty(product)}
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  −
                </button>
                <span className="min-w-[24px] text-center text-sm font-semibold text-stone-800">
                  {qty}
                </span>
                <button
                  className="text-lg font-semibold text-stone-700"
                  onClick={() => onIncreaseQty(product)}
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                >
                  +
                </button>
              </div>
              <button
                className="flex-1 rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-emerald-400"
                type="button"
                onClick={() =>
                  onAddToCart({
                    ...product,
                    selectedVariant,
                    price: displayPrice,
                    size: displayWeight,
                    image: images[0],
                  })
                }
              >
                Add to Cart
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

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20">
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
              {reviews.map((r) => (
                <article
                  key={r._id}
                  data-review-card
                  className={`flex h-full min-w-[min(100%,320px)] max-w-[320px] flex-shrink-0 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-stone-400">
                          {r.authorName ? r.authorName.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {r.authorName || 'Anonymous'}
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
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-700 line-clamp-4">
                    {r.content}
                  </p>
                  {r.replyText ? (
                    <div className="mt-4 rounded-xl border-l-2 border-stone-300 bg-stone-50 p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        Response
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-stone-700">{r.replyText}</p>
                    </div>
                  ) : null}
                </article>
              ))}
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
                Your review
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
                required
              />
            </div>
            <div>
              <label htmlFor="review-name" className="block text-xs font-medium text-stone-600">
                Name (optional)
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
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600">
                Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm text-stone-600 file:mr-2 file:rounded-lg file:border-0 file:bg-stone-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700"
                onChange={(e) => setReviewImageFile(e.target.files?.[0] || null)}
              />
            </div>
            {reviewError ? (
              <p className="text-sm text-red-600">{reviewError}</p>
            ) : null}
            <button
              type="submit"
              disabled={reviewSubmitting || !reviewForm.content.trim()}
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
