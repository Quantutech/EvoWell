import React, { useState, useEffect } from 'react';
import { Availability, DaySchedule, TimeRange } from '@/types';

interface ScheduleBuilderProps {
  value: Availability;
  onChange: (value: Availability) => void;
}

const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'blocked'>('weekly');
  const [blockDateInput, setBlockDateInput] = useState('');
  
  const DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Initialize schedule if empty (legacy data migration)
  useEffect(() => {
    if (!value?.schedule || value.schedule.length === 0) {
      const initialDays = value?.days || [];
      const initialSchedule: DaySchedule[] = DAYS_ORDER.map(day => ({
        day,
        active: initialDays.includes(day),
        timeRanges: initialDays.includes(day) 
          ? [{ start: '09:00', end: '17:00' }] 
          : []
      }));
      
      onChange({
        ...value,
        schedule: initialSchedule,
        blockedDates: value.blockedDates || []
      });
    }
  }, []);

  const updateSchedule = (newSchedule: DaySchedule[]) => {
    // Derive summary fields for search indexing
    const activeDays = newSchedule.filter(s => s.active).map(s => s.day);
    // Simple summary string for "hours" field (taking first range of first active day for now)
    const summaryHours = newSchedule.find(s => s.active && s.timeRanges.length > 0)
      ?.timeRanges.map(r => `${r.start}-${r.end}`) || [];

    onChange({
      ...value,
      days: activeDays,
      hours: summaryHours,
      schedule: newSchedule
    });
  };

  const toggleDay = (dayIndex: number) => {
    const newSchedule = [...(value.schedule || [])];
    if (!newSchedule[dayIndex]) return;
    
    newSchedule[dayIndex].active = !newSchedule[dayIndex].active;
    if (newSchedule[dayIndex].active && newSchedule[dayIndex].timeRanges.length === 0) {
      newSchedule[dayIndex].timeRanges.push({ start: '09:00', end: '17:00' });
    }
    updateSchedule(newSchedule);
  };

  const updateRange = (dayIndex: number, rangeIndex: number, field: keyof TimeRange, val: string) => {
    const newSchedule = [...(value.schedule || [])];
    newSchedule[dayIndex].timeRanges[rangeIndex][field] = val;
    updateSchedule(newSchedule);
  };

  const addRange = (dayIndex: number) => {
    const newSchedule = [...(value.schedule || [])];
    newSchedule[dayIndex].timeRanges.push({ start: '12:00', end: '13:00' });
    updateSchedule(newSchedule);
  };

  const removeRange = (dayIndex: number, rangeIndex: number) => {
    const newSchedule = [...(value.schedule || [])];
    newSchedule[dayIndex].timeRanges.splice(rangeIndex, 1);
    updateSchedule(newSchedule);
  };

  const addBlockedDate = () => {
    if (!blockDateInput) return;
    const current = value.blockedDates || [];
    if (!current.includes(blockDateInput)) {
      onChange({ ...value, blockedDates: [...current, blockDateInput].sort() });
    }
    setBlockDateInput('');
  };

  const removeBlockedDate = (date: string) => {
    onChange({ ...value, blockedDates: (value.blockedDates || []).filter(d => d !== date) });
  };

  const renderWeekly = () => (
    <div className="space-y-4">
      {(value.schedule || []).map((daySchedule, dayIdx) => (
        <div 
          key={daySchedule.day} 
          className={`border rounded-2xl transition-all ${daySchedule.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-75'}`}
        >
          <div className="p-4 flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-24 shrink-0 pt-2 flex items-center gap-3">
              <div 
                onClick={() => toggleDay(dayIdx)}
                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${daySchedule.active ? 'bg-brand-500' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${daySchedule.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className={`font-bold text-sm ${daySchedule.active ? 'text-slate-900' : 'text-slate-400'}`}>{daySchedule.day}</span>
            </div>

            <div className="flex-grow space-y-3">
              {daySchedule.active ? (
                <>
                  {daySchedule.timeRanges.map((range, rangeIdx) => (
                    <div key={rangeIdx} className="flex items-center gap-3">
                      <input 
                        type="time" 
                        value={range.start} 
                        onChange={(e) => updateRange(dayIdx, rangeIdx, 'start', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                      <span className="text-slate-300 font-bold">-</span>
                      <input 
                        type="time" 
                        value={range.end} 
                        onChange={(e) => updateRange(dayIdx, rangeIdx, 'end', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
                      />
                      <button 
                        onClick={() => removeRange(dayIdx, rangeIdx)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Remove slot"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => addRange(dayIdx)}
                    className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 flex items-center gap-1 mt-1"
                  >
                    + Add Shift
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic pt-2 block">Unavailable</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBlocked = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Date to Block</label>
          <input 
            type="date" 
            value={blockDateInput} 
            onChange={(e) => setBlockDateInput(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
        </div>
        <button 
          onClick={addBlockedDate}
          disabled={!blockDateInput}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all whitespace-nowrap h-[46px]"
        >
          Block Date
        </button>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 mb-4">Currently Blocked Dates</h4>
        {(!value.blockedDates || value.blockedDates.length === 0) && (
          <p className="text-xs text-slate-400 italic">No dates blocked yet.</p>
        )}
        <div className="flex flex-wrap gap-3">
          {(value.blockedDates || []).map(date => (
            <div key={date} className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold shadow-sm">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              <button onClick={() => removeBlockedDate(date)} className="hover:text-red-800">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'weekly' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Weekly Hours
        </button>
        <button 
          onClick={() => setActiveTab('blocked')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'blocked' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Time Off
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'weekly' ? renderWeekly() : renderBlocked()}
      </div>
    </div>
  );
};

export default ScheduleBuilder;