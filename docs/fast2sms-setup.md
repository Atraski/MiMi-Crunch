# Fast2SMS OTP Setup — Complete Guide
## MERN Stack E-Commerce ke liye

---

## PART 1: Fast2SMS Dashboard Setup

### Step 1: API Key Regenerate Karo (URGENT ⚠️)
> Purani key publicly expose ho gayi thi — pehle yeh karo!

1. Fast2SMS Dashboard kholo
2. Left sidebar → **Dev API** click karo
3. Upar **"API Key"** tab click karo
4. Password daalo (Fast2SMS login password)
5. **"Regenerate"** button click karo
6. Nayi key copy karo — yeh teri `.env` mein jaayegi

```
✅ Nayi key kuch aisi dikhegi:
ABCxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJ
```

---

### Step 2: Test Karo Dashboard Se (Code se pehle)

1. Left sidebar → **Dev API** click karo
2. **Method** → `POST` select karo
3. **Route** → `OTP Message` select karo
4. **OTP Value** field mein → `123456` type karo
5. **Flash Message** → `No` rakho
6. **Contact** field mein → apna khud ka mobile number daalo
7. Neeche **Submit** button click karo
8. **5-10 seconds mein SMS aana chahiye** ✅

Agar SMS aa jaaye → Fast2SMS working hai, code integrate karo!

---

## PART 2: Backend Setup

### Step 1: Folder Structure Banao

```
backend/
├── .env                        ← Step 2 mein banayenge
├── server.js                   ← already hai
├── utils/
│   └── otpStore.js             ← Step 3 mein banayenge
├── services/
│   └── smsService.js           ← Step 4 mein banayenge
└── routes/
    └── otpRoutes.js            ← Step 5 mein banayenge
```

---

### Step 2: `.env` File Mein Add Karo

```env
FAST2SMS_API_KEY=yahan_apni_nayi_key_daalo
OTP_EXPIRY_MS=600000
```

---

### Step 3: `npm install` karo

```bash
cd backend
npm install axios dotenv
```

---

### Step 4: `utils/otpStore.js` Banao

```js
// In-memory OTP store
// Note: Server restart pe OTPs clear ho jaate hain — theek hai abhi ke liye
const store = new Map();

function saveOTP(phone, otp) {
  store.set(phone, {
    otp: otp.toString(),
    expiresAt: Date.now() + parseInt(process.env.OTP_EXPIRY_MS || 600000),
    attempts: 0,
  });
}

function verifyOTP(phone, inputOtp) {
  const record = store.get(phone);

  if (!record) {
    return { success: false, message: 'OTP nahi mila. Dobara bhejein.' };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(phone);
    return { success: false, message: 'OTP expire ho gaya (10 min). Dobara bhejein.' };
  }

  // Max 3 attempts allowed
  if (record.attempts >= 3) {
    store.delete(phone);
    return { success: false, message: '3 baar galat OTP dala. Dobara bhejein.' };
  }

  if (record.otp !== inputOtp.toString()) {
    record.attempts += 1;
    return { success: false, message: `Galat OTP. ${3 - record.attempts} attempts baaki.` };
  }

  store.delete(phone); // ek baar use ke baad delete
  return { success: true };
}

module.exports = { saveOTP, verifyOTP };
```

---

### Step 5: `services/smsService.js` Banao

```js
const axios = require('axios');

async function sendOTPviaSMS(phone, otp) {
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        variables_values: otp.toString(),
        numbers: phone.toString(),
        flash: 0,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Fast2SMS Response:', response.data);

    if (response.data.return === true) {
      return { success: true };
    } else {
      console.error('Fast2SMS Error:', response.data);
      return { success: false, message: 'SMS send nahi hua.' };
    }

  } catch (err) {
    console.error('SMS Service Error:', err.response?.data || err.message);
    return { success: false, message: 'SMS service error. Baad mein try karo.' };
  }
}

module.exports = { sendOTPviaSMS };
```

