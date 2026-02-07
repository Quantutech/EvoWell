
import React from 'react';
import { ProviderProfile } from '../../../types';
import { formatInTimezone, getTimezoneAbbr } from '../../../utils/timezone';

interface BookingSidebarProps {
  provider: ProviderProfile;
  bookingMode: 'In Person' | 'Online';
  setBookingMode: (mode: 'In Person' | 'Online') => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;
  availableDates: Date[];
  userTz: string;
  bookingStatus: string;
  handleBook: () => void;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
  provider, bookingMode, setBookingMode, selectedDate, setSelectedDate,
  selectedSlot, setSelectedSlot, availableDates, userTz, bookingStatus, handleBook
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Book Appointment</p>
          <div className="flex justify-center items-baseline gap-1 relative z-10">
            <span className="text-3xl font-black">${provider.pricing.hourlyRate}</span>
            <span className="text-xs font-bold opacity-60">/ session</span>
          </div>
          {provider.pricing.slidingScale && <span className="inline-block mt-2 bg-white/10 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-green-300">Sliding Scale Available</span>}
        </div>

        <div className="p-6">
          {/* Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button onClick={() => setBookingMode('In Person')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bookingMode === 'In Person' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>In Person</button>
            <button onClick={() => setBookingMode('Online')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bookingMode === 'Online' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Online</button>
          </div>

          {/* Date Scroller */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-900">Select Date</span>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Timezone</p>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{getTimezoneAbbr(userTz)}</span>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {availableDates.map((date, i) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button 
                    key={i}
                    onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    className={`min-w-[4.5rem] p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-lg transform scale-105' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xl font-black">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-8">
            <span className="text-xs font-bold text-slate-900 mb-3 block">Available Times</span>
            <div className="grid grid-cols-3 gap-2">
              {provider.availability.hours.map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedSlot(t)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedSlot === t ? 'bg-brand-600 border-brand-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-600 hover:border-brand-200 hover:text-brand-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-center text-slate-400 mt-2">Times shown in your local timezone ({getTimezoneAbbr(userTz)})</p>
          </div>

          {/* Confirm Button */}
          <div className="space-y-3">
            {bookingStatus === 'success' && (
              <div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-xl text-center border border-green-100 animate-in fade-in">
                Request Sent Successfully!
              </div>
            )}
            <button 
              onClick={handleBook}
              disabled={!selectedSlot || bookingStatus === 'success' || bookingStatus === 'booking'}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
            >
              {bookingStatus === 'booking' ? 'Processing...' : 'Confirm Appointment'}
            </button>
            <p className="text-[10px] text-center text-slate-400 font-medium">No charge until appointment is confirmed.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-400 border border-slate-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        <span className="text-[10px] font-bold uppercase tracking-widest">HIPAA Secure Booking</span>
      </div>
    </div>
  );
};

export default BookingSidebar;
