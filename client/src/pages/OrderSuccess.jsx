import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

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
        <p className="text-stone-600 mb-10 leading-relaxed">
          Bhai, tera order confirm ho gaya hai! Humne ek confirmation email bhi bhej diya hai. 
          Ab bas kuch hi dino mein healthy MiMi Crunch tere ghar pahunchenge.
        </p>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl p-6 mb-10 border border-stone-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Order ID</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Payment: COD</span>
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