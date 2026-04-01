import BackButton from '../components/BackButton'
import SEO from '../components/SEO'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

/* ─── Small helpers ──────────────────────────────────────────────── */

const DifficultyBadge = ({ level }) => {
  const map = {
    easy:   { label: 'Easy',   cls: 'bg-emerald-100 text-emerald-700' },
    medium: { label: 'Medium', cls: 'bg-amber-100   text-amber-700'   },
    hard:   { label: 'Hard',   cls: 'bg-rose-100    text-rose-700'    },
  }
  const d = map[level?.toLowerCase()] || null
  if (!d) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${d.cls}`}>
      <span className="text-base leading-none">
        {level === 'easy' ? '🟢' : level === 'medium' ? '🟡' : '🔴'}
      </span>
      {d.label}
    </span>
  )
}

const StatPill = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1 rounded-2xl border border-[#1B3B26]/10 bg-white/60 px-5 py-3 backdrop-blur-sm text-center min-w-[80px]">
    <span className="text-xl leading-none">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E]/70">{label}</span>
    <span className="text-sm font-bold text-[#1B3B26] leading-tight">{value}</span>
  </div>
)

/* ─── Main Component ─────────────────────────────────────────────── */

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
      } catch {
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
        const res = await fetch(`${API_BASE}/api/products/slug/${encodeURIComponent(recipe.productSlug)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setLinkedProduct(data)
      } catch {
        if (!cancelled) setLinkedProduct(null)
      } finally {
        if (!cancelled) setLinkedProductLoading(false)
      }
    }
    loadProduct()
    return () => { cancelled = true }
  }, [recipe?.productSlug])

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-[Manrope]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#1B3B26]/20 border-t-[#1B3B26] rounded-full animate-spin" />
          <p className="text-[#4A5D4E] font-semibold tracking-wide animate-pulse">Cooking up recipe details…</p>
        </div>
      </main>
    )
  }

  /* ── Error / Not Found ── */
  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-6 px-4 font-[Manrope]">
        <BackButton />
        <div className="h-20 w-20 rounded-full bg-[#EAE6DF] flex items-center justify-center text-[#1B3B26]/40">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-[Fraunces] font-medium text-[#1B3B26]">Recipe Not Found</h2>
        <p className="text-[#4A5D4E]">{error || "We couldn't find the recipe you're looking for."}</p>
      </main>
    )
  }

  /* ── Helpers ── */
  const hasStats = recipe.time || recipe.servings || recipe.difficulty
  const hasIngredients = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
  const hasSteps = Array.isArray(recipe.steps) && recipe.steps.length > 0
  const hasStructured = hasIngredients || hasSteps

  return (
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-x-hidden pt-6 pb-24 px-4 font-[Manrope]">
      <SEO
        title={recipe.metaTitle || recipe.title}
        description={recipe.metaDescription || recipe.excerpt}
        schemaMarkup={recipe.schemaMarkup}
        slug={recipe.slug}
        type="article"
      />

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full bg-[#1B3B26] opacity-[0.03] blur-[140px]" />
      <div className="pointer-events-none absolute top-[30%] -right-20 w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-[#F5B041] opacity-[0.05] blur-[120px]" />

      <div className="mx-auto max-w-6xl relative z-10 flex flex-col gap-12">

        <BackButton className="text-[#1B3B26]" />

        {/* ════════════════════════════════════════════
            HERO — Media + Info side by side
        ════════════════════════════════════════════ */}
        <header className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">

          {/* Left — Media */}
          <div className="order-2 lg:order-1 relative rounded-[2.5rem] overflow-hidden bg-white/60 border border-white shadow-[0_24px_60px_-15px_rgba(27,59,38,0.18)] aspect-square lg:aspect-[4/5] group">
            {recipe.videoUrl ? (
              <video src={recipe.videoUrl} controls className="w-full h-full object-cover" />
            ) : recipe.coverImage ? (
              <img
                src={recipe.coverImage}
                alt={recipe.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#EAE6DF]/50">
                <span className="text-8xl">🍳</span>
              </div>
            )}

            {/* Time badge floating on image */}
            {recipe.time && (
              <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-bold text-[#1B3B26] shadow-md">
                <span>⏱</span> {recipe.time}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="order-1 lg:order-2 flex flex-col gap-5 items-start">

            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1B3B26] text-[#F5B041] px-5 py-2 text-[11px] font-black tracking-[0.18em] uppercase shadow-lg shadow-[#1B3B26]/10">
              <span>✦</span> Chef's Special
            </span>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-[Fraunces] font-medium text-[#1B3B26] leading-[1.08]">
              {recipe.title}
            </h1>

            {/* Highlight Line */}
            {recipe.highlightLine && (
              <p className="text-lg text-[#4A5D4E] leading-relaxed border-l-[3px] border-[#F5B041] pl-5 italic">
                {recipe.highlightLine}
              </p>
            )}

            {/* Stats Pills */}
            {hasStats && (
              <div className="flex flex-wrap gap-3 mt-1">
                {recipe.time && <StatPill icon="⏱" label="Time" value={recipe.time} />}
                {recipe.servings && <StatPill icon="🍽️" label="Servings" value={recipe.servings} />}
                {recipe.difficulty && <DifficultyBadge level={recipe.difficulty} />}
              </div>
            )}

            {/* Linked Product Card */}
            {recipe.productSlug && (
              <div className="mt-2 w-full max-w-sm rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/80 p-5 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.08)] relative overflow-hidden group/product">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B041] opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none" />

                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5B041]/20 text-xs">✨</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B3B26]/70">Our Star Ingredient</span>
                </div>

                {linkedProductLoading ? (
                  <div className="flex items-center gap-3 p-3">
                    <div className="h-14 w-14 rounded-[1rem] bg-[#EAE6DF]/60 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-[#EAE6DF]/60 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-[#EAE6DF]/60 rounded animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/product/${recipe.productSlug}`}
                    className="flex items-center gap-4 relative z-10 bg-white/40 hover:bg-white rounded-[1.5rem] p-3 transition-all duration-300 border border-white/60 hover:border-white shadow-sm hover:shadow-md"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[1rem] bg-white shadow-sm border border-[#1B3B26]/5">
                      {(linkedProduct?.image || linkedProduct?.images?.[0]) && (
                        <img
                          src={linkedProduct.image || linkedProduct.images?.[0]}
                          alt={linkedProduct.name}
                          className="h-full w-full object-cover p-1.5 mix-blend-multiply transition-transform duration-500 group-hover/product:scale-110"
                        />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-base font-[Fraunces] font-semibold text-[#1B3B26] group-hover/product:text-[#F5B041] transition-colors truncate capitalize">
                        {linkedProduct?.name || recipe.productSlug.split('-').join(' ')}
                      </span>
                      <div className="flex items-center mt-1 text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                        Shop Ingredient
                        <svg className="w-3.5 h-3.5 ml-1 transform transition-transform group-hover/product:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="mt-4 pt-3 border-t border-[#1B3B26]/10 flex items-center justify-between relative z-10 mx-1">
                  <span className="text-[11px] font-semibold text-[#4A5D4E]">+ full recipe below</span>
                  <span className="text-[10px] bg-white border border-[#1B3B26]/10 rounded-full h-6 w-6 flex items-center justify-center animate-bounce shadow-sm">👇</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ════════════════════════════════════════════
            STRUCTURED CONTENT — Ingredients + Steps
        ════════════════════════════════════════════ */}
        {hasStructured && (
          <section className="grid lg:grid-cols-[1fr_1.8fr] gap-8 items-start">

            {/* Ingredients */}
            {hasIngredients && (
              <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white shadow-[0_12px_40px_-10px_rgba(27,59,38,0.08)] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1B3B26] to-[#2d6641] rounded-t-[2.5rem]" />

                <div className="flex items-center gap-3 mb-7">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1B3B26] text-white text-lg shadow-md">
                    🧂
                  </div>
                  <h2 className="text-xl font-[Fraunces] font-semibold text-[#1B3B26]">Ingredients</h2>
                </div>

                <ul className="flex flex-col gap-3">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 group/ing">
                      <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 border-[#F5B041] bg-[#F5B041]/10 flex items-center justify-center">
                        <span className="block h-2 w-2 rounded-full bg-[#F5B041] group-hover/ing:scale-125 transition-transform duration-200" />
                      </span>
                      <span className="text-[#4A5D4E] leading-snug text-sm font-medium">{ing}</span>
                    </li>
                  ))}
                </ul>

                {recipe.servings && (
                  <div className="mt-6 pt-5 border-t border-[#1B3B26]/10 flex items-center gap-2 text-[#4A5D4E]">
                    <span className="text-base">🍽️</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Serves {recipe.servings}</span>
                  </div>
                )}
              </div>
            )}

            {/* Steps */}
            {hasSteps && (
              <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white shadow-[0_12px_40px_-10px_rgba(27,59,38,0.08)] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#F5B041] to-[#f9c67a] rounded-t-[2.5rem]" />

                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F5B041] text-white text-lg shadow-md">
                    👨‍🍳
                  </div>
                  <h2 className="text-xl font-[Fraunces] font-semibold text-[#1B3B26]">Method</h2>
                </div>

                <ol className="flex flex-col gap-8">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-5 group/step">
                      {/* Step Number */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B3B26] text-white text-xs font-black shadow-md">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        {i < recipe.steps.length - 1 && (
                          <div className="mt-2 w-px flex-1 min-h-[32px] bg-gradient-to-b from-[#1B3B26]/20 to-transparent" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-2">
                        {step.header && (
                          <h3 className="text-base font-[Fraunces] font-semibold text-[#1B3B26] mb-1.5 leading-snug">
                            {step.header}
                          </h3>
                        )}
                        {step.description && (
                          <p className="text-sm text-[#4A5D4E] leading-relaxed">
                            {step.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

        {/* ════════════════════════════════════════════
            CHEF'S TIP — Highlighted Card
        ════════════════════════════════════════════ */}
        {recipe.chefTip && (
          <section className="relative rounded-[2.5rem] overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B3B26] via-[#1e4a2f] to-[#2d6641]" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#F5B041] opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F5B041] opacity-5 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Icon */}
              <div className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#F5B041] text-3xl shadow-xl shadow-[#F5B041]/30">
                💡
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F5B041]">
                    Chef's Tip
                  </span>
                  <div className="h-px flex-1 bg-[#F5B041]/30" />
                </div>
                <p className="text-lg md:text-xl font-[Fraunces] text-white/95 leading-relaxed">
                  "{recipe.chefTip}"
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════
            FALLBACK — Rich Text Content
            (only shown if no structured content OR as supplement)
        ════════════════════════════════════════════ */}
        {recipe.contentHtml && (
          <section className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_15px_50px_-15px_rgba(27,59,38,0.06)] p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#1B3B26] opacity-[0.02] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-stone max-w-none text-[#4A5D4E] text-lg
                           prose-headings:font-[Fraunces] prose-headings:font-medium prose-headings:text-[#1B3B26]
                           prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-14 prose-h2:border-b-2 prose-h2:border-[#1B3B26]/10 prose-h2:pb-3
                           prose-h3:text-2xl prose-h3:mt-10
                           prose-p:leading-relaxed prose-p:mb-6
                           prose-li:text-[#4A5D4E] prose-li:my-2 prose-li:leading-relaxed
                           prose-ul:list-disc prose-ul:pl-6 prose-ul:marker:text-[#F5B041]
                           prose-ol:list-decimal prose-ol:pl-6 prose-ol:marker:text-[#1B3B26] prose-ol:marker:font-bold
                           prose-strong:text-[#1B3B26] prose-strong:font-bold
                           prose-img:rounded-[2rem] prose-img:shadow-lg prose-img:my-10
                           prose-a:text-[#F5B041] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                           relative z-10"
                dangerouslySetInnerHTML={{ __html: recipe.contentHtml }}
              />
            </div>
          </section>
        )}

        {/* Empty state — no content at all */}
        {!hasIngredients && !hasSteps && !recipe.chefTip && !recipe.contentHtml && (
          <section className="rounded-[2.5rem] bg-white/80 border border-white p-16 text-center">
            <span className="text-5xl mb-4 block">🥄</span>
            <p className="text-xl text-[#1B3B26] font-[Fraunces] font-medium">Recipe instructions are simmering…</p>
            <p className="text-sm mt-2 text-[#4A5D4E]/70 uppercase tracking-widest font-bold text-[11px]">Check back soon for the full guide!</p>
          </section>
        )}
      </div>
    </main>
  )
}

export default RecipeDetail
