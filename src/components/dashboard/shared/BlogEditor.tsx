import React, { useState, useEffect } from 'react';
import { BlogPost, ProviderProfile } from '@/types';
import { api } from '@/services/api';
import { Select } from '@/components/ui';

interface BlogEditorProps {
  initialBlog?: Partial<BlogPost>;
  provider?: ProviderProfile; // For AI context
  onSubmit: (blog: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
  isAiEnabled?: boolean;
}

const CATEGORIES = [
  'Mental Health', 'Wellness', 'Nutrition', 'Sleep', 'Mindfulness', 'Physical Health', 'Relationships', 'Personal Growth'
];

export const BlogEditor: React.FC<BlogEditorProps> = ({ 
  initialBlog, provider, onSubmit, onCancel, isAiEnabled = false 
}) => {
  const [blog, setBlog] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    category: 'Mental Health',
    imageUrl: '',
    summary: '',
    ...initialBlog
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFlags, setAiFlags] = useState<string[]>([]);

  const handleAiDraft = async () => {
    if (!blog.title || !provider) return alert("Enter a title first.");
    setAiLoading(true);
    try {
      const result = await api.ai.generateBlogPost(blog.title, provider.professionalTitle || 'Health Professional');
      setBlog(prev => ({ ...prev, title: result.title, content: result.content }));
      if (result.flags.length > 0) setAiFlags(result.flags);
    } catch (e) {
      alert("AI Generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...blog,
        // Auto-generate summary if missing
        summary: blog.summary || blog.content?.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        moderationFlags: aiFlags
      });
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Mock upload for now, or use FileReader to dataURI
        const reader = new FileReader();
        reader.onloadend = () => {
            setBlog(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white w-full max-w-4xl mx-auto rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <h3 className="text-2xl font-black text-slate-900">{initialBlog?.id ? 'Edit Article' : 'New Article'}</h3>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {aiFlags.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-amber-800 mb-1">Safety Flags Detected:</p>
                <ul className="list-disc list-inside text-[10px] text-amber-700">
                {aiFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                </ul>
            </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                    <div className="flex gap-2">
                        <input 
                            required 
                            value={blog.title || ''} 
                            onChange={e => setBlog({...blog, title: e.target.value})} 
                            className="flex-grow bg-slate-50 border-none rounded-2xl px-5 py-4 text-lg font-bold outline-none focus:ring-2 focus:ring-brand-500/10" 
                            placeholder="Article Title..." 
                        />
                        {isAiEnabled && (
                            <button type="button" onClick={handleAiDraft} disabled={aiLoading} className="bg-brand-50 text-brand-600 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-100 transition-all flex items-center gap-2 whitespace-nowrap">
                                {aiLoading ? '...' : 'AI Draft'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content</label>
                    <textarea 
                        required 
                        rows={15} 
                        value={blog.content || ''} 
                        onChange={e => setBlog({...blog, content: e.target.value})} 
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium outline-none resize-none leading-relaxed focus:ring-2 focus:ring-brand-500/10" 
                        placeholder="Write your content here..." 
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <Select 
                        options={CATEGORIES}
                        value={blog.category || 'Mental Health'}
                        onChange={val => setBlog({...blog, category: val})}
                        placeholder="Select Category"
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cover Image</label>
                    
                    <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100 overflow-hidden relative group">
                        {blog.imageUrl ? (
                            <img src={blog.imageUrl} className="w-full h-40 object-cover rounded-xl" alt="Cover" />
                        ) : (
                            <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                            <label className="bg-white text-slate-900 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors w-full text-center">
                                Upload File
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <div className="w-full relative">
                                <input 
                                    value={blog.imageUrl || ''}
                                    onChange={e => setBlog({...blog, imageUrl: e.target.value})}
                                    placeholder="Or paste URL..."
                                    className="w-full bg-white/20 backdrop-blur text-white placeholder:text-white/50 px-3 py-2 rounded-lg text-xs outline-none border border-white/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Summary</label>
                    <textarea 
                        rows={4}
                        value={blog.summary || ''} 
                        onChange={e => setBlog({...blog, summary: e.target.value})} 
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-medium outline-none resize-none leading-relaxed" 
                        placeholder="Short summary for preview cards..." 
                    />
                </div>
            </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-50 justify-end">
            <button type="button" onClick={onCancel} className="px-8 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save & Publish'}
            </button>
        </div>
      </form>
    </div>
  );
};
