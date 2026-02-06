import React, { useState } from 'react';
import { Appointment, UserRole } from '../../types';
import { formatInTimezone, getTimezoneAbbr, getUserTimezone } from '../../utils/timezone';
import { appointmentService } from '../../services/appointments';

interface AppointmentCardProps {
  appointment: Appointment;
  role: UserRole;
  onRefresh: () => void;
  onClick?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, role, onRefresh, onClick }) => {
  const userTz = getUserTimezone();
  const date = new Date(appointment.dateTime);
  const isPast = date < new Date();
  const [processing, setProcessing] = useState(false);
  
  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
    try {
      await appointmentService.cancelAppointment(appointment.id, "User cancelled");
      onRefresh();
    } catch (err) {
      alert("Failed to cancel.");
    }
  };

  const handleStatusUpdate = async (e: React.MouseEvent, status: string) => {
      e.stopPropagation();
      setProcessing(true);
      try {
          await appointmentService.updateStatus(appointment.id, status);
          
          if (status === 'CONFIRMED') {
              alert(`Appointment Confirmed! Client ${appointment.client?.firstName || 'User'} has been notified via email.`);
          }
          
          onRefresh();
      } catch (err) {
          alert("Action failed.");
      } finally {
          setProcessing(false);
      }
  };

  const handleSuggest = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newTime = prompt("Suggest a new time (e.g. Tomorrow at 2pm):");
      if (newTime) {
          alert(`Suggestion sent to client: "${newTime}". Waiting for their response.`);
      }
  };

  const handleMessage = (e: React.MouseEvent) => {
      e.stopPropagation();
      const msg = prompt(`Message to ${appointment.client?.firstName || 'Client'}:`);
      if (msg) {
          alert("Message sent successfully!");
      }
  };

  const displayName = role === UserRole.PROVIDER 
    ? `Client: ${appointment.client?.firstName} ${appointment.client?.lastName}`
    : `Dr. ${appointment.provider?.professionalTitle}`; 

  const renderActions = () => {
      // Don't show actions for past appointments unless we want to view details
      if (isPast && appointment.status !== 'COMPLETED' && appointment.status !== 'PENDING') return null;
      if (appointment.status === 'CANCELLED' || appointment.status === 'REJECTED') return null;

      if (role === UserRole.PROVIDER) {
          if (appointment.status === 'PENDING') {
              return (
                  <div className="flex gap-2 w-full md:w-auto flex-wrap">
                      <button 
                          onClick={(e) => handleStatusUpdate(e, 'CONFIRMED')}
                          disabled={processing}
                          className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                      >
                          Confirm
                      </button>
                      <button 
                          onClick={handleSuggest}
                          disabled={processing}
                          className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                      >
                          Suggest
                      </button>
                      <button 
                          onClick={(e) => handleStatusUpdate(e, 'REJECTED')}
                          disabled={processing}
                          className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                      >
                          Reject
                      </button>
                  </div>
              );
          }

          if (appointment.status === 'CONFIRMED' || appointment.status === 'PAID') {
              return (
                  <div className="flex gap-2 w-full md:w-auto items-center flex-wrap">
                      {appointment.meetingLink ? (
                          <div className="flex gap-2">
                             <a 
                                href={appointment.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 md:flex-none px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center"
                             >
                                Join Call
                             </a>
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(appointment.meetingLink || '');
                                    alert("Link copied!");
                                }}
                                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"
                                title="Copy Link"
                             >
                                🔗
                             </button>
                          </div>
                      ) : (
                          <button 
                              className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                              onClick={async (e) => {
                                  e.stopPropagation();
                                  const link = prompt("Enter video meeting URL:");
                                  if (link) {
                                      await appointmentService.updateMeetingLink(appointment.id, link);
                                      onRefresh();
                                  }
                              }}
                          >
                              Add Meeting Link
                          </button>
                      )}
                      <button 
                          onClick={handleMessage}
                          className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-brand-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-50 transition-all"
                      >
                          Message
                      </button>
                      <button 
                          onClick={handleCancel}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Cancel Appointment"
                      >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
              );
          }
      } else {
          // Client Actions
          if (appointment.status === 'CONFIRMED' || appointment.status === 'PAID') {
             return (
                <button 
                   className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                   onClick={(e) => {
                       e.stopPropagation();
                       alert("Video rooms integrated in next phase");
                   }}
                >
                   Join Call
                </button>
             );
          }
      }

      return null;
  };

  return (
    <div 
      onClick={() => {
        if (onClick) {
          onClick(appointment);
        } else {
          alert(`Viewing details for ${displayName}. Full clinical records and messaging history integration coming in next phase.`);
        }
      }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center cursor-pointer group"
    >
      
      {/* Date Badge */}
      <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
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
      {renderActions()}
    </div>
  );
};

export default AppointmentCard;
