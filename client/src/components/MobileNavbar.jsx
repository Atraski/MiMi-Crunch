import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import gsap from 'gsap'

const navItems = [
    {
        label: 'Home', path: '/', icon: (active) => (
            <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand-green scale-110' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        label: 'Shop', path: '/products', icon: (active) => (
            <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand-green scale-110' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        )
    },
    {
        label: 'Recipes', path: '/recipes', icon: (active) => (
            <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand-green scale-110' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        )
    },
    {
        label: 'Search', type: 'search', icon: (active) => (
            <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand-green scale-110' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        )
    },
    {
        label: 'Account', path: '/profile', icon: (active, user) => (
            user?.name ? (
                <span className={`text-lg font-black transition-all duration-300 ${active ? 'text-brand-green scale-110' : 'text-stone-400'}`}>
                    {user.name.charAt(0).toUpperCase()}
                </span>
            ) : (
                <svg className={`w-6 h-6 transition-all duration-300 ${active ? 'text-brand-green scale-110' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        )
    }
]

const MobileNavbar = ({ products = [] }) => {
    const { user } = useAuth()
    const location = useLocation()
    const indicatorRef = useRef(null)
    const searchPanelRef = useRef(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [query, setQuery] = useState('')

    const suggestions = useMemo(() => {
        if (!query.trim()) return []
        const normalized = query.toLowerCase()
        return products.filter((item) => item.name.toLowerCase().includes(normalized))
    }, [products, query])

    useEffect(() => {
        const activeIndex = navItems.findIndex(item => {
            if (item.type === 'search') return isSearchOpen
            if (item.path === '/') return location.pathname === '/' && !isSearchOpen
            return location.pathname.startsWith(item.path) && !isSearchOpen
        })

        if (activeIndex !== -1 && indicatorRef.current) {
            const targetPercent = activeIndex * 20
            gsap.to(indicatorRef.current, {
                left: `${targetPercent}%`,
                duration: 0.6,
                ease: "power4.out"
            })
        }
    }, [location.pathname, isSearchOpen])

    useEffect(() => {
        if (isSearchOpen) {
            gsap.fromTo(searchPanelRef.current,
                { y: '100%', opacity: 0 },
                { y: '0%', opacity: 1, duration: 0.5, ease: "expo.out" }
            )
        }
    }, [isSearchOpen])

    const handleSearchClick = (e) => {
        e.preventDefault()
        setIsSearchOpen(!isSearchOpen)
        if (isSearchOpen) setQuery('')
    }

    return (
        <>
            {/* Search Overlay Panel */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-[115] bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        ref={searchPanelRef}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 pb-32 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-brand-text">Search <span className="text-brand-green">Products</span></h2>
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-2 bg-stone-100 rounded-full text-stone-500"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search for millets, snacks..."
                                    className="w-full h-14 bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 pl-12 text-brand-text font-bold focus:border-brand-green outline-none transition-all shadow-inner"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <div className="max-h-[40vh] overflow-y-auto hide-scrollbar space-y-3">
                                {query.trim() === '' ? (
                                    <div className="py-8 text-center">
                                        <p className="text-stone-400 font-medium">Try searching for "Khichdi" or "Granola"</p>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map(item => (
                                        <Link
                                            key={item.slug}
                                            to={`/products/${item.slug}`}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 active:bg-brand-bg transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0">
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-brand-text line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-brand-secondary font-black opacity-60">₹{item.price} • {item.size}</p>
                                            </div>
                                            <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-8 text-center flex flex-col items-center gap-3">
                                        <span className="text-4xl">🔍</span>
                                        <p className="text-stone-500 font-bold">No products found for "{query}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 z-[120] md:hidden">
                <div className="bg-white/95 backdrop-blur-xl border-t border-stone-100 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] rounded-t-[2rem] pt-1 pb-safe">
                    <div className="relative grid grid-cols-5 h-16 items-center max-w-lg mx-auto">

                        <div
                            ref={indicatorRef}
                            className="absolute -top-[1px] h-[3px] w-1/5 flex justify-center transition-all duration-300"
                        >
                            <div className="w-8 h-full bg-brand-green rounded-b-full shadow-[0_0_12px_rgba(46,125,50,0.6)]" />
                        </div>

                        {navItems.map((item, idx) => {
                            const active = item.type === 'search' ? isSearchOpen : (item.path === '/' ? location.pathname === '/' && !isSearchOpen : location.pathname.startsWith(item.path) && !isSearchOpen)

                            if (item.type === 'search') {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={handleSearchClick}
                                        className="flex flex-col items-center justify-center gap-1.5 h-full tap-highlight-none"
                                    >
                                        <div className={`relative transition-all duration-300 ${active ? '-translate-y-1' : 'translate-y-0'}`}>
                                            {item.icon(active, user)}
                                            {active && (
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-green rounded-full shadow-[0_0_8px_rgba(46,125,50,0.8)]" />
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'text-brand-green' : 'text-stone-400 opacity-60'}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                )
                            }

                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="flex flex-col items-center justify-center gap-1.5 h-full tap-highlight-none"
                                >
                                    <div className={`relative transition-all duration-300 ${active ? '-translate-y-1' : 'translate-y-0'}`}>
                                        {item.icon(active, user)}
                                        {active && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-green rounded-full shadow-[0_0_8px_rgba(46,125,50,0.8)]" />
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'text-brand-green' : 'text-stone-400 opacity-60'}`}>
                                        {item.label === 'Account' && user?.name ? user.name.split(' ')[0] : item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </>
    )
}

export default MobileNavbar
