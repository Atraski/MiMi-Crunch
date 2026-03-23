import { useState, useMemo } from 'react'
import Spinner from '../../components/Spinner.jsx'

const CustomerList = ({
  customers = [],
  loading,
  error,
  onRefresh,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => {
    const total = customers.length
    const verified = customers.filter((c) => c.emailVerified).length
    const withAddress = customers.filter((c) => c.address).length
    return { total, verified, withAddress }
  }, [customers])

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [customers, searchQuery])

  return (
    <div className="space-y-6">
      {/* --- Top Stats Section --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Customers', val: stats.total, color: 'text-stone-900' },
          { label: 'Verified Emails', val: stats.verified, color: 'text-emerald-600' },
          { label: 'Completed Profiles', val: stats.withAddress, color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {/* --- Header & Search --- */}
        <div className="border-b border-stone-100 bg-stone-50/40 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Customer Management</h3>
              <p className="text-xs text-stone-500">View and manage users who signed up</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <input
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm transition-all focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 sm:w-64"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="w-full rounded-xl bg-stone-100 px-5 py-2.5 text-sm font-bold text-stone-900 transition-all active:scale-95 hover:bg-stone-200 sm:w-auto"
                onClick={onRefresh}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        {error ? <p className="p-6 text-sm text-red-600 font-medium bg-red-50">{error}</p> : null}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <Spinner className="h-8 w-8 mb-3" />
            <p className="text-sm font-medium">Fetching customers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: 800 }}>
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/30 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-4 sm:px-6">Customer</th>
                  <th className="px-4 py-4 sm:px-6">Contact Info</th>
                  <th className="px-4 py-4 sm:px-6">Status</th>
                  <th className="px-4 py-4 sm:px-6">Joined Date</th>
                  <th className="px-4 py-4 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-stone-400">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((item) => {
                    const joinedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })

                    return (
                      <tr key={item._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-sm">
                              {(item.name || item.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-stone-900">{item.name || 'Anonymous'}</p>
                              <p className="text-[10px] text-stone-400 font-medium">ID: {item._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {item.email}
                            </div>
                            {item.phone && (
                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {item.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold w-fit ${item.emailVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {item.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                            {item.address && (
                              <p className="text-[10px] text-stone-500 font-medium line-clamp-1 max-w-[150px]" title={item.address}>
                                {item.address}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="text-xs text-stone-600 font-medium">{joinedDate}</p>
                        </td>
                        <td className="px-4 py-4 text-right sm:px-6">
                           <button
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm ml-auto"
                            onClick={() => window.confirm(`Delete ${item.email}? This action cannot be undone.`) && onDelete(item._id)}
                            title="Delete Customer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerList
