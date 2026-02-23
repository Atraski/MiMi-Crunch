import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackButton from '../components/BackButton'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('form')
  const [pendingUserId, setPendingUserId] = useState(null)
  const [otp, setOtp] = useState('')
  const [otpSubmitting, setOtpSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { signup, verifyEmail, resendOtp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/profile'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const data = await signup(name, email, password)
      if (data.needsVerification && data.userId) {
        setPendingUserId(data.userId)
        setStep('otp')
        setResendCooldown(60)
      } else {
        navigate(redirect, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Could not create account.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim() || !pendingUserId) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setOtpSubmitting(true)
    try {
      await verifyEmail(pendingUserId, otp)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid or expired code.')
    } finally {
      setOtpSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingUserId || resendCooldown > 0) return
    setError('')
    try {
      await resendOtp(pendingUserId)
      setResendCooldown(60)
    } catch (err) {
      setError(err.message || 'Could not resend code.')
    }
  }

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  if (step === 'otp') {
    return (
      <main className="min-h-[70vh] py-12">
        <div className="mx-auto max-w-md px-2">
          <BackButton className="mb-6" />
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-stone-900">Verify your email</h1>
            <p className="mt-1 text-sm text-stone-600">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
            </p>
            {error ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            <form className="mt-5 space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-stone-700" htmlFor="signup-otp">
                  Verification code
                </label>
                <input
                  id="signup-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="input mt-1 w-full text-center text-lg tracking-[0.4em]"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={otpSubmitting}
              >
                {otpSubmitting ? 'Verifying…' : 'Verify & continue'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-stone-600">
              Didn’t get the code?{' '}
              <button
                type="button"
                className="font-semibold text-brand-700 hover:underline disabled:text-stone-400"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] py-12">
      <div className="mx-auto max-w-md px-2">
        <BackButton className="mb-6" />
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-stone-900">Create account</h1>
          <p className="mt-1 text-sm text-stone-600">
            Sign up to save your profile and wishlist.
          </p>
          {error ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-stone-700" htmlFor="signup-name">
                Name (optional)
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                className="input mt-1 w-full"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                className="input mt-1 w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                className="input mt-1 w-full"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700" htmlFor="signup-confirm">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                className="input mt-1 w-full"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link to={`/login${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-semibold text-brand-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Signup
