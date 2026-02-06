import React from 'react';

// Define the available icon types and their specific configurations
const iconMap = {
  search: { path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", gradient: "from-blue-400 to-indigo-600" },
  video: { path: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", gradient: "from-violet-400 to-fuchsia-600" },
  clinic: { path: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", gradient: "from-emerald-400 to-teal-600" },
  blog: { path: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l5 5v11a2 2 0 01-2 2z", gradient: "from-orange-400 to-red-600" },
  podcast: { path: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z", gradient: "from-pink-400 to-rose-600" },
  folder: { path: "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5z", gradient: "from-amber-400 to-orange-600" },
  userPlus: { path: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", gradient: "from-cyan-400 to-blue-600" },
  star: { path: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", gradient: "from-yellow-400 to-amber-600" },
  lock: { path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", gradient: "from-slate-400 to-slate-600" },
  download: { path: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", gradient: "from-sky-400 to-blue-600" },
  calendar: { path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", gradient: "from-teal-400 to-emerald-600" },
  chat: { path: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", gradient: "from-purple-400 to-indigo-600" },
  unlocked: { path: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", gradient: "from-rose-400 to-red-600" },
  settings: { path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", gradient: "from-gray-400 to-slate-600" },
  heart: { path: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", gradient: "from-pink-500 to-rose-600" },
  eye: { path: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", gradient: "from-blue-400 to-cyan-600" },
  dollar: { path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-green-400 to-emerald-600" },
  globe: { path: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-indigo-400 to-blue-600" },
  info: { path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", gradient: "from-slate-400 to-slate-600" },
  partners: { path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", gradient: "from-indigo-400 to-purple-600" }
};

interface ThreeDIconProps {
  icon: keyof typeof iconMap;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'colorful' | 'minimal';
}

const ThreeDIcon: React.FC<ThreeDIconProps> = ({ icon, size = 'md', className = '', variant = 'colorful' }) => {
  const config = iconMap[icon];
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

  if (variant === 'minimal') {
    return (
      <div className={`relative rounded-xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className} group-hover:bg-white group-hover:scale-105 transition-all duration-300`}>
        {/* Subtle inner gloss */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/80 to-transparent opacity-50 pointer-events-none"></div>
        <svg 
          className={`${iconSizes[size]} text-slate-600 drop-shadow-sm`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d={config.path} />
        </svg>
      </div>
    );
  }

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
        strokeWidth={2.5}
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d={config.path} />
      </svg>
    </div>
  );
};

export default ThreeDIcon;