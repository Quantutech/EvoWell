import React from 'react';
import { BlogPost, User } from '@/types';
import { BlogEditor } from '../../shared/BlogEditor';

interface AdminBlogsTabProps {
  blogs: BlogPost[];
  editingBlog: Partial<BlogPost> | null;
  setEditingBlog: (blog: Partial<BlogPost> | null) => void;
  onSave: (blog: Partial<BlogPost>) => Promise<void>;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

const AdminBlogsTab: React.FC<AdminBlogsTabProps> = ({ 
  blogs, editingBlog, setEditingBlog, onSave, onApprove, onDelete 
}) => {
  
  if (editingBlog) {
    return (
      <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 animate-in fade-in zoom-in-95">
        <BlogEditor 
          initialBlog={editingBlog}
          onSubmit={onSave}
          onCancel={() => setEditingBlog(null)}
          isAiEnabled={true} 
        />
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