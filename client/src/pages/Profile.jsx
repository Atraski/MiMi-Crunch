import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { products } from '../data/homeData'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth()
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
      if (updated?.email && !updated?.emailVerified) {
        setOtpMessage('Verification code sent to your email.')
      } else {
        setOtpMessage('')
      }
    } catch (err) {
      setError('Failed to update profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const canUseWishlist =
    profile?.name && profile?.phone && profile?.email && profile?.emailVerified
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
    } catch (err) {
      setOtpMessage('Failed to send OTP. Please try again.')
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
      setOtp('')
    } catch (err) {
      setOtpMessage('Invalid or expired code. Please try again.')
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
    <main className="py-16">
      <div className="mx-auto max-w-5xl px-2">
        <BackButton className="mb-6" />
      </div>
      <div className="mx-auto max-w-5xl px-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-stone-900">My Profile</h1>
          <p className="text-stone-600">
            {profile?.name || user?.name || user?.email || 'MiMi Crunch User'}
          </p>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-stone-600">Loading profile...</p>
        ) : (
          <>
            {error ? (
              <p className="mt-6 text-sm text-red-600">{error}</p>
            ) : null}

            {/* Profile Section */}
            {!canUseWishlist ? (
              <div id="complete-profile" className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <h2 className="text-lg font-semibold text-stone-900">Complete your profile</h2>
                <p className="mt-2 text-sm text-stone-600">Add details to enable all features.</p>
                <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
                  <input className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm" placeholder="Full name" name="name" value={form.name} onChange={handleChange} />
                  <input className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm" placeholder="Phone number" name="phone" value={form.phone} onChange={handleChange} />
                  <input className="rounded-xl border border-stone-200 bg-stone-100 px-4 py-2 text-sm text-stone-600 sm:col-span-2" value={form.email} readOnly />
                  <input className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm sm:col-span-2" placeholder="Address" name="address" value={form.address} onChange={handleChange} />
                  <button className="btn btn-primary w-fit" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save Details'}</button>
                </form>
              </div>
            ) : null}

            {/* Wishlist Section */}
            {canUseWishlist && (
              <div id="wishlist" className="mt-8 rounded-2xl bg-white p-6 shadow-lg shadow-stone-200/70">
                <h2 className="text-lg font-semibold text-stone-900">Your Wishlist</h2>
                {wishlistItems.length ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {wishlistItems.map((item) => (
                      <div key={item.slug} className="rounded-xl border border-stone-200 p-4">
                        <p className="pill">{item.size}</p>
                        <h3 className="mt-2 text-sm font-semibold text-stone-900">{item.name}</h3>
                        <p className="mt-1 text-xs text-stone-600">₹{item.price}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-stone-600">Wishlist empty.</p>
                )}
              </div>
            )}

            {/* --- Updated Order History Section --- */}
            <div id="orders" className="mt-8 rounded-2xl bg-white p-6 shadow-lg shadow-stone-200/70">
              <h2 className="text-lg font-semibold text-stone-900">Your Orders</h2>
              {ordersLoading ? (
                <p className="mt-4 text-sm text-stone-600 italic">Fetching your orders...</p>
              ) : orders.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-xl border border-stone-200 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Order #{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm font-medium text-stone-900 mt-1">₹{order.totalAmount}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-3">
                         {order.items.map((item, idx) => (
                           <span key={idx} className="text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded mr-2 inline-block mb-2">
                             {item.name} x {item.qty}
                           </span>
                         ))}
                      </div>
                      <p className="mt-2 text-[10px] text-stone-400">
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-600">No orders yet. Start crunching!</p>
              )}
            </div>

            {/* Email Verification Section */}
            {profile?.email && !profile?.emailVerified ? (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-semibold text-stone-900">Verify your email</h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                   <button className="btn btn-primary" onClick={handleSendOtp} disabled={otpSending}>
                     {otpSending ? 'Sending...' : 'Resend Code'}
                   </button>
                   <form className="flex flex-1 items-center gap-2" onSubmit={handleVerifyOtp}>
                     <input className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm" placeholder="Code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                     <button className="btn btn-primary" type="submit" disabled={otpVerifying}>Verify</button>
                   </form>
                </div>
              </div>
            ) : null}

            {/* Logout Section */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-stone-900">Account</h2>
              <button
                type="button"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                onClick={() => {
                  logout()
                  navigate('/', { replace: true })
                }}
              >
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default Profile