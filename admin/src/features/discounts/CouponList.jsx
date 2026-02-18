import { useState, useEffect } from 'react'

const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const CouponList = ({
  coupons,
  loading,
  error,
  onRefresh,
  onFetchForEdit,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const handleCreate = async (form) => {
    const success = await onCreate?.(form)
    if (success) setIsCreateOpen(false)
    return success
  }

  const handleEdit = async (form) => {
    if (!editingCoupon) return false
    const success = await onUpdate?.(editingCoupon._id, form)
    if (success) {
      setIsEditOpen(false)
      setEditingCoupon(null)
    }
    return success
  }

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.active).length,
    expired: coupons.filter((c) => c.validUntil && new Date(c.validUntil) < new Date()).length,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Total</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Active</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-600">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Expired</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-600">{stats.expired}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-stone-200/60 bg-stone-50/50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-stone-900">Discounts & Coupons</h3>
              <p className="mt-0.5 text-xs text-stone-500">Create and manage coupon codes for your store</p>
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
                Add coupon
              </button>
            </div>
          </div>
        </div>

        {error ? <p className="px-5 pt-4 text-sm text-red-600 sm:px-6">{error}</p> : null}
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-stone-500 sm:px-6">Loading...</p>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-xs font-medium uppercase tracking-wider text-stone-500">
                  <th className="px-5 py-3 sm:px-6">Code</th>
                  <th className="px-5 py-3 sm:px-6">Value</th>
                  <th className="hidden px-5 py-3 sm:px-6 md:table-cell">Type</th>
                  <th className="hidden px-5 py-3 sm:px-6 lg:table-cell">Min order</th>
                  <th className="hidden px-5 py-3 sm:px-6 lg:table-cell">Uses</th>
                  <th className="hidden px-5 py-3 sm:px-6 md:table-cell">Valid until</th>
                  <th className="px-5 py-3 sm:px-6">Status</th>
                  <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="border-b border-stone-100 transition-colors last:border-b-0 hover:bg-stone-50/50"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-stone-900">
                      {coupon.code}
                    </td>
                    <td className="hidden px-6 py-4 text-stone-600 md:table-cell">
                      {coupon.type === 'fixed' ? 'Fixed (₹)' : 'Percentage (%)'}
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {coupon.type === 'fixed' ? `₹${coupon.value}` : `${coupon.value}%`}
                    </td>
                    <td className="hidden px-6 py-4 text-stone-600 lg:table-cell">
                      {coupon.minOrder != null ? `₹${coupon.minOrder}` : '—'}
                    </td>
                    <td className="hidden px-6 py-4 text-stone-600 lg:table-cell">
                      {coupon.usedCount ?? 0}
                      {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="hidden px-6 py-4 text-stone-600 md:table-cell">
                      {formatDate(coupon.validUntil)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          coupon.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="btn btn-soft mr-2 px-3 py-1 text-xs"
                        type="button"
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true)
                          try {
                            const full = onFetchForEdit
                              ? await onFetchForEdit(coupon._id)
                              : coupon
                            setEditingCoupon(full || coupon)
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
                        onClick={() => onDelete?.(coupon._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!coupons.length ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-stone-600" colSpan="8">
                      No coupons yet. Add one to offer discounts.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {isCreateOpen ? (
          <CouponEditorModal
            title="Add coupon"
            initialData={{
              code: '',
              type: 'percentage',
              value: '',
              minOrder: '',
              maxUses: '',
              validFrom: '',
              validUntil: '',
              active: true,
            }}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
          />
        ) : null}

        {isEditOpen && editingCoupon ? (
          <CouponEditorModal
            key={editingCoupon._id}
            title="Edit coupon"
            initialData={{
              code: editingCoupon.code || '',
              type: editingCoupon.type || 'percentage',
              value: editingCoupon.value ?? '',
              minOrder: editingCoupon.minOrder ?? '',
              maxUses: editingCoupon.maxUses ?? '',
              validFrom: editingCoupon.validFrom
                ? new Date(editingCoupon.validFrom).toISOString().slice(0, 10)
                : '',
              validUntil: editingCoupon.validUntil
                ? new Date(editingCoupon.validUntil).toISOString().slice(0, 10)
                : '',
              active: editingCoupon.active !== false,
            }}
            onClose={() => {
              setIsEditOpen(false)
              setEditingCoupon(null)
            }}
            onSubmit={handleEdit}
          />
        ) : null}
      </div>
    </div>
  )
}

const CouponEditorModal = ({ title, initialData, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    code: initialData.code || '',
    type: initialData.type || 'percentage',
    value: initialData.value ?? '',
    minOrder: initialData.minOrder ?? '',
    maxUses: initialData.maxUses ?? '',
    validFrom: initialData.validFrom || '',
    validUntil: initialData.validUntil || '',
    active: initialData.active !== false,
  })
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    setForm({
      code: initialData.code || '',
      type: initialData.type || 'percentage',
      value: initialData.value ?? '',
      minOrder: initialData.minOrder ?? '',
      maxUses: initialData.maxUses ?? '',
      validFrom: initialData.validFrom || '',
      validUntil: initialData.validUntil || '',
      active: initialData.active !== false,
    })
    setSubmitError('')
  }, [initialData?.code, initialData?.value])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!form.code.trim()) {
      setSubmitError('Code is required.')
      return
    }
    const num = Number(form.value)
    if (Number.isNaN(num) || num < 0) {
      setSubmitError('Value must be a positive number.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        code: form.code.trim(),
        type: form.type,
        value: num,
        minOrder: form.minOrder === '' ? undefined : Number(form.minOrder) || 0,
        maxUses: form.maxUses === '' ? undefined : Number(form.maxUses) || 0,
        validFrom: form.validFrom || undefined,
        validUntil: form.validUntil || undefined,
        active: form.active,
      }
      const success = await onSubmit(payload)
      if (!success) setSubmitError('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-xl">
        <div className="border-b border-stone-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {submitError ? (
            <p className="text-sm text-red-600">{submitError}</p>
          ) : null}
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Code *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm uppercase"
              placeholder="e.g. SAVE10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Value *</label>
              <input
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                min="0"
                step={form.type === 'percentage' ? '1' : '1'}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder={form.type === 'percentage' ? '10' : '50'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Min order (₹)</label>
              <input
                type="number"
                name="minOrder"
                value={form.minOrder}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Max uses</label>
              <input
                type="number"
                name="maxUses"
                value={form.maxUses}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Valid from</label>
              <input
                type="date"
                name="validFrom"
                value={form.validFrom}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Valid until</label>
              <input
                type="date"
                name="validUntil"
                value={form.validUntil}
                onChange={handleChange}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="rounded border-stone-300"
            />
            <span className="text-sm text-stone-700">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline rounded-lg px-4 py-2 text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-lg px-4 py-2 text-sm"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CouponList
