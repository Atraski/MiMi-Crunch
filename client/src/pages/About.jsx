import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BackButton from '../components/BackButton'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const heroHeadline = 'Reimagining Healthy Snacking with Mimi Crunch.'

const journeyMilestones = [
  {
    year: 'Oct 2025',
    title: 'Kitchen Prototype',
    blurb:
      'A small home-kitchen experiment to make millet snacks cleaner and lighter for daily routines.',
    visual: 'Recipe Trials',
  },
  {
    year: 'Nov 2025',
    title: 'Farmer Network',
    blurb:
      'Direct sourcing partnerships started with millet growers to ensure freshness and fair procurement.',
    visual: 'Field Sourcing',
  },
  {
    year: 'Jan 2026',
    title: 'Mimi Crunch Launch',
    blurb:
      'We launched modern millet snacking blends focused on clean ingredients and trusted nutrition.',
    visual: 'Brand Debut',
  },
  {
    year: 'Mar 2026',
    title: 'Community Growth',
    blurb:
      'Families and fitness-first consumers adopted Mimi Crunch as a reliable everyday snack upgrade.',
    visual: 'Everyday Wins',
  },
]

const missionCards = [
  {
    title: 'Clean Ingredients',
    icon: 'CI',
    text: 'No unnecessary fillers. Just millet-forward recipes with transparent, carefully selected inputs.',
    img: 'https://res.cloudinary.com/daovxopcn/image/upload/v1775297827/Clean_Ingredients_jkflae.jpg',
  },
  {
    title: 'Farmer First',
    icon: 'FF',
    text: 'We build direct relationships with growers to support local agriculture and premium grain quality.',
    img: 'https://res.cloudinary.com/daovxopcn/image/upload/v1775297829/FarmerFast_irovkj.jpg',
  },
  {
    title: 'Fit Lifestyle',
    icon: 'FL',
    text: 'Designed for modern schedules, our snacks deliver nourishment that aligns with active living.',
    img: 'https://res.cloudinary.com/daovxopcn/image/upload/v1775297829/Fit_Flifestyle_jtqvdd.jpg',
  },
]

