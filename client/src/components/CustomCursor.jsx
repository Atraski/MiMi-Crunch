import { useEffect, useRef, useState } from 'react'

// Smooth lerp for 60fps follow – no GSAP per frame, no lag
const lerp = (a, b, t) => a + (b - a) * t

const CustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const pointerRef = useRef(false)
  const clickingRef = useRef(false)
  const [isPointer, setIsPointer] = useState(false)
  const [isHidden, setIsHidden] = useState(true)
  const [isClicking, setIsClicking] = useState(false)

  pointerRef.current = isPointer
  clickingRef.current = isClicking

  useEffect(() => {
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let ringX = 0
    let ringY = 0
    let rafId = null

    const onMouseMove = (e) => {
      targetX = e.clientX
      targetY = e.clientY
      setIsHidden(false)
    }

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.35)
      currentY = lerp(currentY, targetY, 0.35)
      ringX = lerp(ringX, targetX, 0.12)
      ringY = lerp(ringY, targetY, 0.12)

      const dotScale = clickingRef.current ? 0.5 : 1
      const ringScale = pointerRef.current ? 1.25 : 1

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) scale(${dotScale})`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${ringScale})`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onMouseEnter = () => setIsHidden(false)
    const onMouseLeave = () => setIsHidden(true)
    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)

    const handleHover = (e) => {
      const clickable = e.target.closest('a, button, [role="button"], input, select, textarea, [data-cursor-hover]')
      setIsPointer(!!clickable)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseenter', onMouseEnter)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseover', handleHover)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseover', handleHover)
    }
  }, [])

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] hidden md:block ${isHidden ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      aria-hidden
    >
      {/* Inner dot – snappy, squish on click */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-white will-change-transform"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      {/* Outer ring – smooth lag, glow on hover */}
      <div
        ref={ringRef}
        className={`absolute left-0 top-0 h-8 w-8 rounded-full border-2 will-change-transform transition-[border-color,background-color,box-shadow] duration-200 ${isPointer ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(34,197,94,0.22)] cursor-ring-hover' : 'border-stone-300/80'}`}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (min-width: 768px) {
            * { cursor: none !important; }
            a, button, [role="button"], input, select, textarea, [data-cursor-hover] { cursor: none !important; }
          }
          @keyframes cursor-ring-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }
          .cursor-ring-hover { animation: cursor-ring-pulse 2s ease-in-out infinite; }
        `,
      }} />
    </div>
  )
}

export default CustomCursor
