import BackButton from '../components/BackButton'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/recipes?published=true`)
        const data = await res.json()
        setRecipes(Array.isArray(data) ? data : [])
      } catch (err) {
        setError('Failed to load recipes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-6xl px-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">Recipes</h1>
          <p className="text-stone-600">
            Simple, nutritious recipes powered by Mimi Crunch.
          </p>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : null}
        {loading ? (
          <p className="mt-6 text-sm text-stone-600">Loading recipes...</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-stone-200/70"
              >
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 bg-gradient-to-br from-amber-200 to-stone-100" />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-stone-900">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                      {item.excerpt}
                    </p>
                  ) : null}
                  {item.productSlug ? (
                    <p className="mt-3 text-xs text-stone-500">
                      Made with{' '}
                      <Link
                        to={`/product/${item.productSlug}`}
                        className="font-semibold text-brand-900 underline-offset-2 hover:underline"
                      >
                        {item.productSlug}
                      </Link>
                    </p>
                  ) : null}
                  <Link
                    to={`/recipes/${item.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-brand-900"
                  >
                    View recipe
                  </Link>
                </div>
              </article>
            ))}
            {!loading && !recipes.length ? (
              <p className="col-span-full text-sm text-stone-600">
                No recipes yet.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}

export default RecipesPage
