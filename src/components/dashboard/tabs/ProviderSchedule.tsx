import React, { useState, useEffect } from 'react';
import AppointmentCard from '../../booking/AppointmentCard';
import { Appointment, UserRole } from '../../../types';
import { api } from '../../../services/api';
import { useAuth } from '../../../App';

interface ProviderScheduleProps {
  apps?: Appointment[]; // Optional prop if passed from parent
  onAppointmentClick?: (appt: Appointment) => void;
}

const ProviderSchedule: React.FC<ProviderScheduleProps> = ({ apps, onAppointmentClick }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(apps || []);
  const [loading, setLoading] = useState(!apps);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
    if (!apps) {
        fetchAppointments();
    } else {
        setAppointments(apps);
        setLoading(false);
    }
  }, [user, apps]);

  const filteredAppointments = appointments.filter(a => 
    statusFilter === 'ALL' || a.status === statusFilter
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-2">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
             <h2 className="text-xl font-black text-slate-900 mb-1">Clinical Schedule</h2>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
             {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   {status}
                </button>
             ))}
          </div>
       </div>

       <div className="space-y-4">
             {loading ? (
                <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Loading Schedule...</div>
             ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                   <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} appointments found.</p>
                </div>
             ) : (
                filteredAppointments.map(appt => (
                   <AppointmentCard 
                      key={appt.id} 
                      appointment={appt} 
                      role={UserRole.PROVIDER}
                      onRefresh={fetchAppointments}
                      onClick={onAppointmentClick}
                   />
                ))
             )}
       </div>
    </div>
  );
};

export default ProviderSchedule;
