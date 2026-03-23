import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { products } from '../data/homeData'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app'

const Profile = () => {
  const { user, loading: authLoading, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([]) // Order history state
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true) // Orders specific loading
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [otp, setOtp] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  const loadProfile = async (id) => {
    const res = await fetch(`${API_BASE}/api/users/${id}/profile`)
    if (!res.ok) throw new Error('Failed to load profile')
    const data = await res.json()
    setProfile(data)
    setForm({
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
    })
  }

  // --- Naya Logic: Order History Load karna ---
  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token') // Ya jahan bhi aap token store karte ho
      const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Failed to load orders')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error("Order history error:", err)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/profile', { replace: true })
      return
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user?._id) {
      setLoading(false)
      return
    }
    let cancelled = false

    // Profile aur Orders dono load karo
    Promise.all([loadProfile(user._id), loadOrders()])
      .catch(() => {
        if (!cancelled) setError('Unable to load full profile data. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user?._id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!user?._id) return
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please enter name, phone and email.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        throw new Error('Failed to update profile')
      }
      const updated = await res.json()
      setProfile(updated)
      setUser(updated)
      toast.success('Profile updated successfully!')
      if (updated?.email && !updated?.emailVerified) {
        setOtpMessage('Verification code sent to your email.')
        toast.success('Verification code sent to your email!')
      } else {
        setOtpMessage('')
      }
    } catch (err) {
      setError('Failed to update profile. Try again.')
      toast.error('Failed to update profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const canUseWishlist =
    profile?.email && profile?.emailVerified
  const wishlistItems = (profile?.wishlist || [])
    .map((id) => products.find((item) => item.slug === id))
    .filter(Boolean)

  const handleSendOtp = async () => {
    if (!user?._id) return
    setOtpMessage('')
    setOtpSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/${user._id}/email/send-otp`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error('Failed to send OTP')
      }
      setOtpMessage('Verification code sent to your email.')
      toast.success('Verification code sent to your email!')
    } catch (err) {
      setOtpMessage('Failed to send OTP. Please try again.')
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    if (!otp.trim() || !user?._id) {
      setOtpMessage('Enter the verification code.')
      return
    }
    setOtpVerifying(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/${user._id}/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp.trim() }),
      })
      if (!res.ok) {
        throw new Error('Failed to verify OTP')
      }
      setProfile((prev) => ({ ...prev, emailVerified: true }))
      setOtpMessage('Email verified successfully.')
      toast.success('Email verified successfully!')
      setOtp('')
    } catch (err) {
      setOtpMessage('Invalid or expired code. Please try again.')
      toast.error('Invalid or expired code. Please try again.')
    } finally {
      setOtpVerifying(false)
    }
  }

  if (authLoading || (!user && !profile)) {
    return (
      <main className="py-16">
        <div className="mx-auto max-w-5xl px-2">
          <BackButton className="mb-6" />
          <p className="text-sm text-stone-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] relative overflow-hidden py-16 px-4 font-[Manrope]">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#1B3B26] opacity-[0.04] blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.06] blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-4xl relative z-10">
        <BackButton className="mb-8 text-[#1B3B26]" />

        <div className="space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-[Fraunces] font-medium text-[#1B3B26] tracking-tight">
            My Profile
          </h1>
          <p className="text-lg text-[#4A5D4E]">
            {profile?.name || user?.name || user?.phone || user?.email || 'MiMi Crunch User'}
          </p>
        </div>

        {loading ? (
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

            {otpMessage && (
              <div className="rounded-xl bg-green-50/80 border border-green-100 px-4 py-3 text-sm text-green-700 backdrop-blur-sm">
                {otpMessage}
              </div>
            )}

            {/* Profile Section */}
            <div id="complete-profile" className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 md:p-10 transition-all hover:shadow-[0_24px_60px_-15px_rgba(27,59,38,0.1)]">
              <h2 className="text-2xl font-[Fraunces] font-medium text-[#1B3B26] mb-2">Profile Details</h2>
              {!canUseWishlist && (
                <p className="mb-6 text-sm text-[#F5B041] font-semibold bg-[#F5B041]/10 w-fit px-3 py-1 rounded-full">
                  Complete your profile to enable all features
                </p>
              )}
              <form className="mt-6 grid gap-6 sm:grid-cols-2" onSubmit={handleSave}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Full Name</label>
                  <input className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-4 py-3 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm" placeholder="Your full name" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Email <span className="opacity-60 font-normal">(Read Only)</span></label>
                  <input className="w-full bg-stone-100/60 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-500 cursor-not-allowed shadow-inner" value={form.email} readOnly />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Phone Number</label>
                  <input className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-4 py-3 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm" placeholder="Your phone number" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1">Address</label>
                  <input className="w-full bg-white/70 border border-stone-200/80 rounded-xl px-4 py-3 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm" placeholder="Your delivery address" name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2 mt-2">
                  <button className="bg-[#1B3B26] hover:bg-[#2A5237] text-white font-semibold rounded-xl px-8 py-3.5 transition-all duration-200 shadow-[0_8px_20px_rgba(27,59,38,0.15)] hover:shadow-[0_12px_25px_rgba(27,59,38,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:-translate-y-0" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Details'}</button>
                </div>
              </form>
            </div>

            {/* Email Verification Section */}
            {profile?.email && !profile?.emailVerified ? (
              <div className="backdrop-blur-xl bg-orange-50/70 border border-orange-200/60 shadow-sm rounded-[2rem] p-8 md:p-10">
                <h2 className="text-xl font-[Fraunces] font-medium text-[#1B3B26] mb-1">Verify your email</h2>
                <p className="text-sm text-[#4A5D4E] mb-5">Please verify your email address to secure your account.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button className="bg-white hover:bg-stone-50 text-[#1B3B26] border border-stone-200 font-semibold rounded-xl px-6 py-3 transition-all shadow-sm" onClick={handleSendOtp} disabled={otpSending}>
                    {otpSending ? 'Sending...' : 'Send Code'}
                  </button>
                  <form className="flex flex-1 items-center gap-3 min-w-[250px]" onSubmit={handleVerifyOtp}>
                    <input className="w-full flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-[#1B3B26] focus:outline-none focus:ring-2 focus:ring-[#F5B041] transition-all shadow-sm" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <button className="bg-[#F5B041] hover:bg-[#e4a135] text-[#1B3B26] font-semibold rounded-xl px-6 py-3 transition-all shadow-sm" type="submit" disabled={otpVerifying}>{otpVerifying ? 'Verifying...' : 'Verify'}</button>
                  </form>
                </div>
              </div>
            ) : null}

            {/* Wishlist Section */}
            {canUseWishlist && (
              <div id="wishlist" className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 md:p-10">
                <h2 className="text-2xl font-[Fraunces] font-medium text-[#1B3B26] mb-6">Your Wishlist</h2>
                {wishlistItems.length ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistItems.map((item) => (
                      <div key={item.slug} className="group bg-white/80 rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <div className="bg-[#1B3B26]/5 text-[#1B3B26] text-[10px] font-bold uppercase tracking-wider w-fit px-2.5 py-1 rounded-md mb-3 border border-[#1B3B26]/10">
                          {item.size || 'PACK'}
                        </div>
                        <h3 className="text-lg font-[Fraunces] font-medium text-[#1B3B26] leading-tight mb-1">{item.name}</h3>
                        <p className="text-[#F5B041] font-bold mt-2">₹{item.price}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/40 rounded-2xl border border-stone-200/50 border-dashed">
                    <p className="text-[#4A5D4E]">Your wishlist is currently empty.</p>
                  </div>
                )}
              </div>
            )}

            {/* Order History Section */}
            <div id="orders" className="backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_20px_50px_-15px_rgba(27,59,38,0.08)] rounded-[2rem] p-8 md:p-10">
              <h2 className="text-2xl font-[Fraunces] font-medium text-[#1B3B26] mb-6">Order History</h2>
              {ordersLoading ? (
                <div className="flex animate-pulse space-x-4">
                  <div className="h-24 bg-white/50 rounded-2xl w-full"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-5">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white/80 rounded-2xl border border-stone-100 p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                          <p className="text-xs font-bold text-[#F5B041] uppercase tracking-wider mb-1">
                            Order #{order.orderId || order._id?.slice?.(-6)?.toUpperCase?.() || order._id}
                          </p>
                          <p className="text-xl font-[Fraunces] font-medium text-[#1B3B26]">₹{order.totalAmount}</p>
                        </div>
                        <span className={`w-fit px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${order.status === 'Delivered'
                          ? 'bg-[#1B3B26]/10 text-[#1B3B26] border border-[#1B3B26]/20'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-sm text-[#4A5D4E] bg-stone-100/80 border border-stone-200/60 px-3 py-1.5 rounded-lg font-medium">
                            {item.name} <span className="text-[#1B3B26] font-bold ml-1">×{item.qty}</span>
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 pt-4 border-t border-stone-100 flex justify-between items-center">
                        <p className="text-sm text-[#4A5D4E] font-medium">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/40 rounded-2xl border border-stone-200/50 border-dashed">
                  <p className="text-[#4A5D4E]">No orders yet. Discover our premium millet blends!</p>
                </div>
              )}
            </div>

            {/* Logout Section */}
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                className="bg-transparent border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold rounded-xl px-10 py-3 transition-all duration-200"
                onClick={() => {
                  logout()
                  navigate('/', { replace: true })
                }}
              >
                Log out securely
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}

export default Profile