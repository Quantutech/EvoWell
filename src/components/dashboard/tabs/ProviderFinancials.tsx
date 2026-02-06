import React, { useState } from 'react';
import { SettingInput } from '@/components/dashboard/DashboardComponents';
import { ProviderProfile, ServicePackage } from '@/types';

interface ProviderFinancialsProps {
  editForm: ProviderProfile;
  updateField: (path: string, value: any) => void;
  handleSaveProfile: () => Promise<void>;
}

const ProviderFinancials: React.FC<ProviderFinancialsProps> = ({ editForm, updateField, handleSaveProfile }) => {
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({});
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.priceCents) return;
    const pkg: ServicePackage = {
      id: `pkg-${Date.now()}`,
      providerId: editForm.id,
      name: newPackage.name,
      description: newPackage.description || '',
      priceCents: Number(newPackage.priceCents),
      durationMinutes: Number(newPackage.durationMinutes) || 60,
      sessionsIncluded: Number(newPackage.sessionsIncluded) || 1,
      isActive: true
    };
    const current = editForm?.servicePackages || [];
    updateField('servicePackages', [...current, pkg]);
    setNewPackage({});
    setIsPackageModalOpen(false);
    handleSaveProfile(); 
  };

  const handleDeletePackage = (id: string) => {
    const current = editForm?.servicePackages || [];
    updateField('servicePackages', current.filter(p => p.id !== id));
    handleSaveProfile();
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stripe Connect Card */}
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2">Payments Infrastructure</h3>
                  <p className="text-sm text-slate-400 mb-6">Powered by Stripe Connect</p>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full ${editForm.businessInfo?.stripeStatus === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span className="text-sm font-bold uppercase tracking-widest">{editForm.businessInfo?.stripeStatus === 'active' ? 'Active & Payouts Ready' : 'Setup Incomplete'}</span>
                  </div>
                  <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100">Manage Stripe Account</button>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/20 rounded-full blur-[60px]"></div>
            </div>

            {/* Invoices Summary */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-900">Recent Invoices</h3>
                  <button className="text-brand-600 font-bold text-xs uppercase tracking-widest">+ Create Invoice</button>
              </div>
              <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-700">
                    <tr className="border-b border-slate-50"><td className="py-4">Marcus S.</td><td>$150.00</td><td className="text-green-500">Paid</td><td className="text-right text-slate-400">Oct 24</td></tr>
                    <tr className="border-b border-slate-50"><td className="py-4">Sarah J.</td><td>$120.00</td><td className="text-amber-500">Pending</td><td className="text-right text-slate-400">Oct 22</td></tr>
                  </tbody>
              </table>
            </div>
        </div>

        {/* Service Packages */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                  <h3 className="text-xl font-black text-slate-900">Service Packages</h3>
                  <p className="text-sm text-slate-500">Bundle sessions or create digital product offerings.</p>
              </div>
              <button onClick={() => setIsPackageModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800">+ New Package</button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(editForm.servicePackages || []).map((pkg) => (
                  <div key={pkg.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 relative group">
                    <button onClick={() => handleDeletePackage(pkg.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    <h4 className="text-lg font-black text-slate-900 mb-1">{pkg.name}</h4>
                    <p className="text-2xl font-black text-brand-600 mb-4">${pkg.priceCents / 100}</p>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center gap-2">
                        <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-200">{pkg.sessionsIncluded} Sessions</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{pkg.isActive ? 'Active' : 'Archived'}</span>
                    </div>
                  </div>
              ))}
              {(editForm.servicePackages || []).length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 italic font-medium">No packages created yet.</div>
              )}
            </div>
        </div>
      </div>

      {/* Package Creation Modal */}
      {isPackageModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
               <h3 className="text-xl font-black text-slate-900 mb-6">Create Service Package</h3>
               <div className="space-y-4">
                  <SettingInput label="Package Name" value={newPackage.name} onChange={(v: string) => setNewPackage({...newPackage, name: v})} placeholder="e.g. Anxiety Relief Bundle" />
                  <div className="grid grid-cols-2 gap-4">
                     <SettingInput label="Price (Cents)" value={newPackage.priceCents} onChange={(v: string) => setNewPackage({...newPackage, priceCents: Number(v)})} />
                     <SettingInput label="Sessions Included" value={newPackage.sessionsIncluded} onChange={(v: string) => setNewPackage({...newPackage, sessionsIncluded: Number(v)})} />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                     <textarea rows={3} value={newPackage.description} onChange={e => setNewPackage({...newPackage, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none resize-none" placeholder="What's included?" />
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setIsPackageModalOpen(false)} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                     <button onClick={handleAddPackage} className="flex-1 py-3 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600">Create</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default ProviderFinancials;