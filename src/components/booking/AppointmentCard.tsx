
import React from 'react';
import { Appointment, UserRole } from '../../types';
import { formatInTimezone, getTimezoneAbbr, getUserTimezone } from '../../utils/timezone';
import { appointmentService } from '../../services/appointments';

interface AppointmentCardProps {
  appointment: Appointment;
  role: UserRole;
  onRefresh: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, role, onRefresh }) => {
  const userTz = getUserTimezone();
  const date = new Date(appointment.dateTime);
  const isPast = date < new Date();
  
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
    try {
      await appointmentService.cancelAppointment(appointment.id, "User cancelled");
      onRefresh();
    } catch (e) {
      alert("Failed to cancel.");
    }
  };

  const displayName = role === UserRole.PROVIDER 
    ? `Client: ${appointment.client?.firstName} ${appointment.client?.lastName}`
    : `Dr. ${appointment.provider?.professionalTitle}`; // Simplified, assumes provider data join

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
      
      {/* Date Badge */}
      <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
        isPast ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600'
      }`}>
        <span className="text-xs font-black uppercase tracking-widest">{formatInTimezone(date, userTz, 'MMM')}</span>
        <span className="text-2xl font-black">{formatInTimezone(date, userTz, 'd')}</span>
      </div>

      {/* Info */}
      <div className="flex-grow">
         <div className="flex justify-between items-start mb-1">
            <h4 className="text-lg font-bold text-slate-900">{displayName}</h4>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
               appointment.status === 'CONFIRMED' || appointment.status === 'PAID' ? 'bg-green-100 text-green-700' : 
               appointment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
               'bg-slate-100 text-slate-500'
            }`}>
               {appointment.status}
            </span>
         </div>
         <p className="text-sm text-slate-500 font-medium mb-1">
            {formatInTimezone(date, userTz, 'h:mm a')} {getTimezoneAbbr(userTz)} • {appointment.durationMinutes} min
         </p>
         {appointment.notes && <p className="text-xs text-slate-400 italic">"{appointment.notes}"</p>}
      </div>

      {/* Actions */}
      {!isPast && appointment.status !== 'CANCELLED' && (
         <div className="flex gap-2 w-full md:w-auto">
            <button 
               className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
               onClick={() => alert("Video rooms integrated in next phase")}
            >
               Join Call
            </button>
            <button 
               onClick={handleCancel}
               className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-200 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
            >
               Cancel
            </button>
         </div>
      )}
    </div>
  );
};

export default AppointmentCard;
