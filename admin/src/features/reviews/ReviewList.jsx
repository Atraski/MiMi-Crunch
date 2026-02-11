import { useMemo, useState } from 'react'

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ReviewList = ({
  reviews,
  loading,
  error,
  onRefresh,
  onUpdate,
  apiBase,
}) => {
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [savingReply, setSavingReply] = useState(false)

  const byProduct = useMemo(() => {
    const map = {}
    reviews.forEach((r) => {
      const slug = r.productSlug || 'Unknown'
      if (!map[slug]) map[slug] = []
      map[slug].push(r)
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [reviews])

  const handleSaveReply = async () => {
    if (!replyingId || onUpdate == null) return
    setSavingReply(true)
    const ok = await onUpdate(replyingId, { replyText: replyText.trim() })
    setSavingReply(false)
    if (ok) {
      setReplyingId(null)
      setReplyText('')
    }
  }

  const startReply = (review) => {
    setReplyingId(review._id)
    setReplyText(review.replyText || '')
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="border-b border-stone-200/60 bg-stone-50/50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-stone-900">Reviews</h3>
              <p className="mt-0.5 text-xs text-stone-500">Product-wise · Reply, pin, delete</p>
            </div>
            <button
              className="btn btn-outline rounded-lg px-3 py-1.5 text-xs"
              type="button"
              onClick={onRefresh}
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <p className="px-5 pt-4 text-sm text-red-600 sm:px-6">{error}</p>
        ) : null}
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-stone-500 sm:px-6">
            Loading reviews...
          </p>
        ) : (
          <div className="divide-y divide-stone-200">
            {byProduct.map(([productSlug, items]) => (
              <div key={productSlug} className="px-5 py-4 sm:px-6">
                <h4 className="text-sm font-semibold text-stone-800">
                  {productSlug}
                </h4>
                <p className="mt-0.5 text-xs text-stone-500">
                  {items.length} review(s)
                </p>
                <ul className="mt-4 space-y-4">
                  {items.map((r) => (
                    <li
                      key={r._id}
                      className={`rounded-xl border border-stone-200 bg-white p-4 ${
                        r.isDeleted ? 'opacity-60' : ''
                      } ${r.isPinned ? 'ring-1 ring-amber-300' : ''}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex gap-0.5" aria-label={`${r.rating} stars`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <= r.rating ? 'text-amber-500' : 'text-stone-300'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          {r.authorName ? (
                            <span className="text-sm font-medium text-stone-600">
                              {r.authorName}
                            </span>
                          ) : null}
                          {r.isPinned && (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                              Pinned
                            </span>
                          )}
                          {r.isDeleted && (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              Deleted
                            </span>
                          )}
                        </div>
                        <time className="text-xs text-stone-500" dateTime={r.createdAt}>
                          {formatDate(r.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 text-sm text-stone-700">{r.content}</p>
                      {r.imageUrl ? (
                        <div className="mt-2">
                          <img
                            src={r.imageUrl}
                            alt="Review"
                            className="h-20 w-20 rounded-lg border border-stone-200 object-cover"
                          />
                        </div>
                      ) : null}
                      {r.replyText ? (
                        <div className="mt-3 rounded-lg border-l-2 border-stone-300 bg-stone-50 p-2">
                          <p className="text-xs font-semibold text-stone-500">Reply</p>
                          <p className="mt-0.5 text-sm text-stone-700">{r.replyText}</p>
                          {r.repliedAt ? (
                            <time className="mt-1 block text-xs text-stone-500">
                              {formatDate(r.repliedAt)}
                            </time>
                          ) : null}
                        </div>
                      ) : null}

                      {replyingId === r._id ? (
                        <div className="mt-4 space-y-2">
                          <textarea
                            className="input min-h-[80px] text-sm"
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-primary rounded-lg px-3 py-1.5 text-xs"
                              onClick={handleSaveReply}
                              disabled={savingReply}
                            >
                              {savingReply ? 'Saving...' : 'Save reply'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline rounded-lg px-3 py-1.5 text-xs"
                              onClick={() => {
                                setReplyingId(null)
                                setReplyText('')
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50"
                            onClick={() => startReply(r)}
                          >
                            {r.replyText ? 'Edit reply' : 'Reply'}
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50"
                            onClick={() =>
                              onUpdate?.(r._id, { isPinned: !r.isPinned })
                            }
                          >
                            {r.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            onClick={() =>
                              onUpdate?.(r._id, { isDeleted: !r.isDeleted })
                            }
                          >
                            {r.isDeleted ? 'Restore' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {byProduct.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-stone-500 sm:px-6">
                No reviews yet.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewList
