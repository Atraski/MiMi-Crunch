import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Story = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(".bg-blob", {
        y: -100,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        }
      })

      tl.from(".story-badge", { x: -30, opacity: 0, duration: 0.8, ease: "expo.out" })
        .from(".story-title", { x: -50, opacity: 0, skewY: 5, duration: 1, ease: "expo.out" }, "-=0.6")
        .from(".story-text", { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.7")
        .from(".story-features > div", { y: 20, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: "back.out(2)" }, "-=0.6")
        .from(".story-image-group", { x: 80, opacity: 0, rotate: 5, duration: 1.4, ease: "expo.out" }, "-=1.2")
        .from(".story-btn", { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.4")
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-brand-50/30 py-10 lg:min-h-[85vh] lg:py-0 flex items-center">
      {/* Decorative Background Elements */}
      <div className="bg-blob absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-50/50 blur-3xl lg:opacity-70" />
      <div className="bg-blob absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-amber-50/50 blur-3xl lg:opacity-70" />

      <div className="mx-auto max-w-7xl px-4 lg:px-8 w-full">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

          {/* Content Side */}
          <div className="order-2 lg:order-1 lg:pr-10">
            <span className="story-badge mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Our Heart & Soul
            </span>
            <h2 className="story-title text-4xl font-extrabold leading-tight text-stone-900 sm:text-5xl lg:text-5xl xl:text-6xl">
              Rooted in Nature, <br />
              <span className="text-emerald-700">Crafted with Care.</span>
            </h2>
            <div className="story-text mt-6 space-y-4 text-base text-stone-600 leading-relaxed max-w-lg">
              <p>
                At Mimi Crunch, we believe the best food comes straight from the soil.
                Born from a passion for forgotten ancient grains, we bridge the gap
                between nutritional heritage and modern convenience.
              </p>
              <p>
                We partner directly with small-scale Indian farmers who practice sustainable agriculture,
                ensuring every bite is as good for the planet as it is for you.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="story-features mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-stone-100">
                  <span className="text-xl">🚜</span>
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Direct Sourcing</h4>
                  <p className="text-[11px] text-stone-500">Farm to your table.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-stone-100">
                  <span className="text-xl">🌱</span>
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">100% Natural</h4>
                  <p className="text-[11px] text-stone-500">No hidden chemicals.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link to="/about" className="story-btn btn btn-primary bg-stone-900 text-white hover:bg-stone-800 px-8 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-1 font-bold text-sm">
                Read Our Story
              </Link>
              <div className="flex items-center gap-3 text-sm font-medium text-stone-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span>2k+ families joined</span>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="story-image-group order-1 lg:order-2 relative max-w-md mx-auto lg:mr-0 lg:max-w-none">
            <div className="relative z-10 overflow-hidden rounded-[2.5rem] shadow-2xl">
              <img
                src="/farmer.jpg"
                alt="Our Farmer Partner"
                className="h-full w-full object-cover aspect-[4/4] xl:aspect-[4/4.5] transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent" />

              {/* Floating Stat Card - Compact Version */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl border border-white/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Since 2021</p>
                    <p className="text-lg font-extrabold text-stone-900">500+ Farmers empowered</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative background element behind image */}
            <div className="absolute -bottom-8 -right-8 -z-10 h-48 w-48 rounded-full border-[1rem] border-emerald-50 opacity-20" />
            <div className="absolute -top-6 -left-6 -z-10 h-16 w-16 rounded-2xl bg-amber-100 rotate-12" />
          </div>

        </div>
      </div>
    </section>
  )
}

export default Story

