const ApiEndpointCard = ({ apiBase }) => (
  <section className="card p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="label">API Endpoint</p>
        <p className="mt-2 break-all text-xs text-stone-600 sm:text-sm">{apiBase}</p>
      </div>
      <button className="btn btn-outline w-full sm:w-auto" type="button">
        Copy URL
      </button>
    </div>
  </section>
)

export default ApiEndpointCard
