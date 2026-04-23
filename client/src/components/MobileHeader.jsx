import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// import logo from '../assets/MiMi Crunch Logo.png'

const logo = "/favicon.png"

const MobileHeader = ({ cartCount, onCartToggle, wishlistCount = 0 }) => {
    const { user } = useAuth()

    return (
        <header className="sticky top-0 z-[110] bg-brand-verdun border-b border-brand-orinoco/15 shadow-lg md:hidden">
            <div className="mx-auto flex h-16 items-center justify-between px-6">
                {/* Left: Logo */}
                <Link to="/" className="relative z-10 flex items-center haptic-feedback bg-brand-beige p-1.5 rounded-xl shadow-inner">
                    <img src={logo} alt="Mimi Crunch" className="h-8 w-auto object-contain" />
                </Link>

                {/* Right: Icons */}
                <div className="flex items-center gap-4">
                    {/* Wishlist */}
                    <Link
                        to="/wishlist"
                        className="relative p-2 haptic-feedback tap-highlight-none rounded-full active:bg-brand-deep-green transition-colors"
                    >
                        <svg className="w-6 h-6 text-brand-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {wishlistCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-black text-brand-deep-green shadow-sm border-2 border-brand-green">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <button
                        id="cart-icon-mobile"
                        onClick={onCartToggle}
                        className="relative p-2 haptic-feedback tap-highlight-none rounded-full active:bg-brand-deep-green transition-colors"
                    >
                        <svg className="w-6 h-6 text-brand-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-black text-brand-deep-green shadow-sm border-2 border-brand-green">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default MobileHeader
