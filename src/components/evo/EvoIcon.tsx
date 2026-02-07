import React from 'react';

interface EvoIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const EvoIcon: React.FC<EvoIconProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`} aria-hidden="true">
      {/* Core Orb */}
      <div className="absolute inset-0 bg-brand-500 rounded-full opacity-20 animate-pulse" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-2 bg-brand-600 rounded-full opacity-40 animate-pulse" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
      
      {/* Inner Node */}
      <div className="relative w-[40%] h-[40%] bg-gradient-to-tr from-brand-400 to-brand-600 rounded-full shadow-lg shadow-brand-500/30 animate-spin-slow" style={{ animation: 'spin 12s linear infinite' }}>
        <div className="absolute inset-0 bg-white/10 rounded-full blur-sm"></div>
      </div>

      {/* Outer Ring */}
      <div className="absolute inset-[-10%] border border-brand-300/30 rounded-full animate-ping-slow" style={{ animation: 'ping 4s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
    </div>
  );
};

export default EvoIcon;
