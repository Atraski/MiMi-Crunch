import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getOptimizedImage } from '../utils/imageUtils'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FeaturedProducts = ({ featured, onAddToCart }) => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fp-header-anim", {
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

      gsap.from(".fp-card", {
        scrollTrigger: {
          trigger: ".fp-grid",
          start: "top 85%",
        },
        y: 60,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out",
        clearProps: "all"
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative z-10 bg-brand-smoke py-12 lg:py-20 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="fp-header-anim mb-10 flex flex-col items-center text-center">
          <span className="inline-block rounded-full bg-brand-yellow/20 border border-brand-yellow/30 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-yellow mb-3">
            Trending Now
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-brand-eggshell tracking-tight">
            Featured <span className="text-brand-yellow">Products</span>
          </h2>
        </div>

        <div className="fp-grid grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
          {featured.map((item) => {
            return (
              <div key={item.slug || item.name} className="fp-card group relative flex flex-col overflow-hidden rounded-[2rem] border border-brand-orinoco bg-brand-eggshell p-3 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:border-brand-orinoco">
                <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-brand-orinoco/20 mb-4 flex items-center justify-center p-4">
                  <Link to={item.slug ? `/products/${item.slug}` : '#'} className="w-full h-full flex items-center justify-center">
                    <img
                      src={getOptimizedImage(item.image)}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </Link>

                  {/* Highlights */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {item.tags?.includes('Bestseller') && (
                      <span className="rounded-full bg-brand-yellow px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-brand-brown shadow-sm">
                        Best
                      </span>
                    )}
                    <span className="rounded-full bg-brand-yellow px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-brand-brown shadow-sm">
                      New
                    </span>
                  </div>

                  {/* Add to Cart - Thumb Optimized */}
                  <button
                    onClick={(e) => {
                      const { clientX, clientY } = e;
                      onAddToCart?.(item, { x: clientX, y: clientY });
                    }}
                    className="absolute bottom-3 right-3 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-brand-eggshell shadow-xl transition-all haptic-feedback active:scale-90 hover:bg-brand-yellow"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                <Link to={item.slug ? `/products/${item.slug}` : '#'} className="flex flex-1 flex-col px-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-brand-brown opacity-60 uppercase tracking-widest">
                      {item.size || '300G'}
                    </span>
                    <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-brand-yellow px-2 py-0.5 text-sm font-black text-brand-brown">
                      ₹{item.price}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-verdun leading-tight line-clamp-2 md:text-xl">
                    {item.name}
                  </h3>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
