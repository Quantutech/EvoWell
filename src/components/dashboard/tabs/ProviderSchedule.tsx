
import React, { useState, useEffect } from 'react';
import ScheduleBuilder from '../../ScheduleBuilder';
import AppointmentCard from '../../booking/AppointmentCard';
import { Appointment, ProviderProfile, Availability, UserRole } from '../../../types';
import { api } from '../../../services/api';
import { useAuth } from '../../../App';

interface ProviderScheduleProps {
  apps?: Appointment[]; // Optional as we fetch internally now
  availability: Availability;
  onUpdateAvailability: (val: Availability) => void;
  onSave: () => void;
}

const ProviderSchedule: React.FC<ProviderScheduleProps> = ({ availability, onUpdateAvailability, onSave }) => {
  const { user } = useAuth();
  const [calendarSubTab, setCalendarSubTab] = useState<'appointments' | 'availability'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getAppointmentsForUser(user.id, UserRole.PROVIDER);
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-2">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h2 className="text-xl font-black text-slate-900 mb-1">Clinical Calendar</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
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
          <div className="space-y-4">
             {loading ? (
                <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Loading Schedule...</div>
             ) : appointments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                   <p className="text-slate-400 font-bold">No upcoming appointments.</p>
                </div>
             ) : (
                appointments.map(appt => (
                   <AppointmentCard 
                      key={appt.id} 
                      appointment={appt} 
                      role={UserRole.PROVIDER}
                      onRefresh={fetchAppointments}
                   />
                ))
             )}
          </div>
       )}
    </div>
  );
};

export default ProviderSchedule;
