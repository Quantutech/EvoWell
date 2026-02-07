import React, { useMemo, useState } from 'react';
import { BlogPost, ProviderProfile, User } from '@/types';
import { api } from '@/services/api';
import { BlogEditor } from '../shared/BlogEditor';
import { Select } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

interface ProviderArticlesProps {
  providerBlogs: BlogPost[];
  provider: ProviderProfile;
  user: User;
  onRefresh: () => void;
}

type BlogFilterStatus = 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';

function normalizeStatus(status: BlogPost['status'] | undefined): BlogFilterStatus {
  if (!status) return 'PENDING';
  return status as BlogFilterStatus;
}

const ProviderArticles: React.FC<ProviderArticlesProps> = ({
  providerBlogs,
  provider,
  user,
  onRefresh,
}) => {
  const { addToast } = useToast();
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogFilterStatus>('ALL');

  const draftCount = providerBlogs.filter((blog) => normalizeStatus(blog.status) === 'DRAFT').length;
  const pendingCount = providerBlogs.filter((blog) => normalizeStatus(blog.status) === 'PENDING').length;
  const publishedCount = providerBlogs.filter(
    (blog) => normalizeStatus(blog.status) === 'APPROVED' || normalizeStatus(blog.status) === 'PUBLISHED',
  ).length;

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return providerBlogs.filter((blog) => {
      const matchesSearch =
        q.length === 0 ||
        blog.title.toLowerCase().includes(q) ||
        (blog.summary || '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'ALL' || normalizeStatus(blog.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [providerBlogs, search, statusFilter]);

  const handleSaveBlog = async (blogData: Partial<BlogPost>) => {
    try {
      const basePayload: Partial<BlogPost> = {
        ...blogData,
        providerId: provider.id,
        authorName: blogData.authorName || `${user.firstName} ${user.lastName}`,
        authorRole: blogData.authorRole || provider.professionalTitle,
        authorImage: provider.imageUrl,
        readTime: blogData.readTime || '5 min read',
        isAiGenerated:
          blogData.isAiGenerated || (blogData.content || '').includes('AI-assisted'),
      };

      if (editingBlog) {
        await api.updateBlog(editingBlog.id, basePayload);
        addToast('success', 'Article updated and submitted for review.');
      } else {
        const slugBase = (blogData.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        await api.createBlog({
          ...basePayload,
          slug: `${slugBase}-${Date.now()}`,
          status: blogData.status || 'PENDING',
        });
        addToast('success', 'Draft submitted for editorial review.');
      }

      onRefresh();
      setIsBlogModalOpen(false);
      setEditingBlog(null);
    } catch {
      addToast('error', 'Failed to save article.');
    }
  };

  const handleDelete = async (blog: BlogPost) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;

    try {
      await api.deleteBlog(blog.id);
      addToast('success', 'Article deleted.');
      onRefresh();
    } catch {
      addToast('error', 'Failed to delete article.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">CMS Workbench</h2>
              <p className="text-sm text-slate-500 mt-1">
                Create, review, and track your provider editorial pipeline.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBlog(null);
                setIsBlogModalOpen(true);
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
            >
              + New Article
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drafts</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{draftCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending Review</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Published</p>
              <p className="text-2xl font-black text-green-700 mt-1">{publishedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or summary..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="w-full md:w-[220px]">
              <Select
                ariaLabel="Filter provider articles by status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as BlogFilterStatus)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PENDING', label: 'Pending Review' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                  { value: 'PUBLISHED', label: 'Published' },
                ]}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredBlogs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">No articles match this filter.</div>
            ) : (
              filteredBlogs.map((blog) => {
                const status = normalizeStatus(blog.status);
                const statusClass =
                  status === 'APPROVED' || status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-700'
                    : status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : status === 'DRAFT'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-700';

                return (
                  <div key={blog.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{blog.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{blog.summary || 'No summary provided.'}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Updated {new Date(blog.publishedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusClass}`}>
                          {status}
                        </span>
                        <button
                          onClick={() => {
                            setEditingBlog(blog);
                            setIsBlogModalOpen(true);
                          }}
                          className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog)}
                          className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <BlogEditor
              initialBlog={editingBlog || {}}
              onSubmit={handleSaveBlog}
              onCancel={() => {
                setIsBlogModalOpen(false);
                setEditingBlog(null);
              }}
              provider={provider}
              isAiEnabled={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderArticles;
