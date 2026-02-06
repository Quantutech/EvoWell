import React, { useState, useEffect } from 'react';
import { User, ClientProfile } from '../../../../types';
import { api } from '../../../../services/api';

const AdminClientsTab: React.FC = () => {
  const [clients, setClients] = useState<(User & { profile?: ClientProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<(User & { profile?: ClientProfile }) | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await api.getAllClients();
      setClients(data);
    } catch (e) {
      console.error("Failed to load clients", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-xl font-black text-slate-900">Registered Clients</h3>
           <p className="text-slate-500 text-xs mt-1">Oversee client accounts and documentation.</p>
        </div>

        <div className="overflow-x-auto">
           {loading ? (
             <div className="p-12 text-center text-slate-400 animate-pulse font-bold text-xs uppercase tracking-widest">Loading Clients...</div>
           ) : clients.length === 0 ? (
             <div className="p-12 text-center text-slate-400 italic">No clients found.</div>
           ) : (
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <tr>
                   <th className="px-6 py-4">Name</th>
                   <th className="px-6 py-4">Email</th>
                   <th className="px-6 py-4">Documents</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {clients.map(client => (
                   <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-bold text-slate-900">{client.firstName} {client.lastName}</td>
                     <td className="px-6 py-4">{client.email}</td>
                     <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                            {client.profile?.documents?.length || 0} Files
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${client.profile?.intakeStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {client.profile?.intakeStatus || 'PENDING'}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                       <button 
                         onClick={() => setSelectedClient(client)}
                         className="text-brand-600 font-bold text-xs hover:underline"
                       >
                         View Details
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>

      {/* Client Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedClient.firstName} {selectedClient.lastName}</h3>
              <p className="text-sm text-slate-500 mb-6">{selectedClient.email}</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Uploaded Documents</p>
                 <div className="space-y-3">
                    {selectedClient.profile?.documents?.length ? (
                        selectedClient.profile.documents.map((doc, i) => (
                            <a key={i} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-all">
                                <span className="text-xl">📄</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{doc.type}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 italic">No documents uploaded.</p>
                    )}
                 </div>
              </div>

              <button onClick={() => setSelectedClient(null)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Close</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientsTab;