---

### Step 6: `routes/otpRoutes.js` Banao

```js
const express = require('express');
const router = express.Router();
const { saveOTP, verifyOTP } = require('../utils/otpStore');
const { sendOTPviaSMS } = require('../services/smsService');

// 6-digit OTP generate
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// India phone validate
const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// Rate limiting (simple) — ek number pe 1 min mein 1 baar OTP
const otpCooldown = new Map();
const isOnCooldown = (phone) => {
  const lastSent = otpCooldown.get(phone);
  if (!lastSent) return false;
  return Date.now() - lastSent < 60000; // 60 seconds cooldown
};

// ─────────────────────────────────────
// POST /api/otp/send
// Body: { phone: "9876543210" }
// ─────────────────────────────────────
router.post('/send', async (req, res) => {
  const { phone } = req.body;

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit Indian mobile number daalo.',
    });
  }

  if (isOnCooldown(phone)) {
    return res.status(429).json({
      success: false,
      message: 'OTP abhi bheja gaya hai. 60 seconds baad dobara try karo.',
    });
  }

  const otp = generateOTP();
  saveOTP(phone, otp);
  otpCooldown.set(phone, Date.now());

  const result = await sendOTPviaSMS(phone, otp);

  if (!result.success) {
    return res.status(500).json({ success: false, message: result.message });
  }

  res.json({
    success: true,
    message: `OTP bheja gaya ${phone} pe. 10 minutes mein valid hai.`,
  });
});

// ─────────────────────────────────────
// POST /api/otp/verify
// Body: { phone: "9876543210", otp: "123456" }
// ─────────────────────────────────────
router.post('/verify', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone aur OTP dono chahiye.',
    });
  }

  const result = verifyOTP(phone, otp);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json({
    success: true,
    message: 'Phone verify ho gaya! ✅',
    phoneVerified: true,
  });
});

module.exports = router;
```

---

### Step 7: `server.js` mein Register Karo

```js
// server.js ke top pe (agar nahi hai toh add karo)
require('dotenv').config();

// Routes ke saath add karo
const otpRoutes = require('./routes/otpRoutes');
app.use('/api/otp', otpRoutes);
```

---

## PART 3: Frontend Setup (React)

### `components/PhoneOTPVerify.jsx` Banao

```jsx
import { useState } from 'react';

export default function PhoneOTPVerify({ onVerified }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'verified'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMsg({ text: 'Valid 10-digit mobile number daalo (6-9 se shuru)', type: 'error' });
      return;
    }
    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('otp');
        setMsg({ text: '✅ OTP bheja gaya! SMS check karo.', type: 'success' });
        startTimer();
      } else {
        setMsg({ text: '❌ ' + data.message, type: 'error' });
      }
    } catch {
      setMsg({ text: '❌ Network error. Internet check karo.', type: 'error' });
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setMsg({ text: '6-digit OTP daalo', type: 'error' });
      return;
    }
    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('verified');
        setMsg({ text: '✅ Phone verify ho gaya!', type: 'success' });
        onVerified(phone);
      } else {
        setMsg({ text: '❌ ' + data.message, type: 'error' });
      }
    } catch {
      setMsg({ text: '❌ Network error.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>
        Mobile Number *
      </label>

      {/* Phone Input + Send Button */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="tel"
          value={phone}
          maxLength={10}
          disabled={step !== 'phone'}
          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="10-digit mobile number"
          style={{
            flex: 1, padding: '10px 12px',
            border: '1px solid #ddd', borderRadius: '6px',
            fontSize: '15px',
            backgroundColor: step !== 'phone' ? '#f5f5f5' : 'white',
          }}
        />
        {step === 'phone' && (
          <button
            onClick={handleSendOTP}
            disabled={loading}
            style={{
              padding: '10px 16px', backgroundColor: '#2563eb',
              color: 'white', border: 'none', borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600',
            }}
          >
            {loading ? 'Bhej raha...' : 'OTP Bhejo'}
          </button>
        )}
        {step === 'verified' && (
          <span style={{ color: 'green', fontWeight: '700', fontSize: '20px' }}>✅</span>
        )}
      </div>

      {/* OTP Input */}
      {step === 'otp' && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={otp}
              maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit OTP"
              style={{
                flex: 1, padding: '10px 12px',
                border: '1px solid #ddd', borderRadius: '6px',
                fontSize: '18px', letterSpacing: '4px', textAlign: 'center',
              }}
            />
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{
                padding: '10px 16px', backgroundColor: '#16a34a',
                color: 'white', border: 'none', borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600',
              }}
            >
              {loading ? 'Verify ho raha...' : 'Verify Karo'}
            </button>
          </div>

          {/* Resend Timer */}
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
            {timer > 0 ? (
              <span>OTP dobara bhejne ke liye {timer} seconds wait karo</span>
            ) : (
              <button
                onClick={handleSendOTP}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '13px' }}
              >
                OTP dobara bhejo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {msg.text && (
        <p style={{
          marginTop: '8px', fontSize: '13px', padding: '6px 10px', borderRadius: '4px',
          color: msg.type === 'error' ? '#dc2626' : '#16a34a',
          backgroundColor: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
        }}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
```

