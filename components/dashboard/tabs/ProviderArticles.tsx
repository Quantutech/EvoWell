
import React, { useState } from 'react';
import { BlogPost, ProviderProfile, User } from '../../../types';
import { api } from '../../../services/api';

interface ProviderArticlesProps {
  providerBlogs: BlogPost[];
  provider: ProviderProfile;
  user: User;
  onRefresh: () => void;
}

const ProviderArticles: React.FC<ProviderArticlesProps> = ({ providerBlogs, provider, user, onRefresh }) => {
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', category: 'Mental Health' });
  const [blogAiLoading, setBlogAiLoading] = useState(false);

  const handleBlogAi = async () => {
    if (!newBlog.title) return alert("Enter a topic or title first.");
    setBlogAiLoading(true);
    const draft = await api.ai.generateBlogPost(newBlog.title, provider.professionalTitle || 'Health Professional');
    setNewBlog({ ...newBlog, title: draft.title, content: draft.content });
    setBlogAiLoading(false);
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBlog({
        ...newBlog,
        slug: newBlog.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
        summary: newBlog.content.substring(0, 150) + '...',
        authorName: `Dr. ${user.firstName} ${user.lastName}`,
        authorRole: provider.professionalTitle,
        authorImage: provider.imageUrl,
        imageUrl: 'https://images.unsplash.com/photo-1542884775-40e301d3f4ed?auto=format&fit=crop&q=80&w=800',
        readTime: '5 min read',
        providerId: provider.id
      });
      onRefresh();
      setIsBlogModalOpen(false);
      setNewBlog({ title: '', content: '', category: 'Mental Health' });
      alert("Draft saved! Pending admin approval.");
    } catch(e) {
      alert("Failed to save blog.");
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
            <button onClick={() => setIsBlogModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">+ New Article</button>
        </div>

        <div className="grid gap-4">
            {providerBlogs.length === 0 && <div className="text-center py-12 text-slate-400 italic">No articles published yet.</div>}
            {providerBlogs.map(blog => (
              <div key={blog.id} className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
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
              </div>
            ))}
        </div>
      </div>

      {/* Blog Creation Modal */}
      {isBlogModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-900">New Article</h3>
                  <button onClick={() => setIsBlogModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
               </div>
               
               <form onSubmit={handleCreateBlog} className="space-y-4 flex-grow overflow-y-auto custom-scrollbar p-1">
                  <div className="flex gap-2">
                     <input required value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} className="flex-grow bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="Article Title (e.g. Coping with Anxiety)" />
                     <button type="button" onClick={handleBlogAi} disabled={blogAiLoading} className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-100 transition-all flex items-center gap-2">
                        {blogAiLoading ? 'Generating...' : 'AI Draft'}
                     </button>
                  </div>
                  
                  <textarea required rows={12} value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none" placeholder="Write your content here... (HTML tags supported for paragraphs)" />
                  
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                     <button type="button" onClick={() => setIsBlogModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl">Cancel</button>
                     <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800">Submit for Review</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </>
  );
};

export default ProviderArticles;
