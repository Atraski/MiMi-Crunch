import BackButton from '../components/BackButton'
import { Link, useParams } from 'react-router-dom'
import { categories } from '../data/homeData'

const CollectionPage = ({
  onAddToCart,
  onIncreaseQty,
  onDecreaseQty,
  cart,
  slugOverride,
  products,
}) => {
  const { slug: routeSlug } = useParams()
  const slug = slugOverride ?? routeSlug
  const safeCart = cart ?? []
  const collection = categories.find((item) => item.slug === slug)
  const collectionProducts = products.filter(
    (item) => item.collection === slug,
  )

  if (!collection) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-2">
          <h1 className="text-2xl font-semibold text-stone-900">
            Collection not found
          </h1>
          <p className="mt-2 text-stone-600">
            Please check the collection link or go back to the products page.
          </p>
          <Link className="btn btn-primary mt-6" to="/products">
            Back to Products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-6xl px-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Collection
          </p>
          <h1 className="text-4xl font-semibold text-stone-900">
            {collection.title}
          </h1>
          <p className="text-stone-600">{collection.desc}</p>
        </div>
      </div>
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-2">
          {collectionProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {collectionProducts.map((item) => {
                const cartItem = safeCart.find(
                  (entry) => entry.id === item.slug,
                )
                const qty = cartItem ? cartItem.qty : 0
                return (
                  <article
                    key={item.slug}
                    className="flex flex-col gap-2 sm:gap-4"
                  >
                    <Link
                      to={`/products/${item.slug}`}
                      className="relative h-40 overflow-hidden rounded-xl bg-stone-100 sm:h-60 sm:rounded-xl"
                      aria-label={`View ${item.name}`}
                    />
                    <div className="space-y-1 sm:space-y-2">
                      <span className="inline-flex w-fit rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 sm:px-3 sm:py-1 sm:text-xs">
                        {item.size}
                      </span>
                      <h3 className="line-clamp-2 text-xs font-semibold uppercase tracking-[0.06em] text-stone-900 sm:text-sm sm:tracking-[0.08em]">
                        {item.name}
                      </h3>
                      <p className="hidden text-xs text-stone-500 sm:block">{item.desc}</p>
                      <div className="hidden flex-wrap gap-2 sm:flex">
                        {item.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-stone-900 sm:text-sm">
                        from ₹{item.price}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              No products found for this collection.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default CollectionPage
