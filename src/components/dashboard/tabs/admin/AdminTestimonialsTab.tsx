import React from 'react';
import { Testimonial } from '@/types';

interface AdminTestimonialsTabProps {
  testimonials: Testimonial[];
  filter: 'all' | 'home' | 'partners';
  setFilter: (f: 'all' | 'home' | 'partners') => void;
  onDelete: (id: string) => void;
}

const AdminTestimonialsTab: React.FC<AdminTestimonialsTabProps> = ({ testimonials, filter, setFilter, onDelete }) => {
  return (
     <div className="space-y-8 relative z-0 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex gap-4 border-b border-slate-200 pb-1">
           <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-bold transition-all ${filter === 'all' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'}`}>All</button>
           <button onClick={() => setFilter('home')} className={`px-4 py-2 text-sm font-bold transition-all ${filter === 'home' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'}`}>Home Page</button>
           <button onClick={() => setFilter('partners')} className={`px-4 py-2 text-sm font-bold transition-all ${filter === 'partners' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'}`}>Partners Page</button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
           {testimonials.filter(t => filter === 'all' ? true : t.page === filter).map(t => (
              <div key={t.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group hover:shadow-lg transition-all">
                 <button onClick={() => onDelete(t.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                 <div className="flex items-center gap-4 mb-4">
                    <img src={t.imageUrl} className="w-12 h-12 rounded-full object-cover border border-slate-100" alt="" />
                    <div>
                       <p className="text-sm font-bold text-slate-900">{t.author}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                    </div>
                 </div>
                 <p className="text-sm text-slate-600 italic leading-relaxed">"{t.text}"</p>
                 <div className="mt-4 pt-4 border-t border-slate-50">
                    <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${t.page === 'home' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                       Display: {t.page}
                    </span>
                 </div>
              </div>
           ))}
           {testimonials.length === 0 && <div className="col-span-2 text-center text-slate-400 italic font-medium py-12">No testimonials found. Click "+ New Testimonial" to add one.</div>}
        </div>
     </div>
  );
};

export default AdminTestimonialsTab;