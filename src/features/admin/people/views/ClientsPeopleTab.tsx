import React, { useMemo, useState } from 'react';
import { AdminClientRecord } from '@/services/admin';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminTableLayout } from '@/components/dashboard/tabs/admin/AdminTableLayout';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAdminClients } from '../hooks/useAdminClients';

const PAGE_SIZE = 20;

export const ClientsPeopleTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedClient, setSelectedClient] = useState<AdminClientRecord | null>(null);

  const search = useDebouncedValue(searchInput, 300);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      intakeStatus: intakeFilter,
    }),
    [page, search, intakeFilter],
  );

  const { data, isLoading } = useAdminClients(params);

  const clients = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const header = (
    <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900">Clients</h3>
        <p className="text-xs text-slate-500">Client intake, documentation visibility, and account oversight.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search client..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={intakeFilter}
          onChange={(e) => {
            setIntakeFilter(e.target.value as 'ALL' | 'PENDING' | 'COMPLETED');
            setPage(1);
          }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest"
        >
          <option value="ALL">All Intake</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <AdminTableLayout
        header={header}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
      >
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intake</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-36 mb-2" /><Skeleton className="h-3 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No clients found.</td>
              </tr>
            ) : (
              clients.map((client) => {
                const documentCount = client.profile?.documents?.length || 0;
                const intakeStatus = client.profile?.intakeStatus || 'PENDING';

                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-slate-500 font-mono">{client.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        intakeStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {intakeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{documentCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        client.isDeleted ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {client.isDeleted ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-brand-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableLayout>

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {selectedClient.firstName} {selectedClient.lastName}
            </h3>
            <p className="text-sm text-slate-500 mb-6">{selectedClient.email}</p>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Intake Status</p>
                <p className="text-sm font-bold text-slate-900">{selectedClient.profile?.intakeStatus || 'PENDING'}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Documents</p>
                {selectedClient.profile?.documents?.length ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {selectedClient.profile.documents.map((document, index) => (
                      <a
                        key={`${document.url}-${index}`}
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 transition-all"
                      >
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{document.type}</p>
                        <p className="text-[10px] text-slate-500">{new Date(document.uploadedAt).toLocaleDateString()}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No documents uploaded.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedClient(null)}
              className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
