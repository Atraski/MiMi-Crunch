import React from 'react'

const Footer = () => {
  return (
    <div className="relative mt-20 bg-emerald-950 text-emerald-50">
      <footer className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">Mimi Crunch</h3>
            <p className="text-sm leading-6 text-emerald-200/80">
              Healthy millet foods crafted with care for a better lifestyle.
              Savor the crunch of nature.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/about" className="text-sm hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="/shop" className="text-sm hover:text-white transition-colors">Our Products</a>
              </li>
              <li>
                <a href="/contact" className="text-sm hover:text-white transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/shipping-returns" className="text-sm hover:text-white transition-colors">Shipping & Returns</a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-sm hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-conditions" className="text-sm hover:text-white transition-colors">Terms & Conditions</a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Get in Touch</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-emerald-200/80">
                <span className="text-emerald-400">📧</span> support@mimicrunch.com
              </li>
              <li className="flex items-center gap-2 text-emerald-200/80">
                <span className="text-emerald-400">📞</span> +91 90000 00000
              </li>
              <li className="flex items-center gap-2 text-emerald-200/80">
                <span className="text-emerald-400">📍</span> Gujarat, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-emerald-900/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-emerald-500">
            © 2026 Mimi Crunch. All rights reserved.
          </p>
          
          {/* Social Icons Section */}
          <div className="flex items-center gap-6">
            {/* Instagram Icon */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-white transition-all transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            
            {/* Facebook Icon */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-white transition-all transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer