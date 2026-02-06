
import React from 'react';
import { User, ProviderProfile } from '../../../../types';

interface AdminUsersTabProps {
  users: User[];
  providers: ProviderProfile[];
  onSelectUser: (user: User, provider?: ProviderProfile) => void;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ users, providers, onSelectUser }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <table className="w-full text-left">
         <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
         </thead>
         <tbody className="divide-y divide-slate-100">
            {users.filter(u => u && u.id).map(u => (
               <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                     <p className="text-sm font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                     <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'PROVIDER' ? 'bg-brand-100 text-brand-700' :
                        'bg-slate-100 text-slate-600'
                     }`}>{u.role}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <button onClick={() => onSelectUser(u, providers.find(p => p.userId === u.id))} className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:underline">Manage</button>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
    </div>
  );
};

export default AdminUsersTab;
