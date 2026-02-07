import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ConfigCatalogKey, ConfigEntry, ConfigEntryInput, ConfigEntryStatus, StaffRole } from '@/types';
import { Select } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: ConfigEntryStatus[] = ['ACTIVE', 'INACTIVE', 'DEPRECATED'];
const STAFF_ROLE_OPTIONS: StaffRole[] = [
  'SUPER_ADMIN',
  'OPS_ADMIN',
  'PEOPLE_OPS',
  'PROVIDER_OPS',
  'CONTENT_LEAD',
  'SUPPORT_LEAD',
  'FINANCE_COMPLIANCE',
];

interface EntryFormState {
  id?: string;
  code: string;
  label: string;
  status: ConfigEntryStatus;
  sortOrder: number;
  ownerRole?: StaffRole;
  usageCount: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

const emptyEntryForm = (): EntryFormState => ({
  code: '',
  label: '',
  status: 'ACTIVE',
  sortOrder: 1,
  ownerRole: undefined,
  usageCount: 0,
  effectiveFrom: undefined,
  effectiveTo: undefined,
});

const AdminConfigTab: React.FC = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCatalog, setSelectedCatalog] = useState<ConfigCatalogKey | ''>('');
  const [statusFilter, setStatusFilter] = useState<ConfigEntryStatus | 'ALL'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState<EntryFormState>(emptyEntryForm());

  const { data: catalogs = [], isLoading: catalogsLoading } = useQuery({
    queryKey: ['configCatalogs'],
    queryFn: () => api.listConfigCatalogs(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!selectedCatalog && catalogs.length > 0) {
      setSelectedCatalog(catalogs[0].key);
    }
  }, [catalogs, selectedCatalog]);

  const entriesQueryKey = useMemo(
    () => ['configEntries', selectedCatalog, page, statusFilter, search],
    [selectedCatalog, page, statusFilter, search],
  );

  const { data: entriesResponse, isLoading: entriesLoading } = useQuery({
    queryKey: entriesQueryKey,
    queryFn: () =>
      api.listConfigEntries({
        catalogKey: selectedCatalog as ConfigCatalogKey,
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter,
        search: search || undefined,
      }),
    enabled: !!selectedCatalog,
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    mutationFn: (input: ConfigEntryInput) => api.createConfigEntry(input),
    onSuccess: async () => {
      addToast('success', 'Catalog entry created.');
      setIsEditorOpen(false);
      setForm(emptyEntryForm());
      await queryClient.invalidateQueries({ queryKey: ['configEntries'] });
    },
    onError: (error) => {
      addToast('error', error instanceof Error ? error.message : 'Failed to create entry.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ConfigEntryInput> }) =>
      api.updateConfigEntry(id, input),
    onSuccess: async () => {
      addToast('success', 'Catalog entry updated.');
      setIsEditorOpen(false);
      setForm(emptyEntryForm());
      await queryClient.invalidateQueries({ queryKey: ['configEntries'] });
    },
    onError: (error) => {
      addToast('error', error instanceof Error ? error.message : 'Failed to update entry.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteConfigEntry(id),
    onSuccess: async () => {
      addToast('success', 'Catalog entry deleted.');
      await queryClient.invalidateQueries({ queryKey: ['configEntries'] });
    },
    onError: (error) => {
      addToast('error', error instanceof Error ? error.message : 'Failed to delete entry.');
    },
  });

  const openCreateModal = () => {
    setForm(emptyEntryForm());
    setIsEditorOpen(true);
  };

  const openEditModal = (entry: ConfigEntry) => {
    setForm({
      id: entry.id,
      code: entry.code,
      label: entry.label,
      status: entry.status,
      sortOrder: entry.sortOrder,
      ownerRole: entry.ownerRole,
      usageCount: entry.usageCount,
      effectiveFrom: entry.effectiveFrom,
      effectiveTo: entry.effectiveTo,
    });
    setIsEditorOpen(true);
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCatalog) return;

    const payload: ConfigEntryInput = {
      catalogKey: selectedCatalog,
      code: form.code.trim(),
      label: form.label.trim(),
      status: form.status,
      sortOrder: Number(form.sortOrder) || 1,
      ownerRole: form.ownerRole,
      usageCount: Number(form.usageCount) || 0,
      effectiveFrom: form.effectiveFrom || undefined,
      effectiveTo: form.effectiveTo || undefined,
    };

    if (!payload.code || !payload.label) {
      addToast('error', 'Code and label are required.');
      return;
    }

    if (form.id) {
      await updateMutation.mutateAsync({ id: form.id, input: payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  const entries = entriesResponse?.data || [];
  const total = entriesResponse?.total || 0;
  const totalPages = entriesResponse?.totalPages || 1;
  const isBusy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Configuration Catalog</h2>
              <p className="text-sm text-slate-500 mt-1">
                Govern platform taxonomy, lifecycle states, and operational metadata.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              disabled={!selectedCatalog}
              className="bg-slate-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              + New Entry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="md:col-span-2">
              <Select
                label="Catalog Domain"
                ariaLabel="Select configuration catalog domain"
                value={selectedCatalog}
                onChange={(value) => {
                  setSelectedCatalog(value as ConfigCatalogKey);
                  setPage(1);
                }}
                options={catalogs.map((catalog) => ({
                  value: catalog.key,
                  label: catalog.label,
                }))}
                placeholder={catalogsLoading ? 'Loading catalogs...' : 'Select catalog'}
              />
            </div>

            <Select
              label="Status Filter"
              ariaLabel="Filter configuration entries by status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as ConfigEntryStatus | 'ALL');
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                ...STATUS_OPTIONS.map((status) => ({ value: status, label: status })),
              ]}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Code or label..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex flex-wrap justify-between gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {total} entries
            </p>
            <p className="text-xs text-slate-400">
              Page {page} of {Math.max(1, totalPages)}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Label</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entriesLoading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400 text-sm">
                      Loading catalog entries...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400 text-sm">
                      No entries found for this catalog.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-700">{entry.code}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{entry.label}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            entry.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : entry.status === 'INACTIVE'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        {entry.ownerRole ? entry.ownerRole.replace('_', ' ') : 'Any'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{entry.usageCount}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {entry.effectiveFrom
                          ? `${new Date(entry.effectiveFrom).toLocaleDateString()}${entry.effectiveTo ? ` - ${new Date(entry.effectiveTo).toLocaleDateString()}` : ''}`
                          : 'Always'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => openEditModal(entry)}
                          className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (!window.confirm(`Delete entry "${entry.label}"?`)) return;
                            deleteMutation.mutate(entry.id);
                          }}
                          className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold uppercase tracking-widest text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white rounded-[2rem] border border-slate-200 shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900">
                {form.id ? 'Edit Catalog Entry' : 'Create Catalog Entry'}
              </h3>
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  setForm(emptyEntryForm());
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={submitForm} className="p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code</label>
                  <input
                    value={form.code}
                    onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                    placeholder="e.g. TELETHERAPY"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Label</label>
                  <input
                    value={form.label}
                    onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Human readable label"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(value) => setForm((current) => ({ ...current, status: value as ConfigEntryStatus }))}
                  options={STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 1 }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <Select
                  label="Owner Role"
                  value={form.ownerRole || ''}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      ownerRole: value ? (value as StaffRole) : undefined,
                    }))
                  }
                  options={[
                    { value: '', label: 'Any Role' },
                    ...STAFF_ROLE_OPTIONS.map((role) => ({
                      value: role,
                      label: role.replace('_', ' '),
                    })),
                  ]}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usage Count</label>
                  <input
                    type="number"
                    min={0}
                    value={form.usageCount}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, usageCount: Number(event.target.value) || 0 }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Effective From</label>
                  <input
                    type="date"
                    value={form.effectiveFrom ? form.effectiveFrom.slice(0, 10) : ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        effectiveFrom: event.target.value || undefined,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Effective To</label>
                  <input
                    type="date"
                    value={form.effectiveTo ? form.effectiveTo.slice(0, 10) : ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        effectiveTo: event.target.value || undefined,
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditorOpen(false);
                    setForm(emptyEntryForm());
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="px-5 py-3 rounded-xl bg-brand-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all disabled:opacity-60"
                >
                  {isBusy ? 'Saving...' : form.id ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminConfigTab;
