import { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { Link, useLocation, useParams } from 'react-router-dom'
import { featured as fallbackFeatured, products as fallbackProducts } from '../data/homeData'
import NotFound from './NotFound'
import { getOptimizedImage } from '../utils/imageUtils'

function getRandomFeaturedFromBackend(productsList) {
  if (!Array.isArray(productsList) || productsList.length < 3) return []
  const pool = [...productsList]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3).map((item) => ({
    name: item.name,
    slug: item.slug,
    size: item.size ?? item.variants?.[0]?.weight,
    price: item.price ?? item.variants?.[0]?.price,
    tags: item.tags || [],
    image: item.image ?? item.images?.[0] ?? item.variants?.[0]?.images?.[0],
    desc: item.description || item.desc || '',
  }))
}

const Products = ({
  onAddToCart,
  onIncreaseQty,
  onDecreaseQty,
  cart,
  products,
  loading,
  collections,
}) => {
  const location = useLocation()
  const { collection: collectionParam } = useParams()
  const [featuredItems, setFeaturedItems] = useState([])
  const activeCollection =
    collectionParam ||
    new URLSearchParams(location.search).get('collection')
  const activeCollectionSlug = activeCollection
    ? slugifyCollection(activeCollection)
    : null
  const safeCart = cart ?? []

  const getProductsForCollection = (collection) => {
    if (collection?.productSlugs?.length) {
      const bySlug = new Map(products.map((item) => [item.slug, item]))
      return collection.productSlugs
        .map((slug) => bySlug.get(slug))
        .filter(Boolean)
    }
    if (collection?.slug) {
      return products.filter((item) => item.collection === collection.slug)
    }
    if (collection?.raw) {
      return products.filter((item) => item.collection === collection.raw)
    }
    return products
  }

  const hasBackendCollections = Array.isArray(collections) && collections.length

  const collectionCards = hasBackendCollections
    ? collections.map((collection) => {
        const items = getProductsForCollection(collection)
        return {
          id: collection._id,
          title: collection.title,
          slug: collection.slug,
          raw: collection.slug,
          count: items.length,
          image: collection.image || '',
          desc:
            collection.description ||
            `Explore ${items.length} products in this collection.`,
        }
      })
    : Object.entries(
        products.reduce((acc, item) => {
          const key = item.collection?.trim()
          if (!key) {
            return acc
          }
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(item)
          return acc
        }, {}),
      ).map(([collection, items]) => ({
        title: formatCollectionTitle(collection),
        slug: slugifyCollection(collection),
        raw: collection,
        count: items.length,
        desc: `Explore ${items.length} products in this collection.`,
      }))

  const activeCategory = activeCollectionSlug
    ? collectionCards.find(
        (item) =>
          item.slug === activeCollectionSlug || item.raw === activeCollectionSlug,
      )
    : null

  const visibleProducts = activeCategory
    ? hasBackendCollections
      ? getProductsForCollection(
          collections.find(
            (collection) =>
              collection.slug === activeCategory.slug ||
              collection.slug === activeCategory.raw,
          ) || { slug: activeCategory.raw },
        )
      : getProductsForCollection(activeCategory)
    : products

  const secondaryCollections = activeCategory
    ? collectionCards.filter((item) => item.slug !== activeCategory.slug)
    : collectionCards

  useEffect(() => {
    if (products.length >= 3) {
      setFeaturedItems(getRandomFeaturedFromBackend(products))
    } else {
      setFeaturedItems(
        fallbackFeatured.map((item) => ({
          ...item,
          slug: item.slug || '',
          image: '',
          price: item.price,
        })),
      )
    }
  }, [products])

  if (collectionParam && activeCollectionSlug && !activeCategory) {
    return <NotFound />
  }

  return (
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <BackButton className="mb-6" />
      </div>
      {activeCollection ? (
        <div className="mx-auto max-w-6xl px-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill">
              {activeCategory ? activeCategory.title : activeCollection}
            </span>
            <Link to="/products" className="text-sm font-semibold text-brand-900">
              Clear filter
            </Link>
          </div>
        </div>
      ) : null}
      <ProductGrid
        products={visibleProducts}
        onAddToCart={onAddToCart}
        onIncreaseQty={onIncreaseQty}
        onDecreaseQty={onDecreaseQty}
        cart={safeCart}
        loading={loading}
      />
      <CategoriesSection collections={secondaryCollections} />
      <FeaturedSection featured={featuredItems} />
    </main>
  )
}

