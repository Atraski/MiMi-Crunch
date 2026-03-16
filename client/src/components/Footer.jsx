import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import footerBg from '../assets/MiMi footer.webp'
import footerGif from '../assets/MIMI Mobile Footer.gif'

const Footer = () => {
  const { pathname } = useLocation();

  const getLinkClasses = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return `text-sm transition-all duration-300 flex items-center gap-2 ${
      isActive 
        ? 'text-emerald-400 font-bold translate-x-1' 
        : 'text-emerald-200/70 hover:text-emerald-400 hover:translate-x-1'
    }`;
  };

  const renderIndicator = (path) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return isActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> : null;
  };

  return (
    <div className="relative text-emerald-50 bg-emerald-950 overflow-hidden">
      {/* Mobile: GIF background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden opacity-60"
        style={{ backgroundImage: `url(${footerGif})` }}
        aria-hidden="true"
      />
      {/* Desktop: GIF background */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block opacity-60"
        style={{ backgroundImage: `url(${footerGif})` }}
        aria-hidden="true"
      />

      {/* Lighter overlay for better visibility of animation */}
      <div className="absolute inset-0 bg-emerald-950/40" aria-hidden="true" />

      {/* Gradient for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-950/20 pointer-events-none z-[1]" />

      <footer className="relative z-10 mx-auto max-w-7xl px-3 pt-20 pb-12 lg:px-4">
        {/* Newsletter Section */}
        <div className="mx-auto mb-20 flex max-w-6xl flex-wrap items-center justify-between gap-10 bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
          <div className="max-w-md">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
              Stay in touch
            </span>
            <h2 className="mt-2 text-4xl font-black text-white">
              Join the <span className="text-emerald-400">Crunch Club</span>
            </h2>
            <p className="mt-4 text-sm text-emerald-200/70 leading-relaxed">
              Experience the ancient goodness. Get exclusive offers and millet-based recipes straight to your inbox.
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-3">
            <input
              className="flex-1 min-w-[260px] rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm text-white placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              placeholder="Enter your email"
            />
            <button className="rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-bold text-emerald-950 hover:bg-emerald-400 transition-all shadow-lg active:scale-95" type="button">
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 space-y-6 lg:col-span-1">
            <h3 className="text-2xl font-black text-white tracking-tight">Mimi Crunch</h3>
            <p className="text-sm leading-7 text-emerald-200/70">
              Honoring ancient traditions with modern nutrition. Healthy millet foods crafted for a life full of vitality and crunch.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Company</h3>
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
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Support</h3>
            <ul className="mt-6 space-y-4">
              <li><Link to="/shipping-returns" className={getLinkClasses('/shipping-returns')}>{renderIndicator('/shipping-returns')} Order Help</Link></li>
              <li><Link to="/privacy-policy" className={getLinkClasses('/privacy-policy')}>{renderIndicator('/privacy-policy')} Privacy</Link></li>
              <li><Link to="/terms-conditions" className={getLinkClasses('/terms-conditions')}>{renderIndicator('/terms-conditions')} Terms</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Connect</h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex items-center gap-3 text-emerald-200/70">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                support@mimicrunch.com
              </li>
              {/* <li className="flex items-center gap-3 text-emerald-200/70">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                +91 9157165523
              </li> */}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            © 2026 Mimi Crunch. Honoring Nature's Grains.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-400 hover:text-emerald-950 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-400 hover:text-emerald-950 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer