import { useState, useEffect, useRef } from 'react'

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app')

const isValidIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone)

export default function PhoneOTPVerify({ onVerified, apiBase }) {
  const base = apiBase || API_BASE

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'verified'
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [timer, setTimer] = useState(0)

  const timerRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const startTimer = () => {
    setTimer(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async () => {
    if (!isValidIndianPhone(phone)) {
      setMsg({ text: 'Valid 10-digit mobile number daalo (6, 7, 8 ya 9 se shuru hona chahiye)', type: 'error' })
      return
    }
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const res = await fetch(`${base}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()

      if (data.success) {
        setStep('otp')
        setOtp('')
        setMsg({ text: '✅ OTP bheja gaya! SMS check karo.', type: 'success' })
        startTimer()
      } else {
        setMsg({ text: '❌ ' + data.message, type: 'error' })
      }
    } catch {
      setMsg({ text: '❌ Network error. Internet check karo.', type: 'error' })
    }
    setLoading(false)
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setMsg({ text: '6-digit OTP daalo', type: 'error' })
      return
    }
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const res = await fetch(`${base}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })
      const data = await res.json()

      if (data.success) {
        setStep('verified')
        clearInterval(timerRef.current)
        setMsg({ text: '✅ Phone verify ho gaya!', type: 'success' })
        onVerified(phone)
      } else {
        setMsg({ text: '❌ ' + data.message, type: 'error' })
      }
    } catch {
      setMsg({ text: '❌ Network error. Dobara try karo.', type: 'error' })
    }
    setLoading(false)
  }

  const btnBase = {
    padding: '10px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s',
  }

  return (
    <div style={{ marginBottom: '4px' }}>
      {/* Phone Input Row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          maxLength={10}
          disabled={step !== 'phone'}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="10-digit mobile number"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #d6d3d1',
            borderRadius: '12px',
            fontSize: '15px',
            backgroundColor: step !== 'phone' ? '#f5f5f4' : 'white',
            color: '#1c1917',
            outline: 'none',
          }}
        />
        {step === 'phone' && (
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            style={{ ...btnBase, backgroundColor: loading ? '#78716c' : '#1c1917', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Bhej raha...' : 'OTP Bhejo'}
          </button>
        )}
        {step === 'verified' && (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
            <span style={{ color: '#16a34a', fontSize: '22px', fontWeight: '700' }}>✅</span>
          </div>
        )}
      </div>

      {/* OTP Input Row */}
      {step === 'otp' && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              maxLength={6}
              autoFocus
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
              placeholder="6-digit OTP"
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #d6d3d1',
                borderRadius: '12px',
                fontSize: '20px',
                letterSpacing: '6px',
                textAlign: 'center',
                outline: 'none',
                color: '#1c1917',
              }}
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{ ...btnBase, backgroundColor: loading ? '#4b7a5a' : '#15803d', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verify ho raha...' : 'Verify Karo'}
            </button>
          </div>

          <div style={{ marginTop: '6px', fontSize: '12px', color: '#78716c' }}>
            {timer > 0 ? (
              <span>OTP dobara bhejne ke liye {timer}s wait karo</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOTP}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1c1917',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: '600',
                  textDecoration: 'underline',
                }}
              >
                OTP dobara bhejo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Message */}
      {msg.text && (
        <p
          style={{
            marginTop: '8px',
            fontSize: '12px',
            padding: '6px 10px',
            borderRadius: '6px',
            color: msg.type === 'error' ? '#dc2626' : '#15803d',
            backgroundColor: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          }}
        >
          {msg.text}
        </p>
      )}
    </div>
  )
}
