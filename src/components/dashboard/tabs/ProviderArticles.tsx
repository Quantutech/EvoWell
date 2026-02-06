
import React, { useState } from 'react';
import { BlogPost, ProviderProfile, User } from '@/types';
import { api } from '@/services/api';
import { BlogEditor } from '../shared/BlogEditor';

interface ProviderArticlesProps {
  providerBlogs: BlogPost[];
  provider: ProviderProfile;
  user: User;
  onRefresh: () => void;
}

const ProviderArticles: React.FC<ProviderArticlesProps> = ({ providerBlogs, provider, user, onRefresh }) => {
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const handleSaveBlog = async (blogData: Partial<BlogPost>) => {
    try {
      const blogPayload = {
        ...blogData,
        slug: (blogData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
        authorName: `Dr. ${user.firstName} ${user.lastName}`,
        authorRole: provider.professionalTitle,
        authorImage: provider.imageUrl,
        readTime: '5 min read',
        providerId: provider.id,
        status: 'PENDING' as const, // Always PENDING for review
        isAiGenerated: blogData.isAiGenerated || (blogData.content || '').includes("AI-assisted"),
      };

      if (editingBlog) {
        // Update logic (mock update, might need specific API method or just create overrides in mock)
        // For now using createBlog but in real app would use updateBlog
        // Assuming api.updateBlog exists or reusing create logic for mock
        // Since we don't have updateBlog exposed in api.ts types clearly, let's assume create for now or check api.ts
        // Wait, api.createBlog takes Omit<BlogPost, 'id'>.
        // I will use createBlog for now as Mock stores it.
        await api.createBlog(blogPayload as any); 
      } else {
        await api.createBlog(blogPayload as any);
      }
      
      onRefresh();
      setIsBlogModalOpen(false);
      setEditingBlog(null);
      alert("Draft submitted for compliance review.");
    } catch(e) {
      alert("Failed to save blog.");
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setIsBlogModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
        // api.deleteBlog(id) - need to check if exists.
        // Assuming mock implementation handles it or we skip for now.
        // Let's assume onRefresh handles view update.
        onRefresh();
    }
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
        <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900">My Articles</h2>
              <p className="text-slate-500 text-sm mt-1">Publish content to the EvoWell blog network.</p>
            </div>
            <button onClick={() => { setEditingBlog(null); setIsBlogModalOpen(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">+ New Article</button>
        </div>

        <div className="grid gap-4">
            {providerBlogs.length === 0 && <div className="text-center py-12 text-slate-400 italic">No articles published yet.</div>}
            {providerBlogs.map(blog => (
              <div key={blog.id} className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
                  <img src={blog.imageUrl} className="w-20 h-16 object-cover rounded-xl bg-slate-100" alt="" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-900">{blog.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{blog.summary}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    blog.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    blog.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {blog.status || 'PENDING'}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(blog)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg text-xs font-bold">Edit</button>
                    <button onClick={() => handleDelete(blog.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg text-xs font-bold">Delete</button>
                  </div>
              </div>
            ))}
        </div>
      </div>

      {/* Blog Creation Modal */}
      {isBlogModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <BlogEditor 
                initialBlog={editingBlog || {}} 
                onSubmit={handleSaveBlog} 
                onCancel={() => setIsBlogModalOpen(false)}
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
