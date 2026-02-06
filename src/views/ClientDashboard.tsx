import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { Appointment, UserRole, SupportTicket } from '@/types';
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import ClientSupportTab from '@/components/dashboard/tabs/client/ClientSupportTab';

const ClientDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const { navigate } = useNavigation();
  const [apps, setApps] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  // Settings State
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      api.getAppointmentsForUser(user.id, UserRole.CLIENT).then(data => {
        setApps(data);
        setLoading(false);
      });
      api.getTickets(user.id).then(setTickets);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await api.updateUser(user.id, { firstName: editFirstName, lastName: editLastName, email: editEmail });
      await login(editEmail);
      alert("Portal settings saved.");
    } catch (err) {
      alert("Failed to update portal identity.");
    } finally { setIsSaving(false); }
  };

  if (!user) return null;

  return (
    <ClientDashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-widest text-[11px] text-slate-400">Next Clinical Session</h2>
              {apps.length > 0 ? (
                <div className="bg-blue-50 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-blue-100 transition-all">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{apps[0].dateTime}</p>
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
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center"><h2 className="text-xl font-bold text-slate-900">My Clinical History</h2></div>
            <div className="divide-y divide-slate-100">
              {apps.length > 0 ? apps.map(a => (
                <div key={a.id} className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Session with Specialist {a.providerId.split('-')[1].toUpperCase()}</p>
                    <p className="text-xs text-slate-500 mt-1">{a.dateTime}</p>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest px-2 py-1 bg-green-50 rounded">Scheduled</span>
                </div>
              )) : <div className="p-20 text-center text-slate-400 italic font-medium">No sessions scheduled yet.</div>}
            </div>
        </div>
      )}

      {activeTab === 'support' && (
          <ClientSupportTab user={user} />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-6">Portal Identity Settings</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">First Name</label>
                <input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Last Name</label>
                <input value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" required />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Portal Email Address</label>
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" required />
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={isSaving} className="px-10 py-4 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all hover:bg-blue-600">
                {isSaving ? 'Processing Access...' : 'Save Portal Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientDashboard;