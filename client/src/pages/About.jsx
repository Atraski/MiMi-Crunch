import BackButton from '../components/BackButton'

const About = () => {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">About</h1>
          <p className="text-stone-600">
            Mimi Crunch brings ancient grains to modern kitchens with clean,
            wholesome millet foods.
          </p>
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="h-72 rounded-3xl bg-gradient-to-br from-brand-900 to-emerald-700" />
          <div className="space-y-4 text-stone-600">
            <p>
              We partner with regional farmers to source premium millets and
              craft recipes that respect traditional nutrition while fitting
              today’s lifestyle.
            </p>
            <p>
              Our mission is to make healthy eating easy for every home with
              reliable quality, transparent sourcing, and great taste.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="pill">Gluten Free</span>
              <span className="pill">No Preservatives</span>
              <span className="pill">Family Recipes</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default About
