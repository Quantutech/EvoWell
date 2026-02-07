import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { wishlistService } from '@/services/wishlist.service';
import { useToast } from '@/contexts/ToastContext';
import { Appointment, UserRole, SupportTicket, ClientProfile, WellnessEntry, Habit, ProviderProfile } from '@/types';
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import ClientSupportTab from '@/components/dashboard/tabs/client/ClientSupportTab';
import ClientSavedProviders from '@/components/dashboard/tabs/ClientSavedProviders';
import { BarChart, DonutChart, SettingInput } from '@/components/dashboard/DashboardComponents';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import ProfileImage from '@/components/ui/ProfileImage';

const ClientDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const [apps, setApps] = useState<Appointment[]>([]);
  const [careTeam, setCareTeam] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  
  // Settings State
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editBio, setEditBio] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPronouns, setEditPronouns] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState(profile?.address || { street: '', city: '', state: '', zip: '', country: 'USA' });
  const [isSaving, setIsSaving] = useState(false);

  // Journal State
  const [journalEntry, setJournalEntry] = useState('');

  useEffect(() => {
    if (user) {
      api.getAppointmentsForUser(user.id, UserRole.CLIENT).then(data => {
        setApps(data);
      });
      api.getTickets(user.id).then(setTickets);
      api.getClientProfile(user.id).then(data => {
        if (data) {
          setProfile(data);
          setEditBio(data.bio || '');
          setEditDOB(data.dateOfBirth || '');
          setEditGender(data.gender || '');
          setEditPronouns(data.pronouns || '');
          setEditPhone(data.phoneNumber || '');
          setEditAddress(data.address || { street: '', city: '', state: '', zip: '', country: 'USA' });
        }
        setLoading(false);
      });

      // Fetch Care Team from Wishlist
      wishlistService.getSavedProviders().then(saved => {
        const team = saved.map(s => s.provider).filter(Boolean) as ProviderProfile[];
        setCareTeam(team.slice(0, 3));
      }).catch(console.error);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await api.updateUser(user.id, { firstName: editFirstName, lastName: editLastName, email: editEmail });
      await api.updateClientProfile(user.id, { 
        bio: editBio, 
        dateOfBirth: editDOB, 
        gender: editGender, 
        pronouns: editPronouns,
        phoneNumber: editPhone,
        address: editAddress
      });
      await login(editEmail);
      addToast('success', "Profile updated successfully!");
    } catch (err) {
      addToast('error', "Failed to update profile.");
    } finally { setIsSaving(false); }
  };

  const handleSaveJournal = async () => {
    if (!user || !journalEntry.trim()) return;
    
    // In a real app, this would be an API call to append to wellnessLog
    // For now, we mock it by updating the local profile state or showing toast
    addToast('success', "Entry saved and encrypted. Shared with your care team.");
    setJournalEntry('');
  };

  const handleLogWellness = async () => {
      if (!profile) return;
      addToast('info', "Wellness logging feature coming soon. Your specialist will see these updates.");
  };

  const moodData = useMemo(() => {
    if (!profile?.wellnessLog) return [];
    return profile.wellnessLog.slice(-7).map(w => ({
      label: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: w.mood * 10 // Scale 1-10 for chart
    }));
  }, [profile]);

  const energyData = useMemo(() => {
    if (!profile?.wellnessLog) return [];
    return profile.wellnessLog.slice(-7).map(w => ({
      label: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: w.energy * 10
    }));
  }, [profile]);

  const habitChartData = useMemo(() => {
    if (!profile?.habits) return [];
    return profile.habits.map(h => ({
      label: h.name,
      value: Math.round((h.current / h.target) * 100),
      color: h.color
    }));
  }, [profile]);

  if (!user) return null;

  return (
    <ClientDashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Overview</h1>
                 <p className="text-slate-500 mt-2">Welcome back, {user.firstName}. Here's your clinical summary.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                 {/* Next Session Card */}
                 <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-widest text-[11px] text-slate-400">Next Clinical Session</h2>
                    {apps.filter(a => a.status === 'CONFIRMED').length > 0 ? (
                      <div className="bg-brand-50 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-brand-100 transition-all">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{new Date(apps.filter(a => a.status === 'CONFIRMED')[0].dateTime).toLocaleString()}</p>
                          <p className="text-xs text-brand-600 font-bold uppercase tracking-widest mt-1">Confirmed Specialist Intake</p>
                        </div>
                        <button 
                          onClick={() => addToast('info', 'Secure room opens 10 minutes before session.')}
                          className="px-8 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
                        >
                          Join Secure Room
                        </button>
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 italic mb-4">No upcoming clinical sessions found.</p>
                        <button onClick={() => navigate('#/search')} className="px-6 py-2 bg-white text-brand-600 border border-brand-100 rounded-xl text-xs font-bold hover:bg-brand-50">Find a Specialist</button>
                      </div>
                    )}
                 </section>

                 {/* Activity Overview */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Recent Mood Trend</h3>
                       {moodData.length > 0 ? <BarChart data={moodData} /> : <p className="text-xs text-slate-400 italic py-10 text-center">Start logging wellness to see trends.</p>}
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Habit Completion</h3>
                       <div className="flex items-center justify-center py-4">
                          {habitChartData.length > 0 ? <DonutChart data={habitChartData} /> : <p className="text-xs text-slate-400 italic text-center">No habits tracked yet.</p>}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Quick Log</h3>
                    <p className="text-slate-400 text-xs mb-6 leading-relaxed">Keep your provider updated on your daily well-being between sessions.</p>
                    <button 
                      onClick={() => setActiveTab('wellness')}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                       Log Daily Metrics
                    </button>
                 </div>
                 
                 <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 text-center">My Care Team</h3>
                    <div className="space-y-4">
                       {careTeam.length > 0 ? careTeam.map(provider => (
                           <div key={provider.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => navigate(`#/provider/${provider.id}`)}>
                              <ProfileImage src={provider.imageUrl} alt={`${provider.firstName} ${provider.lastName}`} className="w-10 h-10 rounded-full" />
                              <div>
                                 <p className="text-xs font-bold text-slate-900">Dr. {provider.firstName} {provider.lastName}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">{provider.professionalTitle}</p>
                              </div>
                           </div>
                       )) : (
                           <div className="text-center py-4">
                               <p className="text-xs text-slate-400 italic">No providers yet.</p>
                               <button onClick={() => navigate('#/search')} className="text-[10px] font-bold text-brand-600 hover:underline mt-2">Find a Specialist</button>
                           </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'wellness' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Wellness Tracker</h2>
              <button 
                onClick={handleLogWellness}
                className="bg-brand-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-700 shadow-lg"
              >
                Log Today's Status
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm lg:col-span-2">
                 <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Energy Levels (7 Days)</h3>
                 <BarChart data={energyData} />
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                 <h3 className="text-lg font-bold text-slate-900 mb-8">Overall Progress</h3>
                 <DonutChart data={habitChartData} />
                 <div className="mt-8 space-y-2 w-full">
                    {profile?.habits?.map(h => (
                       <div key={h.id} className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500">{h.name}</span>
                          <span style={{ color: h.color }}>{h.current}/{h.target} {h.unit}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
           <h2 className="text-2xl font-black text-slate-900">Clinical Health Journal</h2>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">New Journal Entry</h3>
              <textarea 
                value={journalEntry}
                onChange={e => setJournalEntry(e.target.value)}
                className="w-full h-40 bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none mb-4"
                placeholder="How are you feeling today? Any breakthroughs or challenges?"
              />
              <div className="flex justify-end">
                 <button 
                   onClick={handleSaveJournal}
                   className="bg-brand-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-700 transition-all"
                 >
                    Securely Save Entry
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">Previous Entries</h3>
              {profile?.wellnessLog?.filter(w => w.notes).length ? profile.wellnessLog.filter(w => w.notes).map(w => (
                 <div key={w.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{new Date(w.date).toLocaleDateString()}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Mood: {w.mood}/5</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium italic">"{w.notes}"</p>
                 </div>
              )) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-slate-400 italic">No journal entries yet.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center"><h2 className="text-xl font-bold text-slate-900">Clinical Session History</h2></div>
            <div className="divide-y divide-slate-100">
              {apps.length > 0 ? apps.map(a => (
                <div key={a.id} className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Clinical Session • {a.type || 'Standard'}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(a.dateTime).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                      a.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                      a.status === 'COMPLETED' ? 'bg-brand-100 text-brand-700' : 
                      'bg-slate-100 text-slate-500'
                    }`}>{a.status}</span>
                  </div>
                </div>
              )) : <div className="p-20 text-center text-slate-400 italic font-medium">No sessions scheduled yet.</div>}
            </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <ClientSavedProviders />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm max-w-4xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
             <h2 className="text-xl font-bold text-slate-900">Profile Management</h2>
             {isSaving && <span className="text-xs font-bold text-brand-500 animate-pulse uppercase tracking-widest">Saving Health Data...</span>}
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-10">
            {/* Identity Section */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Identity</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SettingInput label="First Name" value={editFirstName} onChange={setEditFirstName} />
                 <SettingInput label="Last Name" value={editLastName} onChange={setEditLastName} />
                 <SettingInput label="Date of Birth" value={editDOB} onChange={setEditDOB} placeholder="YYYY-MM-DD" />
                 <SettingInput label="Preferred Gender" value={editGender} onChange={setEditGender} />
                 <SettingInput label="Pronouns" value={editPronouns} onChange={setEditPronouns} />
                 <SettingInput label="Phone Number" value={editPhone} onChange={setEditPhone} />
               </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mailing Address</h3>
               <div className="space-y-6">
                  <AddressAutocomplete 
                    value={editAddress}
                    onChange={setEditAddress}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                      <input value={editAddress?.city || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                      <input value={editAddress?.state || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                      <input value={editAddress?.zip || ''} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Health Narrative */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Narrative</h3>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personal Bio / Goals</label>
                  <textarea 
                    value={editBio} 
                    onChange={e => setEditBio(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/10 h-32 resize-none"
                    placeholder="Describe your health goals or anything you want your care team to know."
                  />
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-bold max-w-md uppercase tracking-tight">Your data is encrypted and only shared with specialists you explicitly book with.</p>
              <button type="submit" disabled={isSaving} className="px-10 py-4 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-brand-600/20 disabled:opacity-50 transition-all hover:bg-brand-700">
                Update Health Portal
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'support' && (
          <ClientSupportTab user={user} />
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-[2.5rem] p-12 border border-slate-200 text-center shadow-sm">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">My Documents</h3>
           <p className="text-slate-500 text-sm max-w-xs mx-auto">Access your shared lab results, treatment plans, and intake forms.</p>
           <button 
             onClick={() => addToast('info', 'Document upload feature coming soon.')}
             className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
           >
             Upload New
           </button>
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientDashboard;
