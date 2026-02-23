import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

const NotFound = () => {
  const headingRef = useRef(null)
  const subtitleRef = useRef(null)
  const linkRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      )
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power2.out' },
      )
      gsap.fromTo(
        linkRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: 'power2.out' },
      )
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power1.out' },
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <main
      ref={containerRef}
      className="flex min-h-[80vh] flex-col items-center justify-center px-2 py-20"
    >
      <h1
        ref={headingRef}
        className="text-8xl font-bold tracking-tighter text-stone-800 sm:text-9xl md:text-[10rem]"
      >
        404
      </h1>
      <p
        ref={subtitleRef}
        className="mt-4 text-xl font-medium text-stone-600 sm:text-2xl"
      >
        Page doesn&apos;t exist
      </p>
      <Link
        ref={linkRef}
        to="/"
        className="mt-10 inline-flex rounded-full bg-stone-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
      >
        Go home
      </Link>
    </main>
  )
}

export default NotFound
