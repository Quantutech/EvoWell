import React, { useState, useEffect } from 'react';
import { User, ProviderProfile, UserRole } from '../../../../types';
import { adminService } from '../../../../services/admin';
import Pagination from '../../../ui/Pagination';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../../../ui/Skeleton';

interface AdminUsersTabProps {
  // Removed static props as we fetch internally now
  onSelectUser: (user: User, provider?: ProviderProfile) => void;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ onSelectUser }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers', page, debouncedSearch],
    queryFn: () => adminService.getUsers(page, 20, debouncedSearch)
  });

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await adminService.deleteUser(id);
      refetch(); // Refresh list
    } catch (e) {
      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (!window.confirm(`Change role for ${user.firstName} to ${newRole}?`)) return;
    try {
      await adminService.updateUserRole(user.id, newRole);
      refetch();
    } catch (e) {
      alert("Failed to update role.");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 flex flex-col">
      {/* Filters */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-black text-slate-900">User Directory</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left whitespace-nowrap">
           <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-5"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-24" /></td>
                    <td className="px-8 py-5"><Skeleton className="h-6 w-16 rounded-lg" /></td>
                    <td className="px-8 py-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-8 py-5 text-right"><div className="flex justify-end gap-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-12" /></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">No users found.</td></tr>
              ) : (
                users.map(u => (
                   <tr key={u.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectUser(u)}>
                      <td className="px-8 py-5">
                         <p className="text-sm font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                         <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                      </td>
                      <td className="px-8 py-5">
                         <div className="relative group/role inline-block" onClick={(e) => e.stopPropagation()}>
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer ${
                              u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                              u.role === UserRole.PROVIDER ? 'bg-brand-100 text-brand-700' :
                              'bg-slate-100 text-slate-600'
                           }`}>
                             {u.role}
                           </span>
                           {/* Quick Role Switcher */}
                           <div className="absolute top-full left-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-xl p-1 hidden group-hover/role:block z-10 w-32">
                              {[UserRole.CLIENT, UserRole.PROVIDER, UserRole.ADMIN].map(role => (
                                <button 
                                  key={role}
                                  onClick={() => handleRoleChange(u, role)}
                                  disabled={u.role === role}
                                  className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 rounded-lg disabled:opacity-50"
                                >
                                  {role}
                                </button>
                              ))}
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 font-medium">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right space-x-2">
                         <button className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:underline">Edit</button>
                         <button onClick={(e) => handleDelete(u.id, e)} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">Delete</button>
                      </td>
                   </tr>
                ))
              )}
           </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminUsersTab;
