import { Link } from 'react-router-dom'

const Recipes = ({ recipes }) => {
  return (
    <section className="bg-[#fbf8f3] py-16">
      <div className="mx-auto max-w-6xl px-2">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Recipes
          </p>
          <h2 className="text-3xl font-semibold text-stone-900">
            From Our Kitchen To Yours
          </h2>
          <p className="text-stone-600">
            Simple, nutritious recipes powered by Mimi Crunch.
          </p>
        </div>
        {recipes?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((item) => (
              <article
                key={item._id || item.slug || item.title}
                className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-square w-full bg-gradient-to-br from-amber-100 to-stone-50" />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-900">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                      {item.excerpt}
                    </p>
                  ) : null}
                  {item.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.slug ? (
                    <Link
                      to={`/recipes/${item.slug}`}
                      className="mt-4 inline-flex text-sm font-semibold text-brand-900"
                    >
                      View Recipe
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-600">
            New recipes are coming soon. Stay tuned!
          </p>
        )}
      </div>
    </section>
  )
}

export default Recipes
