import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackButton from '../components/BackButton'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { sendEmailLoginOtp, verifyEmailLoginOtp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      await sendEmailLoginOtp(email)
      setStep('otp')
      setResendCooldown(60)
    } catch (err) {
      setError(err.message || 'Could not send OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Enter the 6-digit code.')
      return
    }
    setSubmitting(true)
    try {
      await verifyEmailLoginOtp(email, otp)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-[#FAF8F5] relative overflow-hidden py-12 px-4 font-[Manrope]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1B3B26] opacity-[0.05] blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#F5B041] opacity-[0.08] blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-md z-10">
        <BackButton className="mb-6 text-[#1B3B26]" />

        <div className="backdrop-blur-2xl bg-white/70 border border-white/60 shadow-[0_24px_60px_-15px_rgba(27,59,38,0.1)] rounded-[2rem] p-8 md:p-10 transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(27,59,38,0.12)]">

          {step === 'email' ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-[Fraunces] text-[#1B3B26] font-medium mb-3 tracking-tight">Sign up / Log in</h1>
                <p className="text-sm text-[#4A5D4E] opacity-90">
                  Enter your email address to receive an OTP.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50/80 border border-red-100 px-4 py-3 text-sm text-red-600 backdrop-blur-sm animate-[pulse_2s_ease-in-out_infinite]">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1" htmlFor="signup-email">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    className="w-full bg-white/50 border border-stone-200/80 rounded-xl px-4 py-3 text-[#1B3B26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm"
                    placeholder="e.g. you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full bg-[#1B3B26] hover:bg-[#2A5237] text-white font-semibold rounded-xl py-3.5 transition-all duration-200 shadow-[0_8px_20px_rgba(27,59,38,0.15)] hover:shadow-[0_12px_25px_rgba(27,59,38,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-[0_8px_20px_rgba(27,59,38,0.15)]"
                  disabled={submitting}
                >
                  {submitting ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-[Fraunces] text-[#1B3B26] font-medium mb-3 tracking-tight">Verify Email</h1>
                <p className="text-sm text-[#4A5D4E] opacity-90">
                  We sent a 6-digit code to <strong className="text-[#1B3B26]">{email}</strong>.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl bg-red-50/80 border border-red-100 px-4 py-3 text-sm text-red-600 backdrop-blur-sm animate-[pulse_2s_ease-in-out_infinite]">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-sm font-semibold text-[#1B3B26] pl-1 text-center mb-2" htmlFor="signup-otp">
                    Verification code
                  </label>
                  <input
                    id="signup-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="w-full bg-white/50 border border-stone-200/80 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.4em] text-[#1B3B26] placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#F5B041] focus:border-transparent transition-all shadow-sm"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1B3B26] hover:bg-[#2A5237] text-white font-semibold rounded-xl py-3.5 transition-all duration-200 shadow-[0_8px_20px_rgba(27,59,38,0.15)] hover:shadow-[0_12px_25px_rgba(27,59,38,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:-translate-y-0"
                  disabled={submitting}
                >
                  {submitting ? 'Verifying…' : 'Verify & Continue'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#4A5D4E]">
                Didn’t get the code?{' '}
                <button
                  type="button"
                  className="font-bold text-[#F5B041] hover:text-[#d99732] hover:underline transition-colors px-1 disabled:text-stone-400 disabled:hover:no-underline"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || submitting}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </p>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-stone-500 hover:text-stone-700 underline"
                  onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                >
                  Change Email Address
                </button>
              </div>
              <p className="mt-8 text-center text-sm text-[#4A5D4E]">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#F5B041] hover:text-[#d99732] hover:underline transition-colors">
                  Log in instead
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </main>
  )
}

export default Signup
