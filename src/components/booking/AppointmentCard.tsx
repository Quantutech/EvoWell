import React, { useEffect, useRef, useState } from 'react';
import { Appointment, UserRole } from '../../types';
import { formatInTimezone, getTimezoneAbbr, getUserTimezone } from '../../utils/timezone';
import { appointmentService } from '../../services/appointments';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../App';

interface AppointmentCardProps {
  appointment: Appointment;
  role: UserRole;
  onRefresh: () => void;
  onClick?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, role, onRefresh, onClick }) => {
  const userTz = getUserTimezone();
  const { user } = useAuth();
  const { addToast } = useToast();
  const date = new Date(appointment.dateTime);
  const isPast = date < new Date();
  const [processing, setProcessing] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const cancelResetTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (cancelResetTimerRef.current) {
        window.clearTimeout(cancelResetTimerRef.current);
      }
    },
    [],
  );
  
  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmingCancel) {
      setConfirmingCancel(true);
      addToast('warning', 'Press cancel again within 5 seconds to confirm.');
      if (cancelResetTimerRef.current) {
        window.clearTimeout(cancelResetTimerRef.current);
      }
      cancelResetTimerRef.current = window.setTimeout(() => setConfirmingCancel(false), 5000);
      return;
    }

    setProcessing(true);
    try {
      await appointmentService.cancelAppointment(appointment.id, "User cancelled");
      addToast('success', 'Appointment cancelled.');
      setConfirmingCancel(false);
      onRefresh();
    } catch (err) {
      addToast('error', 'Failed to cancel appointment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (e: React.MouseEvent, status: string) => {
      e.stopPropagation();
      setProcessing(true);
      try {
          await appointmentService.updateStatus(appointment.id, status);
          addToast('success', `Appointment ${status.toLowerCase()}.`);
          onRefresh();
      } catch (err) {
          addToast('error', 'Failed to update appointment status.');
      } finally {
          setProcessing(false);
      }
  };

  const handleSuggest = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setProcessing(true);
      try {
          const suggestionDate = new Date(appointment.dateTime);
          suggestionDate.setDate(suggestionDate.getDate() + 1);

          const availableSlots = await appointmentService.getProviderAvailability(
            appointment.providerId,
            suggestionDate,
            appointment.durationMinutes || 60,
          );
          const nextSuggested = availableSlots[0]?.start || suggestionDate;

          await appointmentService.rescheduleAppointment(appointment.id, nextSuggested);
          addToast('info', 'A new time suggestion has been sent.');
          onRefresh();
      } catch {
          addToast('error', 'Failed to suggest a new time.');
      } finally {
          setProcessing(false);
      }
  };

  const handleMessage = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) return;

      try {
          let targetUserId: string | undefined;
          if (role === UserRole.PROVIDER) {
              targetUserId = appointment.clientId;
          } else {
              const provider = await api.getProviderById(appointment.providerId);
              targetUserId = provider?.userId;
          }

          if (!targetUserId) {
              addToast('error', 'Unable to resolve conversation participant.');
              return;
          }

          const conversation = await api.getOrCreateConversation(user.id, targetUserId);
          await api.sendMessage({
              conversationId: conversation.id,
              senderId: user.id,
              text: 'Hi, I am following up about this appointment.',
          });
          addToast('success', 'Message sent.');
      } catch {
          addToast('error', 'Failed to send message.');
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
                                         navigator.clipboard
                                           .writeText(appointment.meetingLink || '')
                                           .then(() => addToast('success', 'Meeting link copied.'))
                                           .catch(() => addToast('error', 'Failed to copy meeting link.'));
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
                                  const link = `https://meet.jit.si/evowell-${appointment.id}`;
                                  await appointmentService.updateMeetingLink(appointment.id, link);
                                  addToast('success', 'Meeting link added.');
                                  onRefresh();
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
                          disabled={processing}
                          className={`p-2 transition-colors disabled:opacity-50 ${
                            confirmingCancel
                              ? 'text-red-600'
                              : 'text-red-400 hover:text-red-600'
                          }`}
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
                       if (appointment.meetingLink) {
                         window.open(appointment.meetingLink, '_blank', 'noopener,noreferrer');
                       } else {
                         addToast('info', 'Meeting link is not available yet.');
                       }
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
               appointment.status === 'CANCELLED' || appointment.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
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
