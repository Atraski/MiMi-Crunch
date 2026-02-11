import { useEffect, useMemo, useState } from 'react'
import RichTextEditor from '../../components/RichTextEditor.jsx'

const BlogList = ({
  blogs,
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
  const [editingBlog, setEditingBlog] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const handleCreate = async (form) => {
    const success = await onCreate?.(form)
    if (success) {
      setIsCreateOpen(false)
    }
    return success
  }

  const handleEdit = async (form) => {
    if (!editingBlog) return false
    const success = await onUpdate?.(editingBlog._id, form)
    if (success) {
      setIsEditOpen(false)
      setEditingBlog(null)
    }
    return success
  }

  const handleToggleActive = async (blog) => {
    await onUpdate?.(blog._id, { published: !blog.published })
  }

  const stats = useMemo(() => {
    const total = blogs.length
    const live = blogs.filter((b) => b.published).length
    const archived = total - live
    return { total, live, archived }
  }, [blogs])

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
            <h3 className="text-base font-semibold text-stone-900">Blog posts</h3>
            <p className="mt-0.5 text-xs text-stone-500">Manage articles</p>
          </div>
          <div className="flex items-center gap-2">
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
              New blog
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
                <th className="px-5 py-3 sm:px-6">Title</th>
                <th className="px-5 py-3 sm:px-6">Slug</th>
                <th className="px-5 py-3 sm:px-6">Status</th>
                <th className="px-5 py-3 text-right sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="border-b border-stone-100 transition-colors last:border-b-0 hover:bg-stone-50/50"
                >
                  <td className="px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-10 w-10 shrink-0 rounded-lg border border-stone-200/80 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-stone-200 bg-stone-100" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">
                          {blog.title}
                        </p>
                        {blog.excerpt ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">
                            {blog.excerpt}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-500 sm:px-6">
                    {blog.slug}
                  </td>
                  <td className="px-5 py-3.5 sm:px-6">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={blog.published}
                      onClick={() => handleToggleActive(blog)}
                      title={blog.published ? 'Active – shown on website' : 'Archived – hidden from website'}
                      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 ${
                        blog.published
                          ? 'bg-emerald-500'
                          : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          blog.published ? 'left-1 translate-x-4' : 'left-1 translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    <div className="inline-flex items-center gap-1">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                        type="button"
                        aria-label="Edit blog"
                        disabled={editLoading}
                        onClick={async () => {
                          setEditLoading(true)
                          try {
                            const full = onFetchForEdit ? await onFetchForEdit(blog._id) : blog
                            setEditingBlog(full || blog)
                            setIsEditOpen(true)
                          } finally {
                            setEditLoading(false)
                          }
                        }}
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
                        type="button"
                        aria-label="Delete blog"
                        onClick={() => onDelete?.(blog._id)}
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
              ))}
              {!blogs.length ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-stone-600" colSpan="4">
                    No blogs yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen ? (
        <BlogEditorModal
          title="New blog"
          apiBase={apiBase}
          initialData={{
            title: '',
            slug: '',
            excerpt: '',
            contentHtml: '',
            coverImage: '',
            tags: [],
            published: false,
          }}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      {isEditOpen && editingBlog ? (
        <BlogEditorModal
          key={editingBlog._id}
          title="Edit blog"
          apiBase={apiBase}
          initialData={editingBlog}
          onClose={() => {
            setIsEditOpen(false)
            setEditingBlog(null)
          }}
          onSubmit={handleEdit}
        />
      ) : null}
    </div>
    </div>
  )
}

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const formatDateTimeLocal = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

const BlogEditorModal = ({ title, apiBase, initialData, onClose, onSubmit }) => {
  const isEdit = Boolean(initialData._id)
  const [form, setForm] = useState({
    title: initialData.title || '',
    slug: initialData.slug || '',
    excerpt: initialData.excerpt || '',
    contentHtml: initialData.contentHtml || '',
    coverImage: initialData.coverImage || '',
    tags: initialData.tags || [],
    published: Boolean(initialData.published),
    ...(isEdit && {
      publishedAt: formatDateTimeLocal(initialData.publishedAt) || formatDateTimeLocal(new Date()),
    }),
  })
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData.slug))
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!initialData) return
    const isEdit = Boolean(initialData._id)
    setForm({
      title: initialData.title || '',
      slug: initialData.slug || '',
      excerpt: initialData.excerpt || '',
      contentHtml: initialData.contentHtml || '',
      coverImage: initialData.coverImage || '',
      tags: initialData.tags || [],
      published: Boolean(initialData.published),
      ...(isEdit && {
        publishedAt: formatDateTimeLocal(initialData.publishedAt) || formatDateTimeLocal(new Date()),
      }),
    })
    setSlugTouched(Boolean(initialData.slug))
    setCoverFile(null)
  }, [initialData?._id])

  const tagsValue = useMemo(
    () => (Array.isArray(form.tags) ? form.tags.join(', ') : ''),
    [form.tags],
  )

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => {
      const next = { ...prev }
      if (name === 'title') {
        next.title = value
        if (!slugTouched || !prev.slug) {
          next.slug = slugify(value)
        }
      } else if (name === 'slug') {
        next.slug = value
        setSlugTouched(Boolean(value.trim()))
      } else if (name === 'published' && type === 'checkbox') {
        next.published = checked
      } else if (name === 'publishedAt') {
        next.publishedAt = value
      } else if (name === 'tags') {
        next.tags = value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      } else {
        next[name] = value
      }
      return next
    })
  }

  const handleContentChange = (html) => {
    setForm((prev) => ({ ...prev, contentHtml: html }))
  }

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, coverImage: previewUrl }))
  }

  const uploadCoverIfNeeded = async () => {
    if (!coverFile || !apiBase) {
      return form.coverImage
    }
    setUploadError('')
    const res = await fetch(`${apiBase}/api/uploads/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'blogs' }),
    })
    if (!res.ok) {
      throw new Error('Signature failed')
    }
    const data = await res.json()
    const uploadUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`
    const formData = new FormData()
    formData.append('file', coverFile)
    formData.append('api_key', data.apiKey)
    formData.append('timestamp', data.timestamp)
    formData.append('signature', data.signature)
    formData.append('folder', 'blogs')
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const coverUrl = await uploadCoverIfNeeded()
      const payload = { ...form, coverImage: coverUrl }
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
      <div className="w-full max-w-5xl">
        <div className="card max-h-[90vh] overflow-y-auto p-6">
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <p className="label">Title</p>
                <input
                  className="input mt-2"
                  name="title"
                  placeholder="Blog title"
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
                  placeholder="blog-title"
                  value={form.slug}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-stone-500">
                  Auto-fills from title, but you can override.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-start">
              <div>
                <p className="label">Content</p>
                <div className="mt-2">
                  <RichTextEditor
                    value={form.contentHtml}
                    onChange={handleContentChange}
                    placeholder="Write your blog content here..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="label">Excerpt</p>
                  <textarea
                    className="input mt-2 min-h-[80px]"
                    name="excerpt"
                    placeholder="Short summary shown in lists."
                    value={form.excerpt}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <p className="label">Cover image</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-20 w-32 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                      {form.coverImage ? (
                        <img
                          src={form.coverImage}
                          alt={form.title || 'Cover image'}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <label className="btn btn-soft px-3 py-1 text-xs cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </label>
                  </div>
                  {uploadError ? (
                    <p className="mt-1 text-xs text-red-600">{uploadError}</p>
                  ) : null}
                </div>
                <div>
                  <p className="label">Tags</p>
                  <input
                    className="input mt-2"
                    name="tags"
                    placeholder="Comma separated, e.g. health, recipes"
                    value={tagsValue}
                    onChange={handleChange}
                  />
                </div>
                <label className="mt-2 inline-flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                  />
                  Published
                </label>
                {isEdit && (
                  <div>
                    <p className="label">Date & time</p>
                    <input
                      type="datetime-local"
                      name="publishedAt"
                      className="input mt-2 w-full"
                      value={form.publishedAt || ''}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-stone-500">
                      Day and time shown for this post (edit only).
                    </p>
                  </div>
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
                {saving ? 'Saving...' : 'Save blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BlogList

