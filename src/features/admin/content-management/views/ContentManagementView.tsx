import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '../components/ContentEditor/RichTextEditor';
import { MediaLibraryModal } from '../components/MediaLibrary/MediaLibraryModal';
import { useContentWorkflow } from '../hooks/useContentWorkflow';
import { useBlogPosts } from '@/hooks/queries';
import { useCreateBlog, useUpdateBlog, useDeleteBlog } from '@/hooks/mutations';
import { BlogPost } from '@/types/domain/blog';
import { useAuth } from '@/App';
import { debounce } from 'lodash';

interface BlogPostForm {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  category?: string;
  authorName?: string;
  authorRole?: string;
  imageUrl?: string;
  tags: string[];
  scheduledFor?: string | null;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'SCHEDULED';
  providerId?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    DRAFT: { label: 'Draft', color: 'text-gray-700', bg: 'bg-gray-100' },
    PENDING: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50' },
    APPROVED: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    REJECTED: { label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-50' },
    PUBLISHED: { label: 'Published', color: 'text-blue-700', bg: 'bg-blue-50' },
    SCHEDULED: { label: 'Scheduled', color: 'text-violet-700', bg: 'bg-violet-50' },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

export const ContentManagementView: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { user } = useAuth();
  const { data: postsData, isLoading: loading, refetch } = useBlogPosts();
  const posts: BlogPost[] = (postsData as any)?.data || [];

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  const [formData, setFormData] = useState<BlogPostForm>({
    title: '',
    content: '',
    summary: '',
    slug: '',
    category: 'Mental Health',
    tags: [],
    scheduledFor: null,
    imageUrl: '',
    status: 'DRAFT',
    authorName: user ? `${user.firstName} ${user.lastName}` : '',
    authorRole: user?.role || 'ADMIN',
  });

  const { currentState, possibleTransitions, transitionTo } = useContentWorkflow(
    selectedBlog?.status as any || 'DRAFT'
  );

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Initialize form when editing
  useEffect(() => {
    if (selectedBlog) {
      // Format date for datetime-local input (YYYY-MM-DDThh:mm)
      let scheduledFor = '';
      if (selectedBlog.publishedAt) {
        try {
          const date = new Date(selectedBlog.publishedAt);
          // Adjust for timezone offset to show local time correct in input
          const offset = date.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
          scheduledFor = localISOTime;
        } catch (e) {
          console.error('Invalid date', e);
        }
      }

      setFormData({
        title: selectedBlog.title,
        content: selectedBlog.content,
        summary: selectedBlog.summary || '',
        slug: selectedBlog.slug,
        tags: (selectedBlog as any).tags || [],
        scheduledFor: scheduledFor || null,
        status: selectedBlog.status,
        category: selectedBlog.category,
        imageUrl: selectedBlog.imageUrl || '',
        authorName: selectedBlog.authorName,
        authorRole: selectedBlog.authorRole,
      });
    } else {
      // Reset for new post
      setFormData({
        title: '',
        content: '',
        summary: '',
        slug: '',
        category: 'Mental Health',
        tags: [],
        scheduledFor: null,
        imageUrl: '',
        status: 'DRAFT',
        authorName: user ? `${user.firstName} ${user.lastName}` : '',
        authorRole: user?.role || 'ADMIN',
      });
    }
  }, [selectedBlog, user]);

  const handleCreateNew = () => {
    setSelectedBlog(null);
    setView('editor');
  };

  const handleSave = async () => {
    try {
      // Auto-generate slug if not provided
      const dataToSave = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        status: currentState.status as any,
        authorName: formData.authorName || (user ? `${user.firstName} ${user.lastName}` : 'Admin'),
        authorRole: formData.authorRole || user?.role || 'ADMIN',
      };

      if (selectedBlog) {
        await updateMutation.mutateAsync({ 
          id: selectedBlog.id, 
          data: dataToSave
        });
      } else {
        await createMutation.mutateAsync(dataToSave);
      }
      
      await refetch();
      setView('list');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post. Please try again.');
    }
  };

