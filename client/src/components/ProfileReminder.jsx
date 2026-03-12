import React, { useState, useEffect } from 'react';
import { X, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileReminder = ({ user }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const shouldShow = sessionStorage.getItem('show_profile_reminder');
    if (shouldShow === 'true' && user && (!user.name || !user.phone || !user.address)) {
      setShow(true);
      // Clear flag so it doesn't show again on refresh
      sessionStorage.removeItem('show_profile_reminder');
    } else {
      // If it's already shown, it stays until dismissed.
      // But if the user is already complete, hide it.
      if (user && user.name && user.phone && user.address) {
        setShow(false);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('profile_reminder_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 left-4 md:left-auto md:w-96 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="backdrop-blur-xl bg-white/90 border border-[#1B3B26]/10 shadow-[0_15px_40px_-10px_rgba(27,59,38,0.2)] rounded-3xl p-5 flex items-start gap-4">
        <div className="bg-[#1B3B26]/10 p-3 rounded-2xl text-[#1B3B26]">
          <UserCircle className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-[#1B3B26] font-bold text-sm mb-1 font-[Fraunces]">Complete Your Profile</h3>
          <p className="text-[#4A5D4E] text-xs leading-relaxed mb-3">
            Add your name and delivery address to speed up your checkout process!
          </p>
          <Link 
            to="/profile" 
            onClick={handleDismiss}
            className="inline-block bg-[#1B3B26] text-white text-[11px] font-bold px-4 py-2 rounded-full hover:bg-[#2A5237] transition-all shadow-sm"
          >
            Update Profile
          </Link>
        </div>

        <button 
          onClick={handleDismiss}
          className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileReminder;
