const StatsGrid = ({ products }) => {
  const lowStockCount = products.filter(
    (item) => (item.inventory?.stock ?? 0) <= 5,
  ).length

  const stats = [
    { label: 'Total Orders', value: '—' },
    { label: 'Active Products', value: products.length || '—' },
    { label: 'Low Stock', value: lowStockCount || '—' },
    { label: 'Today Revenue', value: '—' },
  ]

  return (
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
  )
}

export default StatsGrid
