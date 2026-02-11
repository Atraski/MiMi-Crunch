import AdminHeader from './AdminHeader.jsx'
import AdminSidebar from './AdminSidebar.jsx'

const AdminLayout = ({ tabs, activeTab, onTabChange, children }) => (
  <div className="min-h-screen bg-stone-100/80 text-stone-900">
    <AdminHeader />
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr]">
      <AdminSidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <main className="min-w-0 space-y-8">{children}</main>
    </div>
  </div>
)

export default AdminLayout
