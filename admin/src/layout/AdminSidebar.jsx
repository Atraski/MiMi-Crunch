const AdminSidebar = ({ tabs, activeTab, onTabChange }) => (
  <aside className="h-fit rounded-2xl border border-stone-200/80 bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:sticky lg:top-6 lg:p-3">
    <nav className="space-y-0.5 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-stone-800 text-white'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </aside>
)

export default AdminSidebar
