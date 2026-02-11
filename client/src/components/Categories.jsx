import { Link } from 'react-router-dom'

const Categories = ({ collections }) => {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Collections
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">
            Product Categories
          </h2>
          <p className="text-stone-600">
            Handpicked ranges designed for health, taste, and convenience.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-stone-200/70 bg-white/90 p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 h-12 w-12 rounded-2xl border border-amber-200/70 bg-amber-50" />
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
            <p className="text-sm text-stone-600">No collections available yet.</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default Categories
