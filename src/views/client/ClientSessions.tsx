import React, { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import { api } from '@/services/api';
import { Appointment, UserRole } from '@/types';

const ClientSessions: React.FC = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getAppointmentsForUser(user.id, UserRole.CLIENT).then(data => {
        setApps(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center"><h2 className="text-xl font-bold text-slate-900">My Clinical History</h2></div>
        <div className="divide-y divide-slate-100">
          {loading ? (
             <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading sessions...</div>
          ) : apps.length > 0 ? apps.map(a => (
            <div key={a.id} className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all">
              <div>
                <p className="text-sm font-bold text-slate-900">Session with Specialist {a.providerId.split('-')[1].toUpperCase()}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(a.dateTime).toLocaleDateString()} at {new Date(a.dateTime).toLocaleTimeString()}</p>
              </div>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest px-2 py-1 bg-green-50 rounded">Scheduled</span>
            </div>
          )) : <div className="p-20 text-center text-slate-400 italic font-medium">No sessions scheduled yet.</div>}
        </div>
    </div>
  );
};

export default ClientSessions;
