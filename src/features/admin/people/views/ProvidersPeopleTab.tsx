import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ModerationStatus, ProviderProfile } from '@/types';
import { adminService } from '@/services/admin';
import { useToast } from '@/contexts/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminTableLayout } from '@/components/dashboard/tabs/admin/AdminTableLayout';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAdminProviders } from '../hooks/useAdminProviders';

interface ProvidersPeopleTabProps {
  defaultStatus?: ModerationStatus | 'ALL';
  onSelectProvider?: (provider: ProviderProfile) => void;
}

const PAGE_SIZE = 20;

export const ProvidersPeopleTab: React.FC<ProvidersPeopleTabProps> = ({
  defaultStatus = 'ALL',
  onSelectProvider,
}) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'ALL'>(defaultStatus);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);

  const search = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setStatusFilter(defaultStatus);
    setPage(1);
  }, [defaultStatus]);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      status: statusFilter,
      search: search || undefined,
    }),
    [page, statusFilter, search],
  );

  const { data, isLoading } = useAdminProviders(params);

  const moderationMutation = useMutation({
    mutationFn: async ({ providerId, status }: { providerId: string; status: ModerationStatus }) => {
      if (status === ModerationStatus.APPROVED) {
        await adminService.approveProvider(providerId);
      } else {
        await adminService.rejectProvider(providerId);
      }
    },
    onSuccess: (_, variables) => {
      addToast(
        'success',
        variables.status === ModerationStatus.APPROVED
          ? 'Provider approved.'
          : 'Provider rejected.',
      );
      queryClient.invalidateQueries({ queryKey: ['adminPeople'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Provider moderation failed.';
      addToast('error', message);
    },
  });

  const providers = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const toggleSelected = (providerId: string, checked: boolean) => {
    setSelectedProviderIds((current) => {
      if (checked) {
        return current.includes(providerId) ? current : [...current, providerId];
      }
      return current.filter((id) => id !== providerId);
    });
  };

  const handleBulkModeration = async (status: ModerationStatus) => {
    if (selectedProviderIds.length === 0) return;

    const action = status === ModerationStatus.APPROVED ? 'approve' : 'reject';
    if (!window.confirm(`Bulk ${action} ${selectedProviderIds.length} provider(s)?`)) return;

    try {
      await Promise.all(
        selectedProviderIds.map((providerId) =>
          moderationMutation.mutateAsync({ providerId, status }),
        ),
      );
      setSelectedProviderIds([]);
    } catch {
      // Errors are handled by the mutation onError.
    }
  };

  const header = (
    <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Providers</h3>
          <p className="text-xs text-slate-500">Provider lifecycle, moderation, and profile operations.</p>
        </div>

        {selectedProviderIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkModeration(ModerationStatus.APPROVED)}
              className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest hover:bg-green-200"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkModeration(ModerationStatus.REJECTED)}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest hover:bg-red-200"
            >
              Reject Selected
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search provider..."
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

        {(['ALL', ModerationStatus.PENDING, ModerationStatus.APPROVED, ModerationStatus.REJECTED] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              statusFilter === status
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {status === 'ALL' ? 'All' : status}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AdminTableLayout
      header={header}
      page={page}
      totalPages={totalPages}
      onPageChange={(nextPage) => {
        setSelectedProviderIds([]);
        setPage(nextPage);
      }}
      isLoading={isLoading}
    >
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <input
                type="checkbox"
                checked={providers.length > 0 && providers.every((provider) => selectedProviderIds.includes(provider.id))}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProviderIds(providers.map((provider) => provider.id));
                  } else {
                    setSelectedProviderIds([]);
                  }
                }}
              />
            </th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credentials</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-4"><Skeleton className="h-4 w-4 rounded" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-36 mb-2" /><Skeleton className="h-3 w-24" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
              </tr>
            ))
          ) : providers.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">No providers found.</td>
            </tr>
          ) : (
            providers.map((provider) => (
              <tr
                key={provider.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onSelectProvider?.(provider)}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedProviderIds.includes(provider.id)}
                    onChange={(e) => toggleSelected(provider.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">Dr. {provider.firstName || ''} {provider.lastName || ''}</p>
                  <p className="text-xs text-slate-500 font-mono">{provider.email || 'No email'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700">{provider.professionalTitle || 'Not provided'}</p>
                  <p className="text-[10px] text-slate-500">{provider.licenses?.[0]?.number || provider.npi || 'No license/NPI'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    provider.moderationStatus === ModerationStatus.APPROVED
                      ? 'bg-green-100 text-green-700'
                      : provider.moderationStatus === ModerationStatus.REJECTED
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {provider.moderationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3" onClick={(e) => e.stopPropagation()}>
                  {provider.moderationStatus !== ModerationStatus.APPROVED && (
                    <button
                      onClick={() => moderationMutation.mutate({ providerId: provider.id, status: ModerationStatus.APPROVED })}
                      className="text-green-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                      Approve
                    </button>
                  )}

                  {provider.moderationStatus !== ModerationStatus.REJECTED && (
                    <button
                      onClick={() => moderationMutation.mutate({ providerId: provider.id, status: ModerationStatus.REJECTED })}
                      className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableLayout>
  );
};
