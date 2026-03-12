import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const faqs = [
    {
        question: "What makes Mimi Crunch different from other snacks?",
        answer: "Unlike traditional snacks, Mimi Crunch is crafted from ancient super-grains like Ragi and Millets. These grains provide slow-release energy, are rich in fiber, and are naturally packed with essential micronutrients without any artificial additives."
    },
    {
        question: "Are these products suitable for children?",
        answer: "Absolutely! We've designed Mimi Crunch to be both delicious and highly nutritious. It’s an ideal, guilt-free snack for growing children, providing them with the wholesome energy they need throughout the day."
    },
    {
        question: "Is Mimi Crunch 100% Natural and non-GMO?",
        answer: "Yes, we prioritize purity. All our ingredients are non-GMO and sourced directly from farms that practice sustainable agriculture, ensuring the highest quality from farm to your home."
    },
    {
        question: "How do I use Mimi Crunch in my daily meals?",
        answer: "Beyond snacking, our products are versatile! You can use them as crunchy toppings for salads, mix them into yogurt, or follow our chef-inspired recipes to create healthy meals like Ragi rotis and millet porridges."
    },
    {
        question: "What is your shipping and return policy?",
        answer: "We offer pan-India shipping with free delivery on orders above ₹499. If you receive a damaged product, our hassle-free return policy ensures you get a replacement or refund within 7 days of delivery."
    }
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0)
    const sectionRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header reveal
            gsap.from(".faq-title-reveal", {
                y: 50,
                opacity: 0,
                skewY: 3,
                duration: 1.2,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                    once: true
                },
                ease: "expo.out",
                clearProps: "all"
            })

            // Items stagger
            gsap.from(".faq-card-anim", {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: ".faq-grid-anim",
                    start: "top 90%",
                    once: true
                },
                ease: "power3.out",
                clearProps: "all"
            })
        }, sectionRef)

        // Refresh ScrollTrigger after a short delay to account for dynamic content loading
        const timer = setTimeout(() => {
            ScrollTrigger.refresh()
        }, 500)

        return () => {
            ctx.revert()
            clearTimeout(timer)
        }
    }, [])

    return (
        <section ref={sectionRef} className="bg-stone-50/30 py-16 lg:py-24 border-t border-stone-100 overflow-hidden">
            <div className="mx-auto max-w-4xl px-4 lg:px-8">
                <div className="faq-title-reveal text-center mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full mb-3 inline-block border border-emerald-100">
                        Got Questions?
                    </span>
                    <h2 className="text-3xl lg:text-5xl font-black text-stone-900 leading-tight">
                        Frequently Asked <span className="text-emerald-700">Questions</span>
                    </h2>
                    <p className="mt-4 text-stone-500 text-base lg:text-lg">
                        Everything you need to know about our products and mission.
                    </p>
                </div>

                <div className="faq-grid-anim space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`faq-card-anim border rounded-2xl transition-all duration-300 ${openIndex === index
                                ? "border-emerald-200 bg-white shadow-sm"
                                : "border-stone-100 bg-white/50 hover:bg-white"
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                            >
                                <div
                                    className={`text-base lg:text-lg font-bold transition-colors prose prose-stone max-w-none prose-p:my-0 ${openIndex === index ? "text-emerald-900" : "text-stone-800"
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: faq.question }}
                                />
                                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${openIndex === index
                                    ? "bg-emerald-600 border-emerald-600 text-white rotate-180"
                                    : "bg-white border-stone-200 text-stone-400"
                                    }`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? "max-h-96" : "max-h-0"
                                    }`}
                            >
                                <div className="px-6 pb-6 pt-0">
                                    <div className="h-px w-full bg-emerald-100 mb-4 opacity-30" />
                                    <div
                                        className="text-stone-600 text-sm lg:text-base leading-relaxed prose prose-stone max-w-none prose-p:my-0 prose-strong:text-emerald-700"
                                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-stone-400 text-sm">
                        Still have questions? <a href="/contact" className="text-emerald-700 font-bold hover:underline">Contact support team</a>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default FAQ
