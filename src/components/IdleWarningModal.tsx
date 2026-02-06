
import React from 'react';

interface IdleWarningModalProps {
  remaining: number; // Seconds remaining
  onStayLoggedIn: () => void;
}

const IdleWarningModal: React.FC<IdleWarningModalProps> = ({ remaining, onStayLoggedIn }) => {
  // Format seconds to MM:SS
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 text-center border border-slate-200">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-amber-100 animate-pulse">
          ⏰
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">Session Expiring</h2>
        
        <p className="text-slate-500 font-medium mb-8">
          For your security, you will be automatically logged out in <span className="font-bold text-slate-900">{timeString}</span> due to inactivity.
        </p>

        <button 
          onClick={onStayLoggedIn}
          className="w-full bg-brand-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  );
};

export default IdleWarningModal;
