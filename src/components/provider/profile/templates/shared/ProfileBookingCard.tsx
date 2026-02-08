import React from 'react';
import { formatInTimezone, getTimezoneAbbr } from '@/utils/timezone';

interface ProfileBookingCardProps {
  rateLabel: string;
  supportsSlidingScale: boolean;
  bookingMode: 'In Person' | 'Online';
  setBookingMode: (mode: 'In Person' | 'Online') => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;
  availableDates: Date[];
  availableSlots: Date[];
  slotsLoading: boolean;
  userTimezone: string;
  bookingStatus: 'idle' | 'booking' | 'success' | 'error';
  isAuthenticated: boolean;
  onConfirmBooking: () => void;
  onSignInToBook: () => void;
  onSaveToWishlist: () => void;
  className?: string;
  accentTextClassName?: string;
  primaryButtonClassName?: string;
  slotSelectedClassName?: string;
}

const ProfileBookingCard: React.FC<ProfileBookingCardProps> = ({
  rateLabel,
  supportsSlidingScale,
  bookingMode,
  setBookingMode,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  availableDates,
  availableSlots,
  slotsLoading,
  userTimezone,
  bookingStatus,
  isAuthenticated,
  onConfirmBooking,
  onSignInToBook,
  onSaveToWishlist,
  className = '',
  accentTextClassName = 'text-brand-700',
  primaryButtonClassName = 'bg-slate-900 text-white hover:bg-slate-800',
  slotSelectedClassName = 'border-brand-600 bg-brand-600 text-white',
}) => {
  const timezoneAbbr = getTimezoneAbbr(userTimezone);

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="text-base font-black text-slate-900">Book appointment</h3>
      <p className={`mt-1 text-sm font-bold ${accentTextClassName}`}>{rateLabel}</p>
      {supportsSlidingScale && (
        <p className="mt-1 text-xs font-semibold text-emerald-700">Sliding scale available</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setBookingMode('In Person')}
          className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide ${
            bookingMode === 'In Person'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          In person
        </button>
        <button
          type="button"
          onClick={() => setBookingMode('Online')}
          className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide ${
            bookingMode === 'Online'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Online
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700">Select date</p>
          <p className="text-[11px] font-semibold text-slate-500">Timezone: {timezoneAbbr}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {availableDates.map((date) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                className={`min-w-[68px] rounded-xl border px-3 py-2 text-center ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wide">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-sm font-black">{date.getDate()}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold text-slate-700">Available times</p>
        {slotsLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            Loading slots...
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            No available slots for this date
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot) => {
              const value = slot.toISOString();
              const label = formatInTimezone(slot, userTimezone, 'h:mm a');
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedSlot(value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-bold ${
                    selectedSlot === value
                      ? slotSelectedClassName
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {isAuthenticated ? (
            <button
              type="button"
              onClick={onConfirmBooking}
              disabled={!selectedSlot || bookingStatus === 'booking'}
              className={`w-full rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${primaryButtonClassName}`}
            >
              {bookingStatus === 'booking' ? 'Processing...' : 'Confirm appointment'}
            </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onSignInToBook}
              className={`w-full rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors ${primaryButtonClassName}`}
            >
              Sign in to book
            </button>
            <button
              type="button"
              onClick={onSaveToWishlist}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
            >
              Save to wishlist
            </button>
          </>
        )}

        <p className="text-center text-[11px] font-semibold text-slate-500">Secure booking</p>
        <p className="text-center text-[11px] text-slate-500">
          No payment is collected until confirmed. Cancellation policy is shown at checkout.
        </p>
      </div>
    </div>
  );
};

export default ProfileBookingCard;
