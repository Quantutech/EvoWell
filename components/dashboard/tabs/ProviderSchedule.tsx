
import React, { useState } from 'react';
import ScheduleBuilder from '../../ScheduleBuilder';
import { Appointment, ProviderProfile, Availability } from '../../../types';

interface ProviderScheduleProps {
  apps: Appointment[];
  availability: Availability;
  onUpdateAvailability: (val: Availability) => void;
  onSave: () => void;
}

const ProviderSchedule: React.FC<ProviderScheduleProps> = ({ apps, availability, onUpdateAvailability, onSave }) => {
  const [calendarSubTab, setCalendarSubTab] = useState<'appointments' | 'availability'>('appointments');
  const [calendarView, setCalendarView] = useState<'weekly' | 'list'>('weekly');

  const getAppointmentAtSlot = (dayOffset: number, timeStr: string) => {
    // Helper to check if an appointment exists at a given time/day slot for visual grid
    const targetDayIndex = (dayOffset + 1) % 7; // Adjusting for Mon start (0=Mon for visual grid offset)
    
    return apps.find(a => {
      const d = new Date(a.dateTime);
      const appTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      return d.getDay() === targetDayIndex && appTime.startsWith(timeStr.split(':')[0]);
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[600px] flex flex-col">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h2 className="text-xl font-black text-slate-900 mb-1">Clinical Calendar</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                   onClick={() => setCalendarSubTab('appointments')}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${calendarSubTab === 'appointments' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                >
                   Appointments
                </button>
                <button 
                   onClick={() => setCalendarSubTab('availability')}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${calendarSubTab === 'availability' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                >
                   Availability
                </button>
             </div>
             
             {calendarSubTab === 'appointments' && (
                <div className="flex bg-slate-100 p-1 rounded-xl">
                   <button onClick={() => setCalendarView('list')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${calendarView === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>List</button>
                   <button onClick={() => setCalendarView('weekly')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${calendarView === 'weekly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Weekly</button>
                </div>
             )}
          </div>
       </div>

       {calendarSubTab === 'availability' ? (
          <div className="max-w-3xl">
             <p className="text-sm text-slate-500 mb-6">Manage your recurring weekly hours and time-off.</p>
             <ScheduleBuilder 
                value={availability}
                onChange={(val) => {
                   onUpdateAvailability(val);
                   onSave();
                }}
             />
          </div>
       ) : (
          <>
             {calendarView === 'list' ? (
                <div className="divide-y divide-slate-100">
                  {apps.length > 0 ? apps.map(a => (
                    <div key={a.id} className="py-6 flex justify-between items-center group hover:bg-slate-50 rounded-xl px-4 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center font-bold text-xs border border-blue-100">
                            <span>{new Date(a.dateTime).getDate()}</span>
                            <span className="text-[8px] uppercase">{new Date(a.dateTime).toLocaleString('default', { month: 'short' })}</span>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Patient {a.clientId.split('-')[1].toUpperCase()}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{a.dateTime.split(' at ')[1] || '09:00 AM'} • Video Session</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Reschedule</button>
                         <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-700">Join Room</button>
                      </div>
                    </div>
                  )) : <div className="p-20 text-center text-slate-400 italic font-medium bg-slate-50 rounded-2xl">No upcoming sessions found in list.</div>}
                </div>
             ) : (
                <div className="flex-grow overflow-x-auto">
                   <div className="min-w-[800px]">
                      {/* Days Header */}
                      <div className="grid grid-cols-8 gap-1 mb-2">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-2">Time</div>
                         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center py-2 bg-slate-50 rounded-lg">
                               {day}
                            </div>
                         ))}
                      </div>
                      {/* Time Grid */}
                      <div className="space-y-1">
                         {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                            <div key={time} className="grid grid-cols-8 gap-1 h-14">
                               <div className="text-[10px] font-bold text-slate-400 text-center flex items-center justify-center">{time}</div>
                               {[0,1,2,3,4,5,6].map(d => {
                                  const appAtSlot = getAppointmentAtSlot(d, time);
                                  return (
                                     <div 
                                        key={d} 
                                        className={`rounded-lg border transition-all relative group cursor-pointer ${
                                           appAtSlot
                                           ? 'bg-blue-50 border-blue-200' 
                                           : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                     >
                                        {appAtSlot && (
                                           <div className="absolute inset-1 bg-blue-100 rounded flex flex-col items-center justify-center text-[9px] text-blue-700 p-1 text-center">
                                              <span className="font-bold">Patient {appAtSlot.clientId.split('-')[1].toUpperCase()}</span>
                                           </div>
                                        )}
                                        {!appAtSlot && (
                                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 rounded-lg transition-opacity">
                                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Block</span>
                                           </div>
                                        )}
                                     </div>
                                  );
                               })}
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}
          </>
       )}
    </div>
  );
};

export default ProviderSchedule;
