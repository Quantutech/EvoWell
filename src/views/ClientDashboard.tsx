import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { wishlistService } from '@/services/wishlist.service';
import { storageService } from '@/services/storageService';
import { useToast } from '@/contexts/ToastContext';
import { Appointment, ClientProfile, Habit, ProviderProfile, UserRole, WellnessEntry } from '@/types';
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import ClientSupportTab from '@/components/dashboard/tabs/client/ClientSupportTab';
import ClientSavedProviders from '@/components/dashboard/tabs/ClientSavedProviders';
import { BarChart, DonutChart, SettingInput } from '@/components/dashboard/DashboardComponents';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import ProfileImage from '@/components/ui/ProfileImage';

const EMPTY_ADDRESS = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'USA',
};

const ClientDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState('home');
  const [journalEntry, setJournalEntry] = useState('');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editBio, setEditBio] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPronouns, setEditPronouns] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState<ClientProfile['address']>(EMPTY_ADDRESS);

  const [wellnessMood, setWellnessMood] = useState(3);
  const [wellnessEnergy, setWellnessEnergy] = useState(3);
  const [wellnessSleepHours, setWellnessSleepHours] = useState(7);
  const [wellnessNotes, setWellnessNotes] = useState('');

  const { data: apps = [] } = useQuery({
    queryKey: ['clientAppointments', user?.id],
    queryFn: () => (user ? api.getAppointmentsForUser(user.id, UserRole.CLIENT) : []),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const { data: profile } = useQuery({
    queryKey: ['clientProfile', user?.id],
    queryFn: () => (user ? api.getClientProfile(user.id) : null),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const { data: careTeam = [] } = useQuery({
    queryKey: ['clientCareTeam', user?.id],
    queryFn: async () => {
      const saved = await wishlistService.getSavedProviders();
      return saved.map((item) => item.provider).filter(Boolean).slice(0, 3) as ProviderProfile[];
    },
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['clientJournalEntries', user?.id],
    queryFn: () => (user ? api.getClientJournalEntries(user.id) : []),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!user) return;
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditEmail(user.email || '');
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    setEditBio(profile.bio || '');
    setEditDOB(profile.dateOfBirth || '');
    setEditGender(profile.gender || '');
    setEditPronouns(profile.pronouns || '');
    setEditPhone(profile.phoneNumber || '');
    setEditAddress(profile.address || EMPTY_ADDRESS);
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'search') {
      navigate('#/search');
      setActiveTab('home');
    }
  }, [activeTab, navigate]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not available');
      await api.updateUser(user.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
      });
      await api.updateClientProfile(user.id, {
        bio: editBio,
        dateOfBirth: editDOB,
        gender: editGender,
        pronouns: editPronouns,
        phoneNumber: editPhone,
        address: editAddress || EMPTY_ADDRESS,
      });
      await login(editEmail);
    },
    onSuccess: async () => {
      addToast('success', 'Profile updated successfully.');
      await queryClient.invalidateQueries({ queryKey: ['clientProfile', user?.id] });
    },
    onError: () => addToast('error', 'Failed to update profile.'),
  });

  const logWellnessMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not available');
      const baseProfile = profile || {
        id: `cp-${user.id}`,
        userId: user.id,
        intakeStatus: 'PENDING' as const,
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const nextEntry: WellnessEntry = {
        id: `wellness-${Date.now()}`,
        date: new Date().toISOString(),
        mood: wellnessMood,
        energy: wellnessEnergy,
        sleepHours: wellnessSleepHours,
        notes: wellnessNotes.trim() || undefined,
      };

      await api.updateClientProfile(user.id, {
        ...baseProfile,
        wellnessLog: [...(profile?.wellnessLog || []), nextEntry],
      });
    },
    onSuccess: async () => {
      setWellnessNotes('');
      addToast('success', 'Wellness check-in saved.');
      await queryClient.invalidateQueries({ queryKey: ['clientProfile', user?.id] });
    },
    onError: () => addToast('error', 'Failed to save wellness entry.'),
  });

  const addJournalMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not available');
      if (!journalEntry.trim()) throw new Error('Journal entry is empty');
      await api.addClientJournalEntry(user.id, journalEntry.trim());
    },
    onSuccess: async () => {
      setJournalEntry('');
      addToast('success', 'Journal entry saved.');
      await queryClient.invalidateQueries({ queryKey: ['clientJournalEntries', user?.id] });
    },
    onError: () => addToast('error', 'Failed to save journal entry.'),
  });

  const nextSession = useMemo(() => {
    return apps
      .filter(
        (appointment) =>
          (appointment.status === 'CONFIRMED' || appointment.status === 'PAID') &&
          new Date(appointment.dateTime).getTime() > Date.now(),
      )
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
  }, [apps]);

  const canJoinSession = useMemo(() => {
    if (!nextSession?.meetingLink) return false;
    const now = Date.now();
    const start = new Date(nextSession.dateTime).getTime();
    const openAt = start - 10 * 60 * 1000;
    const closeAt = start + (nextSession.durationMinutes || 60) * 60 * 1000;
    return now >= openAt && now <= closeAt;
  }, [nextSession]);

  const wellnessLog = profile?.wellnessLog || [];

  const moodData = useMemo(
    () =>
      wellnessLog.slice(-7).map((entry) => ({
        label: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: entry.mood * 10,
      })),
    [wellnessLog],
  );

  const energyData = useMemo(
    () =>
      wellnessLog.slice(-7).map((entry) => ({
        label: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: entry.energy * 10,
      })),
    [wellnessLog],
  );

  const habitChartData = useMemo(
    () =>
      (profile?.habits || []).map((habit: Habit) => ({
        label: habit.name,
        value: Math.min(100, Math.round((habit.current / Math.max(1, habit.target)) * 100)),
        color: habit.color,
      })),
    [profile],
  );

  const handleJoinSession = () => {
    if (!nextSession) return;
    if (!nextSession.meetingLink) {
      addToast('info', 'Meeting link will appear once your provider adds it.');
      return;
    }
    if (!canJoinSession) {
      addToast('info', 'Secure room opens 10 minutes before your session.');
      return;
    }
    window.open(nextSession.meetingLink, '_blank', 'noopener,noreferrer');
  };

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingDocument(true);
    try {
      const uploadedUrl = await storageService.uploadFile(
        file,
        `client-documents/${user.id}/${Date.now()}-${file.name}`,
      );

      const nextDocuments = [
        ...(profile?.documents || []),
        {
          type: file.type || 'DOCUMENT',
          url: uploadedUrl,
          uploadedAt: new Date().toISOString(),
        },
      ];

      await api.updateClientProfile(user.id, {
        ...(profile || {}),
        documents: nextDocuments,
      });

      addToast('success', 'Document uploaded.');
      await queryClient.invalidateQueries({ queryKey: ['clientProfile', user.id] });
    } catch {
      addToast('error', 'Failed to upload document.');
    } finally {
      setIsUploadingDocument(false);
      event.target.value = '';
    }
  };

  if (!user) return null;

  return (
    <ClientDashboardLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Overview</h1>
              <p className="text-slate-500 mt-2">
                Welcome back, {user.firstName}. Here&rsquo;s your clinical summary.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-widest text-[11px] text-slate-400">
                  Next Clinical Session
                </h2>
                {nextSession ? (
                  <div className="bg-brand-50 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {new Date(nextSession.dateTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-brand-600 font-bold uppercase tracking-widest mt-1">
                        {nextSession.status} • {nextSession.type || 'Session'}
                      </p>
                    </div>
                    <button
                      onClick={handleJoinSession}
                      className={`px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                        canJoinSession
                          ? 'bg-brand-600 text-white shadow-brand-600/20 hover:bg-brand-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      Join Secure Room
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 italic mb-4">No upcoming clinical sessions found.</p>
                    <button
                      onClick={() => navigate('#/search')}
                      className="px-6 py-2 bg-white text-brand-600 border border-brand-100 rounded-xl text-xs font-bold hover:bg-brand-50"
                    >
                      Find a Specialist
                    </button>
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                    Recent Mood Trend
                  </h3>
                  {moodData.length > 0 ? (
                    <BarChart data={moodData} />
                  ) : (
                    <p className="text-xs text-slate-400 italic py-10 text-center">
                      Start logging wellness to see trends.
                    </p>
                  )}
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                    Habit Completion
                  </h3>
                  <div className="flex items-center justify-center py-4">
                    {habitChartData.length > 0 ? (
                      <DonutChart data={habitChartData} />
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center">No habits tracked yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
                <h3 className="text-lg font-bold">Quick Log</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Keep your provider updated on your daily well-being between sessions.
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <select
                    value={wellnessMood}
                    onChange={(event) => setWellnessMood(Number(event.target.value))}
                    className="bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value} className="text-slate-900">
                        Mood {value}
                      </option>
                    ))}
                  </select>
                  <select
                    value={wellnessEnergy}
                    onChange={(event) => setWellnessEnergy(Number(event.target.value))}
                    className="bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value} className="text-slate-900">
                        Energy {value}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={14}
                    step={0.5}
                    value={wellnessSleepHours}
                    onChange={(event) => setWellnessSleepHours(Number(event.target.value))}
                    className="bg-white/10 border border-white/20 rounded-lg px-2 py-2 text-white"
                    placeholder="Sleep"
                  />
                </div>
                <textarea
                  value={wellnessNotes}
                  onChange={(event) => setWellnessNotes(event.target.value)}
                  className="w-full h-20 rounded-lg px-3 py-2 text-xs bg-white/10 border border-white/20 text-white placeholder:text-slate-300 outline-none"
                  placeholder="Optional notes..."
                />
                <button
                  onClick={() => logWellnessMutation.mutate()}
                  disabled={logWellnessMutation.isPending}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60"
                >
                  {logWellnessMutation.isPending ? 'Saving...' : "Log Today's Status"}
                </button>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 text-center">
                  My Care Team
                </h3>
                <div className="space-y-4">
                  {careTeam.length > 0 ? (
                    careTeam.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => navigate(`#/provider/${provider.id}`)}
                      >
                        <ProfileImage
                          src={provider.imageUrl}
                          alt={`${provider.firstName} ${provider.lastName}`}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Dr. {provider.firstName} {provider.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {provider.professionalTitle}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400 italic">No providers yet.</p>
                      <button
                        onClick={() => navigate('#/search')}
                        className="text-[10px] font-bold text-brand-600 hover:underline mt-2"
                      >
                        Find a Specialist
                      </button>
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
              onClick={() => logWellnessMutation.mutate()}
              disabled={logWellnessMutation.isPending}
              className="bg-brand-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-700 shadow-lg disabled:opacity-60"
            >
              {logWellnessMutation.isPending ? 'Saving...' : "Log Today's Status"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
                Energy Levels (7 Days)
              </h3>
              {energyData.length > 0 ? (
                <BarChart data={energyData} />
              ) : (
                <p className="text-sm italic text-slate-400 text-center py-12">
                  No energy data logged yet.
                </p>
              )}
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-slate-900 mb-8">Overall Progress</h3>
              {habitChartData.length > 0 ? (
                <DonutChart data={habitChartData} />
              ) : (
                <p className="text-slate-400 text-sm italic">No habits tracked yet.</p>
              )}
              <div className="mt-8 space-y-2 w-full">
                {(profile?.habits || []).map((habit: Habit) => (
                  <div key={habit.id} className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">{habit.name}</span>
                    <span style={{ color: habit.color }}>
                      {habit.current}/{habit.target} {habit.unit}
                    </span>
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
              onChange={(event) => setJournalEntry(event.target.value)}
              className="w-full h-40 bg-slate-50 border-none rounded-2xl p-6 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none mb-4"
              placeholder="How are you feeling today? Any breakthroughs or challenges?"
            />
            <div className="flex justify-end">
              <button
                onClick={() => addJournalMutation.mutate()}
                disabled={!journalEntry.trim() || addJournalMutation.isPending}
                className="bg-brand-600 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-700 transition-all disabled:opacity-60"
              >
                {addJournalMutation.isPending ? 'Saving...' : 'Securely Save Entry'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">
              Previous Entries
            </h3>
            {journalEntries.length > 0 ? (
              journalEntries.map((entry) => (
                <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium italic">&quot;{entry.note}&quot;</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 italic">No journal entries yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Clinical Session History</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {apps.length > 0 ? (
              apps.map((appointment: Appointment) => (
                <div key={appointment.id} className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Clinical Session • {appointment.type || 'Standard'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(appointment.dateTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                        appointment.status === 'CONFIRMED' || appointment.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'COMPLETED'
                            ? 'bg-brand-100 text-brand-700'
                            : appointment.status === 'CANCELLED' || appointment.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {appointment.meetingLink && (
                      <div>
                        <button
                          onClick={() => window.open(appointment.meetingLink, '_blank', 'noopener,noreferrer')}
                          className="text-[10px] font-bold text-brand-600 hover:underline uppercase tracking-widest"
                        >
                          Open Meeting Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-slate-400 italic font-medium">
                No sessions scheduled yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'saved' && <ClientSavedProviders />}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm max-w-4xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-xl font-bold text-slate-900">Profile Management</h2>
            {updateProfileMutation.isPending && (
              <span className="text-xs font-bold text-brand-500 animate-pulse uppercase tracking-widest">
                Saving Health Data...
              </span>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateProfileMutation.mutate();
            }}
            className="space-y-10"
          >
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

            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mailing Address</h3>
              <div className="space-y-6">
                <AddressAutocomplete value={editAddress || EMPTY_ADDRESS} onChange={setEditAddress} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                    <input
                      value={editAddress?.city || ''}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State</label>
                    <input
                      value={editAddress?.state || ''}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                    <input
                      value={editAddress?.zip || ''}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Narrative</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Personal Bio / Goals
                </label>
                <textarea
                  value={editBio}
                  onChange={(event) => setEditBio(event.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/10 h-32 resize-none"
                  placeholder="Describe your health goals or anything you want your care team to know."
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] text-slate-400 font-bold max-w-md uppercase tracking-tight">
                Your data is encrypted and only shared with specialists you explicitly book with.
              </p>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-10 py-4 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-brand-600/20 disabled:opacity-50 transition-all hover:bg-brand-700"
              >
                Update Health Portal
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'support' && <ClientSupportTab user={user} />}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">My Documents</h3>
              <p className="text-slate-500 text-sm">
                Access your shared lab results, treatment plans, and intake forms.
              </p>
            </div>
            <button
              onClick={() => documentInputRef.current?.click()}
              disabled={isUploadingDocument}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-60"
            >
              {isUploadingDocument ? 'Uploading...' : 'Upload New'}
            </button>
            <input
              ref={documentInputRef}
              type="file"
              className="hidden"
              onChange={handleUploadDocument}
            />
          </div>

          {!profile?.documents || profile.documents.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 italic">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.documents.map((document, index) => (
                <a
                  key={`${document.url}-${index}`}
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 border border-slate-200 rounded-xl hover:border-brand-300 transition-all"
                >
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    {document.type || 'DOCUMENT'}
                  </p>
                  <p className="text-sm text-slate-900 mt-1 break-all">{document.url.slice(0, 80)}...</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Uploaded {new Date(document.uploadedAt).toLocaleString()}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </ClientDashboardLayout>
  );
};

export default ClientDashboard;
