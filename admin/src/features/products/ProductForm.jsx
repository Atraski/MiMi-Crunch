import { useEffect, useMemo, useState } from 'react'
import { getAdminAuthHeaders } from '../../utils/adminAuth.js'
import RichTextEditor from '../../components/RichTextEditor.jsx'

const defaultForm = {
  title: '',
  slug: '',
  category: '',
  description: '',
  additionalInfo: '',
  collection: '',
  keywords: '',
  tags: '',
  stock: '',
  benefits: '',
  trust: '',
  faqContent: '',
  faqs: [],
  metaData: '',
  metaTitle: '',
  metaDescription: '',
  schemaMarkup: '',
}

const createVariant = () => ({
  weight: '',
  price: '',
  compareAtPrice: '',
  stock: 0,
  sku: '',
  images: [],
  usePrimaryImages: false,
})

const ProductForm = ({
  onCreate,
  onUpdate,
  initialProduct,
  collections,
  apiBase,
  onClose,
}) => {
  const [form, setForm] = useState(defaultForm)
  const [variants, setVariants] = useState([createVariant()])
  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [formError, setFormError] = useState('')
  const [showRichFields, setShowRichFields] = useState(false)
  const isEditing = Boolean(initialProduct?._id)

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'title' && (!slugTouched || !prev.slug)) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleFAQChange = (index, field, value) => {
    setForm((prev) => {
      const nextFaqs = [...prev.faqs]
      nextFaqs[index] = { ...nextFaqs[index], [field]: value }
      return { ...prev, faqs: nextFaqs }
    })
  }

  const handleAddFAQ = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }))
  }

  const handleRemoveFAQ = (index) => {
    setForm((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }))
  }

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, idx) =>
        idx === index ? { ...variant, [field]: value } : variant,
      ),
    )
  }

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, createVariant()])
  }

  const handleRemoveVariant = (index) => {
    setVariants((prev) => {
      const toRemove = prev[index]
      toRemove?.images?.forEach((img) => {
        if (img.file && img.url) {
          URL.revokeObjectURL(img.url)
        }
      })
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const handleVariantImageChange = (index, event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) {
      return
    }
    setVariants((prev) =>
      prev.map((variant, idx) => {
        if (idx !== index) {
          return variant
        }
        const nextImages = [
          ...variant.images,
          ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
        ]
        return { ...variant, images: nextImages }
      }),
    )
    event.target.value = ''
  }

  const handleRemoveVariantImage = (variantIndex, imageIndex) => {
    setVariants((prev) =>
      prev.map((variant, idx) => {
        if (idx !== variantIndex) {
          return variant
        }
        const target = variant.images[imageIndex]
        if (target?.file && target?.url) {
          URL.revokeObjectURL(target.url)
        }
        const nextImages = variant.images.filter((_, i) => i !== imageIndex)
        return { ...variant, images: nextImages }
      }),
    )
  }

  useEffect(() => {
    if (!initialProduct) {
      return
    }
    setForm({
      title: initialProduct.title || initialProduct.name || '',
      slug: initialProduct.slug || '',
      category: initialProduct.category || '',
      description: initialProduct.description || '',
      additionalInfo: initialProduct.additionalInfo || '',
      collection: initialProduct.collection || '',
      keywords: Array.isArray(initialProduct.keywords)
        ? initialProduct.keywords.join(', ')
        : '',
      tags: Array.isArray(initialProduct.tags)
        ? initialProduct.tags.join(', ')
        : '',
      stock:
        typeof initialProduct.inventory?.stock === 'number'
          ? String(initialProduct.inventory.stock)
          : '',
      benefits: initialProduct.benefits || '',
      trust: initialProduct.trust || '',
      faqContent: initialProduct.faqContent || '',
      faqs: Array.isArray(initialProduct.faqs) ? initialProduct.faqs : [],
      metaData: initialProduct.metaData || '',
      metaTitle: initialProduct.metaTitle || '',
      metaDescription: initialProduct.metaDescription || '',
      schemaMarkup: initialProduct.schemaMarkup || '',
    })
    const seedVariants = initialProduct.variants?.length
      ? initialProduct.variants
      : [
        {
          weight: initialProduct.weight,
          price: initialProduct.price,
          compareAtPrice: initialProduct.compareAtPrice,
          images: initialProduct.images || [],
        },
      ]
    setVariants(
      seedVariants.map((variant) => ({
        weight: variant.weight || '',
        price: variant.price ? String(variant.price) : '',
        stock: variant.stock ? String(variant.stock) : '0', // Load stock
        sku: variant.sku || '',                             // Load SKU
        compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : '',
        images: (variant.images || []).map((url) => ({ url })),
        usePrimaryImages: false,
      })),
    )
    setSlugTouched(true)
  }, [initialProduct])

  const uploadImages = async (files) => {
    if (!apiBase) {
      throw new Error('Missing API base')
    }
    const res = await fetch(`${apiBase}/api/uploads/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ folder: 'products' }),
    })
    if (!res.ok) {
      throw new Error('Signature failed')
    }
    const data = await res.json()
    const uploadUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`

    const uploadOne = async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', data.apiKey)
      formData.append('timestamp', data.timestamp)
      formData.append('signature', data.signature)
      formData.append('folder', 'products')
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

    const urls = []
    for (const file of files) {
      urls.push(await uploadOne(file))
    }
    return urls
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setUploadError('')
    const validVariants = variants.filter(
      (variant) => variant.weight.trim() && variant.price,
    )
    if (!validVariants.length) {
      setFormError('Add at least one variant with weight and price.')
      return
    }

    setUploading(true)
    try {
      const payloadVariants = []
      const primaryVariant = validVariants[0]
      const primaryExisting = primaryVariant.images
        .filter((item) => !item.file && item.url)
        .map((item) => item.url)
      const primaryNewFiles = primaryVariant.images
        .filter((item) => item.file)
        .map((item) => item.file)
      const primaryUploaded = primaryNewFiles.length
        ? await uploadImages(primaryNewFiles)
        : []
      const primaryImages = [...primaryExisting, ...primaryUploaded]

      for (const variant of validVariants) {
        const usePrimaryImages = variant.usePrimaryImages && primaryImages.length
        const existingUrls = variant.images
          .filter((item) => !item.file && item.url)
          .map((item) => item.url)
        const newFiles = variant.images
          .filter((item) => item.file)
          .map((item) => item.file)
        const uploadedUrls =
          !usePrimaryImages && newFiles.length
            ? await uploadImages(newFiles)
            : []
        const urls = usePrimaryImages
          ? primaryImages
          : [...existingUrls, ...uploadedUrls]
        payloadVariants.push({
          weight: variant.weight.trim(),
          price: Number(variant.price),
          stock: Number(variant.stock || 0),
          sku: variant.sku || '',
          compareAtPrice: variant.compareAtPrice
            ? Number(variant.compareAtPrice)
            : undefined,
          images: urls,
        })
      }

      const handler = isEditing ? onUpdate : onCreate
      const success = handler
        ? await handler({
          ...form,
          variants: payloadVariants,
          _id: initialProduct?._id,
        })
        : false
      if (success) {
        variants.forEach((variant) =>
          variant.images.forEach((img) => {
            if (img.file && img.url) {
              URL.revokeObjectURL(img.url)
            }
          }),
        )
        setForm(defaultForm)
        setSlugTouched(false)
        setVariants([createVariant()])
      }
    } catch (err) {
      setUploadError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const availableCollections = useMemo(
    () => collections || [],
    [collections],
  )

  return (
    <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="label">Title</p>
          <input
            className="input mt-2"
            name="title"
            placeholder="Product title (H1)"
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
            placeholder="product-title"
            value={form.slug}
            onChange={(event) => {
              const nextValue = event.target.value
              setSlugTouched(nextValue.trim().length > 0)
              handleChange(event)
            }}
          />
          <p className="mt-1 text-xs text-stone-500">Must be unique (e.g. ragi-power-mix-2 if “ragi-power-mix” exists)</p>
        </div>
        <div>
          <p className="label">Category</p>
          <input
            className="input mt-2"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />
        </div>
        <div>
          <p className="label">Collection</p>
          <input
            className="input mt-2"
            name="collection"
            placeholder="millet-grain"
            value={form.collection}
            onChange={handleChange}
            list="collection-options"
          />
          <datalist id="collection-options">
            {availableCollections.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </div>
      </div>

      {/* <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="label">Stock</p>
          <input
            className="input mt-2"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="label">Keywords</p>
          <input
            className="input mt-2"
            name="keywords"
            placeholder="Keywords (comma separated)"
            value={form.keywords}
            onChange={handleChange}
          />
        </div>
        <div>
          <p className="label">Tags</p>
          <input
            className="input mt-2"
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="label">Description</p>
          <p className="mt-1 text-xs text-stone-500">Google Docs style rich text editor.</p>
          <div className="mt-2">
            <RichTextEditor
              value={form.description}
              onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
              placeholder="Detailed product description..."
            />
          </div>
        </div>
        <div>
          <p className="label">Additional Information</p>
          <p className="mt-1 text-xs text-stone-500">Additional details like usage, ingredients, etc.</p>
          <div className="mt-2">
            <RichTextEditor
              value={form.additionalInfo}
              onChange={(html) => setForm((prev) => ({ ...prev, additionalInfo: html }))}
              placeholder="Usage instructions, ingredients..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="label">Variants</p>
          <p className="mt-1 text-sm text-stone-600">
            Add weight, price, and images per variant.
          </p>
        </div>
        {variants.map((variant, index) => (
          <div key={`variant-${index}`} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-900">
                Variant {index + 1}
              </p>
              {variants.length > 1 ? (
                <button
                  className="btn btn-soft px-3 py-1 text-xs"
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <p className="label">Weight</p>
                <input
                  className="input mt-2"
                  placeholder="500g"
                  value={variant.weight}
                  onChange={(event) =>
                    handleVariantChange(index, 'weight', event.target.value)
                  }
                  required
                />
              </div>
              <div>
                <p className="label">Price</p>
                <input
                  className="input mt-2"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(event) =>
                    handleVariantChange(index, 'price', event.target.value)
                  }
                  required
                />
              </div>

              {/* Stock for this specific variant */}
              <div>
                <label className="block text-xs font-bold mb-1 text-orange-600">Stock</label>
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                  className="w-full p-2 border border-orange-200 rounded focus:ring-orange-500"
                />
              </div>

              {/* SKU/ID (Optional) */}
              <div>
                <label className="block text-xs font-bold mb-1">SKU</label>
                <input
                  type="text"
                  value={variant.sku || ''}
                  onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <p className="label">Compare at</p>
                <input
                  className="input mt-2"
                  placeholder="Compare at"
                  value={variant.compareAtPrice}
                  onChange={(event) =>
                    handleVariantChange(
                      index,
                      'compareAtPrice',
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="label">Images</p>
              {index > 0 ? (
                <label className="mt-2 flex items-center gap-2 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={variant.usePrimaryImages}
                    onChange={(event) =>
                      handleVariantChange(
                        index,
                        'usePrimaryImages',
                        event.target.checked,
                      )
                    }
                  />
                  Use same images as first variant
                </label>
              ) : null}
              {variant.usePrimaryImages && index > 0 ? (
                <p className="mt-2 text-xs text-stone-500">
                  This variant will reuse the first variant images.
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-3">
                {!variant.usePrimaryImages
                  ? variant.images.map((item, imageIndex) => (
                    <div
                      key={`${item.url}-${imageIndex}`}
                      className="group relative h-[80px] w-[80px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100"
                    >
                      <img
                        className="h-full w-full object-cover"
                        src={item.url}
                        alt="Variant"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-stone-700 shadow-sm"
                        onClick={() => handleRemoveVariantImage(index, imageIndex)}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))
                  : null}
                {!variant.usePrimaryImages ? (
                  <label className="flex h-[80px] w-[80px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white text-2xl text-stone-500">
                    +
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        handleVariantImageChange(index, event)
                      }
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        <div className="mt-2">
          <button
            className="btn btn-outline border-stone-200 text-stone-600 hover:bg-stone-50"
            type="button"
            onClick={handleAddVariant}
          >
            + Add Another Variant
          </button>
        </div>
        {formError ? (
          <p className="text-sm text-red-600">{formError}</p>
        ) : null}
        {uploadError ? (
          <p className="text-xs text-red-600">{uploadError}</p>
        ) : null}
      </div>

      <div className="space-y-6 pt-10 border-t-4 border-[#1B3B26]/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[Fraunces] text-[#1B3B26]">SEO & Rich Content</h2>
            <p className="mt-1 text-sm text-stone-500">Manage technical info, benefits, FAQs, and search presence.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowRichFields(!showRichFields)}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 underline underline-offset-4"
          >
            {showRichFields ? 'Hide Benefits & Trust' : 'Show Benefits & Trust'}
          </button>
        </div>

        {showRichFields && (
          <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <p className="label">Benefits</p>
              <p className="mt-1 text-xs text-stone-500 font-medium italic">High in fibre, or bullet points.</p>
              <div className="mt-2">
                <RichTextEditor
                  value={form.benefits}
                  onChange={(html) => setForm((prev) => ({ ...prev, benefits: html }))}
                  placeholder="Product health benefits..."
                />
              </div>
            </div>
            <div>
              <p className="label">Trust Indicators</p>
              <p className="mt-1 text-xs text-stone-500 font-medium italic">Certifications, trust badges or emoji.</p>
              <div className="mt-2">
                <RichTextEditor
                  value={form.trust}
                  onChange={(html) => setForm((prev) => ({ ...prev, trust: html }))}
                  placeholder="e.g. 100% Organic, Handpicked..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="label font-bold text-[#1B3B26]">Product Metadata / Nutrition</p>
            <p className="mt-1 text-xs text-stone-500 font-medium italic">Tables or lists for scientific data.</p>
            <textarea
              className="input mt-2 min-h-[120px] font-mono text-sm bg-brand-green/5 border-brand-green/20"
              name="metaData"
              placeholder="<table>...</table>"
              rows="4"
              value={form.metaData}
              onChange={handleChange}
            />
          </div>
          <div>
            <p className="label">Legacy FAQ Content</p>
            <p className="mt-1 text-xs text-stone-500 font-medium">Headings and paragraphs for simple Q&A.</p>
            <textarea
              className="input mt-2 min-h-[120px] font-mono text-sm bg-red-50/30"
              name="faqContent"
              placeholder="<h4>Question?</h4><p>Answer...</p>"
              rows="4"
              value={form.faqContent}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Product Specific FAQs */}
        <div className="space-y-4 rounded-3xl bg-[#1B3B26]/5 p-6 border border-[#1B3B26]/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-lg font-[Fraunces] text-[#1B3B26]">Structured FAQs</p>
              <p className="text-xs text-[#1B3B26]/60 font-medium">Add dedicated Q&A pairs that appear as an accordion on the site.</p>
            </div>
            <button
              type="button"
              className="btn btn-primary bg-[#1B3B26] hover:bg-[#1B3B26]/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-[#1B3B26]/20 transition-all active:scale-95"
              onClick={handleAddFAQ}
            >
              + Add FAQ Item
            </button>
          </div>
          <div className="grid gap-6">
            {(form.faqs || []).map((faq, index) => (
              <div key={index} className="group rounded-2xl border border-stone-200 bg-white p-6 relative transition-all hover:border-brand-green/30 hover:shadow-xl hover:shadow-brand-green/5">
                <button
                  type="button"
                  className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                  onClick={() => handleRemoveFAQ(index)}
                  title="Remove FAQ"
                >
                  ×
                </button>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B3B26]/40">Question {index + 1}</p>
                    <input
                      className="input bg-stone-50/50 focus:bg-white transition-colors text-base font-semibold"
                      placeholder="e.g. Is this gluten-free?"
                      value={faq.question}
                      onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1B3B26]/40">Answer {index + 1}</p>
                    <textarea
                      className="input bg-stone-50/50 focus:bg-white transition-colors min-h-[100px] py-3 leading-relaxed"
                      placeholder="Explain in detail..."
                      value={faq.answer}
                      onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!form.faqs || form.faqs.length === 0) && (
              <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-[2.5rem] bg-white/50">
                <p className="text-stone-400 text-sm font-medium">No custom FAQs added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO Metadata Section */}
        <div className="space-y-4 rounded-3xl bg-[#F5B041]/5 p-6 border border-[#F5B041]/20">
          <div>
            <h3 className="text-xl font-[Fraunces] text-[#1B3B26]">Search Engine Optimization (SEO)</h3>
            <p className="mt-1 text-sm text-stone-500 font-medium">Define how Google and others see this page.</p>
          </div>
          <div className="grid gap-6">
            <div>
              <p className="label text-stone-700">Meta Title</p>
              <p className="mt-1 text-[10px] text-[#F5B041] font-black uppercase tracking-wider">Optimal length: 50-60 chars</p>
              <input
                className="input mt-2 border-[#F5B041]/20 focus:border-[#F5B041]/50"
                name="metaTitle"
                placeholder="Product Name - Buy Online at Mimi Crunch"
                value={form.metaTitle}
                onChange={handleChange}
              />
            </div>
            <div>
              <p className="label text-stone-700">Meta Description</p>
              <p className="mt-1 text-[10px] text-[#F5B041] font-black uppercase tracking-wider">Optimal length: 150-160 chars</p>
              <textarea
                className="input mt-2 min-h-[100px] border-[#F5B041]/20 focus:border-[#F5B041]/50"
                name="metaDescription"
                placeholder="Briefly describe the product for search results..."
                rows="3"
                value={form.metaDescription}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Schema Markup Section */}
        <div>
          <p className="label font-bold text-[#1B3B26]">Advanced SEO: Schema Markup (JSON-LD)</p>
          <p className="mt-1 text-xs text-stone-500 font-medium">Product/FAQ structured data. Valid JSON only.</p>
          <textarea
            className="input mt-2 min-h-[160px] font-mono text-sm bg-stone-900 text-[#F5B041] border-none rounded-2xl"
            name="schemaMarkup"
            placeholder='{"@context":"https://schema.org","@type":"Product","name":"..."}'
            rows="8"
            value={form.schemaMarkup}
            onChange={handleChange}
          />
        </div>
      </div>


      <div className="flex items-center justify-end gap-3 pt-6 border-t border-stone-100">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={uploading}
        >
          {uploading
            ? 'Uploading...'
            : isEditing
              ? 'Update Product'
              : 'Add Product'}
        </button>
        <button
          className="btn btn-soft bg-stone-100 text-stone-600 hover:bg-stone-200"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProductForm
