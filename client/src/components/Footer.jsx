import React from 'react'
import { Link, useLocation } from 'react-router-dom'
// import footerBg from '../assets/MiMi footer.webp'
// import footerGif from '../assets/MIMI Mobile Footer.gif'

const footerBg = "";
const footerGif = "";

const Footer = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  const getLinkClasses = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    if (isHome) {
      return `text-sm transition-all duration-300 flex items-center gap-2 ${isActive
        ? 'text-brand-yellow font-bold translate-x-1'
        : 'text-brand-orinoco hover:text-brand-yellow hover:translate-x-1'
        }`;
    }
    return `text-sm transition-all duration-300 flex items-center gap-2 ${isActive
      ? 'text-brand-yellow font-bold translate-x-1'
      : 'text-brand-beige/70 hover:text-brand-yellow hover:translate-x-1'
      }`;
  };

  const renderIndicator = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return isActive ? <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(245,176,65,0.8)]" /> : null;
  };

  return (
    <div className="relative text-brand-eggshell bg-brand-brown overflow-hidden">
      {/* Mobile: GIF background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden opacity-60 mix-blend-overlay"
        style={{ backgroundImage: `url(${footerGif})` }}
        aria-hidden="true"
      />
      {/* Desktop: GIF background */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block opacity-60 mix-blend-overlay"
        style={{ backgroundImage: `url(${footerGif})` }}
        aria-hidden="true"
      />

      {/* Lighter overlay for better visibility of animation */}
      <div className="absolute inset-0 bg-brand-brown/40" aria-hidden="true" />

      {/* Gradient for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-brown via-brand-brown/80 to-brand-brown/20 pointer-events-none z-[1]" />

      <footer className="relative z-10 mx-auto max-w-7xl px-3 pt-20 pb-12 lg:px-4">
        {/* Newsletter Section */}
        <div className="mx-auto mb-20 flex max-w-6xl flex-wrap items-center justify-between gap-10 bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="max-w-md">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
              Stay in touch
            </span>
            <h2 className="mt-2 text-4xl font-black text-brand-eggshell">
              Join the <span className="text-brand-orange">Crunch Club</span>
            </h2>
            <p className={`mt-4 text-sm leading-relaxed font-medium ${isHome ? 'text-brand-orinoco' : 'text-brand-eggshell/70'}`}>
              Experience the ancient goodness. Get exclusive offers and millet-based recipes straight to your inbox.
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-3">
            <input
              className="flex-1 min-w-[260px] rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm text-white placeholder:text-brand-eggshell/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-medium"
              placeholder="Enter your email"
            />
            <button className="rounded-2xl bg-brand-orange px-8 py-4 text-sm font-black text-brand-eggshell hover:bg-brand-yellow transition-all shadow-lg shadow-brand-orange/20 active:scale-95 uppercase tracking-widest" type="button">
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 space-y-6 lg:col-span-1">
            <h3 className="text-2xl font-black text-brand-eggshell tracking-tight leading-none group hover:scale-105 transition-transform duration-300 transform origin-left">
              <span className="text-brand-orange">Mimi</span> Crunch
            </h3>
            <p className={`text-sm leading-7 font-medium ${isHome ? 'text-brand-orinoco' : 'text-brand-eggshell/70'}`}>
              Honoring ancient traditions with modern nutrition. Healthy millet foods crafted for a life full of vitality and crunch.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-orange/80">Company</h3>
            <ul className="mt-6 space-y-4">
              <li><Link to="/" className={getLinkClasses('/')}>{renderIndicator('/')} Home</Link></li>
              <li><Link to="/products" className={getLinkClasses('/products')}>{renderIndicator('/products')} Products</Link></li>
              <li><Link to="/recipes" className={getLinkClasses('/recipes')}>{renderIndicator('/recipes')} Recipes</Link></li>
              <li><Link to="/about" className={getLinkClasses('/about')}>{renderIndicator('/about')} About Us</Link></li>
              <li><Link to="/blogs" className={getLinkClasses('/blogs')}>{renderIndicator('/blogs')} Blogs</Link></li>
              <li><Link to="/contact" className={getLinkClasses('/contact')}>{renderIndicator('/contact')} Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-orange/80">Support</h3>
            <ul className="mt-6 space-y-4">
              <li><Link to="/shipping-returns" className={getLinkClasses('/shipping-returns')}>{renderIndicator('/shipping-returns')} Shipping and Return Policy</Link></li>
              <li><Link to="/privacy-policy" className={getLinkClasses('/privacy-policy')}>{renderIndicator('/privacy-policy')} Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className={getLinkClasses('/terms-conditions')}>{renderIndicator('/terms-conditions')} Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-orange/80">Connect</h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li className={`flex items-center gap-3 ${isHome ? 'text-brand-orinoco' : 'text-brand-eggshell/70'}`}>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-orange">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <a
                  href="mailto:support@mimicrunch.com"
                  className={`transition-colors font-medium ${isHome ? 'text-brand-yellow hover:underline' : 'hover:text-brand-orange'}`}
                >
                  support@mimicrunch.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed md:leading-normal ${isHome ? 'text-brand-orinoco' : 'text-brand-orange/70'}`}>
            © 2026 Mimi Crunch. Honoring Nature's Grains. <br className="md:hidden" />
          </p>

          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/mimicrunch.in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all duration-300 hover:scale-110">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all duration-300 hover:scale-110">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer