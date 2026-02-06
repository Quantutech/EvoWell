import React from 'react';
import { DailyMetric } from '@/types';

interface SimpleChartProps {
  data: DailyMetric[];
  dataKey: 'views' | 'inquiries';
  color: string;
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, dataKey, color, height = 100 }) => {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-300 text-xs">No Data</div>;

  const maxVal = Math.max(...data.map(d => d[dataKey]));
  
  // Calculate coordinates
  const coordinates = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d[dataKey] / (maxVal || 1)) * 100);
    return { x, y };
  });

  // Construct Area Path (Move to start, Line to each point, Line to bottom right, Line to bottom left, Close)
  const areaPathD = `
    M 0,100 
    ${coordinates.map(p => `L ${p.x},${p.y}`).join(' ')} 
    L 100,100 
    Z
  `;

  // Construct Line Points string (Polyline accepts simple x,y pairs)
  const polylinePoints = coordinates.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Gradient Area */}
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Filled Area */}
        <path d={areaPathD} fill={`url(#grad-${dataKey})`} className="transition-all duration-500" />
        
        {/* Stroke Line */}
        <polyline 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          points={polylinePoints} 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* Interactive Dots */}
        {coordinates.map((p, i) => (
           <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" className="opacity-0 hover:opacity-100 transition-opacity" />
        ))}
      </svg>
      {/* Tooltip hint (invisible structure for layout) */}
      <div className="absolute inset-0 flex justify-between items-end pointer-events-none opacity-50">
         <span className="text-[8px] font-bold text-slate-400">{data[0].date.slice(5)}</span>
         <span className="text-[8px] font-bold text-slate-400">{data[data.length-1].date.slice(5)}</span>
      </div>
    </div>
  );
};

export default SimpleChart;