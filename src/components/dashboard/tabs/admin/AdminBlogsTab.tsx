import React from 'react';
import { BlogPost, User } from '@/types';

interface AdminBlogsTabProps {
  blogs: BlogPost[];
  editingBlog: Partial<BlogPost> | null;
  setEditingBlog: (blog: Partial<BlogPost> | null) => void;
  onSave: (e: React.FormEvent) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({ 
  blogs, editingBlog, setEditingBlog, onSave, onApprove, onDelete 
}) => {
  
  if (editingBlog) {
    return (
      <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95">
        <h2 className="text-2xl font-black mb-10">Resource Editor</h2>
        <form onSubmit={onSave} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
             <input value={editingBlog.title || ''} onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl text-lg font-bold outline-none" placeholder="Article Title" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content (HTML Supported)</label>
             <textarea value={editingBlog.content || ''} onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl h-96 font-medium outline-none" placeholder="<p>Write your content here...</p>" />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                <input value={editingBlog.category || ''} onChange={e => setEditingBlog({...editingBlog, category: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none" placeholder="Wellness, Nutrition..." />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image URL</label>
                <input value={editingBlog.imageUrl || ''} onChange={e => setEditingBlog({...editingBlog, imageUrl: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold outline-none" placeholder="https://..." />
             </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
             <button type="button" onClick={() => setEditingBlog(null)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
             <button type="submit" className="bg-brand-500 text-white px-10 py-3 rounded-2xl font-black shadow-xl hover:bg-brand-600 transition-all">Save Post</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
       <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
             <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {blogs.map(b => (
               <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold">{b.title}</td>
                  <td className="px-8 py-6">
                     <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        b.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        b.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                     }`}>
                        {b.status || 'PENDING'}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-4">
                     {b.status !== 'APPROVED' && (
                        <button 
                          onClick={() => onApprove(b.id)} 
                          className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-100 transition-all border border-green-200"
                        >
                          Approve
                        </button>
                     )}
                     <button onClick={() => setEditingBlog(b)} className="text-blue-500 font-black text-xs uppercase hover:underline">Edit</button>
                     <button onClick={() => onDelete(b.id)} className="text-red-500 font-black text-xs uppercase hover:underline">Delete</button>
                  </td>
               </tr>
             ))}
             {blogs.length === 0 && (
                <tr>
                   <td colSpan={3} className="text-center py-12 text-slate-400 italic font-medium">No blog posts found.</td>
                </tr>
             )}
          </tbody>
       </table>
    </div>
  );
};

export default AdminBlogsTab;