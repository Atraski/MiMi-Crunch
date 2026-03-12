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
    <section ref={sectionRef} className="relative overflow-hidden bg-stone-50/50 mt-[10px] py-8 lg:min-h-[70vh] lg:py-0 flex items-center">
      {/* Decorative texture background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none lg:opacity-[0.05]"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10 w-full">
        <div className="recipe-header mb-6 flex flex-col items-center text-center lg:mb-10">
          <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-800">
            Mimi's Kitchen
          </span>
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
            From Our Kitchen <br />
            <span className="text-emerald-700 font-black">To Yours.</span>
          </h2>
          <div className="mt-2 h-1 w-12 bg-emerald-500 rounded-full" />
        </div>

        {recipes?.length ? (
          <div className="recipe-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {recipes.map((item) => (
              <Link
                key={item._id || item.slug || item.title}
                to={item.slug ? `/recipes/${item.slug}` : '#'}
                className="recipe-card group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-sm border border-stone-100 transition-all duration-500 hover:shadow-lg"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-300">
                      <span className="text-4xl">🥣</span>
                    </div>
                  )}
                  {/* Prep Time Highlight Overlay */}
                  <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded-lg bg-stone-900/90 backdrop-blur-sm px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                    <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.time || '15 Mins'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-tight">
                    {item.title}
                  </h3>

                  {/* Benefits & Features Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-100">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-800 opacity-60">Benefit</p>
                      <p className="mt-0.5 text-[10px] font-bold text-emerald-900 leading-tight">
                        {item.tags?.[0] || 'High Fiber'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-2 border border-amber-100">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-amber-800 opacity-60">Feature</p>
                      <p className="mt-0.5 text-[10px] font-bold text-amber-900 leading-tight">
                        {item.tags?.[1] || 'Quick Cook'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-stone-500 line-clamp-2 leading-relaxed opacity-80">
                    {item.excerpt || 'A wholesome, nutritious meal prepared with premium Mimi Crunch grains.'}
                  </p>

                  <div className="mt-5 flex items-center justify-between pt-3 border-t border-stone-50">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-4 w-4 rounded-full border border-white bg-stone-200" />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-stone-400">2k+ joined</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 group-hover:underline">
                      View Recipe
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-white/50 rounded-[1.5rem] border border-stone-100 border-dashed">
            <span className="text-4xl mb-2">🍳</span>
            <p className="text-lg font-bold text-stone-800">No Recipes Found Yet</p>
          </div>
        )}

        {recipes?.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link to="/recipes" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 transition-colors hover:text-emerald-700">
              Full Cookbook
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-all">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
