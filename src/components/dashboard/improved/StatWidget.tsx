import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface StatWidgetProps {
  label: string;
  queryKey: string;
  queryFn: () => Promise<number>;
  icon: string;
  color: string;
  drillDownId?: string;
  onDrillDown?: (id: string) => void;
}

export const StatWidget: React.FC<StatWidgetProps> = ({ 
  label, queryKey, queryFn, icon, color, drillDownId, onDrillDown 
}) => {
  const { data: value, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn,
    refetchInterval: 60000, // Real-time update every minute
  });

  return (
    <div 
      className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${drillDownId ? 'cursor-pointer' : ''}`}
      onClick={() => drillDownId && onDrillDown?.(drillDownId)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        {drillDownId && (
          <div className="text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        {isLoading ? (
          <div className="h-9 w-16 bg-slate-100 animate-pulse rounded-lg"></div>
        ) : error ? (
          <p className="text-red-500 text-xs font-bold">Error loading</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900">{value?.toLocaleString()}</p>
            {/* Example Trend Indicator (Static for now, could be dynamic) */}
            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        )}
      </div>
    </div>
  );
};
