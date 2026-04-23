import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Recipes = ({ recipes }) => {
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!recipes?.length) return;

    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".recipe-header > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      })

      // Cards Animation
      gsap.from(".recipe-card", {
        scrollTrigger: {
          trigger: ".recipe-grid",
          start: "top 90%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [recipes])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-brand-orinoco py-12 lg:min-h-[70vh] flex items-center">
      {/* Decorative texture background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none lg:opacity-[0.05]"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10 w-full">
        <div className="recipe-header mb-6 flex flex-col items-center text-center lg:mb-10">
          <span className="mb-2 inline-block rounded-full bg-brand-orange/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-brand-orange">
            Mimi's Kitchen
          </span>
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-brand-brown sm:text-4xl">
            From Our Kitchen <br />
            <span className="text-brand-verdun font-black">To Yours.</span>
          </h2>
          <div className="mt-4 h-1 w-16 bg-brand-orange rounded-full" />
        </div>

        {recipes?.length ? (
          <div className="recipe-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {recipes.map((item) => (
              <Link
                key={item._id || item.slug || item.title}
                to={item.slug ? `/recipes/${item.slug}` : '#'}
                className="recipe-card group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-brand-orinoco/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-brown/10 hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-orinoco/10">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-brown/20">
                      <span className="text-4xl">🥣</span>
                    </div>
                  )}
                  {/* Prep Time Highlight Overlay */}
                  <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-[0.8rem] bg-white/95 backdrop-blur-md px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-brown shadow-lg border border-brand-orinoco/20">
                    <svg className="h-3 w-3 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.time || '15 Mins'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <h3 className="text-lg font-black text-brand-brown group-hover:text-brand-orange transition-colors line-clamp-1 leading-tight">
                    {item.title}
                  </h3>

                  {/* Benefits & Features Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-brand-orinoco/20 p-2.5 border border-brand-orinoco/40">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-brand-verdun opacity-70">Highlight</p>
                      <p className="mt-0.5 text-[10px] font-black text-brand-brown leading-tight">
                        {item.tags?.[0] || 'High Fiber'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-brand-eggshell/50 p-2.5 border border-brand-eggshell">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-brand-brown opacity-60">Feature</p>
                      <p className="mt-0.5 text-[10px] font-black text-brand-brown leading-tight">
                        {item.tags?.[1] || 'Quick Cook'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] text-brand-brown/60 line-clamp-2 leading-relaxed font-semibold">
                    {item.excerpt || 'A wholesome, nutritious meal prepared with premium Mimi Crunch grains.'}
                  </p>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-brand-orinoco/20">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-5 w-5 rounded-full border-2 border-white bg-brand-orinoco/30 overflow-hidden" />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-brand-brown/40">Fav'd by 200+</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand-orange group-hover:gap-2 transition-all">
                      View Recipe
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white/50 rounded-[2rem] border border-brand-orinoco/20 border-dashed">
            <span className="text-4xl mb-3 opacity-50 grayscale">🍳</span>
            <p className="text-sm font-bold text-brand-brown/60">Wholesome Recipes Simmering...</p>
          </div>
        )}

        {recipes?.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link to="/recipes" className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-brand-brown transition-colors hover:text-brand-orange">
              Explore Cookbook
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-orange/20 group-hover:border-brand-orange group-hover:bg-brand-orange text-brand-brown group-hover:text-white transition-all shadow-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default Recipes
