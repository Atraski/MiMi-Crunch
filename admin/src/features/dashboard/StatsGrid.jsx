const sourceIcons = {
  google: (
    <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
    </svg>
  ),
  facebook: (
    <svg className="w-4 h-4 mr-2 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4 mr-2 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  direct: (
    <svg className="w-4 h-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  other: (
    <svg className="w-4 h-4 mr-2 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  )
}

const StatsGrid = ({ products, analytics }) => {
  const lowStockCount = products.filter(
    (item) => (item.inventory?.stock ?? 0) <= 5,
  ).length

  const stats = [
    { label: 'Active Products', value: products.length || '0' },
    { label: 'Low Stock', value: lowStockCount || '0' },
    { label: 'Live Users', value: analytics?.activeUsers || '0' },
    { label: 'Total Traffic (30d)', value: analytics?.dailyTraffic?.reduce((sum, day) => sum + day.visitors, 0) || '0' },
  ]

  const sources = analytics?.sourceStats || {}
  const totalSources = Object.values(sources).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {/* Traffic Sources & Chart Summary */}
      <section className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {/* Source Breakdown */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {['google', 'facebook', 'instagram', 'direct', 'other'].map(source => {
              const count = sources[source] || 0
              const percentage = Math.round((count / totalSources) * 100)

              return (
                <div key={source} className="flex items-center justify-between">
                  <span className="flex items-center text-sm font-medium capitalize text-stone-600 w-24">
                    {sourceIcons[source]}
                    {source}
                  </span>
                  <div className="flex-1 mx-4 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${source === 'google' ? 'bg-blue-500' : source === 'facebook' ? 'bg-blue-700' : source === 'instagram' ? 'bg-pink-500' : source === 'direct' ? 'bg-green-500' : 'bg-stone-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-stone-900 min-w-10 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Traffic Chart Placeholder / Basic Info */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Daily Traffic (Past 30 Days)</h3>
          <div className="flex-1 flex items-end justify-between space-x-1 border-b border-stone-100 pb-2 h-40">
            {/* Simple visual bar chart using recent 14 days or so */}
            {analytics?.dailyTraffic?.slice(-14).map((day, idx) => {
              const maxTraffic = Math.max(...analytics.dailyTraffic.map(d => d.visitors), 1)
              const height = `${(day.visitors / maxTraffic) * 100}%`
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="w-full bg-brand-primary/20 rounded-t-sm transition-all hover:bg-brand-primary" style={{ height: height || '4px' }} />

                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 bg-stone-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                    {day._id}: {day.visitors} visitors
                  </div>
                </div>
              )
            })}
            {(!analytics?.dailyTraffic || analytics.dailyTraffic.length === 0) && (
              <div className="w-full text-center text-sm text-stone-400 mb-10">
                No traffic data yet
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-400">
            <span>Older</span>
            <span>Recent</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StatsGrid
