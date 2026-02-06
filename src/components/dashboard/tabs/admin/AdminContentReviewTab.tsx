
import React, { useState, useEffect } from 'react';
import { BlogPost, ProviderProfile } from '../../../../types';
import { api } from '../../../../services/api';

const AdminContentReviewTab: React.FC = () => {
  const [pendingBlogs, setPendingBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<BlogPost | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const blogs = await api.getAllBlogs();
      // Filter for PENDING status
      setPendingBlogs(blogs.filter(b => b.status === 'PENDING'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewItem) return;
    try {
      await api.updateBlog(reviewItem.id, {
        status,
        // adminNotes: reviewNote // Assuming we add this to the update logic or DB
      });
      alert(`Content ${status.toLowerCase()}.`);
      setReviewItem(null);
      setReviewNote('');
      fetchPending();
    } catch (e) {
      alert("Action failed.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {!reviewItem ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900">Content Moderation Queue</h3>
            <p className="text-slate-500 text-xs mt-1">Review AI-generated and provider-submitted content before publishing.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-400 animate-pulse font-bold text-xs uppercase tracking-widest">Loading Queue...</div>
            ) : pendingBlogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">No pending content to review.</div>
            ) : (
              pendingBlogs.map(blog => (
                <div key={blog.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">{blog.title}</span>
                      {(blog as any).isAiGenerated && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">AI Assist</span>
                      )}
                      {(blog as any).moderationFlags && (blog as any).moderationFlags.length > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">Flags Detected</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Author: {blog.authorName} • Category: {blog.category}</p>
                  </div>
                  <button 
                    onClick={() => setReviewItem(blog)}
                    className="bg-brand-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-colors"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-lg font-black text-slate-900">Reviewing: {reviewItem.title}</h3>
             <button onClick={() => setReviewItem(null)} className="text-slate-400 hover:text-slate-600">Close</button>
          </div>
          
          <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                <div className="prose prose-sm max-w-none p-6 bg-slate-50 rounded-2xl border border-slate-100" dangerouslySetInnerHTML={{__html: reviewItem.content}}></div>
             </div>
             
             <div className="space-y-6">
                {(reviewItem as any).moderationFlags && (reviewItem as any).moderationFlags.length > 0 && (
                   <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <p className="text-xs font-bold text-red-800 mb-2">Automated Safety Flags:</p>
                      <ul className="list-disc list-inside text-[10px] text-red-700">
                         {(reviewItem as any).moderationFlags.map((flag: string, i: number) => (
                            <li key={i}>{flag}</li>
                         ))}
                      </ul>
                   </div>
                )}
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Notes</label>
                   <textarea 
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                      rows={4}
                      placeholder="Reason for rejection or approval notes..."
                   />
                </div>

                <div className="flex flex-col gap-3">
                   <button onClick={() => handleDecision('APPROVED')} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-500/20">
                      Approve & Publish
                   </button>
                   <button onClick={() => handleDecision('REJECTED')} className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-200">
                      Reject
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentReviewTab;
