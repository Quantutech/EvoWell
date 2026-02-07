import React, { useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: string;
  type: string;
  tags: string[];
  uploadedAt: string;
}

export const MediaLibrary: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', name: 'clinical-setting.jpg', size: '1.2MB', type: 'image/jpeg', tags: ['clinical', 'office'], uploadedAt: new Date().toISOString() },
    { id: '2', url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400', name: 'patient-care.jpg', size: '0.8MB', type: 'image/jpeg', tags: ['patient', 'nursing'], uploadedAt: new Date().toISOString() },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        // Add new item mock logic here
      }
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Media Assets</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Organize and reuse clinical imagery</p>
        </div>
        <button 
          onClick={handleUpload}
          className="bg-brand-500 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all"
        >
          Upload New Media
        </button>
      </div>

      {isUploading && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Optimizing & Uploading...</span>
              <span className="text-[10px] font-black text-brand-600">{uploadProgress}%</span>
           </div>
           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map(item => (
          <div key={item.id} className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
            <div className="aspect-square overflow-hidden bg-slate-50">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-900 truncate mb-1">{item.name}</p>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-black uppercase">{item.size}</span>
                <div className="flex gap-1">
                   {item.tags.slice(0, 1).map(t => (
                     <span key={t} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[8px] font-bold">#{t}</span>
                   ))}
                </div>
              </div>
            </div>
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-white rounded-xl text-slate-900 hover:bg-brand-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button className="p-2 bg-white rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