const About = ({ recipes = [] }) => {
  const pageRef = useRef(null)
  const wipeRef = useRef(null)
  const heroImageRef = useRef(null)
  const heroWordsRef = useRef([])
  const timelineLineRef = useRef(null)
  const timelineItemRefs = useRef([])
  const missionCardRefs = useRef([])
  const milletBackgroundRef = useRef(null)
  const milletTextRef = useRef(null)
  const ctaRef = useRef(null)
  const teamCardRefs = useRef([])

  useLayoutEffect(() => {
    const cleanupFns = []

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wipeRef.current,
        { scaleY: 1, transformOrigin: 'top center' },
        {
          scaleY: 0,
          duration: 0.9,
          ease: 'power3.inOut',
        },
      )

      gsap.from(heroWordsRef.current, {
        yPercent: 115,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2,
      })

      gsap.fromTo(
        heroImageRef.current,
        { scale: 0.8, opacity: 0, y: 28 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
        },
      )

      gsap.to(heroImageRef.current, {
        y: -12,
        duration: 2.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })

      gsap.fromTo(
        timelineLineRef.current,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.journey-track',
            start: 'top 72%',
            end: 'bottom 30%',
            scrub: true,
          },
        },
      )

      timelineItemRefs.current.forEach((item, index) => {
        const copy = item.querySelector('.journey-copy')
        const media = item.querySelector('.journey-media')
        const xOffset = index % 2 === 0 ? -60 : 60

        gsap.from(copy, {
          x: xOffset,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })

        gsap.from(media, {
          x: -xOffset,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      missionCardRefs.current.forEach((card, index) => {
        gsap.from(card, {
          y: 48,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.08,
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            toggleActions: 'play none none reverse',
          },
        })

        // Pure CSS handles the 180-deg flip logic now.
      })

      gsap.to(milletBackgroundRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.millet-parallax',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.fromTo(
        milletTextRef.current,
        { y: 36, opacity: 0.3, filter: 'blur(9px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: '.millet-parallax',
            start: 'top 80%',
            end: 'center 50%',
            scrub: true,
          },
        },
      )

      const onMagnetMove = (event) => {
        const rect = ctaRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        gsap.to(ctaRef.current, {
          x: x * 0.22,
          y: y * 0.22,
          duration: 0.28,
          ease: 'power2.out',
        })
      }
      const onMagnetLeave = () => {
        gsap.to(ctaRef.current, {
          x: 0,
          y: 0,
          duration: 0.35,
          ease: 'power3.out',
        })
      }
      ctaRef.current.addEventListener('mousemove', onMagnetMove)
      ctaRef.current.addEventListener('mouseleave', onMagnetLeave)
      cleanupFns.push(() => {
        ctaRef.current?.removeEventListener('mousemove', onMagnetMove)
        ctaRef.current?.removeEventListener('mouseleave', onMagnetLeave)
      })

      teamCardRefs.current.forEach((card, index) => {
        const bubble = card.querySelector('.recipe-badge')
        gsap.from(card, {
          y: 44,
          opacity: 0,
          duration: 0.7,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })

        const onEnter = () => {
          gsap.to(bubble, { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.6)' })
        }
        const onLeave = () => {
          gsap.to(bubble, { y: 10, opacity: 0, scale: 0.8, duration: 0.25, ease: 'power2.in' })
        }

        card.addEventListener('mouseenter', onEnter)
        card.addEventListener('mouseleave', onLeave)
        cleanupFns.push(() => {
          card.removeEventListener('mouseenter', onEnter)
          card.removeEventListener('mouseleave', onLeave)
        })
      })
    }, pageRef)

    return () => {
      cleanupFns.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <main ref={pageRef} className="about-page">
      <div ref={wipeRef} className="about-wipe" />
      <section className="about-shell pt-8 md:pt-12">
        <BackButton className="mb-6 md:mb-8" />
      </section>

      <section className="about-shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Health + Modernity</p>
          <h1 className="hero-heading">
            {heroHeadline.split(' ').map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="hero-word-wrap"
              >
                <span ref={(el) => { heroWordsRef.current[index] = el }} className="hero-word">
                  {word}&nbsp;
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-subtext">
            Mimi Crunch is building a cleaner snack culture where ancient grains meet modern flavor, design, and daily convenience.
          </p>
        </div>
        <div className="hero-visual-frame" ref={heroImageRef}>
          <div className="hero-visual-glow" />
          <img
            src="https://res.cloudinary.com/daovxopcn/image/upload/v1775386424/Healthy_Snacking_i54rqx.png"
            alt="Premium healthy millet bowl"
            className="hero-bowl-image"
            loading="lazy"
          />
        </div>
      </section>

      <section className="about-shell about-reveal journey-block">
        <div className="section-head">
          <p className="eyebrow">Our Journey</p>
          <h2 className="section-title">From local grain roots to modern snack rituals.</h2>
        </div>
        <div className="journey-track">
          <span ref={timelineLineRef} className="journey-line" aria-hidden />
          {journeyMilestones.map((item, index) => (
            <article
              key={item.year}
              ref={(el) => { timelineItemRefs.current[index] = el }}
              className={`journey-item ${index % 2 === 0 ? 'left' : 'right'}`}
            >
              <div className="journey-copy">
                <span className="journey-year">{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.blurb}</p>
              </div>
              <div className="journey-media">{item.visual}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-shell about-reveal mission-block">
        <div className="section-head">
          <p className="eyebrow">Mission & Vision</p>
          <h2 className="section-title">Built around people, farms, and future-ready nutrition.</h2>
        </div>
        <div className="mission-grid">
          {missionCards.map((card, index) => (
            <div className="mission-card-wrapper" key={card.title} ref={(el) => { missionCardRefs.current[index] = el }}>
              <article className="mission-card cursor-pointer">
                <div className="mission-card-inner">
                  <div className="mission-card-front">
                    <span className="mission-icon">{card.icon}</span>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                  <div className="mission-card-back">
                    <img src={card.img} alt={card.title} loading="lazy" />
                    <div className="mission-back-overlay">
                      <span>{card.title}</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="millet-parallax about-reveal">
        <div ref={milletBackgroundRef} className="millet-bg" />
        <div className="millet-copy" ref={milletTextRef}>
          <p className="eyebrow eyebrow-light">Why Millets?</p>
          <h2 className="section-title-light">Nutrient dense, naturally resilient, and perfect for modern wellness.</h2>
          <p>
            Millets support balanced living with fiber-rich nutrition while reducing stress on farming ecosystems.
          </p>
          <Link ref={ctaRef} to="/recipes" className="millet-cta">
            See Our Recipes
          </Link>
        </div>
      </section>

      <section className="about-shell about-reveal team-block">
        <div className="section-head">
          <p className="eyebrow">Community Recipes</p>
          <h2 className="section-title">Fresh recipes uploaded by our users.</h2>
        </div>
        <div className="recipe-grid">
          {recipes.slice(0, 3).map((recipe, index) => (
            <Link
              key={recipe._id || recipe.slug || recipe.title}
              to={recipe.slug ? `/recipes/${recipe.slug}` : '/recipes'}
              ref={(el) => { teamCardRefs.current[index] = el }}
              className="recipe-card"
            >
              <div className="recipe-media">
                {recipe.coverImage ? (
                  <img src={recipe.coverImage} alt={recipe.title} loading="lazy" />
                ) : (
                  <div className="recipe-fallback">Mimi Recipe</div>
                )}
              </div>
              <div className="recipe-content">
                <h3>{recipe.title || 'Millet Recipe'}</h3>
                <p>{recipe.excerpt || 'Healthy millet recipe from the Mimi Crunch community.'}</p>
              </div>
              <span className="recipe-badge">{recipe.time || 'New Upload'}</span>
            </Link>
          ))}
          {!recipes.length ? (
            <article className="recipe-empty">
              <h3>No recipes uploaded yet.</h3>
              <p>Jab users recipes upload karenge, yahin dikhengi.</p>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default About
