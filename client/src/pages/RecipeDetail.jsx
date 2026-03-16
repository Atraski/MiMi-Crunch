import BackButton from '../components/BackButton'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

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
      <main className="min-h-screen bg-[#FAF8F5] relative overflow-clip py-16 px-4 font-[Manrope]">
        <div className="mx-auto max-w-4xl relative z-10 flex flex-col items-center justify-center h-[50vh]">
          <div className="h-10 w-10 border-4 border-[#1B3B26]/20 border-t-[#1B3B26] rounded-full animate-spin mb-4"></div>
          <p className="text-[#4A5D4E] font-medium tracking-wide animate-pulse">Cooking up recipe details...</p>
        </div>
      </main>
    )
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] relative overflow-clip py-16 px-4 font-[Manrope]">
        <div className="mx-auto max-w-4xl relative z-10 flex flex-col gap-6 items-center justify-center h-[50vh] text-center">
          <div className="absolute top-0 left-0 w-full"><BackButton className="text-[#1B3B26]" /></div>

          <div className="h-20 w-20 rounded-full bg-[#EAE6DF] border border-[#1B3B26]/10 flex items-center justify-center text-[#1B3B26]/50 mb-2 mt-12">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-[Fraunces] font-medium text-[#1B3B26]">Oops! Recipe Not Found</h2>
          <p className="text-[#4A5D4E]">{error || "We couldn't find the recipe you're looking for."}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-clip py-16 px-4 font-[Manrope]">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-6xl relative z-10 flex flex-col gap-10">
        <BackButton className="text-[#1B3B26] mb-4" />

        <article className="flex flex-col gap-16">
          {/* Magazine Style Top Split Section */}
          <header className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">

            {/* Left Box: Media Showcase */}
            <div className="order-2 lg:order-1 relative w-full rounded-[3rem] overflow-hidden bg-white/60 backdrop-blur-sm border border-white shadow-[0_20px_50px_-15px_rgba(27,59,38,0.15)] aspect-[4/5] sm:aspect-square lg:aspect-[4/5] group">
              {recipe.videoUrl ? (
                <video
                  src={recipe.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : recipe.coverImage ? (
                <img
                  src={recipe.coverImage}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EAE6DF]/50">
                  <span className="text-8xl">🍳</span>
                </div>
              )}
            </div>

            {/* Right Box: Info & Linked Product */}
            <div className="order-1 lg:order-2 flex flex-col items-start text-left gap-6">
              <span className="bg-[#1B3B26] text-[#F5B041] px-5 py-2 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-[#1B3B26]/10">
                Chef's Special
              </span>

              <h1 className="text-4xl lg:text-6xl lg:leading-[1.1] font-[Fraunces] font-medium text-[#1B3B26]">
                {recipe.title}
              </h1>

              {recipe.excerpt && (
                <p className="text-lg text-[#4A5D4E] leading-relaxed border-l-2 border-[#F5B041] pl-6 mt-2">
                  {recipe.excerpt}
                </p>
              )}

              {recipe.productSlug && (
                <div className="mt-6 w-full max-w-sm rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/80 p-5 lg:p-6 shadow-[0_15px_40px_-15px_rgba(27,59,38,0.06)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B041] opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>

                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5B041]/20">
                      <span className="text-[#F5B041] text-xs">✨</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#1B3B26]/70">
                      Our Star Ingredient
                    </span>
                  </div>

                  {linkedProduct ? (
                    <Link
                      to={`/product/${recipe.productSlug}`}
                      className="flex items-center gap-4 relative z-10 bg-white/40 hover:bg-white rounded-[1.5rem] p-3 transition-colors border border-white/60 hover:border-white shadow-sm hover:shadow-md"
                    >
                      <div className="h-14 w-14 lg:h-16 lg:w-16 flex-shrink-0 overflow-hidden rounded-[1rem] bg-white shadow-sm border border-[#1B3B26]/5">
                        {(linkedProduct.image || linkedProduct.images?.[0]) ? (
                          <img
                            src={linkedProduct.image || linkedProduct.images?.[0]}
                            alt={linkedProduct.name}
                            className="h-full w-full object-cover p-1.5 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-base lg:text-lg font-[Fraunces] font-semibold text-[#1B3B26] group-hover:text-[#F5B041] transition-colors truncate">
                          {linkedProduct.name || recipe.productSlug}
                        </span>
                        <div className="flex items-center mt-1 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-[#4A5D4E] group-hover:text-[#1B3B26] transition-colors">
                          Shop Ingredient
                          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ) : linkedProductLoading ? (
                    <div className="flex items-center gap-4 relative z-10 p-3">
                      <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-[1rem] bg-[#EAE6DF]/60 animate-pulse border border-white"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-[#EAE6DF]/60 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-[#EAE6DF]/60 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/product/${recipe.productSlug}`}
                      className="flex items-center gap-4 relative z-10 bg-white/40 hover:bg-white rounded-[1.5rem] p-3 transition-colors border border-white/60 hover:border-white shadow-sm hover:shadow-md"
                    >
                      <div className="flex flex-col flex-1 min-w-0 px-2">
                        <span className="text-base lg:text-lg font-[Fraunces] font-semibold text-[#1B3B26] group-hover:text-[#F5B041] transition-colors capitalize">
                          {recipe.productSlug.split('-').join(' ')}
                        </span>
                        <div className="flex items-center mt-1 text-[10px] lg:text-xs font-bold uppercase tracking-wider text-[#4A5D4E] group-hover:text-[#1B3B26] transition-colors">
                          View Ingredient
                          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  )}

                  <div className="mt-5 pt-4 border-t border-[#1B3B26]/10 flex items-center justify-between relative z-10 mx-2">
                    <span className="text-[11px] font-semibold text-[#4A5D4E]">
                      + full ingredients recipe below
                    </span>
                    <span className="text-[10px] bg-white border border-[#1B3B26]/10 rounded-full h-6 w-6 flex items-center justify-center animate-bounce shadow-sm">
                      👇
                    </span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Content Section */}
          <section className="rounded-[3rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_15px_50px_-15px_rgba(27,59,38,0.06)] p-8 md:p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B3B26] opacity-[0.02] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto">
              {recipe.contentHtml ? (
                <div
                  className="prose prose-stone max-w-none text-[#4A5D4E] text-lg
                             prose-headings:font-[Fraunces] prose-headings:font-medium prose-headings:text-[#1B3B26] 
                             prose-h2:text-4xl prose-h2:mb-8 prose-h2:mt-16 prose-h2:border-b-2 prose-h2:border-[#1B3B26]/10 prose-h2:pb-4 prose-h2:inline-block
                             prose-h3:text-2xl prose-h3:text-[#1B3B26] prose-h3:mt-10
                             prose-p:leading-relaxed prose-p:mb-8
                             prose-li:text-[#4A5D4E] prose-li:my-3 prose-li:leading-relaxed
                             prose-ul:list-disc prose-ul:pl-6 prose-ul:marker:text-[#F5B041]
                             prose-ol:list-decimal prose-ol:pl-6 prose-ol:marker:text-[#1B3B26] prose-ol:marker:font-bold
                             prose-strong:text-[#1B3B26] prose-strong:font-bold
                             prose-img:rounded-[2rem] prose-img:shadow-lg prose-img:border prose-img:border-white/50 prose-img:my-10
                             prose-a:text-[#F5B041] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                             relative z-10"
                  dangerouslySetInnerHTML={{ __html: recipe.contentHtml }}
                />
              ) : (
                <div className="text-center py-20 relative z-10 border-2 border-dashed border-[#1B3B26]/10 rounded-[2rem] bg-white/50">
                  <span className="text-5xl mb-4 block">🥄</span>
                  <p className="text-xl text-[#1B3B26] font-[Fraunces] font-medium">Recipe instructions are simmering...</p>
                  <p className="text-base mt-3 text-[#4A5D4E]/80 tracking-wide uppercase font-bold text-[11px]">Check back soon for the full guide!</p>
                </div>
              )}
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}

export default RecipeDetail
