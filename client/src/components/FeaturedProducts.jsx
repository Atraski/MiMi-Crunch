import { Link } from 'react-router-dom'

const FeaturedProducts = ({ featured }) => {
  return (
    <section className="bg-[#fbf8f3] py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Best Sellers
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">
            Featured Products
          </h2>
          <p className="text-stone-600">Most loved picks from our community.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <article
              key={item.slug || item.name}
              className="flex flex-col gap-3 rounded-3xl border border-stone-200/70 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="h-44 overflow-hidden rounded-2xl border border-stone-200/70 bg-gradient-to-br from-amber-100 to-stone-50">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  {item.size ? <p className="pill">{item.size}</p> : <span />}
                  {typeof item.price === 'number' ? (
                    <p className="text-sm font-semibold text-stone-900">
                      ₹{item.price}
                    </p>
                  ) : null}
                </div>
                <h3 className="mt-2 text-base font-semibold text-stone-900">
                  {item.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {item.slug ? (
                <Link
                  to={`/products/${item.slug}`}
                  className="btn btn-ghost mt-1 w-fit px-4 py-1.5 text-sm"
                >
                  View Product
                </Link>
              ) : (
                <button className="btn btn-ghost mt-1 w-fit px-4 py-1.5 text-sm">
                  View Product
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
