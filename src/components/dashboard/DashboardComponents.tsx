import React, { useState } from 'react';

export const MultiSelect = ({ label, options, selected, onChange, placeholder }: { label: string, options: string[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 min-h-[50px] cursor-pointer flex flex-wrap gap-2 items-center"
        >
          {selected.length === 0 && <span className="text-slate-400 font-medium">{placeholder}</span>}
          {selected.map(s => (
            <span key={s} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
              {s}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleSelection(s); }}
                className="hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
          <div className="ml-auto text-slate-400">
             <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => toggleSelection(opt)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selected.includes(opt) ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {opt}
                {selected.includes(opt) && <span className="float-right">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const BarChart = ({ data }: { data: { label: string, value: number }[] }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div className="h-48 flex items-end justify-between gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
          <div className="relative w-full bg-slate-100 rounded-t-lg flex items-end h-full overflow-hidden">
             <div 
               className="w-full bg-brand-500 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-t-lg relative"
               style={{ height: `${(d.value / maxValue) * 100}%` }}
             >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   ${d.value.toLocaleString()}
                </div>
             </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="-1 -1 2 2" className="rotate-[-90deg]">
        {data.map((slice, i) => {
          const startPercent = cumulativePercent;
          const slicePercent = slice.value / total;
          cumulativePercent += slicePercent;
          
          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={slice.color}
              className="hover:opacity-90 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Inner white circle for donut effect */}
        <circle cx="0" cy="0" r="0.7" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
         <span className="text-xl font-black text-slate-900">{total}%</span>
         <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
      </div>
    </div>
  );
};

export const SettingInput = ({ label, value, onChange, placeholder = '' }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
      placeholder={placeholder}
    />
  </div>
);