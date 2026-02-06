import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8", variant = 'color', showText = true }) => {
  const textColor = variant === 'color' ? '#0f172a' : '#ffffff'; // slate-900 or white
  const primaryColor = variant === 'color' ? '#39a562' : '#ffffff';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img 
        src="/images/logo.svg" 
        alt="EvoWell Logo" 
        className={`h-full w-auto object-contain ${variant === 'white' ? 'brightness-0 invert' : ''}`}
      />
      
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