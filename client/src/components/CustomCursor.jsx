import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const CustomCursor = () => {
    const mainCursor = useRef(null)
    const secondaryCursor = useRef(null)
    const [isPointer, setIsPointer] = useState(false)
    const [isHidden, setIsHidden] = useState(true)
    const [isClicking, setIsClicking] = useState(false)

    useEffect(() => {
        let mouseX = 0
        let mouseY = 0
        let lastX = 0
        let lastY = 0

        const onMouseMove = (e) => {
            const { clientX, clientY } = e
            mouseX = clientX
            mouseY = clientY
            setIsHidden(false)

            // Main small dot (instant)
            gsap.to(mainCursor.current, {
                x: clientX,
                y: clientY,
                duration: 0.1,
                ease: "power2.out"
            })

            // Calculate velocity/direction for stretch effect
            const deltaX = clientX - lastX
            const deltaY = clientY - lastY
            const velocity = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 150)
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

            // Dynamic scaling based on state
            let baseScale = isPointer ? 1.8 : 1.0
            if (isClicking) baseScale *= 0.8

            // Secondary larger circle (smooth lag + dynamic stretch)
            gsap.to(secondaryCursor.current, {
                x: clientX,
                y: clientY,
                duration: 0.5,
                ease: "expo.out",
                rotate: angle, // Align stretch with direction
                scaleX: baseScale * (1 + velocity / 100), // Stretch
                scaleY: baseScale * (1 - velocity / 200), // Squeeze
                backgroundColor: isPointer ? "rgba(46, 125, 50, 0.1)" : "transparent",
                borderColor: isPointer ? "rgba(46, 125, 50, 1)" : "rgba(46, 125, 50, 0.3)"
            })

            lastX = clientX
            lastY = clientY
        }

        const onMouseEnter = () => setIsHidden(false)
        const onMouseLeave = () => setIsHidden(true)
        const onMouseDown = () => setIsClicking(true)
        const onMouseUp = () => setIsClicking(false)

        // Check for hover state on interactive elements
        const handleHover = (e) => {
            const target = e.target
            const isClickable = target.closest('a, button, [role="button"], input, select, textarea, .group, .recipe-card, .product-card')
            setIsPointer(!!isClickable)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseenter', onMouseEnter)
        window.addEventListener('mouseleave', onMouseLeave)
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('mouseover', handleHover)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseenter', onMouseEnter)
            window.removeEventListener('mouseleave', onMouseLeave)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('mouseover', handleHover)
        }
    }, [isPointer, isClicking])

    return (
        <div className={`cursor-wrapper pointer-events-none fixed inset-0 z-[9999] hidden md:block ${isHidden ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
            {/* Main Dot */}
            <div
                ref={mainCursor}
                className="fixed top-0 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green mix-blend-difference"
            />
            {/* Smooth Follower */}
            <div
                ref={secondaryCursor}
                className="fixed top-0 left-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-brand-green/30 mix-blend-normal flex items-center justify-center"
            >
                {isPointer && (
                    <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-ping" />
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (min-width: 768px) {
                    * {
                        cursor: none !important;
                    }
                    a, button, [role="button"], input, select, textarea, .group {
                        cursor: none !important;
                    }
                }
            `}} />
        </div>
    )
}

export default CustomCursor
