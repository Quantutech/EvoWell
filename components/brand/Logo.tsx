
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8", variant = 'color', showText = true }) => {
  const primaryColor = variant === 'color' ? '#39a562' : '#ffffff'; // brand-500 or white
  const textColor = variant === 'color' ? '#0f172a' : '#ffffff'; // slate-900 or white
  const accentColor = variant === 'color' ? '#0e84ea' : 'rgba(255,255,255,0.8)'; // accent-500

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto aspect-square overflow-visible"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Leaf/Cross Hybrid Icon */}
        <path 
          d="M50 15C50 15 35 15 25 25C15 35 15 50 15 50C15 50 15 65 25 75C35 85 50 85 50 85C50 85 65 85 75 75C85 65 85 50 85 50C85 50 85 35 75 25C65 15 50 15 50 15Z" 
          stroke={primaryColor} 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path 
          d="M50 25V75M25 50H75" 
          stroke={primaryColor} 
          strokeWidth="8" 
          strokeLinecap="round" 
          opacity="0.3"
        />
        <circle cx="65" cy="35" r="8" fill={accentColor} />
      </svg>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span 
            className="text-xl font-black tracking-tight leading-none logo-text"
            style={{ color: textColor }}
          >
            Evo<span style={{ color: primaryColor }}>Well</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
