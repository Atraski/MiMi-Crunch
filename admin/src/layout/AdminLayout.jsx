import { useState } from 'react'
import AdminHeader from './AdminHeader.jsx'
import AdminSidebar from './AdminSidebar.jsx'

const AdminLayout = ({ tabs, activeTab, onTabChange, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleTabChange = (tabId) => {
    onTabChange(tabId)
    setIsMobileMenuOpen(false)
  }

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Dashboard'

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-100/80 text-stone-900">
      <AdminHeader
        activeTabLabel={activeTabLabel}
        isMobileMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        onLogout={onLogout}
      />

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:py-8">
        {isMobileMenuOpen ? (
          <div className="mb-4 lg:hidden">
            <AdminSidebar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        ) : null}

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
          <div className="hidden lg:block">
            <AdminSidebar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
          <main className="min-w-0 space-y-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
