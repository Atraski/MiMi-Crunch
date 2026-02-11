import { useState } from 'react'
import { useMemo } from 'react'
import ProductForm from './ProductForm.jsx'

const ProductList = ({
  products,
  loading,
  error,
  onRefresh,
  onFetchForEdit,
  onCreate,
  onUpdate,
  onUpdateStock,
  onDelete,
  onToggleActive,
  apiBase,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
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

  const handleCreate = async (form) => {
    const success = await onCreate(form)
    if (success) {
      setIsCreateOpen(false)
    }
    return success
  }

  const handleEdit = async (form) => {
    if (!editingProduct) {
      return false
    }
    const success = await onUpdate(editingProduct._id, form)
    if (success) {
      setIsEditOpen(false)
      setEditingProduct(null)
    }
    return success
  }

  const stats = useMemo(() => {
    const total = products.length
    const live = products.filter((p) => p.isActive !== false).length
    const archived = total - live
    const outOfStock = products.filter(
      (p) => (p.inventory?.stock ?? 0) === 0,
    ).length
    return { total, live, archived, outOfStock }
  }, [products])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Total</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Live</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-600">{stats.live}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Archived</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-600">{stats.archived}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Out of stock</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-amber-600">{stats.outOfStock}</p>
        </div>
      </div>

    <div className="card overflow-hidden">
    <div className="border-b border-stone-200/60 bg-stone-50/50 px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900">Product catalog</h3>
          <p className="mt-0.5 text-xs text-stone-500">Products & inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline rounded-lg px-3 py-1.5 text-xs" type="button">
            Export
          </button>
          <button className="btn btn-outline rounded-lg px-3 py-1.5 text-xs" type="button">
            Import
          </button>
          <button
            className="btn btn-primary rounded-lg px-4 py-1.5 text-sm"
            type="button"
            onClick={() => setIsCreateOpen(true)}
          >
            Add product
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Active', 'Draft', 'Archived'].map((tab) => (
            <button
              key={tab}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === 'All'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-40 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none"
            placeholder="Search"
          />
          <button
            className="btn btn-outline rounded-lg px-3 py-1.5 text-xs"
            onClick={onRefresh}
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    {error ? <p className="px-5 pt-4 text-sm text-red-600 sm:px-6">{error}</p> : null}
    {loading ? (
      <p className="px-5 py-8 text-center text-sm text-stone-500 sm:px-6">Loading...</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/80 text-xs font-medium uppercase tracking-wider text-stone-500">
              <th className="px-5 py-3 sm:px-6">Product</th>
              <th className="px-5 py-3 sm:px-6">Status</th>
              <th className="px-5 py-3 sm:px-6">Inventory</th>
              <th className="px-5 py-3 sm:px-6">Category</th>
              <th className="px-5 py-3 text-right sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => {
              const stock = item.inventory?.stock ?? 0
              const isLow = stock <= 5
              const isActive = item.isActive !== false
              const primaryImage =
                item.images?.[0] ||
                (item.variants?.[0]?.images && item.variants[0].images[0]) ||
                ''
              return (
                <tr
                  key={item._id}
                  className="border-b border-stone-100 transition-colors last:border-b-0 hover:bg-stone-50/50"
                >
                  <td className="px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-xl border border-stone-200/70 bg-stone-100">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={item.title || item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">
                          {item.title || item.name}
                        </p>
                        {/* <p className="text-xs text-stone-500">
                          {item.slug} • {item.weight}
                        </p> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          className="sr-only"
                          type="checkbox"
                          checked={isActive}
                          onChange={(event) =>
                            onToggleActive?.(item._id, event.target.checked)
                          }
                        />
                        <span
                          className={`h-5 w-9 rounded-full transition ${
                            isActive ? 'bg-emerald-400' : 'bg-stone-300'
                          }`}
                        />
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                            isActive ? 'translate-x-4' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isLow ? 'text-amber-700' : 'text-stone-700'
                        }`}
                      >
                        {/* {stock} in stock */}
                      </span>
                      <input
                        className="w-12 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
                        defaultValue={stock}
                        type="number"
                        min="0"
                        onBlur={(event) =>
                          onUpdateStock(item._id, event.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-600">
                    {item.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true)
                          try {
                            const full = onFetchForEdit ? await onFetchForEdit(item._id) : item
                            setEditingProduct(full || item)
                            setIsEditOpen(true)
                          } finally {
                            setEditLoading(false)
                          }
                        }}
                        type="button"
                        aria-label="Edit product"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-.793.793-2.828-2.828.793-.793Z" />
                          <path d="M11.379 5.793 4 13.172V16h2.828l7.38-7.379-2.83-2.828Z" />
                        </svg>
                      </button>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(item._id)}
                        type="button"
                        aria-label="Delete product"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M8.5 3a1.5 1.5 0 0 0-1.415 1H5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5h-2.085A1.5 1.5 0 0 0 11.5 3h-3Z" />
                          <path d="M6.5 7.25A.75.75 0 0 1 7.25 8v6a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75Zm3.25 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75Zm4 .75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V8Z" />
                          <path d="M5.5 6.5h9v8.25A2.25 2.25 0 0 1 12.25 17h-4.5A2.25 2.25 0 0 1 5.5 14.75V6.5Z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!products.length ? (
              <tr>
                <td className="px-6 py-6 text-sm text-stone-600" colSpan="5">
                  No products yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    )}
    {isCreateOpen ? (
      <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/40 px-4">
        <div className="w-full max-w-3xl">
          <div className="card max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">
                Add Product
              </h3>
              <button
                className="btn btn-soft px-3 py-1 text-xs"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Close
              </button>
            </div>
            <ProductForm
              onCreate={handleCreate}
              collections={collections}
              apiBase={apiBase}
            />
          </div>
        </div>
      </div>
    ) : null}
    {isEditOpen && editingProduct ? (
      <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/40 px-4">
        <div className="w-full max-w-3xl">
          <div className="card max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">
                Edit Product
              </h3>
              <button
                className="btn btn-soft px-3 py-1 text-xs"
                type="button"
                onClick={() => {
                  setIsEditOpen(false)
                  setEditingProduct(null)
                }}
              >
                Close
              </button>
            </div>
            <ProductForm
              key={editingProduct._id}
              onUpdate={handleEdit}
              initialProduct={editingProduct}
              collections={collections}
              apiBase={apiBase}
            />
          </div>
        </div>
      </div>
    ) : null}
    </div>
  </div>
  )
}

export default ProductList
