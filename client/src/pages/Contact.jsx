import BackButton from '../components/BackButton'

const Contact = () => {
  return (
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-hidden py-16 px-4 font-[Manrope]">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-5xl relative z-10">
        <BackButton className="mb-8 text-[#1B3B26]" />

        <div className="space-y-4 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-[Fraunces] font-medium text-[#1B3B26] tracking-tight">
            Get in touch
          </h1>
          <p className="text-lg text-[#4A5D4E] max-w-2xl mx-auto">
            Reach out for partnerships, distribution, or support. We'd love to hear from you.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5 lg:gap-12 items-start">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 transition-all hover:shadow-[0_24px_60px_-15px_rgba(27,59,38,0.1)] hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#1B3B26] text-[#F5B041] rounded-full flex items-center justify-center mb-5 shadow-[0_10px_20px_rgba(27,59,38,0.2)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#F5B041] uppercase tracking-wider mb-1">Email Us</p>
              <a href="mailto:support@mimicrunch.com" className="text-xl font-[Fraunces] font-medium text-[#1B3B26] hover:text-[#2A5237] transition-colors break-words">
                support@mimicrunch.com
              </a>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 transition-all hover:shadow-[0_24px_60px_-15px_rgba(27,59,38,0.1)] hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#1B3B26] text-[#F5B041] rounded-full flex items-center justify-center mb-5 shadow-[0_10px_20px_rgba(27,59,38,0.2)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              {/* <p className="text-sm font-bold text-[#F5B041] uppercase tracking-wider mb-1">Call Us</p>
              <a href="tel:+919157165523" className="text-xl font-[Fraunces] font-medium text-[#1B3B26] hover:text-[#2A5237] transition-colors">
                +91 91571 65523
              </a> */}
            </div>

            <div className="backdrop-blur-xl bg-[#1B3B26] border border-[#2A5237] shadow-[0_20px_50px_-15px_rgba(27,59,38,0.2)] rounded-[2rem] p-8 text-center sm:text-left relative overflow-hidden group hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B041] opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-2xl font-[Fraunces] font-medium text-white mb-2 relative z-10">Follow Our Journey</h3>
              <p className="text-[#a8b8ae] text-sm relative z-10 leading-relaxed">Join our community on social media for the latest recipes and updates.</p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="lg:col-span-3 backdrop-blur-xl bg-white/70 border border-white/60 shadow-[0_24px_60px_-15px_rgba(27,59,38,0.1)] rounded-[2rem] p-8 md:p-10 transition-all">
            <h2 className="text-2xl font-[Fraunces] font-medium text-[#1B3B26] mb-6">Send us a message</h2>
            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Name</label>
                  <input
                    className="w-full bg-white/50 border border-stone-200/80 rounded-xl px-4 py-3.5 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm"
                    placeholder="Your Full Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white/50 border border-stone-200/80 rounded-xl px-4 py-3.5 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Subject</label>
                <input
                  className="w-full bg-white/50 border border-stone-200/80 rounded-xl px-4 py-3.5 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm"
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Message</label>
                <textarea
                  className="w-full min-h-[160px] resize-y bg-white/50 border border-stone-200/80 rounded-xl px-4 py-3.5 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm"
                  placeholder="Tell us what's on your mind..."
                />
              </div>
              <button
                className="mt-2 bg-[#1B3B26] hover:bg-[#2A5237] text-white font-semibold rounded-xl px-8 py-3.5 transition-all duration-200 shadow-[0_8px_20px_rgba(27,59,38,0.15)] hover:shadow-[0_12px_25px_rgba(27,59,38,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:-translate-y-0 sm:w-fit"
                type="button"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Contact
