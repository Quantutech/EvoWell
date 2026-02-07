import React, { useEffect, useMemo, useState } from 'react';
import { useAuth, useNavigation } from '@/App';
import { api } from '@/services/api';
import { Resource } from '@/types';
import ResourceEditor from '../shared/ResourceEditor';
import { Select } from '@/components/ui';
import { useProviderEntitlements } from '@/features/access';
import { useToast } from '@/contexts/ToastContext';

// Icons
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const Edit2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

const ProviderResourcesTab: React.FC = () => {
  const { provider } = useAuth();
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const entitlements = useProviderEntitlements(provider?.id);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<'ALL' | 'free' | 'paid'>('ALL');

  const canAuthorExchange = entitlements.isLoading || entitlements.canUseFeature('feature.exchange.author');
  const canPublishPaid = entitlements.isLoading || entitlements.canUseFeature('feature.exchange.publish_paid');

  useEffect(() => {
    if (provider) {
      fetchResources();
    }
  }, [provider]);

  useEffect(() => {
    const loadResource = async () => {
        if (editingId) {
            const res = await api.getResourceById(editingId);
            setEditingResource(res);
        } else {
            setEditingResource(undefined);
        }
    };
    loadResource();
  }, [editingId]);

  const fetchResources = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await api.getResourcesByProvider(provider.id);
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        await api.deleteResource(id);
        await fetchResources();
      } catch (e) {
        alert("Failed to delete resource.");
      }
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('editor');
  };

  const handleCreate = () => {
    if (!canAuthorExchange) {
      addToast('info', 'Upgrade your plan to publish in Provider Exchange.');
      navigate('/console/subscription');
      return;
    }
    setEditingId(null);
    setEditingResource(undefined);
    setView('editor');
  };

  const handleSave = async (data: Partial<Resource>) => {
      if (!canAuthorExchange) {
          addToast('error', 'Your package does not include Provider Exchange publishing.');
          return;
      }

      if ((data.accessType || editingResource?.accessType) === 'paid' && !canPublishPaid) {
          addToast('error', 'Paid listings require a Professional or Premium package.');
          return;
      }

      try {
          if (editingId) {
              await api.updateResource(editingId, data);
          } else {
              if (provider) {
                 // Generate a simple ID for mock
                 const newId = `res-${Date.now()}`;
                 await api.createResource({ 
                     ...data, 
                     id: newId, 
                     providerId: provider.id,
                     status: 'published',
                     moderationStatus: 'approved'
                 } as Resource);
              }
          }
          await fetchResources();
          setView('list');
      } catch (e) {
          alert("Failed to save resource.");
      }
  };

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        q.length === 0 ||
        resource.title.toLowerCase().includes(q) ||
        resource.shortDescription.toLowerCase().includes(q);

      const matchesAccess =
        accessFilter === 'ALL' || resource.accessType === accessFilter;

      return matchesSearch && matchesAccess;
    });
  }, [resources, searchQuery, accessFilter]);

  if (view === 'editor') {
    if (editingId && !editingResource) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="text-slate-500 hover:text-slate-700 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg">&larr;</span> Back to Resources
          </button>
          <h2 className="text-xl font-black text-slate-900">{editingId ? 'Edit Resource' : 'Create New Resource'}</h2>
        </div>
        <ResourceEditor 
            initialData={editingResource} 
            onSave={handleSave} 
            onCancel={() => setView('list')} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Provider Exchange</h1>
          <p className="text-slate-500 mt-2">Manage your shared clinical tools and digital resources.</p>
        </div>
        <div className="flex items-center gap-3">
          {!canPublishPaid && (
            <button
              onClick={() => navigate('/console/subscription')}
              className="px-4 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-black uppercase tracking-widest hover:bg-brand-100 transition-all"
            >
              Unlock Paid Listings
            </button>
          )}
          <button 
            onClick={handleCreate}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Resource
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex gap-4">
            <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search resources..." 
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/10"
                />
            </div>
            <div className="w-[220px]">
              <Select
                ariaLabel="Filter resources by access type"
                value={accessFilter}
                onChange={(value) => setAccessFilter(value as 'ALL' | 'free' | 'paid')}
                options={[
                  { value: 'ALL', label: 'All Access Types' },
                  { value: 'free', label: 'Free' },
                  { value: 'paid', label: 'Paid' },
                ]}
              />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Resource</th>
                <th className="px-6 py-6">Type</th>
                <th className="px-6 py-6">Access</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6">Stats</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Resources...</td></tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No resources yet</h3>
                        <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Start sharing your expertise by creating your first resource.</p>
                        <button onClick={handleCreate} className="text-brand-600 font-bold text-xs uppercase tracking-widest hover:underline">Create Now</button>
                    </td>
                </tr>
              ) : (
                filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            <img src={resource.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{resource.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{resource.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                        {resource.accessType === 'paid' ? (
                            <span className="font-bold text-slate-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: resource.currency }).format((resource.price || 0) / 100)}
                            </span>
                        ) : (
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Free</span>
                        )}
                    </td>
                    <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                resource.status === 'published' ? 'bg-green-500' : 
                                resource.status === 'draft' ? 'bg-amber-500' : 'bg-slate-300'
                            }`}></div>
                            <span className="text-xs font-bold text-slate-600 capitalize">{resource.status}</span>
                        </div>
                    </td>
                    <td className="px-6 py-6 font-medium text-slate-500 text-xs">
                        <div>{resource.views} views</div>
                        <div className="mt-1">{resource.downloads} downloads</div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => navigate(`#/exchange/${resource.id}`)}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all" 
                            title="View Public Page"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEdit(resource.id)} 
                            className="p-2 hover:bg-brand-50 rounded-xl text-slate-400 hover:text-brand-600 transition-all" 
                            title="Edit Resource"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(resource.id)} 
                            className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all" 
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProviderResourcesTab;
