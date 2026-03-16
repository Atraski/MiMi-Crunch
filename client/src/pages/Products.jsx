import { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { Link, useLocation, useParams } from 'react-router-dom'
import { featured as fallbackFeatured, products as fallbackProducts } from '../data/homeData'
import NotFound from './NotFound'
import { getOptimizedImage } from '../utils/imageUtils'
import { getProductColor, getContrastColor } from '../utils/productColors'

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
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-hidden py-16 px-4 font-[Manrope]">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl relative z-10">
        <BackButton className="mb-8 text-[#1B3B26]" />

        {activeCollection ? (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="bg-[#1B3B26] text-[#F5B041] px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-md">
              {activeCategory ? activeCategory.title : activeCollection}
            </span>
            <Link to="/products" className="text-sm font-semibold text-[#1B3B26] hover:text-[#2A5237] transition-colors underline underline-offset-4 decoration-2 decoration-[#F5B041]/40 hover:decoration-[#F5B041]">
              Clear filter
            </Link>
          </div>
        ) : null}

        <ProductGrid
          products={visibleProducts}
          onAddToCart={onAddToCart}
          onIncreaseQty={onIncreaseQty}
          onDecreaseQty={onDecreaseQty}
          loading={loading}
        />

        {secondaryCollections?.length > 0 && (
          <CategoriesSection collections={secondaryCollections} />
        )}

        <FeaturedSection featured={featuredItems} />
      </div>
    </main>
  )
}

const ProductGrid = ({
  products,
  onAddToCart,
  onIncreaseQty,
  onDecreaseQty,
  loading,
}) => (
  <section className="py-8">
    <div className="mb-10 space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#F5B041]">
        Shop
      </p>
      <h2 className="text-4xl md:text-5xl font-[Fraunces] font-medium text-[#1B3B26] tracking-tight">
        Discover our favourites
      </h2>
      <p className="text-lg text-[#4A5D4E]">
        Single origin millets, clean blends, and everyday staples.
      </p>
    </div>

    {loading ? (
      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex animate-pulse space-x-4">
            <div className="h-[300px] bg-[#EAE6DF]/60 rounded-3xl w-full"></div>
          </div>
        ))}
      </div>
    ) : products.length ? (
      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard
            key={item.slug}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-16 bg-white/40 rounded-[2rem] border border-stone-200/50 border-dashed backdrop-blur-md">
        <p className="text-lg text-[#4A5D4E]">No products found for this collection.</p>
      </div>
    )}
  </section>
)

