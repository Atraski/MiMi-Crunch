const SectionHeader = ({ title, description }) => (
  <section className="card p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="label">Overview</p>
        <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
        <button className="btn btn-outline w-full sm:w-auto" type="button">
          Export
        </button>
        <button className="btn btn-primary w-full sm:w-auto" type="button">
          New Update
        </button>
      </div>
    </div>
  </section>
)

export default SectionHeader