---

### Checkout Page mein Use Karo

```jsx
import PhoneOTPVerify from '../components/PhoneOTPVerify';

const CheckoutPage = () => {
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const handleOrderSubmit = () => {
    if (!phoneVerified) {
      alert('Phone verify karo pehle!');
      return;
    }
    // Order place karo
    placeOrder({ phone: verifiedPhone, phoneVerified: true });
  };

  return (
    <div>
      {/* ...baaki form fields */}

      <PhoneOTPVerify
        onVerified={(phone) => {
          setPhoneVerified(true);
          setVerifiedPhone(phone);
        }}
      />

      <button
        onClick={handleOrderSubmit}
        disabled={!phoneVerified}
        style={{ opacity: phoneVerified ? 1 : 0.5 }}
      >
        {phoneVerified ? 'Order Place Karo ✅' : 'Pehle Phone Verify Karo'}
      </button>
    </div>
  );
};
```

---

## PART 4: Test Karo

### Backend Test (Postman se)

**OTP Send:**
```
POST http://localhost:5000/api/otp/send
Content-Type: application/json

{
  "phone": "tera_number_yahan"
}
```

**OTP Verify:**
```
POST http://localhost:5000/api/otp/verify
Content-Type: application/json

{
  "phone": "tera_number_yahan",
  "otp": "SMS_mein_aaya_OTP"
}
```

---

## PART 5: Common Errors aur Solutions

| Error | Reason | Solution |
|-------|--------|---------|
| `return: false` | Wrong API key | `.env` mein nayi key check karo |
| `insufficient balance` | ₹0 credit | Fast2SMS pe recharge karo |
| `invalid number` | Galat format | 10 digit, 6-9 se shuru |
| `OTP nahi aaya` | DND number | Fast2SMS OTP route DND pe bhi kaam karta hai |
| `CORS error` | Backend CORS | `app.use(cors({ origin: process.env.CLIENT_URL }))` |
| `Cannot read env` | dotenv missing | `require('dotenv').config()` server.js top pe |

---

## Summary — Poora Flow

```
User → Phone number type karta hai
  ↓
"OTP Bhejo" click
  ↓
Backend: OTP generate → Fast2SMS API call
  ↓
Fast2SMS: User ke phone pe SMS bhejta hai
  ↓
User: SMS mein OTP dekh ke type karta hai
  ↓
Backend: OTP match? ✅ → phoneVerified = true
  ↓
Order Place button unlock hota hai
  ↓
Order place hota hai with verified phone ✅
```

**RTO Reduction: ~20-35% expected** 🎯
