const Hero = () => {
  return (
    <section className="bg-[#faf7f2] py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-2 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Proud family recipe • Made in India
          </p>
          <h1 className="text-4xl font-semibold text-stone-900 sm:text-5xl lg:text-6xl">
            Clean, wholesome <span className="text-brand-900">millet foods</span>{' '}
            for everyday health.
          </h1>
          <p className="mt-5 max-w-xl text-base text-stone-600">
            Mimi Crunch brings ancient grains to modern kitchens. Balanced
            meals, clean ingredients, and real taste—crafted for your family.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="/products">
              Explore Products
            </a>
            <a className="btn btn-ghost" href="/recipes">
              View Recipes
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs text-stone-600">
            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1">
              Gluten Free
            </span>
            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1">
              No Preservatives
            </span>
            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1">
              High Fiber
            </span>
            <span className="rounded-full border border-stone-200 bg-white/80 px-3 py-1">
              Low GI
            </span>
          </div>
        </div>
        <div
          className="flex min-h-[380px] items-end rounded-[32px] border border-stone-200/80 bg-cover bg-center p-6 shadow-sm"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop')",
          }}
        >
          <div className="rounded-2xl border border-stone-200/70 bg-white/90 p-5 shadow-sm">
            <p className="pill">Featured</p>
            <h3 className="mt-2 text-lg font-semibold text-stone-900">
              Multi Millet Khichdi
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Comforting, protein-rich meal with five millets and mild spices.
            </p>
            <a className="btn btn-dark mt-4" href="/products/multi-millet-khichdi">
              View Product
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
