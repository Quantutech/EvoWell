import React, { useState } from 'react';
import { User, UserRole } from '../../../types';

interface AdminDataTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onBulkAction: (ids: string[], action: string) => void;
}

export const ImprovedAdminTable: React.FC<AdminDataTableProps> = ({ 
  data, onEdit, onDelete, onBulkAction 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(u => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/30">
        <div className="flex gap-4 items-center">
          <div className="relative">
             <input 
               type="text" 
               placeholder="Search..." 
               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none w-64"
               value={filters.search}
               onChange={e => setFilters({...filters, search: e.target.value})}
             />
             <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
            value={filters.role}
            onChange={e => setFilters({...filters, role: e.target.value})}
          >
            <option value="">All Roles</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.PROVIDER}>Provider</option>
            <option value={UserRole.CLIENT}>Client</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
            <span className="text-[10px] font-black text-slate-400 uppercase mr-2 flex items-center">{selectedIds.length} Selected</span>
            <button 
              onClick={() => onBulkAction(selectedIds, 'delete')}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
            >
              Bulk Delete
            </button>
            <button 
              onClick={() => onBulkAction(selectedIds, 'export')}
              className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 transition-colors"
            >
              Export CSV
            </button>
          </div>
        )}
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 w-10">
              <input type="checkbox" checked={selectedIds.length === data.length && data.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map(user => (
            <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(user.id) ? 'bg-brand-50/30' : ''}`}>
              <td className="px-6 py-4">
                <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                    {user.firstName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                  user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                  user.role === UserRole.PROVIDER ? 'bg-brand-100 text-brand-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase">Active</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <button onClick={() => onEdit(user)} className="text-blue-500 hover:text-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => onDelete(user.id)} className="text-red-400 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Footer */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {data.length} of 1,240 users</p>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors">Next</button>
         </div>
      </div>
    </div>
  );
};
