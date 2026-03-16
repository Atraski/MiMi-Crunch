import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { products } from '../data/homeData'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-hidden py-16 px-4 font-[Manrope]">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-5xl relative z-10">
        <BackButton className="mb-8 text-[#1B3B26]" />

        <div className="space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-[Fraunces] font-medium text-[#1B3B26] tracking-tight">
            My Wishlist
          </h1>
          <p className="text-lg text-[#4A5D4E]">Saved items ready for you.</p>
        </div>

        {authLoading || !user ? (
          <div className="flex animate-pulse space-x-4">
            <div className="h-4 p-6 bg-[#EAE6DF] rounded-2xl w-full max-w-sm"></div>
          </div>
        ) : loading ? (
          <div className="flex animate-pulse space-x-4">
            <div className="h-4 p-6 bg-[#EAE6DF] rounded-2xl w-full max-w-sm"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="rounded-xl bg-red-50/80 border border-red-100 px-4 py-3 text-sm text-red-600 backdrop-blur-sm animate-[pulse_2s_ease-in-out_infinite]">
                {error}
              </div>
            )}

            {!canUseWishlist ? (
              <div className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 md:p-10 transition-all hover:shadow-[0_24px_60px_-15px_rgba(27,59,38,0.1)] text-center max-w-2xl">
                <h3 className="text-2xl font-[Fraunces] font-medium text-[#1B3B26] mb-4">You're almost there!</h3>
                <p className="text-base text-[#4A5D4E] mb-8">
                  Please complete your profile details and verify your email to unlock your personal wishlist and save your favorite millet products.
                </p>
                <Link
                  to="/profile#complete-profile"
                  className="bg-[#1B3B26] hover:bg-[#2A5237] text-white font-semibold rounded-xl px-10 py-3.5 transition-all duration-200 shadow-[0_8px_20px_rgba(27,59,38,0.15)] hover:shadow-[0_12px_25px_rgba(27,59,38,0.2)] hover:-translate-y-0.5 inline-flex"
                >
                  Complete profile
                </Link>
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 md:p-10 transition-all">
                {wishlistItems.length ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistItems.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/products/${item.slug}`}
                        className="group bg-white/80 rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block"
                      >
                        {item.image ? (
                          <div className="aspect-square mb-5 rounded-xl overflow-hidden bg-[#FAF8F5]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : null}
                        <div className="bg-[#1B3B26]/5 text-[#1B3B26] text-[10px] font-bold uppercase tracking-wider w-fit px-3 py-1.5 rounded-md mb-4 border border-[#1B3B26]/10">
                          {item.size || 'PACK'}
                        </div>
                        <h3 className="text-xl font-[Fraunces] font-medium text-[#1B3B26] leading-tight mb-2 group-hover:text-[#F5B041] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[#F5B041] font-bold text-lg">₹{item.price}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/40 rounded-2xl border border-stone-200/50 border-dashed">
                    <p className="text-lg text-[#4A5D4E] mb-6">Your wishlist is currently empty.</p>
                    <Link
                      to="/products"
                      className="bg-[#1B3B26] hover:bg-[#2A5237] text-white font-semibold rounded-xl px-8 py-3 transition-all duration-200 shadow-[0_8px_20px_rgba(27,59,38,0.15)] hover:shadow-[0_12px_25px_rgba(27,59,38,0.2)] hover:-translate-y-0.5 inline-block"
                    >
                      Explore Products
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default Wishlist
