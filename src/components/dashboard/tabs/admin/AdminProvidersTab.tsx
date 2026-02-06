import React, { useState, useEffect } from 'react';
import { User, ProviderProfile, ModerationStatus } from '../../../../types';
import { adminService } from '../../../../services/admin';
import Pagination from '../../../ui/Pagination';
import { api } from '../../../../services/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../../../ui/Skeleton';

interface AdminProvidersTabProps {
  // Removing passed props as we load internally
  onSelectProvider: (provider: ProviderProfile, user?: User) => void;
}

const AdminProvidersTab: React.FC<AdminProvidersTabProps> = ({ onSelectProvider }) => {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminProviders', page, filterStatus],
    queryFn: () => adminService.getProviders(page, 20, filterStatus)
  });

  const providers = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleModerate = async (id: string, status: ModerationStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (status === ModerationStatus.APPROVED) {
        await adminService.approveProvider(id);
      } else if (status === ModerationStatus.REJECTED) {
        await adminService.rejectProvider(id);
      } else {
        await api.moderateProvider(id, status);
      }
      refetch(); // Refresh
    } catch (e) {
      alert("Action failed");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 flex flex-col">
       
       {/* Filters */}
       <div className="p-6 border-b border-slate-100 flex gap-2 bg-slate-50/50 overflow-x-auto">
          {['', 'APPROVED', 'PENDING', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === status 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {status || 'All Status'}
            </button>
          ))}
       </div>

       <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vetting Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  // Skeleton Rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-6"><div className="flex items-center gap-4"><Skeleton className="w-10 h-10 rounded-full" /><div><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-20" /></div></div></td>
                      <td className="px-8 py-6"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-8 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : providers.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No providers found.</td></tr>
                ) : (
                  providers.map(p => {
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onSelectProvider(p)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                              <img src={p.imageUrl} className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all bg-slate-100" alt="" />
                              <div>
                                <span className="text-sm font-black text-slate-800 block">Dr. {p.lastName || 'Unknown'}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{p.professionalTitle}</span>
                              </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-mono">{p.email}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            p.moderationStatus === ModerationStatus.APPROVED ? 'bg-green-100 text-green-700' : 
                            p.moderationStatus === ModerationStatus.REJECTED ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {p.moderationStatus}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          {p.moderationStatus === ModerationStatus.PENDING && (
                            <>
                              <button onClick={(e) => handleModerate(p.id, ModerationStatus.APPROVED, e)} className="text-green-600 font-black text-[10px] uppercase tracking-widest hover:underline bg-green-50 px-2 py-1 rounded">Approve</button>
                              <button onClick={(e) => handleModerate(p.id, ModerationStatus.REJECTED, e)} className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline bg-red-50 px-2 py-1 rounded">Reject</button>
                            </>
                          )}
                          <span className="text-blue-500 font-black text-[10px] uppercase tracking-widest hover:underline">Details</span>
                        </td>
                      </tr>
                    );
                  })
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

export default AdminProvidersTab;
