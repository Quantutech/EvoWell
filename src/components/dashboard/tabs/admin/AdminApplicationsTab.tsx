import React, { useState, useEffect } from 'react';
import { ProviderProfile, ModerationStatus } from '../../../../types';
import { api } from '../../../../services/api';
import { useToast } from '../../../../contexts/ToastContext';

const AdminApplicationsTab: React.FC = () => {
  const [applications, setApplications] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ProviderProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // CHANGE: Fetch providers with PENDING status instead of separate applications
      const allProviders = await api.getAllProviders();
      const pendingProviders = allProviders.filter(p => p.moderationStatus === ModerationStatus.PENDING);
      setApplications(pendingProviders);
    } catch (e) {
      console.error("Failed to load applications", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    if (!window.confirm("Approve this provider? This will make their profile visible to the public.")) return;
    try {
      await api.moderateProvider(appId, ModerationStatus.APPROVED);
      addToast('success', 'Provider approved and published.');
      fetchApplications();
      setSelectedApp(null);
    } catch (e) {
      addToast('error', "Failed to approve provider.");
    }
  };

  const handleReject = async (appId: string) => {
    if (!rejectReason) return alert("Please provide a reason for rejection.");
    try {
      await api.moderateProvider(appId, ModerationStatus.REJECTED);
      addToast('info', 'Provider rejected.');
      fetchApplications();
      setSelectedApp(null);
      setRejectReason('');
    } catch (e) {
      addToast('error', "Failed to reject provider.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-xl font-black text-slate-900">Provider Applications</h3>
           <p className="text-slate-500 text-xs mt-1">Review pending provider profiles waiting for approval.</p>
        </div>

        <div className="overflow-x-auto">
           {loading ? (
             <div className="p-12 text-center text-slate-400 animate-pulse font-bold text-xs uppercase tracking-widest">Loading Applications...</div>
           ) : applications.length === 0 ? (
             <div className="p-12 text-center text-slate-400 italic">No pending provider applications.</div>
           ) : (
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <tr>
                   <th className="px-6 py-4">Applicant</th>
                   <th className="px-6 py-4">Specialty</th>
                   <th className="px-6 py-4">Documents</th>
                   <th className="px-6 py-4">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {applications.map(app => (
                   <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-bold text-slate-900">
                        {app.firstName} {app.lastName}
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{app.email}</div>
                     </td>
                     <td className="px-6 py-4">
                        {app.professionalTitle}
                        <div className="text-[10px] text-slate-400 mt-0.5">{app.specialties?.slice(0, 1).join(', ')}</div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex gap-2">
                            {app.certificates?.filter(c => c.startsWith('ID_DOC:')).length > 0 && <span title="ID Uploaded" className="cursor-help">🆔</span>}
                            {app.certificates?.filter(c => c.startsWith('LICENSE_DOC:')).length > 0 && <span title="License Uploaded" className="cursor-help">📜</span>}
                            {(!app.certificates || app.certificates.length === 0) && <span className="text-slate-300">-</span>}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setSelectedApp(app)}
                           className="bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 transition-colors border border-brand-200"
                         >
                           Review
                         </button>
                         <button 
                           onClick={() => handleApprove(app.id)}
                           className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-colors border border-green-200"
                         >
                           Approve
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Review Provider</h3>
              
              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-4">
                    <img src={selectedApp.imageUrl} alt={selectedApp.firstName} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicant</p>
                       <p className="font-bold text-slate-900">{selectedApp.firstName} {selectedApp.lastName}</p>
                       <p className="text-xs text-slate-500">{selectedApp.email}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">License Info</p>
                       <p className="font-bold text-slate-900">{selectedApp.licenses?.[0]?.number || 'Not provided'}</p>
                       <p className="text-xs text-slate-500">{selectedApp.licenses?.[0]?.state || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credentials</p>
                       <p className="font-bold text-slate-900">{selectedApp.professionalTitle}</p>
                       <p className="text-xs text-slate-500">NPI: {selectedApp.npi || 'N/A'}</p>
                    </div>
                 </div>
                 
                 {/* Verification Documents */}
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification Documents</p>
                    <div className="flex flex-wrap gap-4">
                        {selectedApp.certificates?.filter(c => c.startsWith('ID_DOC:')).map((c, i) => (
                            <a key={i} href={c.replace('ID_DOC:', '')} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <span>🆔 View ID Document</span>
                            </a>
                        ))}
                        {selectedApp.certificates?.filter(c => c.startsWith('LICENSE_DOC:')).map((c, i) => (
                            <a key={i} href={c.replace('LICENSE_DOC:', '')} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <span>📜 View License</span>
                            </a>
                        ))}
                        {(!selectedApp.certificates || selectedApp.certificates.length === 0) && <p className="text-xs text-slate-400 italic">No verification documents attached.</p>}
                    </div>
                 </div>

                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bio Preview</p>
                    <p className="text-xs text-slate-600 line-clamp-3">{selectedApp.bio || 'No bio provided'}</p>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => handleApprove(selectedApp.id)}
                   className="w-full py-4 bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                 >
                   Approve Provider
                 </button>
                 
                 <div className="relative group">
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-red-500/20 outline-none"
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                    <button 
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={!rejectReason}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-200 disabled:opacity-50 transition-all"
                    >
                      Reject
                    </button>
                 </div>

                 <button onClick={() => setSelectedApp(null)} className="mt-2 text-slate-400 text-xs font-bold hover:text-slate-600 uppercase tracking-widest">Cancel Review</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsTab;