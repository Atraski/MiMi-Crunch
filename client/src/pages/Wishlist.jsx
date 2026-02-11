import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { products } from '../data/homeData'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = async (id) => {
    const res = await fetch(`${API_BASE}/api/users/${id}/profile`)
    if (!res.ok) throw new Error('Failed to load profile')
    const data = await res.json()
    setProfile(data)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/wishlist', { replace: true })
      return
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user?._id) {
      setLoading(false)
      return
    }
    let cancelled = false
    loadProfile(user._id)
      .catch(() => {
        if (!cancelled) setError('Unable to load wishlist. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user?._id])

  const canUseWishlist =
    profile?.name && profile?.phone && profile?.email && profile?.emailVerified
  const wishlistItems = (profile?.wishlist || [])
    .map((id) => products.find((item) => item.slug === id))
    .filter(Boolean)

  return (
    <main className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">My Wishlist</h1>
          <p className="text-stone-600">Saved items ready for you.</p>
        </div>

        {authLoading || !user ? (
          <p className="mt-6 text-sm text-stone-600">Loading...</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-stone-600">Loading wishlist...</p>
        ) : (
          <>
            {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

            {!canUseWishlist ? (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <p className="text-sm text-stone-700">
                  Complete your profile first to use the wishlist.
                </p>
                <Link
                  to="/profile"
                  className="btn btn-primary mt-4 inline-flex w-fit"
                >
                  Complete profile
                </Link>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg shadow-stone-200/70">
                {wishlistItems.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.slug}
                        className="rounded-xl border border-stone-200 p-4"
                      >
                        <p className="pill">{item.size}</p>
                        <h3 className="mt-2 text-sm font-semibold text-stone-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-stone-600">
                          ₹{item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-600">
                    Wishlist empty. Add products to see them here.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default Wishlist
