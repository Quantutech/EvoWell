import React, { useState } from 'react';
import { UserRole, SubscriptionTier } from '@/types';
import { adminService } from '@/services/admin';
import { Select } from '@/components/ui';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: UserRole.CLIENT,
    subscriptionTier: SubscriptionTier.FREE
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await adminService.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        subscriptionTier: formData.role === UserRole.PROVIDER ? formData.subscriptionTier : undefined
      });
      onSuccess();
      onClose();
      alert('User created successfully (Default password: "password")');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { label: 'Client', value: UserRole.CLIENT },
    { label: 'Provider', value: UserRole.PROVIDER },
    { label: 'Admin (Team Member)', value: UserRole.ADMIN }
  ];

  const tierOptions = [
    { label: 'Free', value: SubscriptionTier.FREE },
    { label: 'Professional', value: SubscriptionTier.PROFESSIONAL },
    { label: 'Premium', value: SubscriptionTier.PREMIUM }
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl flex flex-col zoom-in-95">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-900">Add New User</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
              <input 
                required 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" 
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
              <input 
                required 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" 
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
            <input 
              required 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20" 
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
            <Select 
              options={roleOptions}
              value={formData.role}
              onChange={val => setFormData({...formData, role: val as UserRole})}
              className="w-full"
            />
          </div>

          {formData.role === UserRole.PROVIDER && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Package</label>
              <Select 
                options={tierOptions}
                value={formData.subscriptionTier}
                onChange={val => setFormData({...formData, subscriptionTier: val as SubscriptionTier})}
                className="w-full"
              />
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
