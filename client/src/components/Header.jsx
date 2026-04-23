import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../context/AuthContext'

const logo = "/favicon.png"
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

const Header = ({ cartCount, onCartToggle, products }) => {
  const { user, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navRef = useRef(null)
  const navigate = useNavigate()

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return []
    }
    const normalized = query.toLowerCase()
    return products.filter((item) => item.name.toLowerCase().includes(normalized))
  }, [products, query])

  useEffect(() => {
    if (!navRef.current) {
      return
    }
    const links = navRef.current.querySelectorAll('a')
    if (!links.length) {
      return
    }
    gsap.fromTo(
      links,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
    )
  }, [])

  const handleWishlistClick = (event) => {
    if (event) event.preventDefault()
    if (!user) {
      navigate('/login?redirect=/wishlist')
      return
    }
    navigate('/wishlist')
  }



  const [badgeAnimated, setBadgeAnimated] = useState(false)

  useEffect(() => {
    if (cartCount > 0) {
      setBadgeAnimated(true)
      const timer = setTimeout(() => setBadgeAnimated(false), 400)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  return (
    <header className="sticky top-0 z-[100] border-b border-brand-verdun/20 bg-brand-verdun shadow-lg transition-all duration-300">
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-2 py-3 md:gap-6">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-eggshell/20 bg-brand-brown text-brand-eggshell shadow-sm hover:-translate-y-0.5 hover:shadow-lg md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            type="button"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
          <a
            href="/"
            className="rounded-xl bg-brand-eggshell p-2 shadow-md"
            aria-label="Mimi Crunch"
          >
            <img className="h-9 w-9 object-contain" src={logo} alt="Mimi Crunch logo" />
          </a>
        </div>

        <nav
          ref={navRef}
          className="hidden flex-1 items-center justify-center gap-8 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-eggshell md:flex"
        >
          <a href="/products" className="hover:text-white transition-colors">Products</a>
          <a href="/recipes" className="hover:text-white transition-colors">Recipes</a>
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/blogs" className="hover:text-white transition-colors">Blogs</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="hidden min-w-[200px] max-w-[320px] flex-1 items-center md:flex">
          <div className="relative w-full">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-3.5-3.5" />
            </svg>
            <input
              className="w-full rounded-full border border-brand-eggshell/30 bg-brand-brown py-2 pl-10 pr-3 text-sm text-brand-eggshell placeholder:text-brand-eggshell/50 focus:border-brand-eggshell/50 focus:outline-none"
              placeholder="Search for products"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {isSearchOpen && query.trim() ? (
              <div className="absolute left-0 top-12 w-full rounded-2xl border border-brand-verdun/20 bg-brand-eggshell p-3 shadow-xl">
                {suggestions.length === 0 ? (
                  <p className="text-xs text-stone-500">No matches found.</p>
                ) : (
                  <div className="space-y-2">
                    {suggestions.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/products/${item.slug}`}
                        className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        onClick={() => {
                          setIsSearchOpen(false)
                          setQuery('')
                        }}
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-stone-400">{item.size}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative order-last flex shrink-0 items-center gap-2 md:order-none md:gap-3">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-eggshell/20 bg-brand-brown text-brand-eggshell shadow-sm hover:-translate-y-0.5 hover:shadow-lg md:hidden"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            aria-label="Search products"
            type="button"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-3.5-3.5" />
            </svg>
          </button>
          <Link
            to={user ? '/profile' : '/login'}
            className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-brand-eggshell md:hidden"
            aria-label={user ? 'Profile' : 'Log in'}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-eggshell/20 bg-brand-brown text-brand-eggshell shadow-sm overflow-hidden">
              {user?.name ? (
                <span className="text-sm font-bold text-brand-eggshell">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.6-3.4 4.8-5 8-5s6.4 1.6 8 5" />
                </svg>
              )}
            </span>
          </Link>
          <div className="relative hidden md:block">
            <div className="group flex flex-col items-center gap-1 text-[11px] font-semibold text-brand-eggshell">
              <Link
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-eggshell/20 bg-brand-brown text-brand-eggshell shadow-sm hover:-translate-y-0.5 hover:shadow-lg"
                to={user ? '/profile' : '/login'}
                aria-label={user ? 'Open profile' : 'Log in'}
              >
                {user?.name ? (
                  <span className="text-sm font-bold text-brand-eggshell group-hover:scale-110 transition-transform">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.6-3.4 4.8-5 8-5s6.4 1.6 8 5" />
                  </svg>
                )}
              </Link>
              <span className="hidden md:block">{user ? (user.name || 'Profile') : 'Login'}</span>
              <div className="pointer-events-none absolute right-0 top-12 w-64 rounded-2xl border border-brand-verdun/20 bg-brand-eggshell p-4 text-left text-sm text-brand-verdun opacity-0 shadow-xl transition group-hover:pointer-events-auto group-hover:opacity-100">
                {user ? (
                  <>
                    <p className="text-sm font-semibold text-brand-brown">Hi, {user.name || user.email || 'there'}</p>
                    <div className="my-3 border-t border-brand-verdun/10" />
                    <div className="space-y-2 text-sm">
                      <Link to="/profile" className="block hover:text-brand-brown font-bold">Profile</Link>
                      <Link to="/profile#orders" className="block hover:text-brand-brown font-bold">Orders</Link>
                      <button type="button" className="block w-full text-left hover:text-brand-brown font-bold" onClick={handleWishlistClick}>Wishlist</button>
                    </div>
                    <div className="mt-3 border-t border-brand-verdun/10 pt-3">
                      <button type="button" className="text-xs font-semibold text-red-600 hover:underline" onClick={() => logout()}>Log out</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-brand-brown">Welcome</p>
                    <p className="text-xs text-brand-brown/60">Sign in to manage profile and wishlist.</p>
                    <div className="mt-3 flex gap-2">
                      <Link to="/login" className="flex-1 rounded-xl border border-brand-verdun/20 px-3 py-2 text-center text-xs font-bold text-brand-verdun">Log in</Link>
                      <Link to="/signup" className="flex-1 rounded-xl bg-brand-verdun px-3 py-2 text-center text-xs font-bold text-brand-eggshell">Sign up</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Link
            className="flex flex-col items-center gap-1 text-[11px] font-semibold text-brand-eggshell"
            aria-label="Open wishlist"
            onClick={handleWishlistClick}
            to="/wishlist"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-eggshell/20 bg-brand-brown text-brand-eggshell shadow-sm hover:-translate-y-0.5 hover:shadow-lg">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1Z" />
              </svg>
            </span>
            <span className="hidden md:block">Wishlist</span>
          </Link>
          <button
            id="cart-icon-desktop"
            className="relative flex flex-col items-center gap-1 text-[11px] font-semibold text-brand-eggshell"
            onClick={onCartToggle}
            aria-label="Open cart"
            type="button"
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-eggshell/20 bg-brand-brown text-brand-eggshell shadow-sm hover:-translate-y-0.5 hover:shadow-lg">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1" />
                <circle cx="17" cy="20" r="1" />
                <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 7H6" />
              </svg>
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-bold text-brand-brown transition-all duration-300 ${badgeAnimated ? 'scale-150 shadow-[0_0_15px_rgba(255,215,0,0.8)]' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden md:block">Bag</span>
          </button>
        </div>
      </div>
      {isSearchOpen && (
        <div className="absolute right-4 top-full z-10 mt-1 w-72 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl md:hidden">
          <input
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"
            placeholder="Search products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="mt-3 max-h-52 overflow-y-auto">
            {suggestions.length === 0 ? (
              <p className="text-xs text-stone-500">No matches found.</p>
            ) : (
              <div className="space-y-2">
                {suggestions.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/products/${item.slug}`}
                    className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    onClick={() => {
                      setIsSearchOpen(false)
                      setQuery('')
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-stone-400">{item.size}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {isMenuOpen ? (
        <div className="border-t border-stone-200/70 bg-brand-50 md:hidden">
          <div className="mx-auto max-w-6xl px-2 py-3">
            <nav className="flex flex-col gap-3 text-sm font-medium text-stone-800">
              <a href="/products" onClick={() => setIsMenuOpen(false)}>
                Products
              </a>
              <a href="/recipes" onClick={() => setIsMenuOpen(false)}>
                Recipes
              </a>
              <a href="/about" onClick={() => setIsMenuOpen(false)}>
                About
              </a>
              <a href="/blogs" onClick={() => setIsMenuOpen(false)}>
                Blogs
              </a>
              <a href="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </a>
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="inline-flex w-fit rounded-full bg-brand-600 px-4 py-2 text-white">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                  <button
                    type="button"
                    className="text-left font-medium text-red-600"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                  >
                    Log out
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Header
