import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

const PageWrapper = ({ children }) => {
    const location = useLocation()
    const wrapperRef = useRef(null)

    useEffect(() => {
        const el = wrapperRef.current
        if (!el) return

        // Slide in from right effect
        gsap.fromTo(el,
            { x: 20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        )
    }, [location.pathname])

    return (
        <div ref={wrapperRef} className="w-full flex-1 flex flex-col min-h-full">
            {children}
        </div>
    )
}

export default PageWrapper
