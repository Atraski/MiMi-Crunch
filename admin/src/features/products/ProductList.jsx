import { useState } from 'react'
import { useMemo } from 'react'
import ProductForm from './ProductForm.jsx'

const ProductList = ({
  products = [],
  loading,
  error,
  onRefresh,
  onFetchForEdit,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
  apiBase,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Collections filter logic
  const collections = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((item) => item.collection)
            .filter((value) => typeof value === 'string' && value.trim()),
        ),
      ),
    [products],
  )

  // Stats calculation based on variants stock
  const stats = useMemo(() => {
    const total = products.length
    const live = products.filter((p) => p.isActive !== false).length
    const archived = total - live
    
    // Check if any variant is out of stock
    const outOfStock = products.filter((p) => {
      if (p.variants && p.variants.length > 0) {
        return p.variants.every(v => (v.stock ?? 0) === 0)
      }
      return (p.inventory?.stock ?? 0) === 0
    }).length

    return { total, live, archived, outOfStock }
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (p.name || p.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  const handleCreate = async (form) => {
    const success = await onCreate(form)
    if (success) setIsCreateOpen(false)
    return success
  }

  const handleEdit = async (form) => {
    if (!editingProduct) return false
    const success = await onUpdate(editingProduct._id, form)
    if (success) {
      setIsEditOpen(false)
      setEditingProduct(null)
    }
    return success
  }

  return (
    <div className="space-y-6">
      {/* --- Top Stats Section --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Products', val: stats.total, color: 'text-stone-900' },
          { label: 'Live on Site', val: stats.live, color: 'text-emerald-600' },
          { label: 'Archived', val: stats.archived, color: 'text-stone-500' },
          { label: 'Completely Out of Stock', val: stats.outOfStock, color: 'text-amber-600' },
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
              <h3 className="text-lg font-bold text-stone-900">Catalog Management</h3>
              <p className="text-xs text-stone-500">Manage products, variants, and live inventory</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <input
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm transition-all focus:border-stone-400 focus:outline-none focus:ring-4 focus:ring-stone-100 sm:w-64"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="w-full rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95 hover:bg-stone-800 sm:w-auto"
                onClick={() => setIsCreateOpen(true)}
              >
                + Add Product
              </button>
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        {error ? <p className="p-6 text-sm text-red-600 font-medium bg-red-50">{error}</p> : null}
        
        {loading ? (
          <div className="py-20 text-center text-stone-400 animate-pulse">Fetching inventory...</div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/30 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-4 sm:px-6">Product Info</th>
                  <th className="px-4 py-4 sm:px-6">Status</th>
                  <th className="hidden px-4 py-4 sm:px-6 md:table-cell">Available Variants</th>
                  <th className="hidden px-4 py-4 sm:px-6 lg:table-cell">Collection</th>
                  <th className="px-4 py-4 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredProducts.map((item) => {
                  const isActive = item.isActive !== false
                  const primaryImage = item.images?.[0] || item.variants?.[0]?.images?.[0] || ''
                  
                  return (
                    <tr key={item._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={primaryImage || 'https://via.placeholder.com/150'} 
                            className="h-12 w-12 rounded-xl border object-cover bg-stone-100" 
                            alt="" 
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-stone-900">{item.title || item.name}</p>
                            <p className="text-[10px] text-stone-400 font-medium">ID: {item._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 sm:px-6 md:table-cell">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isActive}
                            onChange={(e) => onToggleActive?.(item._id, e.target.checked)}
                          />
                          <div className={`h-5 w-10 rounded-full transition-all ${isActive ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                            <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${isActive ? 'left-6' : 'left-1'}`} />
                          </div>
                          <span className={`ml-3 text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-stone-400'}`}>
                            {isActive ? 'LIVE' : 'DRAFT'}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
  <div className="flex flex-wrap gap-2">
    {item.variants && item.variants.length > 0 ? (
      item.variants.map((v, idx) => (
        <div 
          key={idx} 
          className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${
            (v.stock || 0) <= 5 
              ? 'bg-amber-50 border-amber-200 text-amber-700' 
              : 'bg-stone-50 border-stone-100 text-stone-600'
          }`}
        >
          {/* Yahan weight ke baad se ":" hata diya aur v.stock ensure kiya */}
          {v.weight} <span className="text-stone-900 ml-1">{v.stock ?? 0}</span>
        </div>
      ))
    ) : (
      <span className="text-xs text-stone-400 font-medium">No variants found</span>
    )}
  </div>
</td>
                      <td className="hidden px-4 py-4 sm:px-6 lg:table-cell">
                        <span className="inline-block rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-500">
                          {item.collection || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right sm:px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-900 hover:text-white transition-all shadow-sm"
                            onClick={async () => {
                              setEditLoading(true)
                              const full = onFetchForEdit ? await onFetchForEdit(item._id) : item
                              setEditingProduct(full || item)
                              setIsEditOpen(true)
                              setEditLoading(false)
                            }}
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            onClick={() => window.confirm('Delete this product?') && onDelete(item._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modals Section --- */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b p-6">
              <h3 className="text-xl font-bold text-stone-900">
                {isCreateOpen ? 'Add New Munchy' : 'Refine Product'}
              </h3>
              <button
                className="rounded-full bg-stone-100 p-2 hover:bg-stone-200 transition-colors"
                onClick={() => {
                  setIsCreateOpen(false)
                  setIsEditOpen(false)
                  setEditingProduct(null)
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <ProductForm
                key={isCreateOpen ? 'create' : editingProduct?._id}
                onCreate={isCreateOpen ? handleCreate : undefined}
                onUpdate={isEditOpen ? handleEdit : undefined}
                initialProduct={isEditOpen ? editingProduct : null}
                collections={collections}
                apiBase={apiBase}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList