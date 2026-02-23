import BackButton from '../components/BackButton'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const RecipeDetail = () => {
  const { slug } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkedProduct, setLinkedProduct] = useState(null)
  const [linkedProductLoading, setLinkedProductLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/api/recipes/slug/${slug}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setRecipe(data)
      } catch (err) {
        setError('Failed to load recipe.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  useEffect(() => {
    if (!recipe?.productSlug) {
      setLinkedProduct(null)
      return
    }
    let cancelled = false
    const loadProduct = async () => {
      setLinkedProductLoading(true)
      try {
        const res = await fetch(
          `${API_BASE}/api/products/slug/${encodeURIComponent(
            recipe.productSlug,
          )}`,
        )
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setLinkedProduct(data)
        }
      } catch {
        if (!cancelled) {
          setLinkedProduct(null)
        }
      } finally {
        if (!cancelled) {
          setLinkedProductLoading(false)
        }
      }
    }
    loadProduct()
    return () => {
      cancelled = true
    }
  }, [recipe?.productSlug])

  if (loading) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-6xl px-2">
          <p className="text-sm text-stone-600">Loading recipe...</p>
        </div>
      </main>
    )
  }

  if (error || !recipe) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-6xl px-2">
          <BackButton className="mb-6" />
          <p className="text-sm text-red-600">{error || 'Recipe not found.'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="py-16">
      <div className="mx-auto max-w-6xl px-2">
        <BackButton className="mb-6" />
      </div>
      <article className="mx-auto max-w-6xl px-2">
        <header className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-start">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">{recipe.title}</h1>
            {recipe.excerpt ? (
              <p className="mt-3 text-stone-600">{recipe.excerpt}</p>
            ) : null}
            {recipe.productSlug ? (
              <div className="mt-4 space-y-2 text-sm text-stone-600">
                <p>
                  Made with{' '}
                  <Link
                    to={`/product/${recipe.productSlug}`}
                    className="font-semibold text-brand-900 underline-offset-2 hover:underline"
                  >
                    {linkedProduct?.title || linkedProduct?.name || recipe.productSlug}
                  </Link>
                </p>
                {linkedProduct ? (
                  <Link
                    to={`/product/${recipe.productSlug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-900 shadow-sm transition hover:bg-brand-100"
                  >
                    {linkedProduct.image || linkedProduct.images?.[0] ? (
                      <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/80">
                        <img
                          src={linkedProduct.image || linkedProduct.images?.[0]}
                          alt={linkedProduct.title || linkedProduct.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                    ) : null}
                    <span>View product</span>
                  </Link>
                ) : linkedProductLoading ? (
                  <p className="text-xs text-stone-500">Loading product details…</p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            {recipe.coverImage ? (
              <img
                src={recipe.coverImage}
                alt={recipe.title}
                className="h-56 w-full rounded-2xl object-cover md:h-64"
              />
            ) : null}
            {recipe.videoUrl ? (
              <video
                src={recipe.videoUrl}
                controls
                className="w-full rounded-2xl bg-black/5"
              />
            ) : null}
          </div>
        </header>

        <section className="prose prose-stone mt-10 max-w-none text-sm leading-relaxed">
          {recipe.contentHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: recipe.contentHtml }}
            />
          ) : (
            <p>No content yet.</p>
          )}
        </section>
      </article>
    </main>
  )
}

export default RecipeDetail

