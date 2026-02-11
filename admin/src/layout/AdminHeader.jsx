const AdminHeader = () => (
  <header className="border-b border-stone-200/60 bg-white/90 backdrop-blur-sm">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
          Mimi Crunch Admin
        </h1>
        <p className="mt-0.5 text-xs text-stone-500">Dashboard</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="pill text-emerald-700 bg-emerald-50">Live</span>
        <button className="btn btn-soft rounded-lg px-3 py-1.5 text-xs" type="button">
          Help
        </button>
      </div>
    </div>
  </header>
)

export default AdminHeader
