
import React, { useState, useEffect } from 'react';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { appointmentService } from '../../services/appointments';
import { AvailabilitySlot } from '../../types';
import { formatInTimezone, getTimezoneAbbr, getUserTimezone } from '../../utils/timezone';

interface AvailabilityCalendarProps {
  providerId: string;
  providerTimezone: string;
  onSelectSlot: (date: Date) => void;
  selectedSlot: Date | null;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ 
  providerId, providerTimezone, onSelectSlot, selectedSlot 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const userTimezone = getUserTimezone();

  useEffect(() => {
    // Generate next 14 days
    const dates = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(today, i));
    }
    setWeekDates(dates);
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const available = await appointmentService.getProviderAvailability(providerId, selectedDate);
        setSlots(available);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [providerId, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-slate-900">Select Date & Time</h3>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
           Your Time: {getTimezoneAbbr(userTimezone)}
        </span>
      </div>

      {/* Date Scroller */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {weekDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`min-w-[4.5rem] p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                isSelected 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg transform scale-105' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {format(date, 'EEE')}
              </span>
              <span className="text-xl font-black">
                {format(date, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots Grid */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex justify-center items-center h-40">
             <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full"></div>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
             <p className="text-sm font-bold">No slots available</p>
             <p className="text-xs">Try selecting another date</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2">
            {slots.map((slot, idx) => {
               // Format slot start time to user's local time for display
               const timeLabel = formatInTimezone(slot.start, userTimezone, 'h:mm a');
               const isSelected = selectedSlot && slot.start.getTime() === selectedSlot.getTime();

               return (
                 <button
                   key={idx}
                   onClick={() => onSelectSlot(slot.start)}
                   className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                     isSelected
                       ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                       : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-600'
                   }`}
                 >
                   {timeLabel}
                 </button>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
