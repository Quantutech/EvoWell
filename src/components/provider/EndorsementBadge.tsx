import React from 'react';

interface EndorsementBadgeProps {
  type: 'evowell' | 'peer';
  count?: number;
  className?: string;
}

/**
 * EndorsementBadge - Displays trust signals for providers.
 * Follows EvoWell brand guidelines: pill shape, muted tones, custom icons.
 */
export const EndorsementBadge: React.FC<EndorsementBadgeProps> = ({ type, count, className = '' }) => {
  if (type === 'peer' && (count === undefined || count === 0)) return null;

  const isEvoWell = type === 'evowell';

  // Design tokens from spec:
  // - Badge chips radius: 8-12px
  // - EvoWell: deep teal, visually dominant
  // - Peer: warm slate, secondary
  
  return (
    <div 
      className={`inline-flex items-center px-3 py-1.5 rounded-[10px] text-[11px] font-semibold tracking-wide uppercase transition-all duration-200 ${
        isEvoWell 
          ? 'bg-[#0f311c] text-[#ccfbf1] border border-[#1e663a]/30 shadow-sm shadow-[#0f311c]/20' 
          : 'bg-[#334155] text-[#f1f5f9] border border-[#475569]/30 shadow-sm shadow-slate-900/10'
      } ${className}`}
      aria-label={isEvoWell ? "Endorsed by EvoWell team" : `${count} Provider Endorsements`}
    >
      {isEvoWell ? (
        <>
          {/* Abstract Shield/Node Icon */}
          <svg className="w-3.5 h-3.5 mr-2 opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22C16.6 20.9 20 16.1 20 11V5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11V15M12 11L10 9M12 11L14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="whitespace-nowrap">EvoWell Endorsed</span>
        </>
      ) : (
        <>
          {/* Abstract Peer Network Icon */}
          <svg className="w-3.5 h-3.5 mr-2 opacity-90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="whitespace-nowrap">{count} Provider Endorsements</span>
        </>
      )}
    </div>
  );
};
