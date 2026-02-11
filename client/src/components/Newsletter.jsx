const Newsletter = () => {
  return (
    <section className="bg-[#1f1d1a] py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-300">
            Stay in touch
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Spice up your inbox</h2>
          <p className="mt-2 text-sm text-stone-300">
            Get offers, recipes, and product drops before anyone else.
          </p>
        </div>
        <form className="flex flex-wrap gap-3">
          <input
            className="min-w-[220px] rounded-full border border-white/20 bg-white/95 px-4 py-2 text-sm text-stone-900"
            placeholder="Enter your email"
          />
          <button className="btn btn-primary" type="button">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
