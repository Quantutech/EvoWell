import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { Appointment, UserRole } from '@/types';

const ClientHome: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-8 space-y-8">
        {/* Profile Completion */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
           <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-bold text-slate-900">Welcome, {user.firstName}</h2>
              <span className="text-xs font-bold text-slate-500">60% Complete</span>
           </div>
           <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-green-500 w-[60%] rounded-full"></div>
           </div>
           <div className="flex gap-4">
              <button onClick={() => navigate('documents')} className="text-xs font-bold text-blue-600 hover:underline">Upload ID →</button>
              <button onClick={() => navigate('documents')} className="text-xs font-bold text-blue-600 hover:underline">Upload Insurance →</button>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => navigate('/search')} className="p-6 bg-blue-500 text-white rounded-2xl font-bold text-left shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
              <span className="block text-2xl mb-2">📅</span>
              Book Appointment
           </button>
           <button onClick={() => navigate('support')} className="p-6 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold text-left hover:border-slate-300 transition-all">
              <span className="block text-2xl mb-2">💬</span>
              Message Provider
           </button>
        </div>

        <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-widest text-[11px] text-slate-400">Next Clinical Session</h2>
          {loading ? (
             <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div></div>
          ) : apps.length > 0 ? (
            <div className="bg-blue-50 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-blue-100 transition-all">
              <div>
                <p className="text-2xl font-bold text-slate-900">{new Date(apps[0].dateTime).toLocaleDateString()} at {new Date(apps[0].dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Confirmed Specialist Intake</p>
              </div>
              <button className="px-8 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">Join Secure Room</button>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-400 italic mb-6">No scheduled clinical sessions found.</p>
              <button onClick={() => navigate('#/search')} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">Find a Specialist</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClientHome;
