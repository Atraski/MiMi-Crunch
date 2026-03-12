import { useRef, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow, Navigation, Controller } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import { getProductColor, getContrastColor } from '../utils/productColors'
import gsap from 'gsap'

const Hero = ({ products = [] }) => {
  const leftCopyRef = useRef(null);
  const swiperRef = useRef(null);
  const bgSwiperRef = useRef(null);

  const slides = useMemo(() => {
    // List of high-quality farm background images
    const farmBgs = [
      "https://images.unsplash.com/photo-1592910129881-892bbe239cc0?q=80&w=1400&auto=format&fit=crop", // Golden Grains
      "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1400&auto=format&fit=crop", // Lush Green Farming
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1400&auto=format&fit=crop", // Organic Field
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1400&auto=format&fit=crop", // Agriculture Landscape
      "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=1400&auto=format&fit=crop"  // Rural Harvest
    ];

    if (!products || products.length === 0) {
      return [
        {
          id: 1,
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
          bgImage: farmBgs[0],
          name: "Multi Millet Khichdi",
          desc: "Relish the ancient goodness of 5 nutrient-packed millets in one wholesome bowl.",
          slug: "multi-millet-khichdi",
          price: 249
        },
        {
          id: 2,
          image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop",
          bgImage: farmBgs[1],
          name: "Honey Nut Granola",
          desc: "Crunchy, golden-toasted clusters perfect for a high-energy morning boost.",
          slug: "honey-nut-granola",
          price: 399
        },
        {
          id: 3,
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
          bgImage: farmBgs[2],
          name: "Premium Pearl Millet",
          desc: "The powerhouse of energy, naturally gluten-free and rich in dietary fiber.",
          slug: "premium-pearl-millet",
          price: 199
        }
      ];
    }

    return products.slice(0, 5).map((p, idx) => ({
      ...p,
      bgImage: farmBgs[idx % farmBgs.length]
    }));
  }, [products]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-motto", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out"
      });
      gsap.from(".hero-line-anchor", {
        height: 0,
        duration: 1.5,
        ease: "power4.inOut"
      });
      gsap.from(".hero-brand-logo", {
        x: -20,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }, leftCopyRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.to(".floating-product", {
      y: -15,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, [slides]);

  // Syncing logic for dual sliders
  const handleSwiperChange = (swiper) => {
    if (bgSwiperRef.current) {
      bgSwiperRef.current.slideTo(swiper.activeIndex);
    }
  };

  return (
    <section className="relative w-full bg-brand-bg overflow-hidden h-auto md:h-[92vh] flex flex-col md:flex-row m-0 p-0 shadow-none border-none">

      {/* GLOBAL BACKGROUND SLIDER LAYER (FARM IMAGES) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Swiper
          modules={[Autoplay, Controller]}
          onSwiper={(swiper) => (bgSwiperRef.current = swiper)}
          loop={false}
          slidesPerView={1}
          speed={1500}
          allowTouchMove={false}
          className="w-full h-full"
        >
          {slides.map((product, idx) => (
            <SwiperSlide key={`bg-${idx}`} className="w-full h-full overflow-hidden">
              <img
                src={product.bgImage}
                alt=""
                className="w-full h-full object-cover opacity-60 transition-all duration-1000 scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/95 via-brand-bg/60 to-transparent" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {/* LEFT SIDE: MOTIVATIONAL CONTENT (STATIC) */}
        <div
          ref={leftCopyRef}
          className="w-full md:w-[48%] flex flex-col justify-center px-6 py-8 md:px-24 md:py-0 relative"
        >

          <div className="relative space-y-6 md:space-y-10 max-w-xl">
            {/* Elegant Vertical Anchor Line */}
            <div className="absolute -left-8 md:-left-12 top-0 bottom-0 w-[1px] bg-stone-200/50 hidden md:block">
              <div className="hero-line-anchor absolute top-0 left-0 w-full bg-brand-green h-full origin-top" />
            </div>

            <div className="hero-brand-logo flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-brand-green/20 rounded-2xl blur-lg transition-all group-hover:blur-xl opacity-0 group-hover:opacity-100" />
                <div className="relative w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center shadow-xl shadow-brand-green/10">
                  <span className="text-white font-black text-2xl italic">M</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-green/70">Mimi Crunch</p>
                <p className="text-[11px] font-bold text-brand-text/40">ESTD 2024</p>
              </div>
            </div>

            <div className="space-y-4 md:space-y-8">
              <div className="space-y-2 md:space-y-4">
                <div className="hero-motto inline-flex items-center gap-2 px-3 py-1 bg-brand-green/5 rounded-full border border-brand-green/10">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-green">Ancient Indian Grains • Modern Taste</span>
                </div>
                <h2 className="hero-motto text-5xl md:text-7xl lg:text-8xl font-black text-brand-text leading-[0.95] tracking-tighter">
                  Mitti Ka <br />
                  <span className="hero-motto inline-block transform -translate-x-1 decoration-brand-yellow/40 underline-offset-4 italic font-serif font-light text-brand-green">Swad.</span>
                </h2>
              </div>

              <p className="hero-motto text-lg md:text-2xl text-brand-secondary/80 leading-relaxed font-medium max-w-md">
                Experience the soul of Bharat with every crunch. Traditional wisdom meets modern vitality.
              </p>

              <div className="hero-motto pt-2 md:pt-4 flex flex-col md:flex-row items-start md:items-center gap-6">
                <Link
                  to="/products"
                  className="btn-primary btn px-8 py-4 md:px-10 md:py-5 uppercase tracking-[0.25em] text-[10px] md:text-[11px] font-extrabold group haptic-feedback shadow-2xl shadow-brand-green/20 rounded-[1.5rem]"
                >
                  Shop Collection
                  <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="h-8 md:h-10 px-4 bg-white/60 backdrop-blur-sm flex items-center border border-white/50 rounded-full">
                    <span className="text-[10px] font-black text-brand-text/60">5k+ Desi Families</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-motto mt-6 md:mt-12 border-t border-stone-200/50 pt-4 md:pt-8 max-w-sm">
              <p className="italic text-brand-secondary/60 font-serif text-sm md:text-base leading-relaxed">
                "Shuddh Aahar, <br />
                Swasth Jeevan."
              </p>
              <div className="mt-2 md:mt-4 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-brand-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">Mimi Crunch Virasat</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: PRODUCT SLIDER AREA */}
        <div className="w-full md:w-[52%] relative h-[75vh] md:h-full overflow-hidden flex items-center">
          {/* MAIN PRODUCT SLIDER (COVERFLOW) */}
          <Swiper
            modules={[Autoplay, EffectCoverflow, Navigation, Controller]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            onSlideChange={handleSwiperChange}
            coverflowEffect={{
              rotate: 15,
              stretch: -20,
              depth: 200,
              modifier: 1.5,
              slideShadows: false,
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="h-full w-full py-8 md:py-16 relative z-10"
          >
            {slides.map((product, idx) => {
              const brandColor = getProductColor(product.slug, product.name);

              return (
                <SwiperSlide key={idx} className="relative w-[85%] md:w-[65%] h-full flex flex-col items-center justify-center">
                  <div className="relative w-full h-full flex flex-col items-center justify-center">

                    {/* CENTER PRODUCT DISPLAY */}
                    <Link
                      to={`/products/${product.slug}`}
                      className="relative z-10 flex flex-col items-center gap-6 md:gap-8 group no-underline"
                    >
                      <div className="relative floating-product transition-all duration-700 group-hover:scale-105">
                        {/* Glowing Aura Removed */}

                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35)] border-[12px] md:border-[16px] border-white transition-all duration-500 group-hover:border-stone-50 overflow-hidden flex items-center justify-center p-6">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>

                        {/* Price Badge - Dynamic Floating */}
                        <div
                          className="absolute -top-4 -right-4 w-15 h-15 md:w-20 md:h-24 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl rotate-12 transition-all duration-700 group-hover:rotate-0 group-hover:scale-110"
                          style={{ backgroundColor: brandColor }}
                        >
                          <span className="text-[8px] md:text-[10px] uppercase opacity-80 tracking-widest">Only</span>
                          <span className="text-sm md:text-xl">₹{product.price}</span>
                        </div>
                      </div>

                      {/* Minimal Tactical Content */}
                      <div className="text-center space-y-2 md:space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <h3 className="text-2xl md:text-5xl lg:text-6xl font-black text-brand-text tracking-tighter transition-colors leading-none">
                          {product.name}
                        </h3>
                        <div className="flex justify-center gap-6">
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] md:text-[14px] font-black text-brand-green">14g</span>
                            <span className="text-[8px] uppercase tracking-widest text-black font-bold">Protein</span>
                          </div>
                          <div className="w-[1px] h-6 bg-stone-200" />
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] md:text-[14px] font-black text-brand-green">100%</span>
                            <span className="text-[8px] uppercase tracking-widest text-black font-bold">Natural</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Slider Navigation */}
          <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 md:gap-12">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white shadow-3xl flex items-center justify-center text-brand-text hover:bg-brand-green hover:text-white transition-all active:scale-90 border border-stone-100"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="h-1 w-24 md:w-32 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-green animate-progress-line" />
              </div>
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-brand-green">PROUDLY INDIAN</span>
            </div>

            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white shadow-3xl flex items-center justify-center text-brand-text hover:bg-brand-green hover:text-white transition-all active:scale-90 border border-stone-100"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progress-line {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-progress-line {
            animation: progress-line 5s linear infinite;
        }
      `}} />
    </section>
  );
};

export default Hero;
