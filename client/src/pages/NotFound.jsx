import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

const NotFound = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro animation timeline
      const tl = gsap.timeline()

      tl.from(".bg-shape", {
        scale: 0,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "elastic.out(1, 0.5)",
      })
        .from(".text-404", {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.5)",
        }, "-=1")
        .from(".text-desc", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.6")
        .from(".btn-home", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.4")

      // Continuous floating animation for shapes
      gsap.to(".float-1", {
        y: -20,
        rotation: 10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
      gsap.to(".float-2", {
        y: 20,
        rotation: -10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
      })
      gsap.to(".float-3", {
        x: 15,
        y: -15,
        rotation: 15,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
      })

    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-[#faf7f2] px-4 py-20"
    >
      {/* Decorative Animated Shapes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
        <div className="bg-shape float-1 absolute h-64 w-64 rounded-full bg-brand-200/50 blur-3xl -translate-x-32 -translate-y-20"></div>
        <div className="bg-shape float-2 absolute h-72 w-72 rounded-full bg-amber-200/40 blur-3xl translate-x-32 translate-y-20"></div>
        <div className="bg-shape float-3 absolute h-48 w-48 rounded-full bg-stone-300/40 blur-2xl translate-x-10 -translate-y-40"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated 404 Visual */}
        <div className="text-404 relative mb-6 flex items-center justify-center">
          <h1 className="text-[8rem] font-extrabold leading-none tracking-tighter text-stone-900 drop-shadow-sm sm:text-[12rem] xl:text-[16rem]">
            4
            <span className="inline-block px-2 sm:px-4 text-brand-600">0</span>
            4
          </h1>
          {/* Subtle overlay texture or text across the 404 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none mix-blend-overlay">
            <span className="text-2xl sm:text-4xl font-black uppercase tracking-[0.5em] text-stone-900 rotate-[-5deg]">
              Oops!
            </span>
          </div>
        </div>

        <div className="text-desc space-y-4">
          <p className="inline-block rounded-full bg-stone-200/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-stone-600 backdrop-blur-sm">
            Lost in the grains
          </p>
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
            Looks like you&apos;ve strayed <br className="hidden sm:block" />
            from the path.
          </h2>
          <p className="mx-auto max-w-md text-base text-stone-600 sm:text-lg">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link
          to="/"
          className="btn-home mt-10 inline-flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-stone-900/20 transition-all hover:-translate-y-1 hover:bg-stone-800 hover:shadow-2xl hover:shadow-stone-900/30"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Homepage
        </Link>
      </div>
    </main>
  )
}

export default NotFound
