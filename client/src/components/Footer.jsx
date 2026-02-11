import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const Footer = () => {
  const rootRef = useRef(null)
  const lineRef = useRef(null)
  const footerRef = useRef(null)

  useEffect(() => {
    if (!rootRef.current) return

    const ctx = gsap.context(() => {
      // Infinite horizontal scroll on the wheat strip
      if (lineRef.current) {
        gsap.set(lineRef.current, { xPercent: 0 })
        gsap.to(lineRef.current, {
          xPercent: -50,
          duration: 28,
          ease: 'none',
          repeat: -1,
        })
      }

      // Gentle breeze / sway effect on the wheat stalks
      gsap.to('.wheat-sway', {
        y: -3,
        skewY: 2,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 100%',
      })

      // Soft float / glow blobs in the footer background
      gsap.to('.footer-glow', {
        y: -10,
        scale: 1.05,
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      // Subtle footer content reveal
      if (footerRef.current) {
        const cols = footerRef.current.querySelectorAll('[data-footer-col]')
        gsap.from(cols, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.15,
        })
      }
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="relative mt-16">
      {/* GSAP-animated line-art strip above footer */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-16 overflow-hidden">
        <svg
          ref={lineRef}
          className="h-full w-[200%] text-amber-700"
          viewBox="0 0 400 40"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="wheat-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* simple millet / wheat-like stalks */}
              <g className="wheat-sway" stroke="currentColor" strokeWidth="1.2" fill="none">
                <path d="M8 40 V18" />
                <path d="M8 20 L5 16" />
                <path d="M8 22 L11 18" />

                <path d="M20 40 V16" />
                <path d="M20 18 L17 14" />
                <path d="M20 20 L23 16" />
                <path d="M20 22 L17 18" />

                <path d="M32 40 V20" />
                <path d="M32 22 L29 18" />
                <path d="M32 24 L35 20" />
              </g>
            </pattern>
          </defs>
          <rect x="0" y="0" width="400" height="40" fill="url(#wheat-pattern)" />
        </svg>
      </div>

      <footer
        ref={footerRef}
        className="relative overflow-hidden bg-gradient-to-tr from-stone-950 via-stone-900 to-emerald-950 py-12 text-stone-300"
      >
        {/* soft animated glow shapes */}
        <div className="footer-glow pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="footer-glow pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
          <div data-footer-col>
            <h3 className="text-lg font-semibold text-white">Mimi Crunch</h3>
            <p className="mt-2 text-sm">Healthy millet foods crafted with care.</p>
          </div>
          <div className="flex flex-col gap-2" data-footer-col>
            <p className="text-sm font-semibold text-white">Quick Links</p>
            <a className="text-sm" href="/shipping-returns">
              Shipping & Returns
            </a>
            <a className="text-sm" href="/privacy-policy">
              Privacy Policy
            </a>
            <a className="text-sm" href="/terms-conditions">
              Terms & Conditions
            </a>
          </div>
          <div data-footer-col>
            <p className="text-sm font-semibold text-white">Contact</p>
            <p>support@mimicrunch.com</p>
            <p>+91 90000 00000</p>
            <p>Gujrat, India</p>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-4 pt-4 text-xs text-stone-400">
          <p>© 2026 Mimi Crunch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Footer
