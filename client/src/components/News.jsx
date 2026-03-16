import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const News = ({ news }) => {
  const sectionRef = useRef(null)
  const swiperRef = useRef(null)

  // Use news prop, but fall back to empty array safely
  const items = Array.isArray(news) ? news : []

  useEffect(() => {
    // Basic GSAP reveal
    const ctx = gsap.context(() => {
      gsap.from(".news-header-reveal", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // If no news at all, don't show the section to avoid blank gap
  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-20 overflow-hidden bg-brand-bg relative">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header Section */}
        <div className="news-header-reveal mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/5 rounded-full border border-brand-green/10">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Mimi Chronicles</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-brand-text leading-[0.9] tracking-tighter">
              Health & <br className="hidden md:block" />
              <span className="text-brand-green italic font-serif font-light">Heritage.</span>
            </h2>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 pb-2">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-brand-text hover:bg-brand-green hover:text-white transition-all active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-brand-text hover:bg-brand-green hover:text-white transition-all active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Swiper Implementation */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            pagination={{ clickable: true, el: '.news-pagination' }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1.2, spaceBetween: 24 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 30 }
            }}
            className="!pb-14"
          >
            {items.map((item, idx) => (
              <SwiperSlide key={idx}>
                <article
                  className="group flex flex-col h-[500px] bg-white border border-stone-100 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-brand-green/5"
                >
                  {/* Image Container */}
                  <div className="aspect-video w-full shrink-0 relative overflow-hidden bg-stone-50">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title || "Blog Post"}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-green/5">
                        <span className="text-3xl font-black text-brand-green/20">Mimi</span>
                      </div>
                    )}

                    {item.date && (
                      <div className="absolute bottom-3 right-5 z-20 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-green">{item.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-col flex-1 p-7 md:p-8">
                    <h3 className="text-xl md:text-2xl font-black text-brand-text leading-tight line-clamp-2 group-hover:text-brand-green transition-colors mb-3">
                      {item.title || "Untitled Story"}
                    </h3>

                    {item.excerpt && (
                      <p className="line-clamp-2 text-sm md:text-base text-brand-secondary/60 leading-relaxed font-medium">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-6 flex items-center justify-between">
                      {item.slug ? (
                        <Link
                          to={`/blogs/${item.slug}`}
                          className="inline-flex items-center gap-2 group/btn"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-text group-hover/btn:text-brand-green transition-colors">Read Full Story</span>
                          <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center transition-all group-hover/btn:bg-brand-green group-hover/btn:text-white">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 italic">Coming Soon</span>
                      )}
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination */}
          <div className="news-pagination flex justify-center gap-2 mt-4 h-2" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .news-pagination .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            background: #e2e8f0;
            opacity: 1;
            transition: all 0.3s ease;
            border-radius: 4px;
        }
        .news-pagination .swiper-pagination-bullet-active {
            width: 20px;
            background: #2E7D32;
        }
      `}} />
    </section>
  )
}

export default News
