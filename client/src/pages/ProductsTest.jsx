import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BackButton from '../components/BackButton'

gsap.registerPlugin(ScrollTrigger)

const ProductsTest = () => {
  const rootRef = useRef(null)
  const burstRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return

    const ctx = gsap.context(() => {
      const hero = heroRef.current
      const seeds = burstRef.current?.querySelectorAll('[data-seed]')
      const titleLines = hero?.querySelectorAll('[data-hero-title]')
      const subtitle = hero?.querySelector('[data-hero-sub]')
      const orb = hero?.querySelector('.pom-orb')

      // initial states
      if (seeds?.length) {
        gsap.set(seeds, { opacity: 0, scale: 0.4, y: 20 })
      }
      if (titleLines?.length) {
        gsap.set(titleLines, { opacity: 0, y: 40 })
      }
      if (subtitle) {
        gsap.set(subtitle, { opacity: 0, y: 20 })
      }
      if (orb) {
        gsap.set(orb, { scale: 0.9, y: 20 })
      }

      // pinned scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=150%',
          scrub: true,
          pin: true,
        },
      })

      // 1. text reveal
      if (titleLines?.length) {
        tl.to(titleLines, {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
          stagger: 0.15,
        }, 0)
      }
      if (subtitle) {
        tl.to(subtitle, {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
        }, 0.1)
      }

      // 2. seed burst + orbit
      if (seeds?.length) {
        tl.to(seeds, {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'back.out(1.7)',
          stagger: {
            each: 0.04,
            from: 'center',
          },
        }, 0.2)

        tl.to(seeds, {
          rotation: 360,
          transformOrigin: '50% 50%',
          ease: 'none',
        }, 0.4)
      }

      // 3. orb float / zoom
      if (orb) {
        tl.to(orb, {
          scale: 1.05,
          y: -10,
          ease: 'sine.inOut',
        }, 0.3)
      }

      // 4. subtle fade of text before leaving
      if (titleLines?.length) {
        tl.to(titleLines, {
          opacity: 0.3,
          y: -20,
          ease: 'power2.inOut',
        }, 0.8)
      }
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={rootRef} className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      <div className="mx-auto max-w-6xl px-2 pb-24 pt-10">
        <BackButton className="mb-6" />

        <section
          ref={heroRef}
          className="relative grid gap-10 rounded-[2.5rem] bg-gradient-to-tr from-rose-100 via-amber-50 to-rose-50 px-6 py-10 shadow-xl sm:grid-cols-[1.3fr_1fr] sm:px-10 sm:py-14"
        >
          <div className="flex flex-col justify-center gap-4">
            <p
              className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500"
              data-hero-sub
            >
              Scroll to burst
            </p>
            <h1 className="space-y-1 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              <span className="block" data-hero-title>
                Organic
              </span>
              <span className="block text-4xl sm:text-5xl" data-hero-title>
                The Perfect Pomegranate
              </span>
              <span className="block text-xl text-rose-700" data-hero-title>
                Juice Experience
              </span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-stone-700">
              A playful GSAP ScrollTrigger demo just for{' '}
              <span className="font-semibold text-rose-600">/products/test</span>. Scroll to see the
              seeds burst and orbit around the hero fruit.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
              <span className="rounded-full bg-white/80 px-3 py-1 font-medium text-rose-600 shadow-sm">
                GSAP ScrollTrigger
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 font-medium text-amber-700 shadow-sm">
                Parallax
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 font-medium text-stone-700 shadow-sm">
                Experimental hero
              </span>
            </div>
          </div>

          <div
            ref={burstRef}
            className="relative flex items-center justify-center overflow-visible"
          >
            <div className="pom-orb pom-float relative h-56 w-56 rounded-full bg-gradient-to-br from-rose-500 via-rose-400 to-amber-300 shadow-[0_30px_80px_rgba(244,63,94,0.45)] sm:h-64 sm:w-64">
              <div className="absolute inset-6 rounded-[40%] bg-gradient-to-b from-rose-50/70 via-rose-100/80 to-amber-50/80 backdrop-blur-[1px]" />
              {[...Array(10)].map((_, idx) => (
                <div
                  key={idx}
                  data-seed
                  className="absolute h-5 w-5 rounded-full bg-rose-500 shadow-[0_4px_10px_rgba(248,113,113,0.6)]"
                  style={{
                    top: `${30 + Math.sin(idx) * 20}%`,
                    left: `${30 + Math.cos(idx) * 20}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-6 text-sm text-stone-700">
          <h2 className="text-lg font-semibold text-stone-900">
            What&apos;s happening on this page?
          </h2>
          <p>
            This is a sandbox hero just for <code>/products/test</code> where we can experiment with
            scroll-based motion without touching the main product layout.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Hero container fades and slides in on initial load.</li>
            <li>
              Pomegranate seeds (the small circles) burst out with a springy animation when they
              enter the viewport.
            </li>
            <li>
              The main fruit orb has a gentle parallax float tied to scroll via{' '}
              <code>ScrollTrigger</code>.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}

export default ProductsTest

