import React, { useEffect, useMemo, useState } from 'react';
import ProviderSchedule from './ProviderSchedule';
import { Appointment, Availability, UserRole, AppointmentStatus } from '@/types';
import AppointmentCard from '@/components/booking/AppointmentCard';
import { api } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/App';

interface ProviderPatientsProps {
  appointments: Appointment[];
  availability: Availability;
  onUpdateAvailability: (val: Availability) => void;
  onSave: () => void;
  onRefresh?: () => void;
}

interface RegistryClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  sessionCount: number;
  latestSessionAt?: string;
}

const ProviderPatients: React.FC<ProviderPatientsProps> = ({ appointments, onRefresh }) => {
  const { addToast } = useToast();
  const { provider } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'schedule' | 'registry'>('requests');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [registrySearch, setRegistrySearch] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('ALL');
  const [clientNote, setClientNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const providerId = provider?.id || appointments[0]?.providerId;

  const requests = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === AppointmentStatus.PENDING &&
          (requestTypeFilter === 'ALL' || appointment.type === requestTypeFilter),
      ),
    [appointments, requestTypeFilter],
  );

  const registryClients = useMemo<RegistryClient[]>(() => {
    const byClient = new Map<string, RegistryClient>();

    for (const appointment of appointments) {
      const existing = byClient.get(appointment.clientId);
      const latest =
        !existing ||
        !existing.latestSessionAt ||
        new Date(appointment.dateTime).getTime() > new Date(existing.latestSessionAt).getTime();

      if (!existing) {
        byClient.set(appointment.clientId, {
          id: appointment.clientId,
          firstName: appointment.client?.firstName || 'Unknown',
          lastName: appointment.client?.lastName || 'Client',
          email: appointment.client?.email || `user-${appointment.clientId}`,
          sessionCount: 1,
          latestSessionAt: appointment.dateTime,
        });
      } else {
        existing.sessionCount += 1;
        if (latest) {
          existing.latestSessionAt = appointment.dateTime;
        }
      }
    }

    return Array.from(byClient.values()).sort((a, b) =>
      (b.latestSessionAt || '').localeCompare(a.latestSessionAt || ''),
    );
  }, [appointments]);

  const filteredClients = useMemo(() => {
    const q = registrySearch.trim().toLowerCase();
    if (!q) return registryClients;

    return registryClients.filter((client) => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      return fullName.includes(q) || client.email.toLowerCase().includes(q);
    });
  }, [registryClients, registrySearch]);

  const selectedClient = useMemo(
    () => registryClients.find((client) => client.id === selectedClientId) || null,
    [registryClients, selectedClientId],
  );

  const selectedClientAppointments = useMemo(
    () =>
      selectedClientId
        ? appointments
            .filter((appointment) => appointment.clientId === selectedClientId)
            .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
        : [],
    [appointments, selectedClientId],
  );

  useEffect(() => {
    if (!selectedClientId || !providerId) {
      setClientNote('');
      return;
    }

    api
      .getProviderClientNote(providerId, selectedClientId)
      .then((note) => setClientNote(note || ''))
      .catch(() => setClientNote(''));
  }, [selectedClientId, providerId]);

  const saveClientNote = async () => {
    if (!providerId || !selectedClientId) return;

    setSavingNote(true);
    try {
      await api.upsertProviderClientNote(providerId, selectedClientId, clientNote.trim());
      addToast('success', 'Clinical note saved.');
    } catch {
      addToast('error', 'Failed to save clinical note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (selectedClient && selectedClientId) {
    const completedSessions = selectedClientAppointments.filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETED,
    ).length;
    const upcomingSessions = selectedClientAppointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.CONFIRMED &&
        new Date(appointment.dateTime).getTime() > Date.now(),
    ).length;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <button
          onClick={() => setSelectedClientId(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest"
        >
          ← Back to Registry
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sessions</p>
            <p className="text-2xl font-black text-slate-900">{selectedClientAppointments.length}</p>
          </div>
          <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-brand-600">{completedSessions}</p>
          </div>
          <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming</p>
            <p className="text-2xl font-black text-blue-600">{upcomingSessions}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {selectedClient.firstName} {selectedClient.lastName}
            </h2>
            <p className="text-slate-500">{selectedClient.email}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Clinical Notes
            </label>
            <textarea
              value={clientNote}
              onChange={(event) => setClientNote(event.target.value)}
              className="w-full h-36 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Private note for this client..."
            />
            <div className="flex justify-end">
              <button
                onClick={saveClientNote}
                disabled={savingNote}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand-700 disabled:opacity-60"
              >
                Save Note
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 mb-4">Appointment History</h3>
            {selectedClientAppointments.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No appointment history.</p>
            ) : (
              <div className="space-y-3">
                {selectedClientAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    role={UserRole.PROVIDER}
                    onRefresh={onRefresh || (() => {})}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeSubTab === 'requests' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
            }`}
          >
            Booking Requests {requests.length > 0 ? `(${requests.length})` : ''}
          </button>
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeSubTab === 'schedule' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
            }`}
          >
            Clinical Schedule
          </button>
          <button
            onClick={() => setActiveSubTab('registry')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeSubTab === 'registry' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
            }`}
          >
            Patient Registry
          </button>
        </div>
      </div>

      {activeSubTab === 'schedule' && (
        <ProviderSchedule apps={appointments} onAppointmentClick={(appointment) => setSelectedClientId(appointment.clientId)} />
      )}

      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Type:</span>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                {['ALL', 'Video', 'In Person', 'Phone', 'Chat'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setRequestTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      requestTypeFilter === type
                        ? 'bg-white shadow-sm text-brand-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {requests.length} Requests Found
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed text-slate-400 font-bold text-xs uppercase tracking-widest">
              No pending requests matching the filter.
            </div>
          ) : (
            requests.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                role={UserRole.PROVIDER}
                onRefresh={onRefresh || (() => {})}
                onClick={(item) => setSelectedClientId(item.clientId)}
              />
            ))
          )}
        </div>
      )}

      {activeSubTab === 'registry' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-center shadow-sm">
            <div className="relative flex-grow">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={registrySearch}
                onChange={(event) => setRegistrySearch(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            {filteredClients.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                {registrySearch ? `No results for "${registrySearch}"` : 'No clients found.'}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Name</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sessions</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Registry Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <td className="px-8 py-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        {client.firstName} {client.lastName}
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-medium">{client.email}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-700">{client.sessionCount}</td>
                      <td className="px-8 py-4 text-right">
                        <span className="text-brand-600 text-xs font-bold hover:underline">View Record</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderPatients;
