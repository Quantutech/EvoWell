import React from 'react';

interface ChangeDiffViewerProps {
  oldData: any;
  newData: any;
  title?: string;
}

export const ChangeDiffViewer: React.FC<ChangeDiffViewerProps> = ({ oldData, newData, title = "System Change Audit" }) => {
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
      </div>
      
      <div className="grid grid-cols-2 bg-slate-50 gap-px">
        <div className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-white">Original State</div>
        <div className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center bg-white">Updated State</div>
      </div>

      <div className="divide-y divide-slate-100">
        {allKeys.map(key => {
          const isChanged = JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
          return (
            <div key={key} className={`grid grid-cols-2 text-xs font-mono ${isChanged ? 'bg-amber-50/30' : ''}`}>
              <div className="p-4 border-r border-slate-100 break-all">
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-sans">{key}</span>
                <span className={isChanged ? 'text-red-500' : 'text-slate-600'}>
                  {JSON.stringify(oldData[key], null, 2) || '(empty)'}
                </span>
              </div>
              <div className="p-4 break-all relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase font-sans">{key}</span>
                <span className={isChanged ? 'text-green-600 font-bold' : 'text-slate-600'}>
                  {JSON.stringify(newData[key], null, 2) || '(empty)'}
                </span>
                {isChanged && (
                    <span className="absolute top-4 right-4 bg-brand-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Modified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
         <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-colors">Dismiss</button>
         <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Approve Change</button>
      </div>
    </div>
  );
};