  const handleStatusTransition = async (newStatus: any) => {
    try {
      await transitionTo(newStatus);
      if (selectedBlog) {
        await updateMutation.mutateAsync({ 
          id: selectedBlog.id, 
          data: { ...formData, status: newStatus } 
        });
        await refetch();
      }
    } catch (error) {
      console.error('Transition failed:', error);
      alert('Status transition failed. Please try again.');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.summary && post.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderListView = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
              <p className="mt-1 text-sm text-gray-500">Create, manage, and approve blog content</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Post
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{posts.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {posts.filter(p => p.status === ('PUBLISHED' as any) || p.status === 'APPROVED').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {posts.filter(p => p.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-3xl font-bold text-gray-600 mt-1">
                  {posts.filter(p => p.status === 'DRAFT').length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No posts found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first blog post to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map(blog => (
              <div
                key={blog.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Featured Image */}
                    {blog.imageUrl && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>
                        <StatusBadge status={blog.status} />
                      </div>

                      {blog.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{blog.summary}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                            {blog.authorName?.charAt(0) || 'A'}
                          </div>
                          <span className="font-medium text-gray-700">{blog.authorName || 'Unknown Author'}</span>
                        </div>
                        <span>•</span>
                        <span>{blog.category}</span>
                        {blog.readTime && (
                          <>
                            <span>•</span>
                            <span>{blog.readTime}</span>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setView('editor');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>

                        {blog.status === 'PENDING' && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  await updateMutation.mutateAsync({ 
                                    id: blog.id, 
                                    data: { status: 'APPROVED' } 
                                  });
                                  await refetch();
                                } catch (error) {
                                  console.error('Failed to approve:', error);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await updateMutation.mutateAsync({ 
                                    id: blog.id, 
                                    data: { status: 'REJECTED' } 
                                  });
                                  await refetch();
                                } catch (error) {
                                  console.error('Failed to reject:', error);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this post?')) {
                              try {
                                await deleteMutation.mutateAsync(blog.id);
                                await refetch();
                              } catch (error) {
                                console.error('Failed to delete:', error);
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors ml-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderEditorView = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setView('list')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Posts
            </button>

            <div className="flex items-center gap-3">
              <StatusBadge status={currentState.status} />
              
              {possibleTransitions.length > 0 && (
                <div className="flex items-center gap-2">
                  {possibleTransitions.map((transition) => (
                    <button
                      key={transition}
                      onClick={() => handleStatusTransition(transition)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                      {transition.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={loading || createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {selectedBlog ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <input
                className="w-full text-4xl font-bold text-gray-900 placeholder:text-gray-300 outline-none mb-6 bg-transparent"
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="auto-generated-from-title"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-6">
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  onImageAction={() => setShowMediaModal(true)}
                  placeholder="Start writing your story..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Summary / Excerpt
                </label>
                <textarea
                  className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief summary for preview cards..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Author
              </h3>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Author name"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              />
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Author role (optional)"
                value={formData.authorRole}
                onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
              />
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule
              </h3>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.scheduledFor || ''}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-2">Leave empty to publish immediately</p>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category
              </h3>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Wellness">Wellness</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Therapy">Therapy</option>
                <option value="Self-Care">Self-Care</option>
                <option value="Mindfulness">Mindfulness</option>
              </select>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Featured Image
              </h3>
              {formData.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden group">
                  <img
                    src={formData.imageUrl}
                    alt="Featured"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <svg className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Upload image</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showMediaModal) {
    return (
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={(image) => {
          // If in editor view, we might want to insert into editor or set featured image
          // For now, if we came from the editor's image button, we should probably have a way to know.
          // But looking at the UI, there's also a "Featured Image" section in the sidebar.
          // Let's make it smart: if the editor is active, we can't easily insert into tiptap from here 
          // without a ref, but we can at least update the featured image if that was the intent.
          // However, the RichTextEditor now calls onImageAction.
          
          setFormData({ ...formData, imageUrl: image.url });
          setShowMediaModal(false);
        }}
      />
    );
  }

  return view === 'editor' ? renderEditorView() : renderListView();
};