const ProductGrid = ({
  products,
  onAddToCart,
  onIncreaseQty,
  onDecreaseQty,
  cart,
  loading,
}) => (
  <section className="py-12">
    <div className="mx-auto max-w-6xl px-2">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
          Shop
        </p>
        <h2 className="text-4xl font-semibold text-stone-900">
          Discover our favourites
        </h2>
        <p className="text-stone-600">
          Single origin millets, clean blends, and everyday staples.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-stone-600">Loading products...</p>
      ) : products.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item) => (
            <Link
              key={item.slug}
              to={`/products/${item.slug}`}
              className="flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              aria-label={`View ${item.name}`}
            >
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-stone-200/60 bg-stone-100">
                {item.image ? (
                  <img
                    className="h-full w-full object-contain"
                    src={getOptimizedImage(item.image)}
                    alt={item.name}
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="space-y-2 px-5 py-4">
                {item.variants?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {item.variants.map((variant) => (
                      <span
                        key={variant.weight}
                        className="inline-flex rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800"
                      >
                        {variant.weight}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="inline-flex w-fit rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
                    {item.size}
                  </span>
                )}
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-900">
                  {item.name}
                </h3>
                {/* <p className="text-xs text-stone-500">{item.desc}</p> */}
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-medium text-stone-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                  <p className="text-sm font-semibold text-stone-900">
                    from ₹{item.price}
                  </p>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
                    View range
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-600">
          No products found for this collection.
        </p>
      )}
    </div>
  </section>
)

const CategoriesSection = ({ collections }) => (
  <section className="py-12">
    <div className="mx-auto max-w-6xl px-2">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
          Collections
        </p>
        <h2 className="text-3xl font-semibold text-stone-900">
          Product Categories
        </h2>
        <p className="text-stone-600">Find the right fit for your pantry.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-stone-200/70 bg-white/90 p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 h-28 w-full overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-100">
              {item.image ? (
                <img
                  src={getOptimizedImage(item.image)}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
            <h3 className="text-lg font-semibold text-stone-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-stone-600">{item.desc}</p>
            <Link
              to={`/${item.slug}`}
              className="mt-4 inline-flex text-sm font-semibold text-brand-900"
            >
              View Range
            </Link>
          </article>
        ))}
        {!collections.length ? (
          <p className="text-sm text-stone-600">
            No collections available yet.
          </p>
        ) : null}
      </div>
    </div>
  </section>
)

const formatCollectionTitle = (value) =>
  value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')

const slugifyCollection = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const FeaturedSection = ({ featured = [] }) => {
  const list = Array.isArray(featured) && featured.length ? featured : fallbackFeatured.map((f) => ({ ...f, slug: '', image: '' }))
  return (
    <section className="bg-brand-100 py-12">
      <div className="mx-auto max-w-6xl px-2">
        <div className="mb-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Highlights
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">
            Featured Products
          </h2>
          <p className="text-stone-600">Popular picks from our community.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <article
              key={item.slug || item.name}
              className="flex flex-col gap-4 rounded-3xl border border-stone-200/70 bg-white/90 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-stone-200/70 bg-gradient-to-br from-amber-100 to-stone-50">
                {item.image ? (
                  <img
                    src={getOptimizedImage(item.image)}
                    alt={item.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div>
                {item.size ? <p className="pill">{item.size}</p> : null}
                <h3 className="mt-2 text-lg font-semibold text-stone-900">
                  {item.name}
                </h3>
                {item.desc ? (
                  <p className="mt-2 text-sm text-stone-600 line-clamp-2">{item.desc}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(item.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {item.slug ? (
                  <Link
                    to={`/products/${item.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-brand-900"
                  >
                    View Product
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Products
