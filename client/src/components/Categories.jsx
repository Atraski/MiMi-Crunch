import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Categories = ({ collections = [] }) => {
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!collections || collections.length === 0) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(".cat-header-anim", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        skewY: 2,
        duration: 1,
        ease: "expo.out"
      })

      // Cards stagger
      gsap.from(".cat-card", {
        scrollTrigger: {
          trigger: ".cat-grid",
          start: "top 85%",
        },
        y: 40,
        x: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [collections])

  const getIcon = (title) => {
    const t = title?.toLowerCase() || '';
    if (t.includes('millet')) return '🌾';
    if (t.includes('oat') || t.includes('breakfast') || t.includes('cereal') || t.includes('granola')) return '🥣';
    if (t.includes('snack') || t.includes('chip') || t.includes('crunch') || t.includes('cookies')) return '🍪';
    if (t.includes('drink') || t.includes('beverage') || t.includes('mix')) return '🥤';
    if (t.includes('khichdi') || t.includes('meal')) return '🥘';
    if (t.includes('sweet') || t.includes('dessert') || t.includes('halwa')) return '🍩';
    if (t.includes('combo') || t.includes('pack') || t.includes('bundle')) return '🎁';
    if (t.includes('seed') || t.includes('nut')) return '🥜';
    if (t.includes('protein')) return '⚡';
    return '🍃';
  };

  return (
    <section ref={sectionRef} className="relative bg-brand-orinoco pb-8 lg:pb-12 pt-10 lg:pt-16 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Story Style for Mobile */}
        <div className="cat-header-anim mb-4 flex px-4 md:hidden">
          <h2 className="text-xl font-bold text-brand-verdun tracking-tight">
            Quick <span className="text-brand-brown">Access</span>
          </h2>
        </div>

        <div className="hide-scrollbar flex gap-4 overflow-x-auto px-6 pb-2 md:hidden">
          {collections.map((item, idx) => (
            <Link
              key={idx}
              to={`/${item.slug || ''}`}
              className="cat-card-mobile flex flex-col items-center gap-2 shrink-0 haptic-feedback tap-highlight-none"
            >
              <div className="relative p-1 rounded-full border-2 border-brand-verdun/20 active:border-brand-verdun transition-colors">
                <div className="h-20 w-20 rounded-full bg-brand-eggshell flex items-center justify-center text-3xl shadow-sm border border-brand-eggshell overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title || 'Collection'} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    getIcon(item.title)
                  )}
                </div>
              </div>
              <span className="text-[11px] font-bold text-brand-verdun uppercase tracking-tight text-center max-w-[80px] line-clamp-1">
                {item.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop Grid (Hidden on Mobile) */}
        <div className="cat-header-anim mb-8 hidden flex-col items-center text-center md:flex px-4">
          <span className="inline-block rounded-full bg-brand-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange mb-2">
            Our Collections
          </span>
          <h2 className="text-3xl font-bold text-brand-brown sm:text-4xl tracking-tight">
            Explore <span className="text-brand-orange">Categories</span>
          </h2>
          <div className="mt-4 h-1 w-16 bg-brand-orange rounded-full" />
        </div>

        <div className="cat-grid hidden grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 min-h-[100px] md:grid px-4">
          {collections && collections.length > 0 ? (
            collections.map((item, idx) => (
              <Link
                key={item.slug || item.title || idx}
                to={`/${item.slug || ''}`}
                className="cat-card group relative flex flex-col items-start overflow-hidden rounded-[2rem] border border-brand-brown/5 bg-brand-eggshell p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-brown/10 hover:border-brand-orange/30"
              >
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orinoco/30 transition-all duration-300 group-hover:bg-brand-orange group-hover:scale-110 shadow-sm overflow-hidden p-[1px] border border-brand-brown/5">
                  <div className="w-full h-full rounded-[0.9rem] flex items-center justify-center bg-white overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title || 'Collection'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <span className="text-3xl">{getIcon(item.title)}</span>
                    )}
                  </div>
                </div>

                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-black text-brand-brown leading-tight transition-colors group-hover:text-brand-orange">{item.title}</h3>
                  </div>
                  <p className="text-brand-brown/60 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">{item.desc}</p>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown/40 group-hover:text-brand-orange/60 transition-colors">
                      {typeof item.count === 'number' ? `${item.count} Items` : item.count}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/0 group-hover:bg-brand-orange/10 text-brand-orange transition-all duration-300">
                      <svg className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-brand-brown/40 text-sm animate-pulse">Loading collections...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Categories
