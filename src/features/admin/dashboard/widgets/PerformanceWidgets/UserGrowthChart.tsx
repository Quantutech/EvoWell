import React from 'react';

interface UserGrowthChartProps {
  data?: number[];
  isLoading?: boolean;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ 
  data = [30, 45, 25, 60, 55, 80, 75], 
  isLoading 
}) => {
  if (isLoading) return <div className="h-40 w-full bg-slate-50 animate-pulse rounded-2xl"></div>;

  const max = Math.max(...data);
  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ');

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Growth</h4>
            <p className="text-lg font-black text-slate-900 tracking-tight">New User Acquisition</p>
        </div>
        <div className="text-right">
            <p className="text-xs font-black text-green-500">+24%</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase">vs last month</p>
        </div>
      </div>

      <div className="relative h-32 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid Lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
          
          {/* The Line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-lg"
          />
          
          {/* Gradient Fill */}
          <path
            d={`M 0 100 L ${points} L 100 100 Z`}
            fill="url(#growthGradient)"
            opacity="0.1"
          />
          
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
         <span>Mon</span>
         <span>Wed</span>
         <span>Fri</span>
         <span>Sun</span>
      </div>
    </div>
  );
};
