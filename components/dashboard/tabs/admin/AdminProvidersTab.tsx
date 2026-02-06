
import React from 'react';
import { User, ProviderProfile, ModerationStatus } from '../../../../types';

interface AdminProvidersTabProps {
  providers: ProviderProfile[];
  users: User[];
  onSelectProvider: (provider: ProviderProfile, user?: User) => void;
}

const AdminProvidersTab: React.FC<AdminProvidersTabProps> = ({ providers, users, onSelectProvider }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
       <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vetting Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.filter(p => p && p.id).map(p => {
              const u = users.find(usr => usr.id === p.userId);
              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-4">
                        <img src={p.imageUrl} className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <span className="text-sm font-black text-slate-800">Dr. {p.id.split('-')[1].toUpperCase()}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">{u?.email}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.moderationStatus === ModerationStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.moderationStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button onClick={() => onSelectProvider(p, u)} className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:underline">Manage</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
       </table>
    </div>
  );
};

export default AdminProvidersTab;
