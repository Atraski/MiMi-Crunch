const SectionHeader = ({ title, description }) => (
  <section className="card p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="label">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-outline" type="button">
          Export
        </button>
        <button className="btn btn-primary" type="button">
          New Update
        </button>
      </div>
    </div>
  </section>
)

export default SectionHeader