const ProductCard = ({ item, onAddToCart }) => {
  const [showVariants, setShowVariants] = useState(false);
  const primaryImg = item.image || item.images?.[0] || item.variants?.[0]?.images?.[0];
  const secondaryImg = item.images?.[1] || item.variants?.[0]?.images?.[1];
  const brandColor = getProductColor(item.slug);

  const handlePlusClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.variants?.length > 1) {
      setShowVariants(true);
    } else {
      const { clientX, clientY } = e;
      const productToAdd = item.variants?.length === 1 
        ? { ...item, size: item.variants[0].weight, price: item.variants[0].price }
        : item;
      onAddToCart?.(productToAdd, { x: clientX, y: clientY });
    }
  };

  const handleSelectVariant = (e, variant) => {
    e.preventDefault();
    e.stopPropagation();
    const { clientX, clientY } = e;
    const productToAdd = { 
      ...item, 
      size: variant.weight, 
      price: variant.price,
      image: variant.images?.[0] || item.image
    };
    onAddToCart?.(productToAdd, { x: clientX, y: clientY });
    setShowVariants(false);
  };

  return (
    <div className="relative group">
      <Link
        to={`/products/${item.slug}`}
        className="flex flex-col h-full overflow-hidden backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.06)] rounded-[2rem] transition-all hover:shadow-[0_24px_50px_-15px_rgba(27,59,38,0.12)] hover:-translate-y-1"
        aria-label={`View ${item.name}`}
      >
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border-b border-stone-200/40 bg-white/40">
          {primaryImg ? (
            <>
              <img
                className={`absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-700 ease-in-out group-hover:scale-105 ${secondaryImg ? 'group-hover:opacity-0' : ''}`}
                src={getOptimizedImage(primaryImg)}
                alt={item.name}
                loading="lazy"
              />
              {secondaryImg ? (
                <img
                  className="absolute inset-0 h-full w-full object-contain p-4 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                  src={getOptimizedImage(secondaryImg)}
                  alt={`${item.name} alternate view`}
                  loading="lazy"
                />
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex flex-col flex-1 p-4 sm:p-6 bg-white/40">
          <div className="flex flex-col gap-2 mb-3">
            {item.variants?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {item.variants.map((variant) => (
                  <span
                    key={variant.weight}
                    className="inline-flex rounded-md border px-2 py-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider"
                    style={{ borderColor: `${brandColor}30`, color: brandColor, backgroundColor: `${brandColor}10` }}
                  >
                    {variant.weight}
                  </span>
                ))}
              </div>
            ) : (
              <span
                className="inline-flex w-fit rounded-md border px-2 py-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider"
                style={{ borderColor: `${brandColor}30`, color: brandColor, backgroundColor: `${brandColor}10` }}
              >
                {item.size || 'PACK'}
              </span>
            )}
            <h3 className="line-clamp-2 text-sm sm:text-lg font-[Fraunces] font-medium text-[#1B3B26] leading-tight group-hover:text-[#F5B041] transition-colors">
              {item.name}
            </h3>
          </div>

          <div className="hidden flex-wrap gap-1.5 sm:flex mb-4">
            {item.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-lg border border-stone-200/60 bg-white/60 px-2.5 py-1 text-[10px] font-semibold text-[#4A5D4E]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-stone-200/60 pt-4">
            <p className="text-sm font-bold text-[#1B3B26]">
              <span className="text-xs text-[#4A5D4E] font-medium mr-1">from</span>₹{item.price}
            </p>
            <button
              onClick={handlePlusClick}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md transition-all active:scale-90 hover:shadow-lg"
              style={{ backgroundColor: brandColor }}
              aria-label={`Add ${item.name} to cart`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </Link>

      {/* Variant Selection Overlay */}
      {showVariants && (
        <div 
          className="absolute inset-x-2 bottom-2 z-20 backdrop-blur-2xl bg-[#1B3B26]/95 p-5 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300"
          onMouseLeave={() => setShowVariants(false)}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Select Size</span>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowVariants(false); }}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {item.variants?.map((variant) => (
              <button
                key={variant.weight}
                onClick={(e) => handleSelectVariant(e, variant)}
                className="group/btn flex items-center justify-between bg-white/5 hover:bg-white/20 border border-white/10 rounded-2xl p-3.5 transition-all text-white active:scale-95"
              >
                <div className="flex flex-col items-start translate-x-0 transition-transform group-hover/btn:translate-x-1">
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">{variant.weight}</span>
                  <span className="font-bold text-sm tracking-tight">₹{variant.price}</span>
                </div>
                <div className="bg-[#F5B041] rounded-full p-1.5 opacity-0 -translate-x-2 transition-all group-hover/btn:opacity-100 group-hover/btn:translate-x-0">
                  <svg className="w-4 h-4 text-[#1B3B26]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const CategoriesSection = ({ collections }) => (
  <section className="py-12 relative">
    <div className="mb-10 space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5B041]">
        Collections
      </p>
      <h2 className="text-3xl md:text-4xl font-[Fraunces] font-medium text-[#1B3B26]">
        Product Categories
      </h2>
      <p className="text-lg text-[#4A5D4E]">Find the right fit for your pantry.</p>
    </div>
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {collections.map((item) => (
        <article
          key={item.title}
          className="group backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.06)] rounded-[2rem] p-4 sm:p-6 transition-all hover:shadow-[0_24px_50px_-15px_rgba(27,59,38,0.12)] hover:-translate-y-1"
        >
          <div className="mb-4 h-24 sm:h-36 w-full overflow-hidden rounded-[1.5rem] border border-stone-200/40 bg-[#EAE6DF]/40 relative">
            {item.image ? (
              <img
                src={getOptimizedImage(item.image)}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : null}
          </div>
          <h3 className="line-clamp-2 text-base sm:text-xl font-[Fraunces] font-medium text-[#1B3B26] group-hover:text-[#F5B041] transition-colors">
            {item.title}
          </h3>
          <p className="mt-2 hidden text-sm text-[#4A5D4E] sm:block">{item.desc}</p>
          <Link
            to={`/${item.slug}`}
            className="mt-4 inline-flex items-center text-xs font-semibold text-[#1B3B26] hover:text-[#FAFAFA] hover:bg-[#1B3B26] border border-[#1B3B26] rounded-lg px-4 py-2 transition-all sm:text-sm"
          >
            Explore <span className="ml-1 leading-none transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </article>
      ))}
    </div>
  </section>
)

const FeaturedSection = ({ featured = [] }) => {
  const list = Array.isArray(featured) && featured.length ? featured : fallbackFeatured.map((f) => ({ ...f, slug: '', image: '' }))

  if (!list.length) return null;

  return (
    <section className="py-16 mt-8 rounded-[3rem] bg-[#1B3B26] relative overflow-hidden backdrop-blur-sm shadow-[0_30px_60px_-15px_rgba(27,59,38,0.3)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B041] opacity-10 rounded-full blur-3xl transform translate-x-20 -translate-y-20 pointer-events-none"></div>

      <div className="mx-auto max-w-6xl px-6 sm:px-10 relative z-10">
        <div className="mb-10 space-y-4 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F5B041]">
            Highlights
          </p>
          <h2 className="text-3xl md:text-4xl font-[Fraunces] font-medium text-white">
            Featured Products
          </h2>
          <p className="text-[#a8b8ae]">Popular picks from our community.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {list.map((item) => {
            const brandColor = item.slug ? getProductColor(item.slug) : '#F5B041';

            return (
              <article
                key={item.slug || item.name}
                className="group flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-sm transition-all hover:bg-white/10 hover:-translate-y-1 sm:p-6 backdrop-blur-md"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-white/80 p-6">
                  {item.image ? (
                    <>
                      <img
                        src={getOptimizedImage(item.image)}
                        alt={item.name}
                        className={`absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 ease-in-out group-hover:scale-105 ${item.images && item.images[1] ? 'group-hover:opacity-0' : ''}`}
                        loading="lazy"
                      />
                      {item.images && item.images[1] ? (
                        <img
                          src={getOptimizedImage(item.images[1])}
                          alt={`${item.name} alternate`}
                          className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                          loading="lazy"
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
                <div className="flex flex-col flex-1">
                  {item.size ? (
                    <p className="bg-white/10 border border-white/10 text-white w-fit px-2 py-1 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider mb-2">
                      {item.size}
                    </p>
                  ) : null}

                  <h3 className="line-clamp-2 text-sm font-[Fraunces] font-medium text-white sm:text-xl leading-tight">
                    {item.name}
                  </h3>

                  {item.desc ? (
                    <p className="mt-2 hidden text-sm text-[#a8b8ae] line-clamp-2 sm:block">{item.desc}</p>
                  ) : null}

                  <div className="mt-auto pt-4 border-t border-white/10 text-right">
                    {item.slug ? (
                      <Link
                        to={`/products/${item.slug}`}
                        className="inline-flex items-center text-xs font-bold uppercase tracking-widest sm:text-sm hover:opacity-80 transition-opacity"
                        style={{ color: brandColor }}
                      >
                        View Product <span className="ml-1 leading-none text-lg">→</span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default Products

function formatCollectionTitle(value) {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function slugifyCollection(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
