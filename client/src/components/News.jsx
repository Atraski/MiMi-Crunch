import { Link } from 'react-router-dom'

const News = ({ news }) => {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Journal
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">
            The World of Mimi Crunch
          </h2>
          <p className="text-stone-600">
            Latest updates, stories, and product launches.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-stone-200/70 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-stone-50">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              {item.date ? <p className="pill">{item.date}</p> : null}
              <h3 className="mt-3 text-lg font-semibold text-stone-900">
                {item.title}
              </h3>
              {item.excerpt ? (
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                  {item.excerpt}
                </p>
              ) : null}
              {item.slug ? (
                <Link
                  to={`/news/${item.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-brand-900"
                >
                  Read More
                </Link>
              ) : (
                <span className="mt-4 inline-flex text-sm font-semibold text-brand-900">
                  Read More
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default News
