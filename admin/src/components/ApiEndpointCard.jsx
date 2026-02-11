const ApiEndpointCard = ({ apiBase }) => (
  <section className="card p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="label">API Endpoint</p>
        <p className="mt-2 text-sm text-stone-600">{apiBase}</p>
      </div>
      <button className="btn btn-outline" type="button">
        Copy URL
      </button>
    </div>
  </section>
)

export default ApiEndpointCard
