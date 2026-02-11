const Story = () => {
  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
        <div className="h-72 rounded-[32px] border border-stone-200/80 bg-gradient-to-br from-stone-200 to-emerald-100" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Rooted in tradition
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">
            Healthy eating made simple for every home.
          </h2>
          <p className="mt-3 text-stone-600">
            We work with regional farmers to source premium millets and craft
            products that respect traditional nutrition while fitting your
            modern routine.
          </p>
          <button className="btn btn-primary mt-6">Learn More</button>
        </div>
      </div>
    </section>
  )
}

export default Story
