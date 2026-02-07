import React, { useState } from 'react';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  // Mock scheduled content
  const scheduledPosts = [
    { id: 1, day: 5, title: 'Summer Wellness Tips', type: 'blog' },
    { id: 2, day: 12, title: 'New Provider Spotlight', type: 'social' },
    { id: 3, day: 24, title: 'Mental Health Awareness', type: 'blog' },
  ];

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-black uppercase text-slate-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {blanks.map(b => <div key={`blank-${b}`} className="h-24 bg-slate-50/50 rounded-xl" />)}
        {days.map(d => {
          const posts = scheduledPosts.filter(p => p.day === d);
          return (
            <div key={d} className="h-24 bg-slate-50 rounded-xl p-2 border border-slate-100 hover:border-brand-200 transition-colors cursor-pointer relative group">
              <span className="text-xs font-bold text-slate-400 group-hover:text-brand-600">{d}</span>
              <div className="mt-1 space-y-1">
                {posts.map(p => (
                  <div key={p.id} className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate ${p.type === 'blog' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {p.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
