import { useEffect, useMemo, useState } from 'react'
import { getAdminAuthHeaders } from '../../utils/adminAuth.js'
import Spinner from '../../components/Spinner.jsx'

const CollectionList = ({
  collections,
  products,
  loading,
  error,
  onRefresh,
  onFetchForEdit,
  onCreate,
  onUpdate,
  onDelete,
  apiBase,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const productOptions = useMemo(
    () =>
      products.map((item) => ({
        label: item.title || item.name,
        slug: item.slug,
        image:
          item.images?.[0] ||
          (item.variants?.[0]?.images && item.variants[0].images[0]) ||
          '',
      })),
    [products],
  )

  const handleCreate = async (form) => {
    const success = await onCreate?.(form)
    if (success) {
      setIsCreateOpen(false)
    }
    return success
  }

  const handleEdit = async (form) => {
    if (!editingCollection) {
      return false
    }
    const success = await onUpdate?.(editingCollection._id, form)
    if (success) {
      setIsEditOpen(false)
      setEditingCollection(null)
    }
    return success
  }

  const stats = useMemo(() => {
    const total = collections.length
    const live = collections.filter(
      (c) => Array.isArray(c.productSlugs) && c.productSlugs.length > 0,
    ).length
    const archived = total - live
    return { total, live, archived }
  }, [collections])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-stone-200/60 bg-stone-50/50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-stone-900">Collections</h3>
              <p className="mt-0.5 text-xs text-stone-500">Group products for the store</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <button
                className="btn btn-outline rounded-lg px-3 py-1.5 text-xs"
                type="button"
                onClick={onRefresh}
              >
                Refresh
              </button>
              <button
                className="btn btn-primary rounded-lg px-4 py-1.5 text-sm"
                type="button"
                onClick={() => setIsCreateOpen(true)}
              >
                Add collection
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="px-5 pt-4 text-sm text-red-600 sm:px-6">{error}</p> : null}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <Spinner className="h-8 w-8 mb-3" />
            <p className="text-sm font-medium">Sorting collections...</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-xs font-medium uppercase tracking-wider text-stone-500">
                  <th className="px-5 py-3 sm:px-6">Title</th>
                  <th className="hidden px-5 py-3 sm:px-6 md:table-cell">Slug</th>
                  <th className="hidden px-5 py-3 sm:px-6 sm:table-cell">Products</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr
                    key={collection._id}
                    className="border-b border-stone-100 transition-colors last:border-b-0 hover:bg-stone-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {collection.image ? (
                          <img
                            src={collection.image}
                            alt={collection.title}
                            className="h-10 w-10 rounded-xl border border-stone-200/70 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl border border-dashed border-stone-200 bg-stone-50" />
                        )}
                        <div>
                          <p className="font-semibold text-stone-900">
                            {collection.title}
                          </p>
                          {collection.description ? (
                            <p className="mt-1 text-xs text-stone-500">
                              {collection.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-xs text-stone-600 md:table-cell">
                      {collection.slug}
                    </td>
                    <td className="hidden px-6 py-4 text-xs text-stone-600 sm:table-cell">
                      {collection.productSlugs?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="btn btn-soft mr-2 px-3 py-1 text-xs"
                        type="button"
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true)
                          try {
                            const full = onFetchForEdit ? await onFetchForEdit(collection._id) : collection
                            setEditingCollection(full || collection)
                            setIsEditOpen(true)
                          } finally {
                            setEditLoading(false)
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-soft px-3 py-1 text-xs"
                        type="button"
                        onClick={() => onDelete?.(collection._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!collections.length ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-stone-600" colSpan="4">
                      No collections yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {isCreateOpen ? (
          <CollectionEditorModal
            title="Add Collection"
            productOptions={productOptions}
            apiBase={apiBase}
            initialData={{
              title: '',
              slug: '',
              description: '',
              image: '',
              productSlugs: [],
            }}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
          />
        ) : null}

        {isEditOpen && editingCollection ? (
          <CollectionEditorModal
            key={editingCollection._id}
            title="Edit Collection"
            productOptions={productOptions}
            apiBase={apiBase}
            initialData={editingCollection}
            onClose={() => {
              setIsEditOpen(false)
              setEditingCollection(null)
            }}
            onSubmit={handleEdit}
          />
        ) : null}
      </div>
    </div>
  )
}

const CollectionEditorModal = ({
  title,
  productOptions,
  initialData,
  apiBase,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: initialData.title || '',
    slug: initialData.slug || '',
    description: initialData.description || '',
    image: initialData.image || '',
    productSlugs: initialData.productSlugs || [],
  })
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!initialData) return
    setForm({
      title: initialData.title || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      image: initialData.image || '',
      productSlugs: initialData.productSlugs || [],
    })
    setImageFile(null)
  }, [initialData?._id])

  const availableProducts = useMemo(
    () =>
      productOptions.filter(
        (option) => !form.productSlugs.includes(option.slug),
      ),
    [productOptions, form.productSlugs],
  )

  const selectedProducts = useMemo(
    () =>
      form.productSlugs
        .map((slug) => productOptions.find((option) => option.slug === slug))
        .filter(Boolean),
    [form.productSlugs, productOptions],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, image: previewUrl }))
  }

  const uploadImageIfNeeded = async () => {
    if (!imageFile || !apiBase) {
      return form.image
    }
    setUploadError('')
    const res = await fetch(`${apiBase}/api/uploads/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ folder: 'collections' }),
    })
    if (!res.ok) {
      throw new Error('Signature failed')
    }
    const data = await res.json()
    const uploadUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('api_key', data.apiKey)
    formData.append('timestamp', data.timestamp)
    formData.append('signature', data.signature)
    formData.append('folder', 'collections')
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
    if (!uploadRes.ok) {
      throw new Error('Upload failed')
    }
    const uploadJson = await uploadRes.json()
    return uploadJson.secure_url
  }

  const handleAddProduct = (event) => {
    const slug = event.target.value
    if (!slug) {
      return
    }
    setForm((prev) => ({
      ...prev,
      productSlugs: [...prev.productSlugs, slug],
    }))
    event.target.value = ''
  }

  const handleRemoveProduct = (slug) => {
    setForm((prev) => ({
      ...prev,
      productSlugs: prev.productSlugs.filter((value) => value !== slug),
    }))
  }

  const moveProduct = (index, direction) => {
    setForm((prev) => {
      const next = [...prev.productSlugs]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev
      }
      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)
      return { ...prev, productSlugs: next }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const imageUrl = await uploadImageIfNeeded()
      const payload = { ...form, image: imageUrl }
      const success = await onSubmit?.(payload)
      if (!success) {
        setSaving(false)
      }
    } catch (err) {
      setUploadError('Image upload failed. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-900/40 px-4">
      <div className="w-full max-w-3xl">
        <div className="card max-h-[85vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
            <button
              className="btn btn-soft px-3 py-1 text-xs"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="label">Title</p>
                <input
                  className="input mt-2"
                  name="title"
                  placeholder="Millet Grain"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <p className="label">Slug</p>
                <input
                  className="input mt-2"
                  name="slug"
                  placeholder="millet-grain"
                  value={form.slug}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-stone-500">
                  Leave blank to generate from title.
                </p>
              </div>
            </div>
            <div>
              <p className="label">Description</p>
              <textarea
                className="input mt-2 min-h-[80px]"
                name="description"
                placeholder="Short description for this collection."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
              <div>
                <p className="label">Collection image</p>
                <p className="mt-1 text-xs text-stone-500">
                  This image is used for the collection card on the website.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt={form.title || 'Collection image'}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <label className="btn btn-soft px-3 py-1 text-xs cursor-pointer">
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </label>
                </div>
                {uploadError ? (
                  <p className="mt-1 text-xs text-red-600">{uploadError}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="label">Products in this collection</p>
                  <p className="mt-1 text-xs text-stone-500">
                    Add products and arrange their order. A product can be in
                    multiple collections.
                  </p>
                </div>
                <div>
                  <select
                    className="input text-sm"
                    defaultValue=""
                    onChange={handleAddProduct}
                  >
                    <option value="" disabled>
                      Add product…
                    </option>
                    {availableProducts.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3">
                {selectedProducts.length ? (
                  selectedProducts.map((product, index) => (
                    <div
                      key={product.slug}
                      className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.label}
                            className="h-10 w-10 rounded-lg border border-stone-200/70 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-dashed border-stone-200 bg-stone-50" />
                        )}
                        <div>
                          <p className="font-semibold text-stone-900">
                            {product.label}
                          </p>
                          <p className="mt-0.5 text-[11px] text-stone-500">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-soft px-2 py-1 text-[11px]"
                          type="button"
                          onClick={() => moveProduct(index, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-soft px-2 py-1 text-[11px]"
                          type="button"
                          onClick={() => moveProduct(index, 1)}
                          disabled={index === selectedProducts.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          className="btn btn-soft px-2 py-1 text-[11px]"
                          type="button"
                          onClick={() => handleRemoveProduct(product.slug)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500">
                    No products added yet.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                className="btn btn-outline px-4 py-1.5 text-sm"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4 py-1.5 text-sm"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CollectionList

