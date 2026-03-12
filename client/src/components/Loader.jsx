import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Loader = () => {
    const containerRef = useRef(null)
    const logoRef = useRef(null)
    const grainsRef = useRef([])
    const textRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial fade in
            gsap.fromTo(containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.4 }
            )

            // Orbiting animation for grains
            grainsRef.current.forEach((grain, i) => {
                if (!grain) return;
                // Circular path
                gsap.to(grain, {
                    rotation: 360,
                    duration: 4 + (i % 3),
                    repeat: -1,
                    ease: "none",
                    transformOrigin: `50% ${70 + (i % 2) * 15}px`
                })

                // Random scaling and opacity for "organic" feel
                gsap.to(grain, {
                    scale: 1.5,
                    opacity: 0.4,
                    duration: 1 + i * 0.1,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                })
            })

            // Logo float and pulse
            gsap.to(logoRef.current, {
                y: -15,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            })

            // Glow pulse
            gsap.to(".logo-glow", {
                scale: 1.2,
                opacity: 0.2,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            })

            // Text stagger reveal
            const words = ["Crafting", "Natural", "Vitality", "Authentic"];
            let wordIndex = 0;
            const updateText = () => {
                if (!textRef.current) return;
                gsap.to(textRef.current, {
                    y: -20,
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        if (!textRef.current) return;
                        wordIndex = (wordIndex + 1) % words.length;
                        textRef.current.innerText = `${words[wordIndex]}...`;
                        gsap.fromTo(textRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
                    }
                });
            };

            const textInterval = setInterval(updateText, 2500);
            return () => clearInterval(textInterval);

        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#FDFBF7]"
        >
            {/* Premium Background Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2E7D32]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FFD700]/5 blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            </div>

            <div className="relative">
                {/* Subtle outer static rings */}
                <div className="absolute inset-[-40px] border border-stone-200/40 rounded-full" />
                <div className="absolute inset-[-80px] border border-stone-100/60 rounded-full" />

                {/* Orbiting Millets (Abstract) */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            ref={el => grainsRef.current[i] = el}
                            className="absolute"
                            style={{
                                transform: `rotate(${i * (360 / 12)}deg) translateY(-90px)`
                            }}
                        >
                            <svg className="w-4 h-6 text-[#2E7D32]/30 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C12 2 12 6 8 8C4 10 4 14 4 14C4 14 6 12 10 12C14 12 16 14 16 14C16 14 16 10 12 8C8 6 12 2 12 2Z" />
                            </svg>
                        </div>
                    ))}

                    {/* Central Logo Container */}
                    <div ref={logoRef} className="relative z-10">
                        {/* Glow effect */}
                        <div className="logo-glow absolute inset-[-20px] bg-[#2E7D32]/10 rounded-full blur-2xl" />

                        <div className="w-24 h-24 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex items-center justify-center border border-white/80 overflow-hidden relative group">
                            <span className="text-5xl font-black text-[#2E7D32] tracking-tighter drop-shadow-sm select-none">M</span>

                            {/* Animated Waves for filling effect */}
                            <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20 h-[60%] overflow-hidden">
                                <div className="absolute bottom-0 left-[-100%] w-[300%] h-full bg-[#FFD700] rounded-[40%] animate-[wave_6s_linear_infinite]" />
                                <div className="absolute bottom-1 left-[-100%] w-[300%] h-full bg-[#2E7D32] rounded-[45%] animate-[wave_10s_linear_infinite_reverse] opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Text Section */}
            <div className="mt-16 flex flex-col items-center">
                <div className="w-12 h-0.5 bg-stone-200 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-[#2E7D32] w-1/2 animate-[progress_1.5s_ease-in-out_infinite]" />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 mb-2">
                    Mimi Crunch
                </p>

                <div className="h-6 overflow-hidden flex items-center justify-center">
                    <span
                        ref={textRef}
                        className="text-lg font-black text-[#2E7D32] italic tracking-tight"
                    >
                        Crafting Natural...
                    </span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}} />
        </div>
    )
}

export default Loader
