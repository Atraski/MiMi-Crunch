import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { trackMetaEvent } from '../utils/metaPixel'

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = location.state?.orderId || queryParams.get('order_id');
  const totalAmount = Number(location.state?.totalAmount || queryParams.get('amount') || 0)
  const fromRedirect = !!queryParams.get('order_id');
  const shouldVerify = location.state?.verify || fromRedirect || false;
  
  const [verifying, setVerifying] = React.useState(shouldVerify);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (shouldVerify && orderId) {
      const verify = async () => {
        try {
          const apiBase = import.meta.env.DEV ? 'http://localhost:5000' : 'https://mimicrunch-33how.ondigitalocean.app';
          const res = await fetch(`${apiBase}/api/orders/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.removeItem('mimi_cart');
            window.dispatchEvent(new Event('mimi-cart-cleared'));
            setVerifying(false);
          } else {
            setError(data.message || 'Payment verification failed');
            setVerifying(false);
          }
        } catch (err) {
          console.error("Verification error:", err);
          setError('Failed to connect for verification');
          setVerifying(false);
        }
      };
      verify();
    }
  }, [shouldVerify, orderId]);

  React.useEffect(() => {
    if (!orderId || verifying || error) return
    const purchaseKey = `meta_purchase_${orderId}`
    if (sessionStorage.getItem(purchaseKey)) return
    trackMetaEvent('Purchase', {
      content_type: 'product',
      content_ids: [String(orderId)],
      value: totalAmount,
      currency: 'INR',
    })
    sessionStorage.setItem(purchaseKey, '1')
  }, [orderId, verifying, error, totalAmount])

  // Agar koi bina order ke is page par aaye toh use home bhej do
  if (!orderId && !location.state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/')} className="text-stone-900 underline">
          Go back to Home
        </button>
      </div>
    );
  }

  if (verifying) {
    return (
      <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-stone-900">Verifying Payment...</h2>
        <p className="text-stone-500 mt-2 text-center">We are confirming your transaction with the bank. Please do not refresh.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-2 py-20">
         <div className="max-w-lg w-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">Payment Error</h1>
            <p className="text-stone-600 mb-10 leading-relaxed">{error}</p>
            <button onClick={() => navigate('/checkout')} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold">
              Try Again
            </button>
         </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-2 py-20">
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-100 text-center">
        
        {/* Animated Checkmark Icon */}
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">Order Confirmed!</h1>
        <p className="text-stone-600 mb-10 leading-relaxed max-w-sm mx-auto">
          Your order has been successfully placed. We've sent a confirmation email with all the details.
          Prepare to receive your healthy MiMi Crunch soon!
        </p>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl p-6 mb-10 border border-stone-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Order ID</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">
              Payment: {shouldVerify ? 'Online' : 'COD'}
            </span>
          </div>
          <p className="text-lg font-mono font-black text-stone-800 tracking-wider">
            #{orderId}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4">
          <Link 
            to="/products" 
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-200"
          >
            Continue Shopping
          </Link>
          <Link 
            // to="/profile" 
            to="#"
            className="w-full text-stone-400 py-2 text-sm font-semibold cursor-not-allowed pointer-events-none"
            onClick={(e) => e.preventDefault()}
          >
            View Order History
          </Link>
        </div>

        {/* Support Note */}
        <p className="mt-12 text-[11px] text-stone-400">
          Koi dikkat ho toh contact karein: <span className="font-bold">support@mimicrunch.com</span>
        </p>
      </div>
    </main>
  );
};

export default OrderSuccess;