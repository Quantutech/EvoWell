import React, { useState, useMemo } from 'react';
import ProviderSchedule from './ProviderSchedule';
import { Appointment, Availability, UserRole, AppointmentType } from '@/types';
import AppointmentCard from '@/components/booking/AppointmentCard';

interface ProviderPatientsProps {
  appointments: Appointment[];
  availability: Availability;
  onUpdateAvailability: (val: Availability) => void;
  onSave: () => void;
}

const ProviderPatients: React.FC<ProviderPatientsProps> = ({ appointments, availability, onUpdateAvailability, onSave }) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'schedule' | 'registry'>('requests');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [externalClients, setExternalClients] = useState<any[]>([]);
  const [registrySearch, setRegistrySearch] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('ALL');
  
  // Filtered requests
  const requests = appointments.filter(a => 
    a.status === 'PENDING' && 
    (requestTypeFilter === 'ALL' || a.type === requestTypeFilter)
  );

  // Derive unique clients list from appointments
  const derivedClients = useMemo(() => {
      const clientMap = new Map();
      appointments.forEach(appt => {
          if (appt.client && !clientMap.has(appt.clientId)) {
              clientMap.set(appt.clientId, { ...appt.client, id: appt.clientId });
          }
      });
      return Array.from(clientMap.values());
  }, [appointments]);

  // Extended Mock Clients for Demo
  const MOCK_DEMO_CLIENTS = [
      { id: 'mock-c1', firstName: 'Emma', lastName: 'Thompson', email: 'emma.t@example.com', timezone: 'PST', initialNote: 'Struggling with work-life balance. Interested in mindfulness.' },
      { id: 'mock-c2', firstName: 'Liam', lastName: 'Rodriguez', email: 'liam.r@example.com', timezone: 'EST', initialNote: 'Referred by Dr. Smith for anxiety management.' },
      { id: 'mock-c3', firstName: 'Sophia', lastName: 'Patel', email: 'sophia.p@example.com', timezone: 'CST', initialNote: 'Focus on nutritional planning for marathon training.' },
      { id: 'mock-c4', firstName: 'Noah', lastName: 'Kim', email: 'noah.k@example.com', timezone: 'PST', initialNote: 'Returning client. Review previous CBT homework.' },
  ];

  // Merge derived, mock, and external
  const allClients = [...derivedClients, ...MOCK_DEMO_CLIENTS, ...externalClients].filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i);

  // Filtered clients for registry
  const filteredClients = allClients.filter(c => 
    c.firstName.toLowerCase().includes(registrySearch.toLowerCase()) || 
    c.lastName.toLowerCase().includes(registrySearch.toLowerCase()) ||
    c.email.toLowerCase().includes(registrySearch.toLowerCase())
  );

  if (selectedClient) {
      const client = allClients.find(c => c.id === selectedClient);
      const clientAppointments = appointments.filter(a => a.clientId === selectedClient);
      
      return (
          <ClientDetailView 
            client={client}
            appointments={clientAppointments}
            onBack={() => setSelectedClient(null)} 
          />
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
       <div className="flex justify-between items-center flex-wrap gap-4">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setActiveSubTab('requests')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === 'requests' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Booking Requests {requests.length > 0 && `(${requests.length})`}</button>
              <button onClick={() => setActiveSubTab('schedule')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === 'schedule' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Clinical Schedule</button>
              <button onClick={() => setActiveSubTab('registry')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeSubTab === 'registry' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Patient Registry</button>
           </div>
           <button 
              onClick={() => setShowAddClient(true)}
              className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg"
           >
              + Add Client
           </button>
       </div>

       {showAddClient && (
          <AddClientModal 
             onClose={() => setShowAddClient(false)} 
             onSave={(newClient) => {
                 setExternalClients([...externalClients, { ...newClient, id: `ext-${Date.now()}` }]);
                 setShowAddClient(false);
             }}
          />
       )}

       {activeSubTab === 'registry' && (
          <div className="space-y-4">
             {/* Registry Controls */}
             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-center shadow-sm">
                <div className="relative flex-grow">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </span>
                   <input 
                      type="text"
                      placeholder="Search patients by name or email..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                   />
                </div>
                <div className="hidden md:flex gap-2">
                   <button className="px-3 py-2 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">All Status</button>
                   <button className="px-3 py-2 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">Sort: Newest</button>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                {filteredClients.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                       {registrySearch ? `No results for "${registrySearch}"` : "No clients found."}
                    </div>
                ) : (
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 border-b border-slate-100">
                           <tr>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Name</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Status</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Registry Action</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {filteredClients.map(c => (
                               <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedClient(c.id)}>
                                   <td className="px-8 py-4 font-bold text-slate-900 flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                                           {c.firstName[0]}{c.lastName[0]}
                                       </div>
                                       {c.firstName} {c.lastName}
                                   </td>
                                <td className="px-8 py-4 text-sm text-slate-500 font-medium">{c.email}</td>
                                <td className="px-8 py-4">
                                   <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                      allClients.indexOf(c) % 3 === 0 ? 'bg-green-100 text-green-700' : 
                                      allClients.indexOf(c) % 3 === 1 ? 'bg-blue-100 text-blue-700' : 
                                      'bg-slate-100 text-slate-500'
                                   }`}>
                                      {allClients.indexOf(c) % 3 === 0 ? 'Active' : 
                                       allClients.indexOf(c) % 3 === 1 ? 'Follow-up' : 'Inactive'}
                                   </span>
                                </td>
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

       {activeSubTab === 'schedule' && (
          <ProviderSchedule 
            apps={appointments} 
            onAppointmentClick={(appt) => setSelectedClient(appt.clientId)}
          />
       )}

       {activeSubTab === 'requests' && (
          <div className="space-y-4">
             {/* Request Controls */}
             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Type:</span>
                   <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                      {['ALL', 'Video', 'In Person', 'Phone'].map(type => (
                         <button 
                           key={type}
                           onClick={() => setRequestTypeFilter(type)}
                           className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${requestTypeFilter === type ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
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
                requests.map(appt => (
                   <AppointmentCard 
                      key={appt.id} 
                      appointment={appt} 
                      role={UserRole.PROVIDER}
                      onRefresh={() => window.location.reload()} 
                      onClick={(a) => setSelectedClient(a.clientId)}
                   />
                ))
             )}
          </div>
       )}
    </div>
  );
};

const AddClientModal = ({ onClose, onSave }: { onClose: () => void, onSave: (client: any) => void }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                <h3 className="text-xl font-black text-slate-900 mb-6">Add New Client</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <input 
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20"
                            placeholder="Jane"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input 
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20"
                            placeholder="Doe"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20"
                            placeholder="jane@example.com"
                        />
                    </div>
                    <div className="flex gap-3 mt-8">
                        <button onClick={onClose} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
                        <button 
                            onClick={() => {
                                if (firstName && lastName && email) {
                                    onSave({ firstName, lastName, email });
                                }
                            }}
                            className="flex-1 bg-brand-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-700 shadow-lg"
                        >
                            Save Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientDetailView = ({ client, appointments, onBack }: { client: any, appointments: Appointment[], onBack: () => void }) => {
    const [note, setNote] = useState(client?.initialNote || 'Patient shows good progress. Continue with CBT module 3.');
    const [isEditingNote, setIsEditingNote] = useState(false);
    
    // Metrics
    const completedSessions = appointments.filter(a => a.status === 'COMPLETED').length;
    const upcomingSessions = appointments.filter(a => a.status === 'CONFIRMED' && new Date(a.dateTime) > new Date()).length;
    const nextSession = appointments
        .filter(a => a.status === 'CONFIRMED' && new Date(a.dateTime) > new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

    const handleSaveNote = () => {
        setIsEditingNote(false);
        // In real app, save to backend
        alert("Note saved!"); 
    };

    if (!client) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">
                ← Back to Directory
            </button>

            {/* Metrics Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sessions</p>
                    <p className="text-2xl font-black text-slate-900">{completedSessions}</p>
                </div>
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upcoming</p>
                    <p className="text-2xl font-black text-brand-600">{upcomingSessions}</p>
                </div>
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Appointment</p>
                    <p className="text-lg font-bold text-slate-900">
                        {nextSession ? new Date(nextSession.dateTime).toLocaleDateString() : 'None scheduled'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8">
                {/* Sidebar Profile */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-brand-50 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-brand-600">
                            {client.firstName[0]}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{client.firstName} {client.lastName}</h2>
                        <p className="text-slate-500">{client.email}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Details</p>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Status</span> <span className="font-bold text-green-600">Active</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Since</span> <span className="font-bold text-slate-900">2023</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Timezone</span> <span className="font-bold text-slate-900">{client.timezone || 'UTC'}</span></div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Goals</p>
                        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                            <li>Manage anxiety</li>
                            <li>Improve sleep schedule</li>
                        </ul>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Clinical Notes */}
                    <div className="bg-yellow-50/50 p-6 rounded-[1.5rem] border border-yellow-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                               <h3 className="text-lg font-black text-slate-900">Clinical Notes</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Private notes only visible to you</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                               {isEditingNote && (
                                  <div className="flex gap-1 mr-2 border-r border-slate-200 pr-2">
                                     <button 
                                       onClick={() => setNote(`SUBJECTIVE: \n\nOBJECTIVE: \n\nASSESSMENT: \n\nPLAN: `)}
                                       className="text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                     >
                                       SOAP Template
                                     </button>
                                     <button 
                                       onClick={() => setNote(`CHIEF COMPLAINT: \n\nHISTORY: \n\nMENTAL STATUS EXAM: \n\nDIAGNOSIS: \n\nRECOMMENDATIONS: `)}
                                       className="text-[9px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                     >
                                       Intake Template
                                     </button>
                                  </div>
                               )}
                               {!isEditingNote ? (
                                   <button 
                                       onClick={() => setIsEditingNote(true)}
                                       className="flex-1 md:flex-none text-xs font-bold text-slate-500 hover:text-brand-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all"
                                   >
                                       Edit Notes
                                   </button>
                               ) : (
                                   <div className="flex gap-2 flex-1 md:flex-none">
                                       <button 
                                           onClick={() => setIsEditingNote(false)}
                                           className="flex-1 md:flex-none text-xs font-bold text-slate-500 hover:text-slate-700 bg-white px-3 py-1.5"
                                       >
                                           Cancel
                                       </button>
                                       <button 
                                           onClick={handleSaveNote}
                                           className="flex-1 md:flex-none text-xs font-bold text-white bg-brand-600 px-4 py-1.5 rounded-lg hover:bg-brand-700 shadow-sm transition-all"
                                       >
                                           Save Notes
                                       </button>
                                   </div>
                               )}
                            </div>
                        </div>
                        <textarea 
                            className={`w-full h-40 bg-transparent border-0 p-0 text-sm text-slate-700 outline-none resize-none leading-relaxed ${!isEditingNote ? 'cursor-default' : ''}`}
                            placeholder="Type private session notes here..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            readOnly={!isEditingNote}
                        />
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="text-lg font-black text-slate-900 mb-4">Appointment History</h3>
                        {appointments.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">No appointment history.</p>
                        ) : (
                            <div className="space-y-3">
                                {appointments.map(appt => (
                                    <div key={appt.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{new Date(appt.dateTime).toLocaleDateString()} at {new Date(appt.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            <p className="text-xs text-slate-500">{appt.durationMinutes} min • {appt.status}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderPatients;
