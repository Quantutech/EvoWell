import React from 'react';
import { iconPaths, IconName } from './iconPaths';

// Define the available icon types and their specific configurations
// Using centralized paths, but keeping gradients here as they are specific to the 3D system
const iconMap: Record<IconName, { gradient: string }> = {
  search: { gradient: "from-blue-400 to-indigo-600" },
  video: { gradient: "from-violet-400 to-fuchsia-600" },
  clinic: { gradient: "from-emerald-400 to-teal-600" },
  blog: { gradient: "from-orange-400 to-red-600" },
  podcast: { gradient: "from-pink-400 to-rose-600" },
  folder: { gradient: "from-amber-400 to-orange-600" },
  userPlus: { gradient: "from-cyan-400 to-blue-600" },
  star: { gradient: "from-yellow-400 to-amber-600" },
  lock: { gradient: "from-slate-400 to-slate-600" },
  download: { gradient: "from-sky-400 to-blue-600" },
  calendar: { gradient: "from-teal-400 to-emerald-600" },
  chat: { gradient: "from-purple-400 to-indigo-600" },
  unlocked: { gradient: "from-rose-400 to-red-600" },
  settings: { gradient: "from-gray-400 to-slate-600" },
  heart: { gradient: "from-pink-500 to-rose-600" },
  eye: { gradient: "from-blue-400 to-cyan-600" },
  dollar: { gradient: "from-green-400 to-emerald-600" },
  globe: { gradient: "from-indigo-400 to-blue-600" },
  info: { gradient: "from-slate-400 to-slate-600" },
  partners: { gradient: "from-indigo-400 to-purple-600" },
  dashboard: { gradient: "from-blue-500 to-indigo-600" },
  user: { gradient: "from-slate-500 to-slate-700" },
  shield: { gradient: "from-red-500 to-red-700" },
  chart: { gradient: "from-emerald-500 to-teal-700" }
};

interface ThreeDIconProps {
  icon: IconName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * PROVIDER VISUAL LANGUAGE COMPONENT
 * 
 * This 3D/Gradient icon system is strictly reserved for PROVIDER-FACING surfaces only.
 * Do NOT use on:
 * - Marketing pages
 * - Investor pages
 * - Partner pages
 * - Core user booking or consent flows
 * 
 * Use standard <Icon /> for those areas.
 */
const ThreeDIcon: React.FC<ThreeDIconProps> = ({ icon, size = 'md', className = '' }) => {
  const config = iconMap[icon];
  // If icon key doesn't exist in map (e.g. if passed from legacy data), fallback or null.
  // We use the type system to enforce valid keys, but runtime check is safe.
  if (!config) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5',
    xl: 'w-16 h-16 p-4',
  };

  const iconSizes = {
    sm: 'w-full h-full',
    md: 'w-full h-full',
    lg: 'w-full h-full',
    xl: 'w-full h-full',
  };

  return (
    <div className={`relative rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg shadow-black/10 flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className} group-hover:scale-110 transition-transform duration-300`}>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent opacity-80 pointer-events-none"></div>
      
      {/* Icon */}
      <svg 
        className={`${iconSizes[size]} text-white drop-shadow-md`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2.5} // Locked stroke weight for provider system
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d={iconPaths[icon]} />
      </svg>
    </div>
  );
};

export default ThreeDIcon;
