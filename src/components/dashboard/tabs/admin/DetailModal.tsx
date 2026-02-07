import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { providerProfileSchema } from '@/utils/validation-schemas';
import { User, ProviderProfile, ModerationStatus } from '@/types';

interface DetailModalProps {
  user: User;
  provider?: ProviderProfile;
  onClose: () => void;
  onUpdateProvider: (id: string, data: any) => Promise<void>;
  onRefresh: () => void;
  onModerate: (id: string, status: ModerationStatus) => void;
  onDeleteUser: (id: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  user: u,
  provider: p,
  onClose,
  onUpdateProvider,
  onRefresh,
  onModerate,
  onDeleteUser
}) => {
  const [tab, setTab] = useState<'actions' | 'edit'>('actions');

  const { register, handleSubmit, setValue, watch } = useForm<ProviderProfile>({
    resolver: zodResolver(providerProfileSchema) as any,
    defaultValues: p || undefined
  });

  const editForm = watch();

  const updateAddress = (field: string, value: string) => {
    setValue('businessAddress', { ...(editForm.businessAddress || {}), [field]: value } as any);
  };

  const handleSaveDetails = async (data: ProviderProfile) => {
    try {
      await onUpdateProvider(data.id, data);
      alert("Provider details updated.");
      onRefresh();
    } catch (e) {
      alert("Failed to update provider.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900">Manage {u ? u.firstName : 'Provider'}</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setTab('actions')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'actions' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Actions</button>
            {p && <button onClick={() => setTab('edit')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'edit' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>Edit Profile</button>}
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-grow p-1">
          {tab === 'actions' && (
            <div className="space-y-4">
              {p && (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Status</p>
                    <p className={`text-lg font-black ${p.moderationStatus === ModerationStatus.APPROVED ? 'text-green-600' : 'text-amber-600'}`}>{p.moderationStatus}</p>
                  </div>
                  {p.moderationStatus !== ModerationStatus.APPROVED && (
                    <button onClick={() => onModerate(p.id, ModerationStatus.APPROVED)} className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold text-xs uppercase hover:bg-green-200 transition-colors">Approve Provider</button>
                  )}
                  {p.moderationStatus !== ModerationStatus.REJECTED && (
                    <button onClick={() => onModerate(p.id, ModerationStatus.REJECTED)} className="w-full py-3 bg-amber-100 text-amber-700 rounded-xl font-bold text-xs uppercase hover:bg-amber-200 transition-colors">Reject Provider</button>
                  )}
                </>
              )}
              {u && <button onClick={() => { onDeleteUser(u.id); onClose(); }} className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-bold text-xs uppercase hover:bg-red-200 transition-colors">Delete User</button>}
              <button onClick={onClose} className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition-colors">Close</button>
            </div>
          )}

          {tab === 'edit' && editForm && (
            <div className="space-y-6">
              {/* Identity */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Identity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Slug</label>
                    <input {...register('profileSlug')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="dr-name-specialty" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pronouns</label>
                    <input {...register('pronouns')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="They/Them" />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Contact & Web</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                    <input {...register('phoneNumber')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Website</label>
                    <input {...register('website')} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="https://" />
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Business Address</h4>
                <input value={editForm.businessAddress?.street || ''} onChange={e => updateAddress('street', e.target.value)} className="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none mb-2 focus:ring-2 focus:ring-brand-500/20" placeholder="Street Address" />
                <div className="grid grid-cols-3 gap-2">
                  <input value={editForm.businessAddress?.city || ''} onChange={e => updateAddress('city', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="City" />
                  <input value={editForm.businessAddress?.state || ''} onChange={e => updateAddress('state', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="State" />
                  <input value={editForm.businessAddress?.zip || ''} onChange={e => updateAddress('zip', e.target.value)} className="bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Zip" />
                </div>
              </div>

              <button onClick={handleSubmit(handleSaveDetails)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
