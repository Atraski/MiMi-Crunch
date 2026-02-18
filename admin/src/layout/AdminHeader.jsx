const AdminHeader = ({ activeTabLabel, onMenuToggle, isMobileMenuOpen, onLogout }) => (
  <header className="border-b border-stone-200/60 bg-white/90 backdrop-blur-sm">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 lg:hidden"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 5A.75.75 0 0 1 2.75 9h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.75Zm0 5A.75.75 0 0 1 2.75 14h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
            Mimi Crunch Admin
          </h1>
          <p className="mt-0.5 text-xs text-stone-500">{activeTabLabel || 'Dashboard'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="pill text-emerald-700 bg-emerald-50">Live</span>
        <button className="btn btn-soft hidden rounded-lg px-3 py-1.5 text-xs sm:inline-flex" type="button">
          Help
        </button>
        <button
          className="btn btn-outline rounded-lg px-3 py-1.5 text-xs"
          type="button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  </header>
)

export default AdminHeader
