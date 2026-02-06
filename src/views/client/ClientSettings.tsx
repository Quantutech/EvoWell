import React, { useState } from 'react';
import { useAuth } from '@/App';
import { api } from '@/services/api';

const ClientSettings: React.FC = () => {
  const { user, login } = useAuth();
  
  // Settings State
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm max-w-2xl animate-in fade-in slide-in-from-bottom-4">
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
  );
};

export default ClientSettings;
